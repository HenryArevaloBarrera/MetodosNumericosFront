import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          Métodos Numéricos
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/biseccion" className={`nav-link ${isActive('/biseccion') ? 'active' : ''}`}>
          Bisección
        </Link>
        <Link to="/punto_fijo" className={`nav-link ${isActive('/punto_fijo') ? 'active' : ''}`}>
          Punto Fijo
        </Link>
        <Link to="/newton_raphson" className={`nav-link ${isActive('/newton_raphson') ? 'active' : ''}`}>
          Newton-Raphson
        </Link>
        <Link to="/secante" className={`nav-link ${isActive('/secante') ? 'active' : ''}`}>
          Secante
        </Link>
        <Link to="/jacobi" className={`nav-link ${isActive('/jacobi') ? 'active' : ''}`}>
          Jacobi
        </Link>
        <Link to="/gauss_seidel" className={`nav-link ${isActive('/gauss_seidel') ? 'active' : ''}`}>
          Gauss-Seidel
        </Link>
        <Link to="/trapecio" className={`nav-link ${isActive('/trapecio') ? 'active' : ''}`}>
          Trapecio
        </Link>
        <Link to="/simpson" className={`nav-link ${isActive('/simpson') ? 'active' : ''}`}>
          Simpson
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;