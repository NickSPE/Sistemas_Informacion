import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, GraduationCap, CalendarCheck, ShieldAlert, CreditCard, Bell } from 'lucide-react';

const ParentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Mis Hijos', path: '/portal-familia', icon: Home },
    { name: 'Asistencia', path: '/portal-familia/asistencia', icon: CalendarCheck },
    { name: 'Calificaciones', path: '/portal-familia/notas', icon: GraduationCap },
    { name: 'Conducta', path: '/portal-familia/conducta', icon: ShieldAlert },
    { name: 'Estado de Cuenta', path: '/portal-familia/pagos', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-[#f4f6fb] font-sans">
      {/* Sidebar for Parents */}
      <div className="w-64 bg-[#1a1f36] text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            SIBES <span className="text-[#6c63ff] font-black">FAMILIA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Portal del Apoderado</p>
        </div>

        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6c63ff] flex items-center justify-center text-white font-bold shadow-md">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'FA'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{user?.username}</p>
            <p className="text-xs text-[#2dce89] font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2dce89]"></span> Activo
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/portal-familia'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={18} className="stroke-[2.5]" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-[#ff6584] transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:stroke-[#ff6584] transition-colors stroke-[2.5]" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white h-16 flex items-center justify-between px-8 border-b border-slate-200 shrink-0 z-10 shadow-sm">
          <div className="text-xs font-bold text-[#8898aa] uppercase tracking-widest flex items-center gap-2">
            <span>SIBES 360</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[#1a1f36]">{navItems.find(item => item.path === location.pathname || (item.path === '/portal-familia' && location.pathname === '/portal-familia/'))?.name || 'Portal'}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#8898aa] hover:text-[#1a1f36] transition-colors rounded-full hover:bg-slate-100">
              <Bell size={20} className="stroke-[2.5]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff6584] border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#f4f6fb]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
