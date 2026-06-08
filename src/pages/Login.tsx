import { useState } from 'react';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); 
    console.log("Intentando iniciar sesión con:", correo, password);
  };

  return (
    <div className="min-h-screen bg-stone-200 flex items-center justify-center p-4">
      
      {/* Tarjeta de Login */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-800">Wonderland Café</h1>
          <p className="text-stone-500 mt-2">Ingresa tus credenciales del sistema</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Input de Correo */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
              placeholder="admin@wonderland.cl"
              required
            />
          </div>

          {/* Input de Contraseña */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
              placeholder="••••••"
              required
            />
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Iniciar Sesión
          </button>

        </form>
      </div>
    </div>
  );
}