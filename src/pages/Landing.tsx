import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Landing() {
  const navigate = useNavigate();
  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [paso, setPaso] = useState(0); 

  const [tematicas, setTematicas] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);

  const [cliente, setCliente] = useState({ nombre: '', correo: '', telefono: '' });
  const [evento, setEvento] = useState({ fecha: '', hora: '', ninos: 0, adultos: 0 });
  const [idTematica, setIdTematica] = useState('');
  const [menusSeleccionados, setMenusSeleccionados] = useState<number[]>([]);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (isReservaModalOpen) {
      api.get('/tematicas').then(res => setTematicas(res.data)).catch(console.error);
      api.get('/menus').then(res => setMenus(res.data)).catch(console.error);
    }
  }, [isReservaModalOpen]);

  const productosFiltrados = menus.filter(m => 
    idTematica === '' || m.tematica?.idTematica === Number(idTematica)
  );

  const toggleProducto = (id: number) => {
    setMenusSeleccionados(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const sumaProductos = menus.filter(m => menusSeleccionados.includes(m.idMenu)).reduce((acc, curr) => acc + curr.precioBase, 0);
  const totalEstimado = sumaProductos * (Number(evento.ninos) + Number(evento.adultos));

  const validarPaso = () => {
    if (paso === 1) {
      if (!cliente.nombre.trim() || !cliente.telefono.trim() || !cliente.correo.trim()) {
        return alert("Por favor, completa todos los campos de contacto.");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cliente.correo)) {
        return alert("Por favor, ingresa un correo electrónico con un formato válido (ejemplo@correo.com).");
      }
      if (cliente.telefono.length < 8) {
        return alert("El número de teléfono ingresado es muy corto.");
      }
    }
    if (paso === 2) {
      if (!evento.fecha || !evento.hora) {
        return alert("Debes seleccionar una fecha y hora obligatoriamente para el evento.");
      }
      if (evento.ninos === 0 && evento.adultos === 0) {
        return alert("La asistencia no puede ser cero. Añade cantidad de niños o adultos.");
      }
    }
    if (paso === 3) {
      if (menusSeleccionados.length === 0) {
        return alert("Debes seleccionar al menos un producto o menú para armar tu minuta.");
      }
    }
    
    setPaso(paso + 1);
  };

  const handleEnviarReserva = async () => {
    try {
      const resCliente = await api.post('/clientes', cliente);
      const idClienteGenerado = resCliente.data.idCliente;
      
      const fechaHora = `${evento.fecha}T${evento.hora}:00`;

      const nombresProductos = menus.filter(m => menusSeleccionados.includes(m.idMenu)).map(m => m.nombreMenu).join(' | ');
      const observacionesConCatalogo = `[PRODUCTOS SOLICITADOS: ${nombresProductos}] \n\nObservaciones especiales del cliente:\n${observaciones}`;

      await api.post('/reservas', {
        cliente: { idCliente: idClienteGenerado },
        menu: { idMenu: menusSeleccionados[0] }, 
        fechaHora: fechaHora,
        cantidadNinos: Number(evento.ninos),
        cantidadAdultos: Number(evento.adultos),
        totalEstimado: totalEstimado,
        observaciones: observacionesConCatalogo,
        estado: 'PENDIENTE'
      });

      setPaso(5); 
    } catch (error) {
      console.error("Error al despachar la reserva:", error);
      alert("Hubo un problema de conectividad al enviar tu minuta. Revisa la consola del servidor.");
    }
  };

  const cerrarModal = () => {
    setIsReservaModalOpen(false);
    setPaso(0);
    setCliente({ nombre: '', correo: '', telefono: '' });
    setEvento({ fecha: '', hora: '', ninos: 0, adultos: 0 });
    setIdTematica('');
    setMenusSeleccionados([]);
    setObservaciones('');
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 scroll-smooth">
      
      <nav className="bg-stone-900 text-amber-500 p-6 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="text-3xl font-black tracking-widest uppercase cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          WONDERLAND CAFÉ
        </div>
        <div className="space-x-8 text-stone-300 font-semibold hidden md:flex items-center">
          <a href="#historia" className="hover:text-amber-500 transition-colors">Nuestra Historia</a>
          <a href="#experiencia" className="hover:text-amber-500 transition-colors">La Experiencia</a>
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm border border-amber-500 text-amber-500 px-4 py-1.5 rounded-lg hover:bg-amber-500 hover:text-stone-900 font-bold transition-all cursor-pointer"
          >
            Acceso Staff
          </button>
        </div>
      </nav>

      <section className="relative bg-amber-900 text-white py-36 px-6 text-center shadow-inner">
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-black drop-shadow-xl tracking-tight">
            Donde la Magia se Sirve en Taza
          </h1>
          <p className="text-xl md:text-3xl font-light text-amber-100 max-w-2xl mx-auto">
            Planifica eventos temáticos inolvidables con nuestro cotizador inteligente guiado.
          </p>
          <button 
            onClick={() => setIsReservaModalOpen(true)} 
            className="mt-8 bg-amber-500 hover:bg-amber-400 text-stone-900 font-extrabold text-xl py-5 px-12 rounded-full shadow-2xl transform hover:scale-105 transition-all cursor-pointer inline-block"
          >
            ✨ Agendar un Evento Aquí
          </button>
        </div>
      </section>

      <section id="historia" className="py-24 px-6 max-w-4xl mx-auto text-center space-y-8 border-b border-stone-200">
        <h2 className="text-4xl font-extrabold text-amber-800 tracking-tight">Nuestra Historia</h2>
        <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full"></div>
        <p className="text-lg md:text-xl text-stone-600 leading-relaxed font-light">
          Nacimos con la firme convicción de combinar la alta repostería artesanal con mundos de fantasía interactivos. Cada espacio físico de Wonderland Café está diseñado estructuralmente para sacarte de la cotidianidad. Ya sea que nos confíes la producción de un cumpleaños inspirado en el País de las Maravillas o una tarde mágica empresarial, nuestra infraestructura logística garantiza excelencia culinaria y mágica.
        </p>
      </section>

      <section id="experiencia" className="py-24 bg-stone-100 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-extrabold text-stone-800 tracking-tight">La Experiencia Wonderland</h2>
            <p className="text-stone-500 max-w-md mx-auto">Lo que ofrecemos para hacer de tus celebraciones un hito único</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md space-y-4 border-t-4 border-amber-600">
              <div className="text-3xl">🎭</div>
              <h3 className="text-xl font-bold text-stone-800">Inmersión Temática</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Decoraciones personalizadas adaptadas a tus conceptos de fantasía favoritos, cuidadas al más mínimo detalle.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md space-y-4 border-t-4 border-amber-600">
              <div className="text-3xl">🍰</div>
              <h3 className="text-xl font-bold text-stone-800">Catering de Autor</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Pastelería fina, jugos temáticos y bocadillos diseñados exclusivamente para combinar con la estética elegida.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md space-y-4 border-t-4 border-amber-600">
              <div className="text-3xl">🧑‍🍳</div>
              <h3 className="text-xl font-bold text-stone-800">Staff Calificado</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Animadores, garzones y maestros de cocina dedicados 100% a la gestión de tu evento de principio a fin.</p>
            </div>
          </div>
        </div>
      </section>

      {isReservaModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden relative">
            
            <div className="bg-stone-100 border-b border-stone-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Solicitud de Evento Temático</h2>
                {paso > 0 && paso < 5 && <p className="text-sm text-stone-500 font-medium mt-0.5">Paso {paso} de 4</p>}
              </div>
              <button onClick={cerrarModal} className="text-stone-400 hover:text-red-500 text-3xl font-bold cursor-pointer transition-colors">&times;</button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[65vh]">
              
              {paso === 0 && (
                <div className="text-center space-y-8 py-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold text-amber-800">¿Cómo deseas gestionar tu reserva?</h3>
                    <p className="text-stone-500 max-w-md mx-auto">Para procesar la minuta de tu evento necesitamos asociar tus antecedentes de contacto.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
                    <div className="border-2 border-stone-200 bg-stone-50 p-5 rounded-2xl flex flex-col justify-between items-center opacity-60 relative">
                      <div className="text-center space-y-2">
                        <span className="text-2xl">🔐</span>
                        <h4 className="font-bold text-stone-700">Usuario Registrado</h4>
                        <p className="text-xs text-stone-500">Inicia sesión para usar tus datos guardados automáticamente.</p>
                      </div>
                      <button disabled className="mt-4 w-full bg-stone-300 text-stone-600 font-bold py-2.5 px-4 rounded-xl cursor-not-allowed text-xs">
                        Iniciar Sesión (Próximamente)
                      </button>
                    </div>

                    <div className="border-2 border-amber-500 bg-amber-50/50 p-5 rounded-2xl flex flex-col justify-between items-center shadow-sm">
                      <div className="text-center space-y-2">
                        <span className="text-2xl">🏃‍♂️</span>
                        <h4 className="font-bold text-amber-900">Continuar como Invitado</h4>
                        <p className="text-xs text-stone-500">Completa una minuta rápida ingresando tus datos al final.</p>
                      </div>
                      <button 
                        onClick={() => setPaso(1)} 
                        className="mt-4 w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-colors cursor-pointer text-xs"
                      >
                        Agendar como Invitado &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paso === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-amber-800 border-b pb-2">1. Datos del Solicitante</h3>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Nombre Completo</label>
                    <input type="text" value={cliente.nombre} onChange={e => setCliente({...cliente, nombre: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all" placeholder="Ej: Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Teléfono Móvil (Solo números)</label>
                    <input type="tel" value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value.replace(/[^0-9+]/g, '')})} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all" placeholder="Ej: +56912345678" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Correo Electrónico</label>
                    <input type="email" value={cliente.correo} onChange={e => setCliente({...cliente, correo: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all" placeholder="Ej: ejemplo@correo.com" />
                  </div>
                </div>
              )}

              {paso === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-amber-800 border-b pb-2">2. Detalles de Planificación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Fecha del Evento</label>
                      <input type="date" value={evento.fecha} onChange={e => setEvento({...evento, fecha: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Hora de Inicio</label>
                      <input type="time" value={evento.hora} onChange={e => setEvento({...evento, hora: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Cantidad de Niños</label>
                      <input type="number" min="0" value={evento.ninos || ''} onChange={e => setEvento({...evento, ninos: Number(e.target.value)})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ej: 15" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Cantidad de Adultos</label>
                      <input type="number" min="0" value={evento.adultos || ''} onChange={e => setEvento({...evento, adultos: Number(e.target.value)})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ej: 5" />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3 MODIFICADO: DIVISIÓN ENTRE MENÚS Y PRODUCTOS SUELTOS */}
              {paso === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-amber-800 border-b pb-2 flex items-center gap-2">
                    <span>☕</span> 3. Catálogo Temático (Multielección)
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Filtro Temático</label>
                    <select value={idTematica} onChange={e => {setIdTematica(e.target.value); setMenusSeleccionados([]);}} className="w-full px-4 py-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="">Mostrar catálogo completo</option>
                      {tematicas.map(t => <option key={t.idTematica} value={t.idTematica}>{t.nombreTematica}</option>)}
                    </select>
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm font-medium text-stone-600">Personaliza tu minuta combinando combos y/o ítems adicionales:</p>
                    
                    {/* SECCIÓN A: MENÚS COMPLETOS (Encabezan la lista) */}
                    {productosFiltrados.filter(m => m.tipoProducto !== 'Producto Individual').length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-stone-800 flex items-center gap-2 border-b border-stone-200 pb-1">
                          <span>🍱</span> Menús Completos Sugeridos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {productosFiltrados.filter(m => m.tipoProducto !== 'Producto Individual').map(m => {
                            const seleccionado = menusSeleccionados.includes(m.idMenu);
                            return (
                              <div 
                                key={m.idMenu}
                                onClick={() => toggleProducto(m.idMenu)}
                                className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                                  seleccionado ? 'border-amber-500 bg-amber-50/70 shadow-md ring-1 ring-amber-500' : 'border-stone-200 hover:border-amber-400 bg-white'
                                }`}
                              >
                                <input type="checkbox" checked={seleccionado} readOnly className="mt-1 w-4 h-4 text-amber-600 accent-amber-600 cursor-pointer" />
                                <div>
                                  <p className={`font-bold tracking-tight ${seleccionado ? 'text-amber-900' : 'text-stone-800'}`}>{m.nombreMenu}</p>
                                  <p className="text-xs text-stone-500 font-medium mt-0.5">${m.precioBase.toLocaleString('es-CL')} (Precio Base)</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SECCIÓN B: PRODUCTOS INDIVIDUALES (Aparecen debajo) */}
                    {productosFiltrados.filter(m => m.tipoProducto === 'Producto Individual').length > 0 && (
                      <div className="space-y-3 mt-6">
                        <h4 className="font-extrabold text-stone-800 flex items-center gap-2 border-b border-stone-200 pb-1">
                          <span>🛒</span> Productos a la Carta y Extras
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {productosFiltrados.filter(m => m.tipoProducto === 'Producto Individual').map(m => {
                            const seleccionado = menusSeleccionados.includes(m.idMenu);
                            return (
                              <div 
                                key={m.idMenu}
                                onClick={() => toggleProducto(m.idMenu)}
                                className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                                  seleccionado ? 'border-amber-500 bg-amber-50/70 shadow-md ring-1 ring-amber-500' : 'border-stone-200 hover:border-amber-400 bg-white'
                                }`}
                              >
                                <input type="checkbox" checked={seleccionado} readOnly className="mt-1 w-4 h-4 text-amber-600 accent-amber-600 cursor-pointer" />
                                <div>
                                  <p className={`font-bold tracking-tight ${seleccionado ? 'text-amber-900' : 'text-stone-800'}`}>{m.nombreMenu}</p>
                                  <p className="text-xs text-stone-500 font-medium mt-0.5">${m.precioBase.toLocaleString('es-CL')} (Precio Unitario)</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paso === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-amber-800 border-b pb-2">4. Resumen de Cotización</h3>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Observaciones Especiales (Alergias o requerimientos)</label>
                    <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ej: 2 niños vegetarianos, 1 intolerante a la lactosa..."></textarea>
                  </div>
                  
                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 mt-4 space-y-3">
                    <h4 className="font-extrabold text-amber-900">Cotización Preliminar</h4>
                    <p className="text-sm text-stone-600">
                      Asistentes Totales: <span className="font-bold text-stone-800">{Number(evento.ninos) + Number(evento.adultos)} personas</span>
                    </p>
                    <div className="text-3xl font-black text-green-700">${totalEstimado.toLocaleString('es-CL')}</div>
                    
                    <div className="text-xs text-amber-800 bg-amber-100 p-3 rounded-lg flex gap-2 items-start leading-relaxed">
                      <span className="text-base">⚠️</span>
                      <p><strong>Aviso de valores:</strong> Este monto corresponde a estimaciones referenciales basadas en las unidades iniciales solicitadas. Los requerimientos de insumos y dotación de personal técnico serán validados minuciosamente por el administrador del panel, tras lo cual se enviará la cotización formal y definitiva por correo electrónico.</p>
                    </div>
                  </div>
                </div>
              )}

              {paso === 5 && (
                <div className="text-center py-10 space-y-4">
                  <div className="text-6xl animate-bounce">🎉</div>
                  <h3 className="text-2xl font-black text-green-600">¡Minuta de Reserva Recibida!</h3>
                  <p className="text-stone-600 max-w-md mx-auto text-sm leading-relaxed">
                    Tu solicitud ha ingresado exitosamente al panel de control logístico del administrador bajo el estado de revisión. Evaluaremos la disponibilidad de insumos y staff técnico del café para despacharte el correo de aprobación oficial.
                  </p>
                  <button onClick={cerrarModal} className="mt-6 bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl font-bold transition-colors cursor-pointer text-sm shadow">
                    Finalizar y Volver al Inicio
                  </button>
                </div>
              )}

            </div>

            {paso > 0 && paso < 5 && (
              <div className="bg-stone-100 border-t p-4 flex justify-between items-center">
                <button 
                  onClick={() => setPaso(paso - 1)} 
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold transition-colors cursor-pointer text-sm"
                >
                  Volver
                </button>
                {paso < 4 ? (
                  <button 
                    onClick={validarPaso} 
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold shadow transition-colors cursor-pointer text-sm"
                  >
                    Siguiente &rarr;
                  </button>
                ) : (
                  <button 
                    onClick={handleEnviarReserva} 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow transition-colors cursor-pointer text-sm"
                  >
                    🚀 Enviar Solicitud de Minuta
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}