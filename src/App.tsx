import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Pantalla de Login (No lleva barra lateral) */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Privadas: Todas estas tendrán la barra lateral (Sidebar) inyectada por el Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App;