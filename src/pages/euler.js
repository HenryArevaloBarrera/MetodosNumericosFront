import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import '../styles/biseccion.css';

const Euler = () => {
  const navigate = useNavigate();
  const [f, setF] = useState('x+y');
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(1);
  const [xf, setXf] = useState(2);
  const [n, setN] = useState(10);
  const [yReal, setYReal] = useState('');
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Añade un valor y si es x o y y antes hay un número, añade * automáticamente
  const addToEquation = (value) => {
    setF(prev => {
      if (
        (value === 'x' || value === 'y') &&
        prev.length > 0 &&
        /[0-9)]$/.test(prev)
      ) {
        return prev + '*' + value;
      }
      return prev + value;
    });
  };
  const deleteLastCharacter = () => setF(prev => prev.slice(0, -1));
  const clearEquation = () => setF('');

  const formatEquationForDisplay = (eq) => eq
    .replace(/sqrt/g, '√')
    .replace(/\*\*/g, '^')
    .replace(/\*/g, '×');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResults(null);

    if (!f.trim() || isNaN(Number(x0)) || isNaN(Number(y0)) || isNaN(Number(xf)) || isNaN(Number(n))) {
      setErrorMessage('Todos los campos son obligatorios y deben ser válidos.');
      return;
    }

    if (Number(n) < 1) {
      setErrorMessage('El número de pasos (n) debe ser mayor que 0.');
      return;
    }

    let backendUrl = `http://localhost:5010/euler?f=${encodeURIComponent(f)}&x0=${x0}&y0=${y0}&xf=${xf}&n=${n}`;
    if (yReal.trim()) backendUrl += `&y_real=${encodeURIComponent(yReal)}`;

    try {
      const response = await fetch(backendUrl);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error en el servidor');
      if (!Array.isArray(data.x) || !Array.isArray(data.y)) throw new Error('Respuesta inesperada del servidor');

      setResults(data);
      setErrorMessage('');
    } catch (err) {
      setResults(null);
      setErrorMessage(err.message);
    }
  };

  const renderTable = () => {
    if (!results || !results.tabla) return null;
    const showError = results.tabla.some(row => row.error !== undefined && row.error !== null);
    const showYReal = results.tabla.some(row => row.y_real !== undefined && row.y_real !== null);
    return (
      <table className="euler-table">
        <thead>
          <tr>
            <th>i</th>
            <th>x</th>
            <th>y</th>
            <th>f(x, y)</th>
            {showYReal && <th>y<sub>real</sub></th>}
            {showError && <th>Error |y - y<sub>real</sub>|</th>}
          </tr>
        </thead>
        <tbody>
          {results.tabla.map((row, i) => (
            <tr key={i}>
              <td>{row.i}</td>
              <td>{Number(row.x).toFixed(4)}</td>
              <td>{Number(row.y).toFixed(6)}</td>
              <td>{Number(row.f).toExponential(4)}</td>
              {showYReal && (
                <td>{row.y_real !== undefined && row.y_real !== null ? Number(row.y_real).toFixed(6) : ''}</td>
              )}
              {showError && (
                <td>{row.error !== undefined && row.error !== null ? Number(row.error).toExponential(2) : ''}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderPlot = () => {
    if (!results || !results.x || !results.y) return null;
    const traces = [
      {
        x: results.x,
        y: results.y,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'blue' },
        name: 'Aproximación Euler'
      }
    ];

    if (results.y_real && results.y_real.length === results.x.length) {
      traces.push({
        x: results.x,
        y: results.y_real,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'orange' },
        line: { dash: 'dot' },
        name: 'Solución exacta'
      });
    }

    return (
      <Plot
        data={traces}
        layout={{
          title: "Solución Aproximada por el Método de Euler",
          xaxis: { title: "x" },
          yaxis: { title: "y" },
          legend: { x: 1, y: 1 },
          width: 500,
          height: 400
        }}
      />
    );
  };

  return (
    <div className="home-container">
      <div className="api-container2">
        <h1 className="home-title">Método de Euler</h1>
        <form onSubmit={handleSubmit} className="biseccion-form">
          <div className="form-group">
            <label>Ecuación f(x, y):</label>
            <div className="equation-input-container">
              <input
                type="text"
                value={formatEquationForDisplay(f)}
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
              <button type="button" className="calculator-button variable-button" onClick={() => addToEquation('y')}>y</button>
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

          <div className="form-group-row">
            <div className="form-group">
              <label>x₀:</label>
              <input
                type="number"
                value={x0}
                onChange={e => setX0(e.target.value)}
                step="any"
              />
            </div>
            <div className="form-group">
              <label>y₀:</label>
              <input
                type="number"
                value={y0}
                onChange={e => setY0(e.target.value)}
                step="any"
              />
            </div>
            <div className="form-group">
              <label>x<sub>f</sub>:</label>
              <input
                type="number"
                value={xf}
                onChange={e => setXf(e.target.value)}
                step="any"
              />
            </div>
            <div className="form-group">
              <label>Pasos (n):</label>
              <input
                type="number"
                value={n}
                onChange={e => setN(e.target.value)}
                min="1"
                step="1"
              />
            </div>
            <div className="form-group">
              <label>Solución exacta y<sub>real</sub>(x): <span style={{fontWeight: "normal"}}>(opcional, ej: 2*np.exp(x)-x-1)</span></label>
              <input
                type="text"
                value={yReal}
                onChange={e => setYReal(e.target.value)}
                placeholder="Ejemplo: 2*np.exp(x)-x-1"
              />
            </div>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="action-buttons">
            <button type="button" className="back-button" onClick={() => navigate('/')}>Regresar</button>
            <button type="submit" className="submit-button">Calcular</button>
          </div>
        </form>
        {results && (
          <div className="euler-results-grid" style={{ display: "flex", gap: "2rem", marginTop: "2rem", flexWrap: "wrap" }}>
            <div className="euler-left" style={{ flex: 1, minWidth: 320, maxWidth: 400 }}>
              <div className="results-table">
                <h2>Tabla de Iteraciones</h2>
                {renderTable()}
              </div>
            </div>
            <div className="euler-right" style={{ flex: 1, minWidth: 320, maxWidth: 500 }}>
              <div className="plot-container">
                <h2>Gráfica de la Solución</h2>
                {renderPlot()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Euler;