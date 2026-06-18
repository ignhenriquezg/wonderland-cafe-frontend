import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Insumos() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tabActiva, setTabActiva] = useState('activos'); // 'activos' o 'faltantes'

  const [nombre, setNombre] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [stockActual, setStockActual] = useState(''); // Nuevo estado

  const fetchInsumos = async () => {
    try {
      const response = await api.get('/insumos');
      setInsumos(response.data);
    } catch (error) {
      console.error("Error cargando los insumos:", error);
    }
  };

  useEffect(() => { fetchInsumos(); }, []);

  const handleCrearInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/insumos', { 
        nombre: nombre, 
        unidadMedida: unidadMedida,
        stockActual: Number(stockActual) // Enviamos el stock
      });
      setIsModalOpen(false);
      setNombre(''); setUnidadMedida(''); setStockActual('');
      fetchInsumos();
    } catch (error) {
      console.error("Error al crear insumo:", error);
      alert("Error al guardar. Verifica la consola.");
    }
  };

  const handleEliminarInsumo = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este insumo?")) return;
    try {
      await api.delete(`/insumos/${id}`);
      fetchInsumos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se puede eliminar este insumo porque está siendo utilizado.");
    }
  };

  // Filtramos para mostrar los que tienen stock en 0 como "Faltantes"
  const insumosMostrados = tabActiva === 'activos' 
    ? insumos.filter(i => i.stockActual > 0) 
    : insumos.filter(i => i.stockActual <= 0);

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl relative">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Gestión de Insumos y Bodega</h1>
          <p className="text-stone-500">Administra el inventario para abastecer los eventos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md">
          + Registrar Insumo
        </button>
      </div>

      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setTabActiva('activos')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors cursor-pointer ${tabActiva === 'activos' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
        >
          📦 Inventario Activo
        </button>
        <button 
          onClick={() => setTabActiva('faltantes')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${tabActiva === 'faltantes' ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
        >
          ⚠️ Alertas de Faltantes
          {insumos.filter(i => i.stockActual <= 0).length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {insumos.filter(i => i.stockActual <= 0).length}
            </span>
          )}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-b-2 border-stone-200">
              <th className="p-4 font-semibold w-24">ID</th>
              <th className="p-4 font-semibold">Nombre del Insumo</th>
              <th className="p-4 font-semibold">Stock Actual</th>
              <th className="p-4 font-semibold">Unidad</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {insumosMostrados.length > 0 ? (
              insumosMostrados.map((insumo) => (
                <tr key={insumo.idInsumo} className={`border-b hover:bg-stone-50 transition-colors ${insumo.stockActual <= 0 ? 'bg-red-50/30' : 'border-stone-100'}`}>
                  <td className="p-4 text-stone-500">#{insumo.idInsumo}</td>
                  <td className="p-4 font-bold text-stone-800">{insumo.nombre}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-black ${insumo.stockActual > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {insumo.stockActual}
                    </span>
                  </td>
                  <td className="p-4 text-stone-600 font-medium">{insumo.unidadMedida}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEliminarInsumo(insumo.idInsumo)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 transition-colors cursor-pointer">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-stone-500">
                  {tabActiva === 'activos' ? 'No hay insumos con stock positivo.' : '¡Excelente! No hay faltantes registrados en bodega.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Registrar a Bodega</h2>
            <form onSubmit={handleCrearInsumo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del Insumo</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Ej: Harina Selecta" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Stock Inicial</label>
                  <input type="number" step="0.1" min="0" value={stockActual} onChange={(e) => setStockActual(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Ej: 10" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Medida</label>
                  <select value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white" required>
                    <option value="" disabled>Elegir...</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Kilogramos">Kg</option>
                    <option value="Gramos">Gramos</option>
                    <option value="Litros">Litros</option>
                    <option value="Cajas">Cajas</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer">Guardar en Bodega</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}