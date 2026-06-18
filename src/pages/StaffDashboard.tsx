import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function StaffDashboard() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Estados para el Modal de Rechazo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turnoARechazar, setTurnoARechazar] = useState<number | null>(null);
  const [justificacion, setJustificacion] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);

  // Estados para la Fase 3: Operación en Vivo
  const [turnoActivo, setTurnoActivo] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [descripcionIncidencia, setDescripcionIncidencia] = useState('');
  const [enviandoIncidencia, setEnviandoIncidencia] = useState(false);

  // NUEVO: Estados para el Perfil (Paso 1)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [perfilCorreo, setPerfilCorreo] = useState('');
  const [perfilPassword, setPerfilPassword] = useState('');

  // Datos del Usuario Logueado
  const idPersonal = localStorage.getItem('idPersonal');
  const rolUsuario = localStorage.getItem('rolUsuario');

  const fetchData = async () => {
    try {
      setLoading(true);
      const resTurnos = await api.get('/turnos');
      const misTurnos = resTurnos.data.filter((t: any) => t.personal?.idPersonal === Number(idPersonal));
      misTurnos.reverse();
      setTurnos(misTurnos);

      const ahora = new Date();
      const enCurso = misTurnos.find((t: any) => {
        if (t.estadoAsistencia !== 'ACEPTADO') return false;
        const inicio = new Date(t.horaInicio);
        const fin = new Date(t.horaFin);
        return ahora >= inicio && ahora <= fin;
      });

      if (enCurso) {
        setTurnoActivo(enCurso);
        const resChecklist = await api.get(`/operaciones/turnos/${enCurso.idTurno}/checklist`);
        setChecklist(resChecklist.data);
      } else {
        setTurnoActivo(null);
        setChecklist([]);
      }

    } catch (error) {
      console.error("Error cargando el portal operativo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!idPersonal) {
      navigate('/login');
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- NUEVO: FUNCIONES DEL PERFIL ---
  const abrirModalPerfil = async () => {
    try {
      const res = await api.get(`/usuarios/perfil/${idPersonal}`);
      setPerfilCorreo(res.data.correo);
      setPerfilPassword(''); // Siempre vacía por seguridad
      setIsPerfilModalOpen(true);
    } catch (error) {
      alert("No se pudo cargar la información del perfil.");
    }
  };

  const actualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/usuarios/perfil/${idPersonal}`, {
        correo: perfilCorreo,
        password: perfilPassword
      });
      alert("¡Perfil actualizado con éxito! La próxima vez que inicies sesión, usa tus nuevas credenciales.");
      setIsPerfilModalOpen(false);
    } catch (error) {
      alert("Error al actualizar el perfil.");
    }
  };

  // --- FUNCIONES DE ASISTENCIA Y MODAL ---
  const responderTurno = async (idTurno: number, estado: string, justificacionTexto?: string, archivoAdjunto?: File | null) => {
    try {
      const formData = new FormData();
      formData.append('estado', estado);
      if (justificacionTexto) formData.append('justificacion', justificacionTexto);
      if (archivoAdjunto) formData.append('archivo', archivoAdjunto);

      await api.put(`/turnos/${idTurno}/asistencia`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setIsModalOpen(false);
      setJustificacion('');
      setArchivo(null);
      setTurnoARechazar(null);
      fetchData();
    } catch (error) {
      console.error("Error al responder:", error);
      alert("Hubo un problema al enviar tu respuesta.");
    }
  };

  const abrirModalRechazo = (idTurno: number) => {
    setTurnoARechazar(idTurno);
    setIsModalOpen(true);
  };

  const confirmarRechazo = (e: React.FormEvent) => {
    e.preventDefault();
    if (turnoARechazar) responderTurno(turnoARechazar, 'RECHAZADO', justificacion, archivo);
  };

  // --- FUNCIONES DE OPERACIÓN EN VIVO ---
  const handleCompletarTarea = async (idChecklist: number) => {
    try {
      await api.put(`/operaciones/checklist/${idChecklist}/completar`);
      setChecklist(prev => prev.map(item => item.idChecklist === idChecklist ? { ...item, completada: true, horaCompletada: new Date().toISOString() } : item));
    } catch (error) {
      console.error("Error al completar la tarea:", error);
    }
  };

  const handleReportarIncidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcionIncidencia.trim() || !turnoActivo) return;
    try {
      setEnviandoIncidencia(true);
      await api.post('/operaciones/incidencias', {
        idReserva: turnoActivo.reserva?.idReserva || turnoActivo.evento?.idEvento, 
        idPersonal: Number(idPersonal),
        descripcion: descripcionIncidencia
      });
      alert("🚨 Alerta de incidencia enviada.");
      setDescripcionIncidencia('');
    } catch (error) {
      console.error("Error reportando incidencia:", error);
      alert("No se pudo enviar el reporte.");
    } finally {
      setEnviandoIncidencia(false);
    }
  };

  const formatearFecha = (fechaHoraStr: string) => {
    if (!fechaHoraStr) return 'N/A';
    return new Date(fechaHoraStr).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatearHora = (fechaHoraStr: string) => {
    if (!fechaHoraStr) return 'N/A';
    return new Date(fechaHoraStr).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-stone-100 text-stone-500 font-medium">Cargando portal de operaciones...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-100 font-sans pb-12">
      
      {/* HEADER PORTAL ACTUALIZADO */}
      <nav className="bg-stone-900 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-amber-500 tracking-wider">WONDERLAND CAFÉ</h1>
          <p className="text-xs text-stone-400">Portal Operativo • {rolUsuario}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={abrirModalPerfil} className="bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer border border-stone-600">
            ⚙️ Mi Perfil
          </button>
          <button onClick={handleCerrarSesion} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer">
            🚪 Salir
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 mt-4 space-y-6">
        
        {/* PANEL EN VIVO */}
        {turnoActivo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse-once">
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-xl border-t-8 border-green-600 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="text-xl font-black text-stone-800">⚡ Minuta de Tareas Activa</h3>
                  <p className="text-xs text-stone-500">Completa la checklist para tu rol de {rolUsuario}.</p>
                </div>
                <span className="text-xs font-bold uppercase bg-green-100 text-green-800 px-2.5 py-1 rounded-full animate-pulse">● Evento en Curso</span>
              </div>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.idChecklist} className={`flex items-center justify-between p-3 rounded-xl border ${item.completada ? 'bg-stone-50 opacity-75' : 'bg-white shadow-sm'}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={item.completada} disabled={item.completada} onChange={() => handleCompletarTarea(item.idChecklist)} className="w-5 h-5 accent-green-600 rounded cursor-pointer disabled:cursor-not-allowed" />
                      <span className={`text-sm font-medium ${item.completada ? 'line-through text-stone-400' : 'text-stone-800'}`}>{item.tarea?.descripcion}</span>
                    </div>
                    {item.completada && <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded font-mono">✓ {formatearHora(item.horaCompletada)}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-8 border-red-600 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-800 text-red-700">🚨 Canal de Incidencias</h3>
                <p className="text-xs text-stone-500 mt-1">¿Sucedió un imprevisto? Repórtalo aquí inmediatamente.</p>
                <form onSubmit={handleReportarIncidencia} className="mt-4 space-y-3">
                  <textarea value={descripcionIncidencia} onChange={(e) => setDescripcionIncidencia(e.target.value)} className="w-full p-3 border border-stone-300 rounded-xl outline-none focus:border-red-500 text-xs bg-stone-50/50 resize-none" rows={4} placeholder="Ej: Se quebró una taza..." required></textarea>
                  <button type="submit" disabled={enviandoIncidencia} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-md">⚠️ Emitir Reporte Urgente</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* AGENDA GENERAL */}
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-purple-600">
          <h2 className="text-2xl font-black text-stone-800">Mi Agenda Completa</h2>
          <p className="text-stone-500 mt-1 text-sm">Historial y control de asistencia de tus jornadas laborales.</p>
        </div>

        <div className="grid gap-4">
          {turnos.length > 0 ? (
            turnos.map((t) => {
              const esElTurnoEnVivo = turnoActivo?.idTurno === t.idTurno;
              return (
                <div key={t.idTurno} className={`bg-white p-5 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${esElTurnoEnVivo ? 'border-green-500 bg-green-50/30 ring-2 ring-green-400' : 'border-stone-200'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-stone-800 capitalize">📅 {formatearFecha(t.horaInicio)}</span>
                      {t.estadoAsistencia === 'PENDIENTE' && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pendiente</span>}
                      {t.estadoAsistencia === 'ACEPTADO' && !esElTurnoEnVivo && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Confirmado</span>}
                      {esElTurnoEnVivo && <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">Trabajando Ahora</span>}
                      {t.estadoAsistencia === 'RECHAZADO' && <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Rechazado</span>}
                    </div>
                    <p className="text-stone-600 text-sm font-medium">⏰ Horario: <span className="text-stone-800 font-bold">{formatearHora(t.horaInicio)} a {formatearHora(t.horaFin)}</span></p>
                  </div>
                  {t.estadoAsistencia === 'PENDIENTE' ? (
                    <div className="flex gap-2">
                      <button onClick={() => responderTurno(t.idTurno, 'ACEPTADO')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm">✔ Aceptar</button>
                      <button onClick={() => abrirModalRechazo(t.idTurno)} className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-bold text-sm">✖ Rechazar</button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-xs font-bold text-stone-400 uppercase">Registro Completo</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white p-10 rounded-xl border text-center"><p className="text-stone-500 font-medium">No tienes turnos asignados.</p></div>
          )}
        </div>
      </main>

      {/* MODAL PARA RECHAZAR TURNO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
            <h3 className="text-xl font-bold text-stone-800 mb-2 border-b pb-2">Rechazar Turno</h3>
            <form onSubmit={confirmarRechazo} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Motivo / Justificación</label>
                <textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)} className="w-full p-3 border rounded-lg text-sm" rows={3}></textarea>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border border-dashed">
                <input type="file" onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)} className="w-full text-xs" accept="image/*,.pdf" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-stone-200 py-2 rounded-lg font-bold text-sm">Cancelar</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-sm">Confirmar Rechazo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NUEVO: MODAL DE PERFIL */}
      {isPerfilModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <h3 className="text-xl font-bold text-stone-800 mb-2 border-b pb-2 text-center">⚙️ Configuración de Cuenta</h3>
            <p className="text-xs text-stone-500 mb-4 text-center">Actualiza tus credenciales de acceso al sistema.</p>

            <form onSubmit={actualizarPerfil} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={perfilCorreo} 
                  onChange={(e) => setPerfilCorreo(e.target.value)} 
                  className="w-full p-2 border border-stone-300 rounded-lg outline-none focus:border-amber-500 text-sm" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={perfilPassword} 
                  onChange={(e) => setPerfilPassword(e.target.value)} 
                  className="w-full p-2 border border-stone-300 rounded-lg outline-none focus:border-amber-500 text-sm" 
                  placeholder="Dejar en blanco para no cambiarla"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsPerfilModalOpen(false)} className="flex-1 bg-stone-200 text-stone-700 py-2 rounded-lg font-bold text-sm hover:bg-stone-300 transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors shadow-md cursor-pointer">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}