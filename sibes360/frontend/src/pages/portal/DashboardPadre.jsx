import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, CalendarCheck, ShieldAlert, CreditCard } from 'lucide-react';

const DashboardPadre = () => {
  const { user } = useAuth();
  const [apoderadoInfo, setApoderadoInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/apoderados/mi_perfil/');
        setApoderadoInfo(response.data);
      } catch (err) {
        console.error("Error cargando perfil del apoderado", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  if (!apoderadoInfo || !apoderadoInfo.estudiantes_detalle || apoderadoInfo.estudiantes_detalle.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-slate-200">
        <h2 className="text-xl font-bold text-[#1a1f36] mb-2">Bienvenido, {apoderadoInfo?.nombres || user?.username}</h2>
        <p className="text-slate-500">Actualmente no tienes estudiantes asociados a tu cuenta. Si esto es un error, por favor contacta al colegio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight">Portal de Familia</h1>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenido de vuelta, {apoderadoInfo.nombres}. Aquí tienes el resumen de tus estudiantes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {apoderadoInfo.estudiantes_detalle.map(estudiante => (
          <div key={estudiante.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
            {/* Cabecera de la tarjeta */}
            <div className="p-6 border-b border-slate-100 relative overflow-hidden bg-gradient-to-br from-[#6c63ff]/10 to-transparent">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6c63ff]/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#6c63ff] font-black text-xl">
                  {estudiante.nombres.substring(0, 1)}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${estudiante.estado ? 'bg-[#2dce89]/10 text-[#2dce89]' : 'bg-[#ff6584]/10 text-[#ff6584]'}`}>
                  {estudiante.estado ? 'Matriculado' : 'Inactivo'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-[#1a1f36]">{estudiante.nombres} {estudiante.apellidos}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">DNI: {estudiante.dni}</p>
            </div>

            {/* Accesos rápidos */}
            <div className="p-4 bg-slate-50/50">
              <div className="grid grid-cols-4 gap-2">
                <Link to="/portal-familia/notas" className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all gap-1.5 group/btn">
                  <GraduationCap size={20} className="text-[#8898aa] group-hover/btn:text-[#6c63ff] transition-colors" />
                  <span className="text-[10px] font-semibold text-slate-500 group-hover/btn:text-[#1a1f36]">Notas</span>
                </Link>
                <Link to="/portal-familia/asistencia" className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all gap-1.5 group/btn">
                  <CalendarCheck size={20} className="text-[#8898aa] group-hover/btn:text-[#6c63ff] transition-colors" />
                  <span className="text-[10px] font-semibold text-slate-500 group-hover/btn:text-[#1a1f36]">Asist.</span>
                </Link>
                <Link to="/portal-familia/conducta" className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all gap-1.5 group/btn">
                  <ShieldAlert size={20} className="text-[#8898aa] group-hover/btn:text-[#ffb236] transition-colors" />
                  <span className="text-[10px] font-semibold text-slate-500 group-hover/btn:text-[#1a1f36]">Cond.</span>
                </Link>
                <Link to="/portal-familia/pagos" className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all gap-1.5 group/btn">
                  <CreditCard size={20} className="text-[#8898aa] group-hover/btn:text-[#2dce89] transition-colors" />
                  <span className="text-[10px] font-semibold text-slate-500 group-hover/btn:text-[#1a1f36]">Pagos</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPadre;
