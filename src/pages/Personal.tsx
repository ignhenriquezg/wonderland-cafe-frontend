import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Personal() {
  const [personalList, setPersonalList] = useState<any[]>([]);
  const [listaRoles, setListaRoles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados del formulario (Personales)
  const [rut, setRut] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idRol, setIdRol] = useState('');
  
  // Estados de Credenciales de Acceso (Usuario)
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const fetchData = async () => {
    try {
      const [resPersonal, resRoles] = await Promise.all([
        api.get('/personal'),
        api.get('/roles') 
      ]);
      setPersonalList(resPersonal.data);
      setListaRoles(resRoles.data);
    } catch (error) {
      console.error("Error cargando el personal o roles:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCrearPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Enviamos todos los datos unidos en un solo objeto (DTO)
      await api.post('/personal', {
        rut,
        nombres,
        apellidos,
        telefono,
        idRol: Number(idRol),
        correo,
        password
      });

      setIsModalOpen(false);
      setRut(''); setNombres(''); setApellidos(''); setTelefono(''); setIdRol('');
      setCorreo(''); setPassword('');
      fetchData();
    } catch (error) {
      console.error("Error al registrar personal:", error);
      alert("Error al guardar. Verifica la consola.");
    }
  };

  const handleEliminarPersonal = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar a este miembro del staff? Se borrará también su acceso al sistema.")) return;
    try {
      await api.delete(`/personal/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se puede eliminar porque este empleado está asignado a un evento activo o tiene historial.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl relative">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Gestión de Personal</h1>
          <p className="text-stone-500">Administra al equipo de trabajo de Wonderland Café y sus Accesos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md">
          + Registrar Personal
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-b-2 border-stone-200">
              <th className="p-4 font-semibold w-24">ID</th>
              <th className="p-4 font-semibold">RUT</th>
              <th className="p-4 font-semibold">Nombre Completo</th>
              <th className="p-4 font-semibold">Rol</th>
              <th className="p-4 font-semibold">Teléfono</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {personalList.length > 0 ? (
              personalList.map((p) => (
                <tr key={p.idPersonal} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="p-4 text-stone-500">#{p.idPersonal}</td>
                  <td className="p-4 text-stone-600">{p.rut}</td>
                  <td className="p-4 font-medium text-stone-800">{p.nombres} {p.apellidos}</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {p.rol?.nombreRol || 'Sin Rol'} 
                    </span>
                  </td>
                  <td className="p-4 text-stone-600">{p.telefono || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEliminarPersonal(p.idPersonal)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 transition-colors cursor-pointer">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-500">No hay personal registrado en el sistema.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg my-8 relative">
            <h2 className="text-2xl font-bold text-amber-800 mb-4 border-b pb-2">Registrar Nuevo Staff</h2>
            
            <form onSubmit={handleCrearPersonal} className="space-y-4">
              
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4">
                <h3 className="font-bold text-stone-700 text-sm uppercase tracking-wider">1. Datos Personales</h3>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">RUT</label>
                  <input type="text" value={rut} onChange={(e) => setRut(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white" placeholder="Ej: 12345678-9" required maxLength={12} />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nombres</label>
                    <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white" required />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Apellidos</label>
                    <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white" required />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
                    <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white" placeholder="+569..." maxLength={20} />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Rol en el Equipo</label>
                    <select value={idRol} onChange={(e) => setIdRol(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white" required>
                      <option value="" disabled>Seleccione un rol...</option>
                      {listaRoles.map((r) => (
                        <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE CREDENCIALES DE ACCESO */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wider">2. Credenciales de Acceso</h3>
                <p className="text-xs text-blue-600">Asigna un correo y contraseña para que el empleado acceda a su panel. Luego podrán cambiar la contraseña ellos mismos.</p>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-blue-900 mb-1">Correo Electrónico</label>
                    <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="empleado@correo.com" required />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-blue-900 mb-1">Contraseña Inicial</label>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="Mínimo 6 caracteres" required minLength={6} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer font-bold shadow">Crear Empleado y Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}