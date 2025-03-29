import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import '../styles/biseccion.css';

const Jacobi = () => {
  const navigate = useNavigate();
  const [numEquations, setNumEquations] = useState(3);
  const [equations, setEquations] = useState(Array(3).fill(''));
  const [initialVector, setInitialVector] = useState(Array(3).fill(0));
  const [tolerance, setTolerance] = useState('0.0001');
  const [maxIterations, setMaxIterations] = useState('100');
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeEquationIndex, setActiveEquationIndex] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [variables, setVariables] = useState(['x', 'y']);

  // Letras disponibles para variables
  const availableLetters = ['x', 'y', 'z', 'w', 'v', 'u', 'm', 'n', 'p', 'q', 'r', 's', 't'];

  // Actualizar variables cuando cambia el número de ecuaciones
  useEffect(() => {
    const newVariables = availableLetters.slice(0, numEquations);
    setVariables(newVariables);
    
    setEquations(prev => {
      const newEquations = [...prev];
      while (newEquations.length < numEquations) newEquations.push('');
      while (newEquations.length > numEquations) newEquations.pop();
      return newEquations;
    });
    
    setInitialVector(prev => {
      const newVector = [...prev];
      while (newVector.length < numEquations) newVector.push(0);
      while (newVector.length > numEquations) newVector.pop();
      return newVector;
    });
  }, [numEquations]);

  const handleEquationChange = (index, value) => {
    const newEquations = [...equations];
    newEquations[index] = value;
    setEquations(newEquations);
  };

  const handleVectorChange = (index, value) => {
    const newVector = [...initialVector];
    newVector[index] = parseFloat(value) || 0;
    setInitialVector(newVector);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (equations.some(eq => eq.trim() === '')) {
      setErrorMessage('Todas las ecuaciones deben estar completas.');
      return;
    }
  
    if (initialVector.some(val => isNaN(val))) {
      setErrorMessage('Todos los valores del vector inicial deben ser números válidos.');
      return;
    }
  
    if (isNaN(tolerance) || isNaN(maxIterations)) {
      setErrorMessage('La tolerancia y el número máximo de iteraciones deben ser números válidos.');
      return;
    }
  
    // Convertir ecuaciones para el backend
    const formattedEquations = equations.map(eq => 
      eq.replace(/√/g, 'sqrt')
       .replace(/\^/g, '**')
       .replace(/×/g, '*')
       .replace(/=/g, '%3D')
    );
  
    const url = `http://localhost:5005/jacobi?${formattedEquations
      .map((eq, index) => `ecuaciones[]=${encodeURIComponent(eq.replace(/\s+/g, ''))}`)
      .join('&')}&x0=${encodeURIComponent(JSON.stringify(initialVector))}&tol_error=${tolerance}&max_iter=${maxIterations}`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido en el servidor');
      }

      // Actualizar variables si son diferentes
      if (data.variables && JSON.stringify(data.variables) !== JSON.stringify(variables)) {
        setVariables(data.variables);
      }
  
      setResults(data.tabla);
      setErrorMessage('');
    } catch (error) {
      setResults([]);
      setErrorMessage(error.message);
      console.error('Error:', error);
    }
  };

  // Funciones para el teclado matemático
  const addToEquation = (value) => {
    const newEquations = [...equations];
    newEquations[activeEquationIndex] += value;
    setEquations(newEquations);
  };

  const deleteLastCharacter = () => {
    const newEquations = [...equations];
    newEquations[activeEquationIndex] = newEquations[activeEquationIndex].slice(0, -1);
    setEquations(newEquations);
  };

  const clearEquation = () => {
    const newEquations = [...equations];
    newEquations[activeEquationIndex] = '';
    setEquations(newEquations);
  };

  // Formatear ecuación para visualización
  const formatEquationForDisplay = (eq) => {
    return eq
      .replace(/sqrt/g, '√')
      .replace(/\*\*/g, '^')
      .replace(/\*/g, '×');
  };

  // Función para graficar la convergencia (actualizada)
  const plotData = () => {
    if (!results || results.length === 0) return null;

    const iterations = results.map((row) => row.iteracion);
    const errors = results.map((row) => row.error || 0);

    // Crear trazas para cada variable
    const traces = variables.map((varName) => ({
      x: iterations,
      y: results.map((row) => row.valores[varName] || 0),
      type: 'scatter',
      mode: 'lines+markers',
      name: varName,
    }));

    const errorTrace = {
      x: iterations,
      y: errors,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Error',
      yaxis: 'y2',
    };

    return (
      <Plot
        data={[...traces, errorTrace]}
        layout={{
          title: 'Convergencia del Método de Jacobi',
          xaxis: { title: 'Iteración' },
          yaxis: { title: 'Valor de las variables' },
          yaxis2: { title: 'Error', overlaying: 'y', side: 'right' },
          showlegend: true,
        }}
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  return (
    <div className="home-container">
      <div className="api-container2">
        <h1 className="home-title">Método de Jacobi</h1>
        <form onSubmit={handleSubmit} className="biseccion-form">
          <div className="form-group">
            <label>Número de ecuaciones (2-10):</label>
            <input
              type="number"
              value={numEquations}
              min="2"
              max="10"
              onChange={(e) => {
                const value = Math.min(10, Math.max(2, parseInt(e.target.value) || 2));
                setNumEquations(value);
              }}
            />
          </div>

          {equations.map((eq, index) => (
            <div className="form-group" key={index}>
              <label>Ecuación {index + 1}:</label>
              <div className="equation-input-container">
                <input
                  type="text"
                  value={formatEquationForDisplay(eq)}
                  onChange={(e) => handleEquationChange(index, e.target.value)}
                  onFocus={() => {
                    setActiveEquationIndex(index);
                    setShowKeyboard(true);
                  }}
                  className="equation-input"
                  readOnly
                />
                <button
                  type="button"
                  className="keyboard-toggle"
                  onClick={() => {
                    setActiveEquationIndex(index);
                    setShowKeyboard(!showKeyboard);
                  }}
                >
                  {showKeyboard && activeEquationIndex === index ? '▲' : '▼'}
                </button>
              </div>
            </div>
          ))}

          {showKeyboard && (
            <div className="calculator-buttons">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '.'].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="calculator-button"
                  onClick={() => addToEquation(num.toString())}
                >
                  {num}
                </button>
              ))}

              {['+', '-', '×', '÷', '='].map((op) => (
                <button
                  key={op}
                  type="button"
                  className="calculator-button"
                  onClick={() => addToEquation(
                    op === '×' ? '*' : 
                    op === '÷' ? '/' : 
                    op === '=' ? '=' : op
                  )}
                >
                  {op}
                </button>
              ))}

              {/* Variables dinámicas */}
              {variables.map((varName) => (
                <button
                  key={varName}
                  type="button"
                  className="calculator-button variable-button"
                  onClick={() => addToEquation(varName)}
                >
                  {varName}
                </button>
              ))}

              {['(', ')', '^', '√', 'e'].map((char) => (
                <button
                  key={char}
                  type="button"
                  className="calculator-button function-button"
                  onClick={() => addToEquation(
                    char === '√' ? 'sqrt(' : 
                    char === '^' ? '**' : 
                    char === 'e' ? 'exp(' : char
                  )}
                >
                  {char}
                </button>
              ))}

              {['sin(', 'cos(', 'tan('].map((func) => (
                <button
                  key={func}
                  type="button"
                  className="calculator-button function-button"
                  onClick={() => addToEquation(func)}
                >
                  {func.replace('(', '')}
                </button>
              ))}

              <button type="button" className="calculator-button clear-button" onClick={clearEquation}>
                C
              </button>
              <button type="button" className="calculator-button delete-button" onClick={deleteLastCharacter}>
                ⌫
              </button>
            </div>
          )}

          <h3>Vector inicial</h3>
          {initialVector.map((val, index) => (
            <div className="form-group" key={index}>
              <label>{variables[index]}:</label>
              <input
                type="number"
                value={val}
                onChange={(e) => handleVectorChange(index, e.target.value)}
                step="any"
              />
            </div>
          ))}

          <div className="form-group">
            <label>Tolerancia:</label>
            <input
              type="number"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              step="any"
              min="0.0000000001"
            />
          </div>

          <div className="form-group">
            <label>Máx Iteraciones:</label>
            <input
              type="number"
              value={maxIterations}
              onChange={(e) => setMaxIterations(e.target.value)}
              min="1"
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="action-buttons">
            <button type="button" className="back-button" onClick={() => navigate('/')}>
              Regresar
            </button>
            <button type="submit" className="submit-button">
              Calcular
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="results-table">
            <h2>Resultados</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Iteración</th>
                    {variables.map((varName) => (
                      <th key={varName}>{varName}</th>
                    ))}
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr key={row.iteracion}>
                      <td>{row.iteracion}</td>
                      {variables.map((varName) => (
                        <td key={varName}>
                          {Number(row.valores[varName]).toFixed(6)}
                        </td>
                      ))}
                      <td>{Number(row.error).toExponential(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="plot-container">
              <h2>Gráfica de Convergencia</h2>
              {plotData()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jacobi;