import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../api/axiosConfig'; 

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); 
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); 

    try {
      const response = await api.post('/auth/login', { correo, password });

      // Extraemos los datos enriquecidos que ahora manda el backend
      const { token, rol, idPersonal } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('idPersonal', idPersonal.toString());
      localStorage.setItem('rolUsuario', rol);

      // Enrutador Lógico
      if (rol.toUpperCase() === 'ADMINISTRADOR') {
        navigate('/dashboard'); // Va al panel negro
      } else {
        navigate('/staff'); // Va al nuevo portal de trabajadores
      }

    } catch (error) {
      console.error("Error de autenticación", error);
      setErrorMsg('Correo o contraseña incorrectos. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-800">Wonderland Café</h1>
          <p className="text-stone-500 mt-2">Ingresa tus credenciales de acceso</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="ejemplo@wonderland.cl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="••••••"
              required
            />
          </div>

          {errorMsg && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-4 rounded-lg cursor-pointer"
          >
            Iniciar Sesión
          </button>

        </form>
      </div>
    </div>
  );
}