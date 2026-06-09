import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const [eventosCalendario, setEventosCalendario] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null);
  
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [listaMenus, setListaMenus] = useState<any[]>([]);

  const [idCliente, setIdCliente] = useState('');
  const [idMenu, setIdMenu] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [cantNinos, setCantNinos] = useState('');

  const fetchEventos = async () => {
    try {
      const response = await api.get('/eventos');
      const eventosMapeados = response.data.map((evento: any) => {
        let fechaString = evento.fechaEvento;
        if (Array.isArray(fechaString)) {
            const mes = String(fechaString[1]).padStart(2, '0');
            const dia = String(fechaString[2]).padStart(2, '0');
            fechaString = `${fechaString[0]}-${mes}-${dia}`;
        }
        
        const nombreCliente = evento.cliente?.nombre || 'Cliente'; 
        
        return {
          id: evento.idEvento, 
          title: `Reserva - ${nombreCliente}`, 
          date: fechaString,
          extendedProps: {
            cliente: `${nombreCliente} ${evento.cliente?.apellido || ''}`,
            menu: evento.menu?.nombreMenu || 'No especificado',
            estado: evento.estado?.descripcion || 'Ingresado',
            cantNinos: evento.cantNinos
          }
        };
      });
      setEventosCalendario(eventosMapeados);
    } catch (error) {
      console.error("Error cargando los eventos:", error);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const [resClientes, resMenus] = await Promise.all([
        api.get('/clientes'),
        api.get('/menus')
      ]);
      setListaClientes(resClientes.data);
      setListaMenus(resMenus.data);
    } catch (error) {
      console.error("Error cargando los catálogos:", error);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchCatalogos(); 
  }, []);

  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestDTO = {
        idCliente: Number(idCliente),
        idMenu: Number(idMenu),
        fechaEvento: fechaEvento,
        cantNinos: Number(cantNinos)
      };

      await api.post('/eventos/reservar', requestDTO);

      setIsModalOpen(false);
      setIdCliente('');
      setIdMenu('');
      setFechaEvento('');
      setCantNinos('');
      fetchEventos(); 

    } catch (error) {
      console.error("Error al crear la reserva:", error);
      alert("Error al guardar. Revisa la consola.");
    }
  };

  const handleEventClick = (info: any) => {
    setEventoSeleccionado({
      id: info.event.id,
      title: info.event.title,
      fecha: info.event.startStr,
      ...info.event.extendedProps
    });
    setIsDetalleModalOpen(true);
  };

  const handleEliminarReserva = async () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas cancelar esta reserva?");
    if (!confirmar) return;

    try {
      await api.delete(`/eventos/${eventoSeleccionado.id}`);
      setIsDetalleModalOpen(false);
      fetchEventos(); 
    } catch (error) {
      console.error("Error al eliminar la reserva:", error);
      alert("Hubo un error al cancelar la reserva. Revisa la consola.");
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    // CONTENEDOR PRINCIPAL: Flexbox para dividir Sidebar y Contenido
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      
      {/* 1. SIDEBAR (Barra de Navegación Lateral) */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-stone-700">
          <h2 className="text-2xl font-bold text-amber-500 tracking-wider">WONDERLAND</h2>
          <p className="text-sm text-stone-400">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-amber-700 text-white rounded-lg transition-colors font-medium">
            <span>📅</span> Reservas
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer">
            <span>👥</span> Clientes
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer">
            <span>🍔</span> Menús y Catálogo
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer">
            <span>📦</span> Insumos
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer">
            <span>🧑‍🍳</span> Personal (Staff)
          </a>
        </nav>

        <div className="p-4 border-t border-stone-700">
          <button 
            onClick={handleCerrarSesion}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 hover:bg-red-900 hover:text-white text-stone-300 rounded-lg transition-colors cursor-pointer"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 2. ÁREA DE TRABAJO PRINCIPAL (Contenido dinámico) */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
          
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-800">Panel de Calendario</h1>
              <p className="text-stone-500">Gestión de eventos y disponibilidad</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md"
            >
              + Nueva Reserva
            </button>
          </div>

          <div className="calendar-container">
            <FullCalendar
              plugins={[ dayGridPlugin, interactionPlugin ]}
              initialView="dayGridMonth"
              events={eventosCalendario}
              locale="es"
              height="auto"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth' }}
              buttonText={{ today: 'Hoy', month: 'Mes' }}
              eventClick={handleEventClick}
            />
          </div>

        </div>
      </main>

      {/* MODALES OCULTOS (Crear y Detalle) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Agendar Nueva Reserva</h2>
            <form onSubmit={handleCrearReserva} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Cliente</label>
                <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white" required>
                  <option value="" disabled>Seleccione un cliente...</option>
                  {listaClientes.map((c) => (
                    <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Menú Escogido</label>
                <select value={idMenu} onChange={(e) => setIdMenu(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white" required>
                  <option value="" disabled>Seleccione un menú...</option>
                  {listaMenus.map((m) => (
                    <option key={m.idMenu} value={m.idMenu}>{m.nombreMenu}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Fecha del Evento</label>
                  <input type="date" value={fechaEvento} onChange={(e) => setFechaEvento(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" required />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Cant. Niños</label>
                  <input type="number" min="0" value={cantNinos} onChange={(e) => setCantNinos(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" required />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetalleModalOpen && eventoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm border-t-8 border-amber-700">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-stone-800">Detalles de Reserva</h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                {eventoSeleccionado.estado}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-stone-600"><strong className="text-stone-800">Cliente:</strong> {eventoSeleccionado.cliente}</p>
              <p className="text-stone-600"><strong className="text-stone-800">Fecha:</strong> {eventoSeleccionado.fecha}</p>
              <p className="text-stone-600"><strong className="text-stone-800">Menú:</strong> {eventoSeleccionado.menu}</p>
              <p className="text-stone-600"><strong className="text-stone-800">Niños:</strong> {eventoSeleccionado.cantNinos}</p>
            </div>

            <div className="flex justify-between mt-6">
              <button 
                onClick={handleEliminarReserva}
                className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer border border-red-200"
              >
                Cancelar Reserva
              </button>
              <button 
                onClick={() => setIsDetalleModalOpen(false)}
                className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}