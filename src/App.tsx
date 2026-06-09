import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Menus from './pages/Menus';
import Tematicas from './pages/Tematicas';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Pantalla de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Privadas */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/menus" element={<Menus />} />
          <Route path="/tematicas" element={<Tematicas />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App;