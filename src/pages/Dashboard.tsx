import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [insumosGlobales, setInsumosGlobales] = useState<any[]>([]);
  const [requerimientosMap, setRequerimientosMap] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resReservas, resInsumos] = await Promise.all([
        api.get('/reservas'),
        api.get('/insumos')
      ]);
      const reservasData = resReservas.data.reverse();
      setReservas(reservasData);
      setInsumosGlobales(resInsumos.data);

      const reqs: Record<number, any[]> = {};
      for (const r of reservasData) {
        if (r.menu?.idMenu && r.cantidadNinos > 0) {
          const reqRes = await api.get(`/reservas/requerimientos-reales?idMenu=${r.menu.idMenu}&ninos=${r.cantidadNinos}`);
          reqs[r.idReserva] = reqRes.data;
        }
      }
      setRequerimientosMap(reqs);

    } catch (error) {
      console.error("Error cargando el motor logístico:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCambiarEstado = async (reserva: any, nuevoEstado: string) => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}? ${nuevoEstado === 'CONFIRMADA' ? 'Esto descontará el stock de bodega.' : ''}`)) return;
    try {
      await api.put(`/reservas/${reserva.idReserva}`, { ...reserva, estado: nuevoEstado });
      fetchData(); 
    } catch (error) {
      alert("Error al actualizar la reserva.");
    }
  };

  // NUEVA FUNCIÓN: Eliminar permanentemente la reserva rechazada
  const handleEliminarReserva = async (idReserva: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro histórico? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(`/reservas/${idReserva}`);
      fetchData(); 
    } catch (error) {
      console.error("Error al eliminar la reserva:", error);
      alert("Hubo un problema al intentar eliminar este registro del sistema.");
    }
  };

  const formatearFecha = (fechaHoraStr: string) => {
    if (!fechaHoraStr) return 'N/A';
    const fecha = new Date(fechaHoraStr);
    return fecha.toLocaleDateString('es-CL') + ' ' + fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-stone-500 font-medium">Cargando motor logístico...</div>;
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      
      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-8 border-amber-700">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Motor de Asignación Logística</h1>
          <p className="text-stone-500 mt-1">Cruce automático de minutas vs. Recetas Reales y Bodega</p>
        </div>
        <div className="flex gap-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div className="text-center">
            <p className="text-xs text-stone-500 font-bold uppercase">Minutas</p>
            <p className="text-3xl font-black text-amber-700">{reservas.length}</p>
          </div>
          <div className="w-px bg-stone-300 self-stretch"></div>
          <div className="text-center">
            <p className="text-xs text-stone-500 font-bold uppercase">Items Bodega</p>
            <p className="text-3xl font-black text-green-700">{insumosGlobales.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-stone-100 text-stone-700 border-b-2 border-stone-200 text-sm">
              <th className="p-4 font-bold">Solicitante</th>
              <th className="p-4 font-bold w-44">Fecha Evento</th>
              <th className="p-4 font-bold w-52">Minuta Base</th>
              <th className="p-4 font-bold bg-amber-50/50 text-amber-900 border-l border-amber-200 w-80">📦 Desglose de Insumos (Receta)</th>
              <th className="p-4 font-bold bg-purple-50/50 text-purple-900 border-l border-purple-200 text-center w-36">🧑‍🍳 Staff (2:5)</th>
              <th className="p-4 font-bold text-center">Estado</th>
              <th className="p-4 font-bold text-right">Decisión Logística</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length > 0 ? (
              reservas.map((r) => {
                const ninos = r.cantidadNinos || 0;
                const staffRequerido = Math.ceil(ninos / 5) * 2;
                const requerimientos = requerimientosMap[r.idReserva] || [];

                return (
                  <tr key={r.idReserva} className="border-b border-stone-100 hover:bg-stone-50/80 text-sm">
                    
                    <td className="p-4">
                      <p className="font-extrabold text-stone-800">{r.cliente?.nombre}</p>
                      <p className="text-xs text-stone-500 font-medium">📞 {r.cliente?.telefono}</p>
                      <p className="text-xs text-stone-500 font-medium">📧 {r.cliente?.correo}</p>
                    </td>

                    <td className="p-4 font-semibold text-stone-700">
                      {formatearFecha(r.fechaHora)}
                      <p className="text-xs font-black text-green-700 mt-1">Estimado: ${r.totalEstimado?.toLocaleString('es-CL')}</p>
                    </td>

                    <td className="p-4 text-xs text-stone-600 font-medium max-w-[200px]">
                      <p className="font-bold text-amber-800 mb-1">{r.menu?.nombreMenu}</p>
                      <p className="truncate" title={r.observaciones}>{r.observaciones}</p>
                    </td>

                    <td className="p-4 bg-amber-50/20 border-l border-amber-100">
                      {requerimientos.length > 0 ? (
                        <div className="space-y-1.5 text-xs">
                          {requerimientos.map((req: any) => {
                            const tieneStock = req.stockActual >= req.cantidadTotalRequerida;
                            const faltante = req.cantidadTotalRequerida - req.stockActual;
                            
                            return (
                              <div key={req.idInsumo} className="flex flex-col bg-white p-1.5 rounded border border-stone-200/60 shadow-sm">
                                <div className="flex justify-between font-medium">
                                  <span className="text-stone-800">{req.nombre}</span>
                                  <span className="text-stone-500">{req.cantidadTotalRequerida} {req.unidadMedida} (Stock: {req.stockActual})</span>
                                </div>
                                <div className="text-right mt-0.5 font-bold">
                                  {tieneStock ? (
                                    <span className="text-green-600 text-[10px] bg-green-50 px-1 rounded">✔ Stock Suficiente</span>
                                  ) : (
                                    <span className="text-red-600 text-[10px] bg-red-50 px-1 rounded">⚠️ Comprar Faltante: {faltante} {req.unidadMedida}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-stone-400 text-xs italic">El menú seleccionado no tiene recetas cargadas o está a la carta.</p>
                      )}
                    </td>

                    <td className="p-4 bg-purple-50/20 border-l border-purple-100 text-center">
                      <p className="font-bold text-stone-800">{ninos} Niños</p>
                      <p className="text-xs text-purple-900 font-extrabold bg-purple-100 px-2 py-1 rounded-full mt-1 inline-block">
                        🧑‍🍳 {staffRequerido} Staff
                      </p>
                    </td>

                    <td className="p-4 text-center">
                      {r.estado === 'PENDIENTE' ? (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold block">PENDIENTE</span>
                      ) : r.estado === 'CONFIRMADA' ? (
                        <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-bold block">CONFIRMADA</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-bold block">RECHAZADA</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {r.estado === 'PENDIENTE' && (
                        <div className="flex flex-col gap-2.5 max-w-[140px] ml-auto">
                          <button 
                            onClick={() => handleCambiarEstado(r, 'CONFIRMADA')} 
                            className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-sm text-center"
                          >
                            Aprobar Evento
                          </button>
                          <button 
                            onClick={() => handleCambiarEstado(r, 'RECHAZADA')} 
                            className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-sm text-center"
                          >
                            Rechazar Solicitud
                          </button>
                        </div>
                      )}
                      
                      {r.estado !== 'PENDIENTE' && (
                        <div className="flex flex-col gap-2.5 max-w-[140px] ml-auto">
                          <button 
                            onClick={() => handleCambiarEstado(r, 'PENDIENTE')} 
                            className="bg-stone-200 hover:bg-stone-300 text-stone-700 py-1.5 px-3 rounded-md font-bold text-xs transition-colors cursor-pointer"
                          >
                            Revertir Decisión
                          </button>
                          
                          {/* BOTÓN DE ELIMINAR SOLO DISPONIBLE SI ESTÁ RECHAZADA */}
                          {r.estado === 'RECHAZADA' && (
                            <button 
                              onClick={() => handleEliminarReserva(r.idReserva)} 
                              className="text-red-500 hover:text-red-700 font-bold text-xs py-1 transition-colors cursor-pointer flex items-center justify-end gap-1"
                            >
                              <span>🗑️</span> Eliminar Registro
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-500 italic">
                  No se registran minutas ni solicitudes de eventos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}