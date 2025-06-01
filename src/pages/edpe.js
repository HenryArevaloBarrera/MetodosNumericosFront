import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import '../styles/biseccion.css';

const EDPE = () => {
  const navigate = useNavigate();
  const [n, setN] = useState(3);
  const [top, setTop] = useState(100);
  const [bottom, setBottom] = useState(100);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [tol, setTol] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(10000);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResults(null);

    if (n < 1 || n > 50) {
      setErrorMessage("n debe estar entre 1 y 50");
      return;
    }

    const backendUrl = `http://localhost:5009/edpe?n=${n}&top=${top}&bottom=${bottom}&left=${left}&right=${right}&tol=${tol}&max_iter=${maxIter}`;
    try {
      const response = await fetch(backendUrl);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error en el servidor');
      if (!Array.isArray(data.matriz)) throw new Error('Respuesta inesperada del servidor');

      setResults(data);
      setErrorMessage('');
    } catch (err) {
      setResults(null);
      setErrorMessage(err.message);
    }
  };

  // Tabla de la matriz de resultados
  const renderTable = () => {
    if (!results || !results.matriz) return null;
    return (
      <table className="edpe-table">
        <thead>
          <tr>
            <th></th>
            {results.matriz[0].map((_, j) => <th key={j}>Columna {j+1}</th>)}
          </tr>
        </thead>
        <tbody>
          {results.matriz.map((row, i) => (
            <tr key={i}>
              <th>Fila {i+1}</th>
              {row.map((val, j) => <td key={j}>{Number(val).toFixed(2)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Gráfica tipo mapa de calor con valores numéricos
  const renderHeatmap = (showValues = true) => {
    if (!results || !results.matriz) return null;
    const data = results.matriz;
    return (
      <Plot
        data={[
          {
            z: data,
            type: 'heatmap',
            colorscale: 'RdBu',
            colorbar: { title: 'T' },
            showscale: true,
            text: showValues
              ? data.map(row => row.map(v => v.toFixed(1)))
              : undefined,
            hoverinfo: showValues ? 'text' : 'z',
            zmid: (Number(top) + Number(bottom) + Number(left) + Number(right)) / 4
          }
        ]}
        layout={{
          title: showValues ? "Mapa con valores numéricos" : "Mapa solo colores (sin números)",
          xaxis: { title: "X", dtick: 1, showgrid: false },
          yaxis: { title: "Y", dtick: 1, autorange: "reversed", showgrid: false },
          width: 400,
          height: 400,
          margin: { t: 50, b: 50, l: 60, r: 30 },
          annotations: showValues ? data.flatMap((row, i) =>
            row.map((val, j) => ({
              x: j,
              y: i,
              text: val.toFixed(1),
              showarrow: false,
              font: { color: 'black', size: 12 }
            }))
          ) : []
        }}
      />
    );
  };

  return (
    <div className="home-container">
      <div className="api-container2">
        <h1 className="home-title">EDP Elíptica (placa de calor)</h1>
        <form onSubmit={handleSubmit} className="biseccion-form">
          <div className="form-group-row">
            <div className="form-group">
              <label>Tamaño de la placa (n x n):</label>
              <input type="number" min="1" max="50" value={n} onChange={e => setN(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Temperatura borde superior:</label>
              <input type="number" value={top} onChange={e => setTop(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Temperatura borde inferior:</label>
              <input type="number" value={bottom} onChange={e => setBottom(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Temperatura borde izquierdo:</label>
              <input type="number" value={left} onChange={e => setLeft(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Temperatura borde derecho:</label>
              <input type="number" value={right} onChange={e => setRight(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tolerancia:</label>
              <input type="number" step="any" value={tol} onChange={e => setTol(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Máx iteraciones:</label>
              <input type="number" value={maxIter} onChange={e => setMaxIter(e.target.value)} />
            </div>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="action-buttons">
            <button type="button" className="back-button" onClick={() => navigate('/')}>Regresar</button>
            <button type="submit" className="submit-button">Simular</button>
          </div>
        </form>

        {results && (
          <div className="edpe-results-grid">
            <div className="edpe-left">
              <div className="results-table">
                <h2>Matriz de Resultados (Temperaturas)</h2>
                {renderTable()}
              </div>
              <div className="ecuaciones-container">
                <h2>Ecuaciones de Diferencias Finitas</h2>
                <pre style={{
                  background: "transparent",
                  padding: "8px",
                  overflowX: "auto",
                  height: "240px",
                  maxHeight: "240px"
                }}>
                  {results.ecuaciones && results.ecuaciones.join('\n')}
                </pre>
              </div>
            </div>
            <div className="edpe-right">
              <div className="plot-container">
                <h2>Mapa con valores numéricos</h2>
                {renderHeatmap(true)}
              </div>
              <div className="plot-container">
                <h2>Mapa solo colores (sin números)</h2>
                {renderHeatmap(false)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EDPE;