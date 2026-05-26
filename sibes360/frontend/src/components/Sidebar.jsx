import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Building2, Users, GraduationCap, ShieldAlert, Briefcase, 
  UserPlus, BookOpen, Clock, Calendar, FileSpreadsheet, FileDown, 
  Smile, CreditCard, Bell, AlertTriangle, BarChart3, LogOut, Settings 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/instituciones', label: 'Instituciones', icon: Building2 },
    { to: '/usuarios', label: 'Usuarios', icon: Users },
    { to: '/estudiantes', label: 'Estudiantes', icon: GraduationCap },
    { to: '/apoderados', label: 'Apoderados', icon: ShieldAlert },
    { to: '/docentes', label: 'Docentes', icon: Briefcase },
    { to: '/matricula', label: 'Matrícula', icon: UserPlus },
    { to: '/academico', label: 'Cursos', icon: BookOpen },
    { to: '/horarios', label: 'Horarios', icon: Clock },
    { to: '/asistencia', label: 'Asistencia', icon: Calendar },
    { to: '/notas', label: 'Notas', icon: FileSpreadsheet },
    { to: '/libretas', label: 'Libretas', icon: FileDown },
    { to: '/conducta', label: 'Conducta', icon: Smile },
    { to: '/pagos', label: 'Caja y Pensiones', icon: CreditCard },
    { to: '/comunicacion', label: 'Comunicación', icon: Bell },
    { to: '/alertas', label: 'Alertas', icon: AlertTriangle },
    { to: '/reportes', label: 'Reportes', icon: BarChart3 },
    { to: '/configuracion', label: 'Configuración', icon: Settings }
  ];

  const filteredNavItems = navItems.filter(item => {
    const rol = user?.rol;
    if (rol === 'SuperAdmin') return true;
    if (rol === 'Director') {
      if (item.to === '/instituciones') return false;
      return true;
    }
    if (rol === 'Docente') {
      // Docente only gets Dashboard, Cursos, Libretas, Comunicación, Alertas
      const allowed = ['/dashboard', '/academico', '/libretas', '/comunicacion', '/alertas'];
      return allowed.includes(item.to);
    }
    if (rol === 'Apoderado') {
      const allowed = ['/dashboard', '/asistencia', '/notas', '/libretas', '/conducta', '/pagos', '/comunicacion', '/alertas'];
      return allowed.includes(item.to);
    }
    return false;
  });

  return (
    <div className="w-[240px] bg-[#1a1f36] text-white flex flex-col h-screen select-none shrink-0 border-r border-slate-800">
      {/* Title Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#161a2e]">
        <span className="text-[#6c63ff] font-extrabold text-xl tracking-wider">SIBES</span>
        <span className="text-white font-medium text-xl ml-1">360</span>
      </div>

      {/* User Card */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-[#171c32]/50">
        <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-[#6c63ff] font-bold flex items-center justify-center border border-indigo-500/30 text-sm">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-200 truncate">{user?.first_name} {user?.last_name}</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-[#6c63ff]/20 text-[#a09cff] rounded border border-[#6c63ff]/30 border-solid">
            {user?.rol || 'Rol'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#6c63ff] text-white shadow-sm shadow-[#6c63ff]/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <Icon size={16} className="shrink-0 stroke-[2]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-slate-800 bg-[#161a2e]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-all"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
