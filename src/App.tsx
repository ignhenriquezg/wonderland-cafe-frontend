import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Menus from './pages/Menus';
import Tematicas from './pages/Tematicas';
import Insumos from './pages/Insumos';
import Personal from './pages/Personal';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/menus" element={<Menus />} />
          <Route path="/tematicas" element={<Tematicas />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/personal" element={<Personal />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App;