import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/biseccion.css'; // Importar estilos

const Biseccion = () => {
  const navigate = useNavigate();

  const [equation, setEquation] = useState('');
  const [xo, setXo] = useState('');
  const [xu, setXu] = useState('');
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
    const url = `http://localhost:5002/biseccion?ecuacion=${encodeURIComponent(
      formattedEquation
    )}&xo=${xo}&xu=${xu}&tol_error=${error}`;

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

  return (
    <div className="home-container">
      <div className="api-container2">
        <h1 className="home-title">Método de Bisección</h1>
        <form onSubmit={handleSubmit} className="biseccion-form">
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
              <label htmlFor="xo">Valor de xo:</label>
              <input
                type="number"
                id="xo"
                value={xo}
                onChange={(e) => setXo(e.target.value)}
                placeholder="xo"
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
                placeholder="xu"
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
                    <td>{row.xo}</td>
                    <td>{row.xu}</td>
                    <td>{row.xm}</td>
                    <td>{row.fxm}</td>
                    <td>{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Biseccion;
