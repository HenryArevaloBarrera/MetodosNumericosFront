import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import '../styles/biseccion.css';

const Trapecio = () => {
  const navigate = useNavigate();
  const [ecuacion, setEcuacion] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [n, setN] = useState(4);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Teclado matemático
  const addToEquation = (value) => setEcuacion(prev => prev + value);
  const deleteLastCharacter = () => setEcuacion(prev => prev.slice(0, -1));
  const clearEquation = () => setEcuacion('');

  // Mostrar de manera bonita la ecuación
  const formatEquationForDisplay = (eq) => eq
    .replace(/sqrt/g, '√')
    .replace(/\*\*/g, '^')
    .replace(/\*/g, '×');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResults(null);

    if (!ecuacion.trim() || a === '' || b === '' || n === '') {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (isNaN(Number(a)) || isNaN(Number(b)) || isNaN(Number(n))) {
      setErrorMessage('a, b y n deben ser números válidos.');
      return;
    }

    if (Number(n) < 1) {
      setErrorMessage('n debe ser un entero mayor que 0.');
      return;
    }

    const backendUrl = `http://localhost:5007/trapecio?ecuacion=${encodeURIComponent(ecuacion.replace(/\s+/g, ''))}&a=${a}&b=${b}&n=${n}`;
    try {
      const response = await fetch(backendUrl);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error en el servidor');
      if (!Array.isArray(data.xi) || !Array.isArray(data.fxi)) throw new Error('Respuesta inesperada del servidor');

      setResults(data);
      setErrorMessage('');
    } catch (err) {
      setResults(null);
      setErrorMessage(err.message);
    }
  };

  // Gráfica del método del trapecio
  const plotData = () => {
    if (!results || !results.xi || !results.fxi) return null;

    // Traza de la función interpolada
    const functionTrace = {
      x: results.xi,
      y: results.fxi,
      mode: 'lines+markers',
      name: 'f(x)',
      line: { color: 'blue' },
      marker: { color: 'blue' }
    };

    // Trazas de los trapecios
    const trapecios = results.xi.slice(0, -1).map((xi, i) => ({
      x: [results.xi[i], results.xi[i], results.xi[i + 1], results.xi[i + 1]],
      y: [0, results.fxi[i], results.fxi[i + 1], 0],
      fill: 'toself',
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(0,176,246,0.3)' },
      fillcolor: 'rgba(0,176,246,0.2)',
      name: `Trapecio ${i + 1}`,
      showlegend: false
    }));

    return (
      <Plot
        data={[functionTrace, ...trapecios]}
        layout={{
          title: 'Aproximación por el Método del Trapecio',
          xaxis: { title: 'x' },
          yaxis: { title: 'f(x)' },
          legend: { x: 1, y: 1 },
        }}
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  return (
    <div className="home-container">
      <div className="api-container2">
        <h1 className="home-title">Método del Trapecio</h1>
        <form onSubmit={handleSubmit} className="biseccion-form">
          <div className="form-group">
            <label>Ecuación (usa x como variable):</label>
            <div className="equation-input-container">
              <input
                type="text"
                value={formatEquationForDisplay(ecuacion)}
                onChange={(e) => setEcuacion(e.target.value)}
                onFocus={() => setShowKeyboard(true)}
                className="equation-input"
                readOnly
              />
              <button
                type="button"
                className="keyboard-toggle"
                onClick={() => setShowKeyboard(!showKeyboard)}
              >
                {showKeyboard ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {showKeyboard && (
            <div className="calculator-buttons">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '.'].map((num) => (
                <button key={num} type="button" className="calculator-button" onClick={() => addToEquation(num.toString())}>{num}</button>
              ))}
              {['+', '-', '×', '÷'].map((op) => (
                <button key={op} type="button" className="calculator-button" onClick={() => addToEquation(op === '×' ? '*' : op === '÷' ? '/' : op)}>{op}</button>
              ))}
              <button type="button" className="calculator-button variable-button" onClick={() => addToEquation('x')}>x</button>
              {['(', ')', '^', '√', 'e'].map((char) => (
                <button key={char} type="button" className="calculator-button function-button" onClick={() => addToEquation(
                  char === '√' ? 'sqrt(' : char === '^' ? '**' : char === 'e' ? 'exp(' : char
                )}>{char}</button>
              ))}
              {['sin(', 'cos(', 'tan('].map((func) => (
                <button key={func} type="button" className="calculator-button function-button" onClick={() => addToEquation(func)}>{func.replace('(', '')}</button>
              ))}
              <button type="button" className="calculator-button clear-button" onClick={clearEquation}>C</button>
              <button type="button" className="calculator-button delete-button" onClick={deleteLastCharacter}>⌫</button>
            </div>
          )}

          <div className="form-group">
            <label>Límite inferior (a):</label>
            <input type="number" value={a} onChange={e => setA(e.target.value)} step="any" />
          </div>
          <div className="form-group">
            <label>Límite superior (b):</label>
            <input type="number" value={b} onChange={e => setB(e.target.value)} step="any" />
          </div>
          <div className="form-group">
            <label>Número de trapecios (n):</label>
            <input type="number" value={n} onChange={e => setN(e.target.value)} min="1" step="1" />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="action-buttons">
            <button type="button" className="back-button" onClick={() => navigate('/')}>Regresar</button>
            <button type="submit" className="submit-button">Calcular</button>
          </div>
        </form>

        {results && (
          <div className="results-table">
            <h2>Resultado</h2>
            <table>
              <tbody>
                <tr>
                  <th>Integral aproximada (Trapecio)</th>
                  <td>{results.integral_trapecio}</td>
                </tr>
                <tr>
                  <th>Integral exacta (Simbólica)</th>
                  <td>{results.integral_real}</td>
                </tr>
                <tr>
                  <th>Error absoluto</th>
                  <td>{results.error_absoluto}</td>
                </tr>
                <tr>
                  <th>h</th>
                  <td>{results.h}</td>
                </tr>
                <tr>
                  <th>n</th>
                  <td>{results.n}</td>
                </tr>
              </tbody>
            </table>

            <div className="plot-container">
              <h2>Gráfica del Método del Trapecio</h2>
              {plotData()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trapecio;