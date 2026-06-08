import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const [eventosCalendario, setEventosCalendario] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
          title: `Reserva - ${nombreCliente}`, 
          date: fechaString,
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

      // Limpiar y cerrar
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

  return (
    <div className="min-h-screen bg-stone-100 p-8 relative">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-amber-800">Panel de Reservas - Wonderland Café</h1>
          
          <div className="space-x-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              + Nueva Reserva
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="calendar-container">
          <FullCalendar
            plugins={[ dayGridPlugin, interactionPlugin ]}
            initialView="dayGridMonth"
            events={eventosCalendario}
            locale="es"
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            buttonText={{ today: 'Hoy', month: 'Mes' }}
          />
        </div>

      </div>

      {/* MODAL DE RESERVA (Ajustado al DTO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Agendar Nueva Reserva</h2>
            
            <form onSubmit={handleCrearReserva} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Cliente</label>
                <select 
                  value={idCliente} 
                  onChange={(e) => setIdCliente(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  required
                >
                  <option value="" disabled>Seleccione un cliente...</option>
                  {listaClientes.map((c) => (
                    <option key={c.idCliente} value={c.idCliente}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Menú Escogido</label>
                <select 
                  value={idMenu} 
                  onChange={(e) => setIdMenu(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  required
                >
                  <option value="" disabled>Seleccione un menú...</option>
                  {listaMenus.map((m) => (
                    <option key={m.idMenu} value={m.idMenu}>
                      {m.nombreMenu} 
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Fecha del Evento</label>
                  <input 
                    type="date" 
                    value={fechaEvento} 
                    onChange={(e) => setFechaEvento(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    required 
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Cant. Niños</label>
                  <input 
                    type="number"
                    min="0"
                    value={cantNinos} 
                    onChange={(e) => setCantNinos(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    required 
                  />
                </div>
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
                  Guardar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}