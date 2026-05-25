import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Briefcase, Building, AlertTriangle, TrendingDown, Clock, ShieldAlert, FileText 
} from 'lucide-react';
import KPICard from '../components/KPICard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await axios.get('http://localhost:8000/api/dashboard/stats/');
        setStats(statsRes.data);

        // Fetch recent active alerts
        const alertsRes = await axios.get('http://localhost:8000/api/alertas/pendientes/');
        setAlerts(alertsRes.data.slice(0, 4)); // top 4
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = [
    { name: 'Marzo', asistencia: 92, morosidad: 12 },
    { name: 'Abril', asistencia: 94, morosidad: 8 },
    { name: 'Mayo', asistencia: 95, morosidad: 5 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  const isParent = user?.rol === 'Apoderado';
  const isTeacher = user?.rol === 'Docente';

  return (
    <div className="space-y-6">
      {/* Title bar - Single H1 Constraint strictly verified */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">
            {isParent ? 'Mi Portal de Apoderado' : isTeacher ? 'Portal del Docente' : 'Panel de Control General'}
          </h1>
          <p className="text-xs text-[#8898aa]">
            {isParent 
              ? 'Seguimiento y control de rendimiento académico y de asistencia de tus hijos.' 
              : `Resumen en tiempo real del ecosistema educativo de ${user?.institucion_nombre || 'SIBES 360'}.`}
          </p>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title={isParent ? "Hijos Representados" : "Total Alumnos"} 
          value={stats?.total_estudiantes || 0} 
          subtitle={isParent ? "Estudiantes vinculados" : "Matrículas registradas"} 
          trend={isParent ? undefined : "+4.8%"}
          trendType={isParent ? undefined : "up"} 
          icon={Users} 
        />
        <KPICard 
          title={isParent ? "Colegio" : "Total Docentes"} 
          value={isParent ? (user?.institucion_nombre || "Asignado") : (stats?.total_docentes || 0)} 
          subtitle={isParent ? "Institución educativa" : "Plana docente activa"} 
          trend={isParent ? undefined : "Estable"} 
          icon={Briefcase} 
          color="warning"
        />
        <KPICard 
          title={isParent ? "Asistencia Hijo(s)" : "Asistencia General"} 
          value={`${stats?.asistencia?.tasa_asistencia || 100}%`} 
          subtitle="Tasa de asistencia"
          trend="+1.2%" 
          trendType="up" 
          icon={Clock} 
          color="success"
        />
        <KPICard 
          title="Alertas Pendientes" 
          value={stats?.alertas_pendientes || 0} 
          subtitle={isParent ? "Incidencias de tu hijo" : "Alertas del colegio"}
          trend={stats?.alertas_pendientes > 0 ? "Requiere acción" : "Sin alertas"} 
          trendType={stats?.alertas_pendientes > 0 ? "down" : "neutral"}
          icon={AlertTriangle} 
          color="danger"
        />
      </div>

      {/* Reddit-inspired 3-column layout structure: Center Column (2/3 width) and Right Column (1/3 width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Center Column: Charts + Main metrics (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#1a1f36] mb-4">Rendimiento Operativo y Académico</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAsist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dce89" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2dce89" stopOpacity={0}/>
                    </linearGradient>
                    {!isParent && !isTeacher && (
                      <linearGradient id="colorMoros" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                      </linearGradient>
                    )}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#8898aa" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8898aa" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="asistencia" stroke="#2dce89" fillOpacity={1} fill="url(#colorAsist)" strokeWidth={2} name="Tasa Asistencia (%)" />
                  {!isParent && !isTeacher && (
                    <Area type="monotone" dataKey="morosidad" stroke="#6c63ff" fillOpacity={1} fill="url(#colorMoros)" strokeWidth={2} name="Tasa Morosidad (%)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Institutional Stats card */}
          {user?.rol === 'SuperAdmin' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1a1f36] mb-3">Instituciones Afiliadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="p-3 bg-indigo-50 text-[#6c63ff] rounded-lg">
                    <Building size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8898aa] block">Escuelas Activas</span>
                    <span className="text-lg font-bold text-[#1a1f36]">{stats?.total_instituciones || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="p-3 bg-red-50 text-[#ff6584] rounded-lg">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8898aa] block">Morosidad Pensiones</span>
                    <span className="text-lg font-bold text-[#1a1f36]">{stats?.pensiones?.tasa_morosidad || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Warnings, Alerts, Logs (Col span 1) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
            <h2 className="text-sm font-bold text-[#1a1f36] mb-4 flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#ff6584]" />
              <span>{isParent ? 'Alertas de mi Hijo' : 'Alertas Escolares Críticas'}</span>
            </h2>

            <div className="space-y-4 flex-grow">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="p-3 border-l-4 border-[#ff6584] bg-red-50/40 rounded-r-lg space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#ff6584] uppercase tracking-wide">
                      {alert.tipo}
                    </span>
                    <span className="text-[9px] font-bold bg-[#ff6584]/15 text-[#ff6584] px-1.5 py-0.2 rounded border border-[#ff6584]/20">
                      Activa
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    Alumna: {alert.estudiante_apellidos}, {alert.estudiante_nombres}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {alert.descripcion}
                  </p>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="py-10 text-center text-xs text-[#8898aa]">
                  No se registran alertas activas en Lima.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#1a1f36] mb-3">Accesos Directos</h2>
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="/libretas"
                className="p-3 rounded-lg border border-slate-100 hover:border-[#6c63ff] hover:bg-indigo-50/20 text-center transition-all group"
              >
                <FileText size={18} className="mx-auto text-slate-400 group-hover:text-[#6c63ff] mb-1.5" />
                <span className="text-[10px] font-bold text-slate-600 block group-hover:text-[#6c63ff]">
                  {isParent ? 'Mis Libretas' : 'Emitir Libretas'}
                </span>
              </a>
              <a 
                href="/alertas"
                className="p-3 rounded-lg border border-slate-100 hover:border-[#ff6584] hover:bg-red-50/20 text-center transition-all group"
              >
                <AlertTriangle size={18} className="mx-auto text-slate-400 group-hover:text-[#ff6584] mb-1.5" />
                <span className="text-[10px] font-bold text-slate-600 block group-hover:text-[#ff6584]">Ver Incidencias</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
