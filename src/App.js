import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ApiComponent from './pages/biseccion';
import ApiComponent1 from './pages/punto_fijo';
import ApiComponent2 from './pages/newton_raphson';
import ApiComponent3 from './pages/secante';
import ApiComponent4 from './pages/jacobi';
import ApiComponent5 from './pages/seidel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Ruta para la página principal */}
        <Route path="/biseccion" element={<ApiComponent />} /> {/* Ruta para el método1 */}
        <Route path="/punto_fijo" element={<ApiComponent1 />} /> {/* Ruta para el método2 */}
        <Route path="/newton_raphson" element={<ApiComponent2 />} /> {/* Ruta para el método1 */}
        <Route path="/secante" element={<ApiComponent3 />} /> {/* Ruta para el método1 */}
        <Route path="/jacobi" element={<ApiComponent4 />} /> {/* Ruta para el método1 */}
        <Route path="/gauss_seidel" element={<ApiComponent5 />} /> {/* Ruta para el método1 */}



      </Routes>
    </Router>
  );
}

export default App;