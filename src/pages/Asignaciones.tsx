import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Asignaciones() {
  const [reservasConfirmadas, setReservasConfirmadas] = useState<any[]>([]);
  const [personal, setPersonal] = useState<any[]>([]);
  const [personajes, setPersonajes] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reservaSeleccionada, setReservaSeleccionada] = useState<any>(null);
  const [idPersonal, setIdPersonal] = useState('');
  const [idPersonaje, setIdPersonaje] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const [incidencias, setIncidencias] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resReservas, resPersonal, resPersonajes, resTurnos] = await Promise.all([
        api.get('/reservas'),
        api.get('/personal'),
        api.get('/personajes'),
        api.get('/turnos')
      ]);

      const confirmadas = resReservas.data.filter((r: any) => r.estado === 'CONFIRMADA').reverse();
      setReservasConfirmadas(confirmadas);
      setPersonal(resPersonal.data);
      setPersonajes(resPersonajes.data);
      setTurnos(resTurnos.data);
    } catch (error) {
      console.error("Error cargando datos de asignación:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval: any;
    const cargarIncidencias = async (idReserva: number) => {
      try {
        const res = await api.get(`/operaciones/reservas/${idReserva}/incidencias`);
        setIncidencias(res.data.reverse());
      } catch (error) {
        console.error("Error cargando incidencias:", error);
      }
    };

    if (reservaSeleccionada) {
      cargarIncidencias(reservaSeleccionada.idReserva);
      interval = setInterval(() => cargarIncidencias(reservaSeleccionada.idReserva), 10000);
    } else {
      setIncidencias([]);
    }

    return () => clearInterval(interval);
  }, [reservaSeleccionada]);

  const handleAsignarTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaSeleccionada) return;

    try {
      const payload: any = {
        reserva: { idReserva: reservaSeleccionada.idReserva },
        personal: { idPersonal: Number(idPersonal) },
        horaInicio: `${reservaSeleccionada.fechaHora.split('T')[0]}T${horaInicio}:00`,
        horaFin: `${reservaSeleccionada.fechaHora.split('T')[0]}T${horaFin}:00`,
        estadoAsistencia: 'PENDIENTE'
      };
      if (idPersonaje) payload.personaje = { idPersonaje: Number(idPersonaje) };

      await api.post('/turnos', payload);
      
      setIdPersonal('');
      setIdPersonaje('');
      setHoraInicio('');
      setHoraFin('');
      fetchData();
    } catch (error) {
      alert("Hubo un error al guardar la asignación.");
    }
  };

  const marcarIncidenciaResuelta = async (idIncidencia: number) => {
    try {
      await api.put(`/operaciones/incidencias/${idIncidencia}/resolver`);
      setIncidencias(prev => prev.map(inc => 
        inc.idIncidencia === idIncidencia ? { ...inc, estado: 'RESUELTA', horaResolucion: new Date().toISOString() } : inc
      ));
    } catch(e) {
      alert("Error al intentar resolver la incidencia.");
    }
  };

  // NUEVA FUNCIÓN: Generar Resumen y Finalizar Evento
  const handleFinalizarEvento = async () => {
    if (!reservaSeleccionada) return;

    const pendientes = incidencias.filter(i => i.estado === 'PENDIENTE').length;
    if (pendientes > 0) {
      alert("⚠️ ALTO: No puedes finalizar el evento mientras existan incidencias PENDIENTES. Resuélvelas primero.");
      return;
    }

    const turnosDelEvento = turnos.filter(t => t.reserva?.idReserva === reservaSeleccionada.idReserva);
    const asistieron = turnosDelEvento.filter(t => t.estadoAsistencia === 'ACEPTADO').length;
    const faltaron = turnosDelEvento.filter(t => t.estadoAsistencia === 'RECHAZADO' || t.estadoAsistencia === 'PENDIENTE').length;

    const confirmacion = window.confirm(
      `🏁 RESUMEN DEL EVENTO\n\n` +
      `• Staff Asistente: ${asistieron}\n` +
      `• Ausencias / No Confirmados: ${faltaron}\n` +
      `• Incidencias Solucionadas: ${incidencias.length}\n\n` +
      `¿Estás seguro de que deseas FINALIZAR este evento? Desaparecerá de tu panel operativo.`
    );

    if (confirmacion) {
      try {
        await api.put(`/operaciones/reservas/${reservaSeleccionada.idReserva}/finalizar`);
        setReservaSeleccionada(null); // Deseleccionamos el evento actual
        fetchData(); // Recargamos para que desaparezca de la lista
        alert("✅ Evento finalizado y archivado con éxito.");
      } catch (error) {
        alert("Error al finalizar el evento.");
      }
    }
  };

  const verJustificativo = async (fileName: string) => {
    try {
      const response = await api.get(`/turnos/archivos/${fileName}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("No se pudo descargar el archivo adjunto.");
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

  if (loading) return <div className="flex justify-center items-center h-64 text-stone-500 font-medium">Cargando panel de operaciones...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-amber-600">
        <h1 className="text-3xl font-black text-stone-800">Panel de Asignaciones (Operaciones)</h1>
        <p className="text-stone-500 mt-1">Asigna el Staff, controla la asistencia y monitorea emergencias en vivo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-md border border-stone-200 flex flex-col max-h-[85vh]">
          <h2 className="font-bold text-stone-700 uppercase text-sm mb-4 tracking-wider flex justify-between items-center">
            <span>Eventos Operativos</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{reservasConfirmadas.length}</span>
          </h2>
          
          <div className="overflow-y-auto pr-2 space-y-3 flex-1">
            {reservasConfirmadas.length > 0 ? (
              reservasConfirmadas.map((r) => {
                const turnosAsignados = turnos.filter(t => t.reserva?.idReserva === r.idReserva);
                const isSelected = reservaSeleccionada?.idReserva === r.idReserva;

                return (
                  <div key={r.idReserva} onClick={() => setReservaSeleccionada(r)} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-stone-100 hover:border-stone-300'}`}>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-stone-800">{r.cliente?.nombre}</p>
                      <span className="text-xs font-bold bg-green-100 text-green-800 px-2 rounded-full">Confirmada</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 capitalize">📅 {formatearFecha(r.fechaHora)}</p>
                    <p className="text-xs text-stone-500 mt-1 flex justify-between">
                      <span>📍 Wonderland Café</span>
                      <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">🧑‍🍳 {turnosAsignados.length} Asignados</span>
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-6 text-stone-400 italic text-sm">No hay reservas confirmadas actualmente.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {!reservaSeleccionada ? (
            <div className="bg-white p-8 rounded-xl shadow-md border border-stone-200 flex flex-col items-center justify-center h-full text-stone-400">
              <span className="text-5xl mb-4">📋</span>
              <p className="font-medium">Selecciona un evento de la lista para gestionar su operación.</p>
            </div>
          ) : (
            <>
              {/* BOTÓN DE CIERRE Y FORMULARIO */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200 relative">
                
                {/* NUEVO: Botón para Finalizar Evento */}
                <div className="absolute top-4 right-6">
                  <button onClick={handleFinalizarEvento} className="bg-stone-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md transition-colors cursor-pointer border border-stone-700">
                    🏁 Finalizar Evento
                  </button>
                </div>

                <div className="mb-4 border-b pb-2">
                  <h2 className="font-bold text-stone-800 text-lg">Asignar Staff al Evento</h2>
                  <span className="text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mt-2">
                    Evento: {formatearFecha(reservaSeleccionada.fechaHora)}
                  </span>
                </div>

                <form onSubmit={handleAsignarTurno} className="flex flex-wrap gap-4 items-end mt-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Seleccionar Staff</label>
                    <select value={idPersonal} onChange={(e) => setIdPersonal(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-amber-500 text-sm" required>
                      <option value="" disabled>Elegir empleado...</option>
                      {personal.map(p => <option key={p.idPersonal} value={p.idPersonal}>{p.nombres} {p.apellidos} ({p.rol?.nombreRol})</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Disfraz (Opcional)</label>
                    <select value={idPersonaje} onChange={(e) => setIdPersonaje(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-amber-500 text-sm">
                      <option value="">Sin disfraz</option>
                      {personajes.map(per => <option key={per.idPersonaje} value={per.idPersonaje}>{per.nombrePersonaje}</option>)}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Entrada</label>
                    <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-amber-500 text-sm" required />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Salida</label>
                    <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-amber-500 text-sm" required />
                  </div>
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors cursor-pointer text-sm shadow-sm">+ Asignar</button>
                </form>
              </div>

              {/* LISTA DE ASISTENCIA */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200">
                <h2 className="font-bold text-stone-700 uppercase text-sm mb-4 tracking-wider">Control de Asistencia del Evento</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                        <th className="p-3 font-semibold">Staff</th>
                        <th className="p-3 font-semibold">Rol</th>
                        <th className="p-3 font-semibold text-center">Horario</th>
                        <th className="p-3 font-semibold text-center">Estado</th>
                        <th className="p-3 font-semibold">Justificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnos.filter(t => t.reserva?.idReserva === reservaSeleccionada.idReserva).length > 0 ? (
                        turnos.filter(t => t.reserva?.idReserva === reservaSeleccionada.idReserva).map((t) => (
                          <tr key={t.idTurno} className="border-b border-stone-100 hover:bg-stone-50/50">
                            <td className="p-3 font-medium text-stone-800">{t.personal?.nombres}</td>
                            <td className="p-3">
                              <span className="text-xs font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded block w-max">{t.personal?.rol?.nombreRol}</span>
                            </td>
                            <td className="p-3 text-center text-stone-600 font-medium">{formatearHora(t.horaInicio)} - {formatearHora(t.horaFin)}</td>
                            <td className="p-3 text-center">
                              {t.estadoAsistencia === 'PENDIENTE' && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Pendiente</span>}
                              {t.estadoAsistencia === 'ACEPTADO' && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Aceptado</span>}
                              {t.estadoAsistencia === 'RECHAZADO' && <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Rechazado</span>}
                            </td>
                            <td className="p-3">
                              {t.estadoAsistencia === 'RECHAZADO' && t.justificacion && (
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="text-[10px] font-bold text-red-600">{t.justificacion}</span>
                                  {t.rutaArchivo && <button onClick={() => verJustificativo(t.rutaArchivo)} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 cursor-pointer">📎 Ver Archivo</button>}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-6 text-center text-stone-400 italic">No has asignado personal a este evento todavía.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MONITOR DE INCIDENCIAS */}
              <div className="bg-white p-6 rounded-xl shadow-md border-t-8 border-red-600">
                <h2 className="font-bold text-stone-800 uppercase text-sm mb-4 tracking-wider flex justify-between items-center">
                  <span>🚨 Monitor de Incidencias (En Vivo)</span>
                  {incidencias.filter(i => i.estado === 'PENDIENTE').length > 0 && (
                    <span className="bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-full animate-pulse shadow-md">
                      {incidencias.filter(i => i.estado === 'PENDIENTE').length} Pendientes
                    </span>
                  )}
                </h2>

                <div className="space-y-3">
                  {incidencias.length > 0 ? (
                    incidencias.map(inc => (
                      <div key={inc.idIncidencia} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all ${inc.estado === 'PENDIENTE' ? 'bg-red-50/50 border-red-200' : 'bg-stone-50 border-stone-200 opacity-70'}`}>
                        <div>
                          <p className={`text-sm font-bold ${inc.estado === 'PENDIENTE' ? 'text-red-800' : 'text-stone-700'}`}>{inc.descripcion}</p>
                          <p className="text-xs text-stone-500 mt-1">
                            Reportado por: <span className="font-semibold">{inc.personalReporta?.nombres} ({inc.personalReporta?.rol?.nombreRol})</span> • {formatearHora(inc.horaReporte)}
                          </p>
                          {inc.estado === 'RESUELTA' && <p className="text-[10px] text-green-700 font-bold mt-1">✓ Resuelta a las {formatearHora(inc.horaResolucion)}</p>}
                        </div>
                        {inc.estado === 'PENDIENTE' && (
                          <button onClick={() => marcarIncidenciaResuelta(inc.idIncidencia)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow transition-colors cursor-pointer sm:w-auto w-full text-center whitespace-nowrap">
                            ✔ Marcar Resuelta
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                      <span className="text-2xl opacity-50">👍</span>
                      <p className="text-stone-400 text-sm font-medium mt-2">Todo en orden. No hay incidencias reportadas.</p>
                    </div>
                  )}
                </div>
              </div>

            </>
          )}

        </div>
      </div>
    </div>
  );
}