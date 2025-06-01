import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import '../styles/biseccion.css';

const NewtonRaphson = () => {
  const navigate = useNavigate();

  const [equation, setEquation] = useState('');
  const [x0, setX0] = useState('');
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState([]);
  const [graficoX, setGraficoX] = useState([]);
  const [graficoY, setGraficoY] = useState([]);
  const [xHist, setXHist] = useState([]);
  const [fxHist, setFxHist] = useState([]);

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
      .replace(/√/g, 'sqrt')          // √ → sqrt
      .replace(/×/g, '*')             // × → *
      .replace(/e\^/g, 'exp')         // e^ → exp
      .replace(/\^/g, '**')           // ^ → **
      .replace(/÷/g, '/')             // ÷ → /
      .replace(/(\d)([x(])/g, '$1*$2')     // 4x → 4*x, 4( → 4*(
      .replace(/(\))([\dx])/g, '$1*$2');   // )x → )*x, )4 → )*4
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

      // Soportar ambas respuestas: solo tabla (antiguo) o objeto con datos de gráfico (nuevo)
      if (Array.isArray(data)) {
        setResults(data);
        setGraficoX([]);
        setGraficoY([]);
        setXHist([]);
        setFxHist([]);
      } else if (data.tabla && data.grafico_x && data.grafico_y && data.x_hist && data.fx_hist) {
        setResults(data.tabla);
        setGraficoX(data.grafico_x);
        setGraficoY(data.grafico_y);
        setXHist(data.x_hist);
        setFxHist(data.fx_hist);
      } else {
        throw new Error('Formato de respuesta inválido del servidor');
      }

      setErrorMessage('');
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage(error.message);
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

  // Gráfico con los datos del backend (grafico_x, grafico_y, x_hist, fx_hist)
  const plotData = () => {
    if (!graficoX.length || !graficoY.length) return null;

    return (
      <Plot
        data={[
          {
            x: graficoX,
            y: graficoY,
            type: 'scatter',
            mode: 'lines',
            name: 'f(x)',
            line: { color: 'blue' },
          },
          {
            x: xHist,
            y: fxHist,
            type: 'scatter',
            mode: 'markers+text',
            name: 'Iteraciones',
            marker: { color: 'red', size: 10 },
            text: xHist.map((v, i) => `Iter ${i}`),
            textposition: 'top center'
          }
        ]}
        layout={{
          title: 'Gráfica de f(x) y puntos de iteración',
          xaxis: { title: 'x' },
          yaxis: { title: 'f(x)' },
          showlegend: true,
          width: 600,
          height: 400
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
              readOnly
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
            {/* Gráfica de la ecuación y puntos de iteración */}
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