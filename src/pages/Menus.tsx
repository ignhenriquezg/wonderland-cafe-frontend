import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Menus() {
  const [menus, setMenus] = useState<any[]>([]);
  const [listaTematicas, setListaTematicas] = useState<any[]>([]);
  const [listaInsumos, setListaInsumos] = useState<any[]>([]); // Almacena insumos registrados
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nombreMenu, setNombreMenu] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [idTematica, setIdTematica] = useState('');
  const [tipoProducto, setTipoProducto] = useState('Menú Completo'); 
  
  // Estado dinámico para mapear { idInsumo: cantidadEscrita }
  const [cantidadesInsumos, setCantidadesInsumos] = useState<Record<number, string>>({});

  const fetchData = async () => {
    try {
      const [resMenus, resTematicas, resInsumos] = await Promise.all([ 
        api.get('/menus'), 
        api.get('/tematicas'),
        api.get('/insumos')
      ]);
      setMenus(resMenus.data);
      setListaTematicas(resTematicas.data);
      setListaInsumos(resInsumos.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCrearMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Formateamos el payload de insumos filtrando los que tengan cantidad ingresada mayor a 0
      const insumosPayload = Object.keys(cantidadesInsumos)
        .filter(id => Number(cantidadesInsumos[Number(id)]) > 0)
        .map(id => ({
          insumo: { idInsumo: Number(id) },
          cantidadNecesaria: Number(cantidadesInsumos[Number(id)])
        }));

      await api.post('/menus', { 
        nombreMenu: nombreMenu, 
        precioBase: Number(precioBase), 
        tematica: { idTematica: Number(idTematica) },
        tipoProducto: tipoProducto,
        insumos: insumosPayload // Enviamos la receta estructurada al backend
      });

      setIsModalOpen(false);
      setNombreMenu(''); 
      setPrecioBase(''); 
      setIdTematica(''); 
      setTipoProducto('Menú Completo');
      setCantidadesInsumos({});
      fetchData();
    } catch (error) {
      console.error("Error al crear menú con receta:", error);
      alert("Error al guardar. Verifica la consola.");
    }
  };

  const handleEliminarMenu = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este ítem?")) return;
    try {
      await api.delete(`/menus/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se puede eliminar porque está siendo utilizado en una reserva activa.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl relative">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Catálogo de Menús y Productos</h1>
          <p className="text-stone-500">Administra paquetes completos e ítems individuales</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md">
          + Nuevo Ítem
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-b-2 border-stone-200">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Tipo</th>
              <th className="p-4 font-semibold">Nombre del Ítem</th>
              <th className="p-4 font-semibold">Temática</th>
              <th className="p-4 font-semibold">Precio Base</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {menus.length > 0 ? (
              menus.map((menu) => (
                <tr key={menu.idMenu} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="p-4 text-stone-500">#{menu.idMenu}</td>
                  <td className="p-4 font-bold text-stone-600 text-xs uppercase tracking-wide">
                    {menu.tipoProducto === 'Producto Individual' ? '🛒 Producto' : '🍱 Menú Completo'}
                  </td>
                  <td className="p-4 font-medium text-stone-800">{menu.nombreMenu}</td>
                  <td className="p-4 text-stone-600">
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold">{menu.tematica?.nombreTematica || 'General'}</span>
                  </td>
                  <td className="p-4 text-green-700 font-semibold">${menu.precioBase}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEliminarMenu(menu.idMenu)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 transition-colors cursor-pointer">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-500">No hay ítems registrados en el catálogo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <h2 className="text-2xl font-bold text-amber-800 mb-4 border-b pb-2">Registrar al Catálogo</h2>
            
            <form onSubmit={handleCrearMenu} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de Ítem</label>
                <select value={tipoProducto} onChange={(e) => setTipoProducto(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white font-semibold text-stone-700 outline-none">
                  <option value="Menú Completo">🍱 Menú Completo</option>
                  <option value="Producto Individual">🛒 Producto Individual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                <input type="text" value={nombreMenu} onChange={(e) => setNombreMenu(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ej: Cupcake Alicia o Menú Sombrerero" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Temática</label>
                  <select value={idTematica} onChange={(e) => setIdTematica(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none" required>
                    <option value="" disabled>Seleccione...</option>
                    {listaTematicas.map((t) => (
                      <option key={t.idTematica} value={t.idTematica}>{t.nombreTematica}</option> 
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Precio Base ($)</label>
                  <input type="number" min="0" value={precioBase} onChange={(e) => setPrecioBase(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" required />
                </div>
              </div>

              {/* SECCIÓN INTERACTIVA: CONFIGURADOR DINÁMICO DE RECETAS */}
              <div className="border-t pt-3 space-y-2">
                <label className="block text-sm font-bold text-stone-700">🛠️ Definir Receta (Asignar Insumos por Unidad/Niño)</label>
                <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded">Indica qué cantidad requiere este producto. Deja vacío o en 0 los insumos que no use.</p>
                
                <div className="border rounded-xl divide-y bg-stone-50/50 max-h-48 overflow-y-auto p-2 space-y-1">
                  {listaInsumos.length > 0 ? (
                    listaInsumos.map((ins) => (
                      <div key={ins.idInsumo} className="flex justify-between items-center py-2 px-1 text-sm bg-white rounded-lg p-2 shadow-sm mb-1">
                        <span className="font-semibold text-stone-700">{ins.nombre}</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={cantidadesInsumos[ins.idInsumo] || ''}
                            onChange={(e) => setCantidadesInsumos({
                              ...cantidadesInsumos,
                              [ins.idInsumo]: e.target.value
                            })}
                            className="w-20 text-center px-2 py-1 border rounded-lg outline-none focus:border-amber-500 font-bold"
                          />
                          <span className="text-xs text-stone-500 w-16 truncate">{ins.unidadMedida}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400 text-xs p-4 text-center">No hay insumos registrados en bodega para armar la receta.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg font-medium cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold cursor-pointer shadow">Guardar al Catálogo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}