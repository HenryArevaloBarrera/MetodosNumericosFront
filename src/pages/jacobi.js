import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js'; // Importar Plotly
import '../styles/biseccion.css'; // Importar estilos

const Jacobi = () => {
  const navigate = useNavigate();
  const [numEquations, setNumEquations] = useState(3);
  const [equations, setEquations] = useState(Array(numEquations).fill(''));
  const [initialVector, setInitialVector] = useState(Array(numEquations).fill(0));
  const [tolerance, setTolerance] = useState('0.0001');
  const [maxIterations, setMaxIterations] = useState('100');
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEquationChange = (index, value) => {
    const newEquations = [...equations];
    newEquations[index] = value;
    setEquations(newEquations);
  };

  const handleVectorChange = (index, value) => {
    const newVector = [...initialVector];
    newVector[index] = parseFloat(value);
    setInitialVector(newVector);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validar que todas las ecuaciones estén completas
    if (equations.some(eq => eq.trim() === '')) {
      setErrorMessage('Todas las ecuaciones deben estar completas.');
      return;
    }
  
    // Validar que el vector inicial esté completo
    if (initialVector.some(val => isNaN(val))) {
      setErrorMessage('Todos los valores del vector inicial deben ser números válidos.');
      return;
    }
  
    // Validar que la tolerancia y el número máximo de iteraciones sean válidos
    if (isNaN(tolerance) || isNaN(maxIterations)) {
      setErrorMessage('La tolerancia y el número máximo de iteraciones deben ser números válidos.');
      return;
    }
  
    // Construir la URL con los parámetros (solicitud GET)
    const url = `http://localhost:5005/jacobi?${equations
      .map((eq, index) => `ecuaciones[]=${encodeURIComponent(eq.replace(/\s+/g, ''))}`)
      .join('&')}&x0=${encodeURIComponent(JSON.stringify(initialVector))}&tol_error=${tolerance}&max_iter=${maxIterations}`;
  
    // Mostrar los datos que se enviarán en la consola
    console.log("Datos que se enviarán al servidor:");
    console.log("URL:", url);
    console.log("Ecuaciones:", equations);
    console.log("Vector inicial:", initialVector);
    console.log("Tolerancia:", tolerance);
    console.log("Máximo de iteraciones:", maxIterations);
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido en el servidor');
      }
  
      console.log("Respuesta del servidor:", data); // Depuración: Verificar la respuesta
      setResults(data.tabla);
      setErrorMessage('');
    } catch (error) {
      console.error("Error en la solicitud:", error); // Depuración: Verificar errores
      setResults([]); // Limpiar resultados anteriores
      setErrorMessage(error.message);
    }
  };

  // Función para graficar la convergencia
  const plotData = () => {
    if (results.length === 0) return null;

    // Extraer los valores de x y el error de cada iteración
    const iterations = results.map((row) => row.iteracion);
    const xValues = results.map((row) => row.x);
    const errors = results.map((row) => row.error);

    // Crear trazas para cada variable
    const traces = xValues[0].map((_, i) => ({
      x: iterations,
      y: xValues.map((x) => x[i]),
      type: 'scatter',
      mode: 'lines+markers',
      name: `x${i + 1}`,
    }));

    // Traza para el error
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
          yaxis: { title: 'Valor de x' },
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
            <label>Número de ecuaciones:</label>
            <input
              type="number"
              value={numEquations}
              min="2"
              max="10"
              onChange={(e) => {
                const n = Number(e.target.value);
                setNumEquations(n);
                setEquations(Array(n).fill(''));
                setInitialVector(Array(n).fill(0));
              }}
            />
          </div>
          {equations.map((eq, index) => (
            <div className="form-group" key={index}>
              <label>Ecuación {index + 1}:</label>
              <input
                type="text"
                value={eq}
                onChange={(e) => handleEquationChange(index, e.target.value)}
              />
            </div>
          ))}

          <h3>Vector inicial</h3>
          {initialVector.map((val, index) => (
            <div className="form-group" key={index}>
              <label>X{index + 1}:</label>
              <input
                type="number"
                value={val}
                onChange={(e) => handleVectorChange(index, e.target.value)}
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
            />
          </div>

          <div className="form-group">
            <label>Máx Iteraciones:</label>
            <input
              type="number"
              value={maxIterations}
              onChange={(e) => setMaxIterations(e.target.value)}
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="action-buttons">
            <button type="button" className="back-button" onClick={() => navigate('/')}>Regresar</button>
            <button type="submit" className="submit-button">Enviar Datos</button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="results-table">
            <h2>Resultados</h2>
            <table>
              <thead>
                <tr>
                  <th>Iteración</th>
                  {results[0].x.map((_, idx) => (
                    <th key={idx}>X{idx + 1}</th>
                  ))}
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index}>
                    <td>{row.iteracion}</td>
                    {row.x.map((val, idx) => (
                      <td key={idx}>{val}</td>
                    ))}
                    <td>{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Gráfica de convergencia */}
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