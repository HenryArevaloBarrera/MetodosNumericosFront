import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'; // Importar estilos

const Home = () => {
  const navigate = useNavigate();

  // Nombres personalizados para los botones
  const buttonNames = [
    "Punto Fijo",
    "Biseccion",
    "Newton-Raphson",
    "Secante",
    "Regla Falsa",
    "Gauss-Jordan",
    "Jacobi",
    "Gauss-Seidel",
    "Lagrange",
    "Trapecio"
  ];

  // Función para convertir el nombre del método en una URL válida
  const formatMethodNameForURL = (name) => {
    return name
      .toLowerCase() // Convertir a minúsculas
      .replace(/ /g, '_') // Reemplazar espacios con guiones
      .replace(/[^a-z0-9-]/g, ''); // Eliminar caracteres especiales
  };

  return (
    <div className="home-container">
      <div className="api-container2">
        {/* Contenedor para el título */}
        <div className="title-container">
          <h1 className="home-title">Bienvenido a la Página Principal</h1>
          <h1 className="home-title">METODOS NUMERICOS</h1>
          <h2 className="home-subtitle">Selecciona el método que deseas ver</h2>
        </div>

        {/* Contenedor para los botones */}
        <div className="buttons-container">
          {buttonNames.map((name, index) => (
            <button
              key={index}
              className="home-button"
              onClick={() => navigate(`/${formatMethodNameForURL(name)}`)} // Redirige a la ruta correspondiente
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;