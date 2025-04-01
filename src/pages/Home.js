import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const methods = [
    {
      title: 'Método de Bisección',
      description: 'Método numérico para encontrar raíces de una función en un intervalo cerrado.',
      path: '/biseccion',
      icon: '🔍',
      color: '#4A80F0',
      gradient: 'linear-gradient(135deg, #4A80F0, #3A70E0)',
      category: 'Raíces',
    },
    {
      title: 'Método de Punto Fijo',
      description: 'Método iterativo para encontrar puntos fijos de una función.',
      path: '/punto_fijo',
      icon: '⚡',
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B, #FF5252)',
      category: 'Raíces',
    },
    {
      title: 'Método de Newton-Raphson',
      description: 'Método iterativo que utiliza la derivada para encontrar raíces de una función.',
      path: '/newton_raphson',
      icon: '📈',
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50, #45A049)',
      category: 'Raíces',
    },
    {
      title: 'Método de la Secante',
      description: 'Método numérico que aproxima la derivada usando diferencias finitas.',
      path: '/secante',
      icon: '📐',
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
      category: 'Raíces',
    },
    {
      title: 'Método de Jacobi',
      description: 'Método iterativo para resolver sistemas de ecuaciones lineales.',
      path: '/jacobi',
      icon: '🔄',
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800, #F57C00)',
      category: 'Sistemas',
    },
    {
      title: 'Método de Gauss-Seidel',
      description: 'Método iterativo mejorado para resolver sistemas de ecuaciones lineales.',
      path: '/gauss_seidel',
      icon: '⚡',
      color: '#00BCD4',
      gradient: 'linear-gradient(135deg, #00BCD4, #0097A7)',
      category: 'Sistemas',
    },
  ];

  const categories = [...new Set(methods.map((method) => method.category))];

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Métodos Numéricos</h1>
        <p className="hero-subtitle">
          Calculadora interactiva para resolver problemas matemáticos usando métodos numéricos
          <ul>
            <h4> Integrantes:</h4>
            <li>Camilo Alejandro Colón</li>
            <li>Henry Hair Arevalo</li>
          </ul>
        </p>

      </div>

      <div className="methods-container">
        {categories.map((category) => (
          <div key={category} className="category-section">
            <h2 className="category-title">{category}</h2>
            <div className="methods-grid">
              {methods
                .filter((method) => method.category === category)
                .map((method, index) => (
                  <Link to={method.path} key={index} className="method-card">
                    <div className="method-card-content">
                      <div className="method-icon" style={{ backgroundColor: method.color }}>
                        {method.icon}
                      </div>
                      <div className="method-info">
                        <h3 className="method-title">{method.title}</h3>
                        <p className="method-description">{method.description}</p>
                      </div>
                      <div className="method-arrow">
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h2>¿Qué son los métodos numéricos?</h2>
        <p>
          Los métodos numéricos son técnicas matemáticas que utilizan aproximaciones numéricas para resolver problemas
          matemáticos que no pueden resolverse analíticamente. Son especialmente útiles en:
        </p>
        <ul>
          <li>Encontrar raíces de ecuaciones no lineales</li>
          <li>Resolver sistemas de ecuaciones lineales</li>
          <li>Calcular integrales definidas</li>
          <li>Resolver ecuaciones diferenciales</li>
        </ul>

      </div>
    </div>
  );
};

export default Home;
