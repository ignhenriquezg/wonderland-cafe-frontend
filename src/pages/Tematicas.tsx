import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Tematicas() {
  const [tematicas, setTematicas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para el formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState(''); // Añadimos la descripción

  // Traer las temáticas desde Spring Boot
  const fetchTematicas = async () => {
    try {
      const response = await api.get('/tematicas');
      setTematicas(response.data);
    } catch (error) {
      console.error("Error cargando las temáticas:", error);
    }
  };

  useEffect(() => {
    fetchTematicas();
  }, []);

  const handleCrearTematica = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // AQUÍ ESTÁ LA MAGIA: Enviamos el JSON exactamente como lo pide Tematica.java
      await api.post('/tematicas', {
        nombreTematica: nombre, 
        descripcion: descripcion
      });

      setIsModalOpen(false);
      setNombre('');
      setDescripcion('');
      fetchTematicas();
      
    } catch (error) {
      console.error("Error al crear la temática:", error);
      alert("Error al guardar. Verifica la consola.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl relative">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Gestión de Temáticas</h1>
          <p className="text-stone-500">Administra los conceptos y estilos para los eventos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md"
        >
          + Nueva Temática
        </button>
      </div>
      
      {/* TABLA DE TEMÁTICAS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-b-2 border-stone-200">
              <th className="p-4 font-semibold w-24">ID</th>
              <th className="p-4 font-semibold">Nombre de la Temática</th>
              <th className="p-4 font-semibold">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {tematicas.length > 0 ? (
              tematicas.map((t) => (
                <tr key={t.idTematica} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="p-4 text-stone-500">#{t.idTematica}</td>
                  <td className="p-4 font-medium text-stone-800">
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">
                      🎭 {t.nombreTematica}
                    </span>
                  </td>
                  <td className="p-4 text-stone-600">{t.descripcion || 'Sin descripción'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-stone-500">
                  No hay temáticas registradas en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE NUEVA TEMÁTICA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Registrar Temática</h2>
            <form onSubmit={handleCrearTematica} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre de la Temática</label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej: Willy Wonka"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción (Opcional)</label>
                <input 
                  type="text" 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej: Decoración de fábrica de chocolate"
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