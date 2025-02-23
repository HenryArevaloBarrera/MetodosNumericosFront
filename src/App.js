import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ApiComponent from './pages/biseccion';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Ruta para la página principal */}
        <Route path="/biseccion" element={<ApiComponent />} /> {/* Ruta para el método1 */}
      </Routes>
    </Router>
  );
}

export default App;