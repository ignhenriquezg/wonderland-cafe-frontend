import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para el formulario del nuevo cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  // Traer los clientes desde Spring Boot
  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error("Error cargando los clientes:", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Enviar el nuevo cliente al Backend
  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clientes', {
        nombre,
        telefono,
        correo
      });

      // Limpiar y cerrar modal
      setIsModalOpen(false);
      setNombre('');
      setTelefono('');
      setCorreo('');
      
      // Recargar la tabla
      fetchClientes();
    } catch (error) {
      console.error("Error al crear cliente:", error);
      alert("Error al guardar. Revisa la consola.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl relative">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Gestión de Clientes</h1>
          <p className="text-stone-500">Administra la base de datos de tus clientes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md"
        >
          + Nuevo Cliente
        </button>
      </div>
      
      {/* TABLA DE CLIENTES */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-b-2 border-stone-200">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre Completo</th>
              <th className="p-4 font-semibold">Teléfono</th>
              <th className="p-4 font-semibold">Correo Electrónico</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <tr key={cliente.idCliente} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="p-4 text-stone-500">#{cliente.idCliente}</td>
                  <td className="p-4 font-medium text-stone-800">{cliente.nombre}</td>
                  <td className="p-4 text-stone-600">{cliente.telefono || 'N/A'}</td>
                  <td className="p-4 text-stone-600">{cliente.correo || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-stone-500">
                  No hay clientes registrados en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE NUEVO CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Registrar Cliente</h2>
            <form onSubmit={handleCrearCliente} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej: Familia Silva"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
                <input 
                  type="text" 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej: +56 9 1234 5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={correo} 
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ej: correo@dominio.com"
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
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}