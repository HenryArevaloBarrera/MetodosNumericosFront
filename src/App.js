import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ApiComponent from './pages/biseccion';
import ApiComponent1 from './pages/punto_fijo';
import ApiComponent2 from './pages/newton_raphson';
import ApiComponent3 from './pages/secante';
import ApiComponent4 from './pages/jacobi';
import ApiComponent5 from './pages/seidel';
import ApiComponent6 from './pages/Trapecio';
import ApiComponent7 from './pages/Simpson';
import ApiComponent8 from './pages/edpe';
import ApiComponent9 from './pages/euler'; // Asegúrate de que este componente exista

import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} /> {/* Ruta para la página principal */}
            <Route path="/biseccion" element={<ApiComponent />} /> {/* Ruta para el método1 */}
            <Route path="/punto_fijo" element={<ApiComponent1 />} /> {/* Ruta para el método2 */}
            <Route path="/newton_raphson" element={<ApiComponent2 />} /> {/* Ruta para el método1 */}
            <Route path="/secante" element={<ApiComponent3 />} /> {/* Ruta para el método1 */}
            <Route path="/jacobi" element={<ApiComponent4 />} /> {/* Ruta para el método1 */}
            <Route path="/gauss_seidel" element={<ApiComponent5 />} /> {/* Ruta para el método1 */}
            <Route path="/trapecio" element={<ApiComponent6 />} /> {/* Ruta para el método1 */}
            <Route path="/simpson" element={<ApiComponent7 />} /> {/* Ruta para el método1 */}
            <Route path="/edpe" element={<ApiComponent8 />} /> {/* Ruta para el método1 */}
            <Route path="/euler" element={<ApiComponent9 />} /> {/* Ruta para el método de Euler */}
            {/* Puedes agregar más rutas aquí para otros métodos */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
