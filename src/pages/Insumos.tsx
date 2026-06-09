import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Insumos() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');

  // Traer los insumos desde Spring Boot
  const fetchInsumos = async () => {
    try {
      const response = await api.get('/insumos');
      setInsumos(response.data);
    } catch (error) {
      console.error("Error cargando los insumos:", error);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const handleCrearInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Enviamos el JSON tal cual lo pide Insumo.java
      await api.post('/insumos', {
        nombre: nombre,
        unidadMedida: unidadMedida
      });

      setIsModalOpen(false);
      setNombre('');
      setUnidadMedida('');
      fetchInsumos();
      
    } catch (error) {
      console.error("Error al crear insumo:", error);
      alert("Error al guardar. Verifica la consola.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl relative">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Gestión de Insumos</h1>
          <p className="text-stone-500">Administra el inventario y materiales para los eventos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md"
        >
          + Nuevo Insumo
        </button>
      </div>
      
      {/* TABLA DE INSUMOS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-b-2 border-stone-200">
              <th className="p-4 font-semibold w-24">ID</th>
              <th className="p-4 font-semibold">Nombre del Insumo</th>
              <th className="p-4 font-semibold">Unidad de Medida</th>
            </tr>
          </thead>
          <tbody>
            {insumos.length > 0 ? (
              insumos.map((insumo) => (
                <tr key={insumo.idInsumo} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="p-4 text-stone-500">#{insumo.idInsumo}</td>
                  <td className="p-4 font-medium text-stone-800">{insumo.nombre}</td>
                  <td className="p-4 text-stone-600">
                    <span className="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {insumo.unidadMedida}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-stone-500">
                  No hay insumos registrados en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE NUEVO INSUMO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Registrar Insumo</h2>
            <form onSubmit={handleCrearInsumo} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del Insumo</label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej: Vasos temáticos, Harina, Globos..."
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Unidad de Medida</label>
                <select 
                  value={unidadMedida} 
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  required
                >
                  <option value="" disabled>Seleccione una medida...</option>
                  <option value="Unidades">Unidades</option>
                  <option value="Kilogramos (kg)">Kilogramos (kg)</option>
                  <option value="Gramos (g)">Gramos (g)</option>
                  <option value="Litros (L)">Litros (L)</option>
                  <option value="Cajas">Cajas</option>
                  <option value="Paquetes">Paquetes</option>
                </select>
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}