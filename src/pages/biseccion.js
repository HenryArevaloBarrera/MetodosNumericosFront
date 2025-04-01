import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/biseccion.css';

const Biseccion = () => {
  const navigate = useNavigate();

  const [equation, setEquation] = useState('');
  const [xo, setXo] = useState('');
  const [xu, setXu] = useState('');
  const [tolError, setTolError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const formatEquationForBackend = (eq) => {
    // Convertir la notación visual a notación computable
    return eq
      .replace(/√/g, 'sqrt')
      .replace(/×/g, '*')
      .replace(/e\^/g, 'exp')    // e^ → exp
      .replace(/\^/g, '**')       // ^ → **
      .replace(/÷/g, '/')         // ÷ → /
      .replace(/(\d)([x(])/g, '$1*$2')    // 4x → 4*x
      .replace(/(\))([\dx])/g, '$1*$2');  // )x → )*x
  };

  const formatEquationForDisplay = (eq) => {
    // Convertir a notación matemática visual
    return eq
      .replace(/exp/g, 'e^')    // exp → e^
      .replace(/\*\*/g, '^')    // ** → ^
      .replace(/\//g, '÷')      // / → ÷
      .replace(/\*+/g, '');     // Eliminar * (multiplicaciones implícitas)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!areParenthesesBalanced(equation)) {
      setErrorMessage('Error: Los paréntesis no están balanceados.');
      setIsLoading(false);
      return;
    }

    const formattedEquation = formatEquationForBackend(equation);
    const url = `http://localhost:5002/biseccion?ecuacion=${encodeURIComponent(
      formattedEquation
    )}&xo=${xo}&xu=${xu}&tol_error=${tolError}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el servidor');
      }

      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido del servidor');
      }

      setResults(data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage(error.message);
      setResults([]);
    } finally {
      setIsLoading(false);
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

  const safeFormat = (value, decimals = 6) => {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    return value.toFixed(decimals);
  };

  const safeExponential = (value, decimals = 4) => {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    return value.toExponential(decimals);
  };

  return (
    <div className="home-container">
      <div className="api-container2">
        <h1 className="home-title">Método de Bisección</h1>
        <form onSubmit={handleSubmit} className="biseccion-form">
          <div className="form-group equation-group">
            <label htmlFor="equation">Ecuación (usa 'x' como variable):</label>
            <input
              type="text"
              id="equation"
              value={formatEquationForDisplay(equation)}
              placeholder="Usa los botones para ingresar la ecuación"
              readOnly
              className="equation-input"
            />
          </div>

          <div className="input-row">
            <div className="form-group">
              <label htmlFor="xo">Valor de xo:</label>
              <input
                type="number"
                id="xo"
                value={xo}
                onChange={(e) => setXo(e.target.value)}
                placeholder="Ej: 1"
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="xu">Valor de xu:</label>
              <input
                type="number"
                id="xu"
                value={xu}
                onChange={(e) => setXu(e.target.value)}
                placeholder="Ej: 3"
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="tolError">Tolerancia de error:</label>
              <input
                type="number"
                id="tolError"
                value={tolError}
                onChange={(e) => setTolError(e.target.value)}
                placeholder="Ej: 0.0001"
                min="0.0000000001"
                max="0.999999"
                step="any"
                required
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

            {['+', '-', '×', '÷'].map((op) => (
              <button
                key={op}
                type="button"
                className="calculator-button"
                onClick={() => addToEquation(op)}
              >
                {op}
              </button>
            ))}

            {['sin(', 'cos(', 'tan(', 'e^(', '√(', '^('].map((func) => (
              <button
                key={func}
                type="button"
                className="calculator-button"
                onClick={() => addToEquation(func)}
              >
                {func.replace('(', '').replace('e^', 'e^')}
              </button>
            ))}

            {['(', ')', 'x'].map((char) => (
              <button
                key={char}
                type="button"
                className="calculator-button"
                onClick={() => addToEquation(char)}
              >
                {char}
              </button>
            ))}

            <button type="button" className="calculator-button" onClick={clearEquation}>
              C
            </button>
            <button type="button" className="calculator-button" onClick={deleteLastCharacter}>
              ⌫
            </button>
          </div>

          {errorMessage && (
            <div className="error-message">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          <div className="action-buttons">
            <button type="button" className="back-button" onClick={() => navigate('/')}>
              Regresar
            </button>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Calculando...' : 'Calcular'}
            </button>
          </div>
        </form>

        {isLoading && <div className="loading-indicator">Procesando...</div>}

        {results.length > 0 && (
          <div className="results-container">
            <div className="results-table">
              <h2>Resultados</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Iteración</th>
                      <th>xo</th>
                      <th>xu</th>
                      <th>xm</th>
                      <th>f(xm)</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr key={index}>
                        <td>{row.nIteracion}</td>
                        <td>{safeFormat(row.xo)}</td>
                        <td>{safeFormat(row.xu)}</td>
                        <td>{safeFormat(row.xm)}</td>
                        <td>{safeExponential(row.fxm)}</td>
                        <td>{safeExponential(row.error)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Biseccion;