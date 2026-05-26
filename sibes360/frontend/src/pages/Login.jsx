import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      if (result.user?.rol === 'Apoderado') {
        navigate('/portal-familia');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative colored glow bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#6c63ff]/10 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#ff6584]/5 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 relative z-10 shadow-sm">
        {/* Brand/Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-1.5 mb-2">
            <span className="text-[#6c63ff] font-extrabold text-3xl tracking-wider">SIBES</span>
            <span className="text-[#1a1f36] font-semibold text-3xl">360</span>
          </div>
          <p className="text-xs font-semibold text-[#8898aa] uppercase tracking-wider">
            Gestión Escolar Inteligente · Lima, Perú
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-[#ff6584] text-xs font-semibold">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#1a1f36] uppercase tracking-wider mb-2">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-[#8898aa]" size={16} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="pl-10 pr-4 py-2.5 w-full text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#6c63ff] transition-all bg-slate-50/20 text-[#1a1f36]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#1a1f36] uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#8898aa]" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 py-2.5 w-full text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#6c63ff] transition-all bg-slate-50/20 text-[#1a1f36]"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-2.5 text-[#8898aa]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6c63ff] hover:bg-[#5b52e0] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <LogIn size={16} />
            <span>{loading ? 'Iniciando sesión...' : 'Ingresar'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-[#8898aa]">
          <p>© {new Date().getFullYear()} SIBES 360. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
