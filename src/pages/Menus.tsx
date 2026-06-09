import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Menus() {
  const [menus, setMenus] = useState<any[]>([]);
  const [listaTematicas, setListaTematicas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nombreMenu, setNombreMenu] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [idTematica, setIdTematica] = useState('');

  const fetchData = async () => {
    try {
      const [resMenus, resTematicas] = await Promise.all([
        api.get('/menus'),
        api.get('/tematicas') 
      ]);
      setMenus(resMenus.data);
      setListaTematicas(resTematicas.data);
    } catch (error) {
      console.error("Error cargando datos del catálogo:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCrearMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/menus', {
        nombreMenu: nombreMenu,
        precioBase: Number(precioBase),
        tematica: { idTematica: Number(idTematica) } 
      });

      setIsModalOpen(false);
      setNombreMenu('');
      setPrecioBase('');
      setIdTematica('');
      fetchData();
      
    } catch (error) {
      console.error("Error al crear menú:", error);
      alert("Error al guardar. Verifica la consola.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl relative">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Catálogo de Menús</h1>
          <p className="text-stone-500">Administra los paquetes y precios ofrecidos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md"
        >
          + Nuevo Menú
        </button>
      </div>
      
      {/* TABLA DE MENÚS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-b-2 border-stone-200">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre del Menú</th>
              <th className="p-4 font-semibold">Temática</th>
              <th className="p-4 font-semibold">Precio Base</th>
            </tr>
          </thead>
          <tbody>
            {menus.length > 0 ? (
              menus.map((menu) => (
                <tr key={menu.idMenu} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="p-4 text-stone-500">#{menu.idMenu}</td>
                  <td className="p-4 font-medium text-stone-800">{menu.nombreMenu}</td>
                  <td className="p-4 text-stone-600">
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold">
                      {/* CAMBIO AQUÍ: nombreTematica */}
                      {menu.tematica?.nombreTematica || 'General'}
                    </span>
                  </td>
                  <td className="p-4 text-green-700 font-semibold">${menu.precioBase}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-stone-500">
                  No hay menús registrados en el catálogo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE NUEVO MENÚ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Registrar Nuevo Menú</h2>
            <form onSubmit={handleCrearMenu} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del Menú</label>
                <input 
                  type="text" 
                  value={nombreMenu} 
                  onChange={(e) => setNombreMenu(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej: Menú Sombrerero Loco"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Temática</label>
                <select 
                  value={idTematica} 
                  onChange={(e) => setIdTematica(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  required
                >
                  <option value="" disabled>Seleccione una temática...</option>
                  {listaTematicas.map((t) => (
                    // CAMBIO AQUÍ: nombreTematica
                    <option key={t.idTematica} value={t.idTematica}>{t.nombreTematica}</option> 
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Precio Base ($)</label>
                <input 
                  type="number" 
                  min="0"
                  value={precioBase} 
                  onChange={(e) => setPrecioBase(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej: 15000"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Guardar Menú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}