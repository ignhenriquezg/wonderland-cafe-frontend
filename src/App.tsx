import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Menus from './pages/Menus';
import Tematicas from './pages/Tematicas';
import Insumos from './pages/Insumos';
import Personal from './pages/Personal';
import Asignaciones from './pages/Asignaciones'; 
import Layout from './components/Layout';
import Landing from './pages/Landing';
import StaffDashboard from './pages/StaffDashboard'; // <-- IMPORTACIÓN DEL PORTAL DE STAFF

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA (El cliente llega aquí primero) */}
        <Route path="/" element={<Landing />} />
        
        {/* RUTA DE AUTENTICACIÓN */}
        <Route path="/login" element={<Login />} />
        
        {/* RUTA DEL STAFF: Portal de trabajadores (Fuera del Layout del Admin) */}
        <Route path="/staff" element={<StaffDashboard />} />
        
        {/* RUTAS PRIVADAS: Todo el Panel Administrativo (Con barra lateral negra) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/menus" element={<Menus />} />
          <Route path="/tematicas" element={<Tematicas />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/personal" element={<Personal />} />
          
          {/* Puente Logístico para asignar eventos al Staff */}
          <Route path="/asignaciones" element={<Asignaciones />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App;