import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
      isActive ? 'bg-amber-700 text-white' : 'text-stone-300 hover:bg-stone-800'
    }`;

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-stone-700">
          <h2 className="text-2xl font-bold text-amber-500 tracking-wider">WONDERLAND</h2>
          <p className="text-sm text-stone-400">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* RUTAS CONECTADAS */}
          <NavLink to="/dashboard" className={navClass}>
            <span>📅</span> Reservas
          </NavLink>
          <NavLink to="/clientes" className={navClass}>
            <span>👥</span> Clientes
          </NavLink>
          <NavLink to="/menus" className={navClass}>
            <span>🍔</span> Menús y Catálogo
          </NavLink>
          <NavLink to="/tematicas" className={navClass}>
            <span>🎭</span> Temáticas
          </NavLink>
          
          {/* Estos los conectaremos después */}
          <div className="flex items-center gap-3 px-4 py-3 text-stone-500 rounded-lg cursor-not-allowed">
            <span>📦</span> Insumos
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-stone-500 rounded-lg cursor-not-allowed">
            <span>🧑‍🍳</span> Personal (Staff)
          </div>
        </nav>

        <div className="p-4 border-t border-stone-700">
          <button 
            onClick={handleCerrarSesion}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 hover:bg-red-900 hover:text-white text-stone-300 rounded-lg transition-colors cursor-pointer"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE TRABAJO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Outlet /> 
      </main>

    </div>
  );
}