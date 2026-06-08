import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axiosConfig'; 

export default function Dashboard() {
  const [eventosCalendario, setEventosCalendario] = useState([]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get('/eventos');
        
        const eventosMapeados = response.data.map((evento: any) => ({
          title: evento.estadoEvento?.nombre || 'Reserva de Mesa', 
          date: evento.fechaHora.split('T')[0], 
        }));

        setEventosCalendario(eventosMapeados);
      } catch (error) {
        console.error("Error cargando los eventos del servidor:", error);
      }
    };

    fetchEventos();
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        
        {/* Cabecera del Panel */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-amber-800">Panel de Reservas - Wonderland Café</h1>
          
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

        {/* El Calendario */}
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
            buttonText={{
              today: 'Hoy',
              month: 'Mes'
            }}
          />
        </div>

      </div>
    </div>
  );
}