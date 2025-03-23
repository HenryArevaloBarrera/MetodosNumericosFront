import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js'; // Importar Plotly
import '../styles/newtonraphson.css'; // Importar estilos

const NewtonRaphson = () => {
  const navigate = useNavigate();

  const [equation, setEquation] = useState('');
  const [x0, setX0] = useState('');
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState([]);

  const areParenthesesBalanced = (str) => {
    const stack = [];
    for (let char of str) {
      if (char === '(') stack.push(char);
      else if (char === ')') {
        if (stack.length === 0) return false;
        stack.pop();
      }
    }
    return stack.length === 0;
  };

  const formatEquationForURL = (eq) => {
    return eq
      .replace(/√/g, 'sqrt')
      .replace(/\^/g, '**')
      .replace(/×/g, '*')
      .replace(/÷/g, '/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!areParenthesesBalanced(equation)) {
      setErrorMessage('Error: Los paréntesis no están balanceados.');
      return;
    }
    setErrorMessage('');

    const formattedEquation = formatEquationForURL(equation);
    const url = `http://localhost:5003/newton_raphson?ecuacion=${encodeURIComponent(
      formattedEquation
    )}&x0=${x0}&tol_error=${error}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido en el servidor');
      }

      setResults(data);
      setErrorMessage(''); // Limpiar errores si la solicitud es exitosa
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage(error.message); // Mostrar el error del backend en la UI
    }
  };

  const addToEquation = (value) => {
    setEquation((prev) => prev + value);
    setErrorMessage('');
  };

  const deleteLastCharacter = () => {
    setEquation((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const clearEquation = () => {
    setEquation('');
    setErrorMessage('');
  };

  // Función para graficar la ecuación y los puntos de la tabla
  const plotData = () => {
    if (results.length === 0) return null;

    // Extraer los valores de xi y f(xi) de los resultados
    const xValues = results.map((row) => row.xi);
    const yValues = results.map((row) => row.fxi);

    // Crear un rango de valores para graficar la ecuación
    const xRange = Array.from({ length: 100 }, (_, i) => x0 - 5 + (i * 10) / 100);
    const yRange = xRange.map((x) => {
      try {
        // Evaluar la ecuación en el rango de valores
        const expr = equation.replace(/x/g, `(${x})`);
        return eval(expr); // ¡Cuidado! Usar eval puede ser peligroso en aplicaciones reales
      } catch (e) {
        return NaN;
      }
    });

    return (
      <Plot
        data={[
          {
            x: xRange,
            y: yRange,
            type: 'scatter',
            mode: 'lines',
            name: 'Ecuación',
            line: { color: 'blue' },
          },
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'markers',
            name: 'Puntos (xi, f(xi))',
            marker: { color: 'red', size: 10 },
          },
        ]}
        layout={{
          title: 'Gráfica de la ecuación y puntos de iteración',
          xaxis: { title: 'x' },
          yaxis: { title: 'f(x)' },
          showlegend: true,
        }}
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  return (
    <div className="home-container">
      <div className="api-container2">
        <h1 className="home-title">Método de Newton-Raphson</h1>
        <form onSubmit={handleSubmit} className="newton-raphson-form">
          <div className="form-group equation-group">
            <label htmlFor="equation">Ecuación:</label>
            <input
              type="text"
              id="equation"
              value={equation}
              placeholder="Ingresa la ecuación"
              readOnly // Bloquear edición manual
            />
          </div>

          <div className="input-row">
            <div className="form-group">
              <label htmlFor="x0">Valor de x0:</label>
              <input
                type="number"
                id="x0"
                value={x0}
                onChange={(e) => setX0(e.target.value)}
                placeholder="x0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="error">Error mínimo:</label>
              <input
                type="number"
                id="error"
                value={error}
                onChange={(e) => setError(e.target.value)}
                placeholder="Error"
                required
                min="0.000001"
                max="0.999999"
                step="any"
              />
            </div>
          </div>

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

            {['+', '-', '×', '÷', 'x'].map((op) => (
              <button
                key={op}
                type="button"
                className="calculator-button"
                onClick={() => addToEquation(op)}
              >
                {op}
              </button>
            ))}

            {['sin(', 'cos(', 'tan('].map((func) => (
              <button
                key={func}
                type="button"
                className="calculator-button"
                onClick={() => addToEquation(func)}
              >
                {func.replace('(', '')}
              </button>
            ))}

            {['e^(', '√(', '^('].map((func) => (
              <button
                key={func}
                type="button"
                className="calculator-button"
                onClick={() => addToEquation(func)}
              >
                {func}
              </button>
            ))}

            {['(', ')'].map((paren) => (
              <button
                key={paren}
                type="button"
                className="calculator-button"
                onClick={() => addToEquation(paren)}
              >
                {paren}
              </button>
            ))}

            <button type="button" className="calculator-button" onClick={clearEquation}>
              C
            </button>
            <button type="button" className="calculator-button" onClick={deleteLastCharacter}>
              ⌫
            </button>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="action-buttons">
            <button type="button" className="back-button" onClick={() => navigate('/')}>
              Regresar
            </button>
            <button type="submit" className="submit-button">
              Enviar Datos
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="results-table">
            <h2>Resultados</h2>
            <table>
              <thead>
                <tr>
                  <th>Iteración</th>
                  <th>xi</th>
                  <th>f(xi)</th>
                  <th>g'(xi)</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index}>
                    <td>{row.nIteracion}</td>
                    <td>{row.xi}</td>
                    <td>{row.fxi}</td>
                    <td>{row.g_prima}</td>
                    <td>{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Gráfica de la ecuación y los puntos */}
            <div className="plot-container">
              <h2>Gráfica de la ecuación y puntos de iteración</h2>
              {plotData()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewtonRaphson;