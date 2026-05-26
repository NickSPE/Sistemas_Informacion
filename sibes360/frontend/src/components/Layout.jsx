import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Layout = ({ children }) => {
  const { user, selectedInstitucion, setSelectedInstitucion } = useAuth();
  const [instituciones, setInstituciones] = useState([]);

  useEffect(() => {
    if (user?.rol === 'SuperAdmin') {
      const fetchInsts = async () => {
        try {
          const res = await axios.get('http://localhost:8000/api/instituciones/');
          setInstituciones(res.data);
        } catch (err) {
          console.error("Layout failed to load institutions:", err);
        }
      };
      fetchInsts();
    }
  }, [user]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f6fb]">
      {/* Column 1: Left Navy Sidebar (240px) */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Top Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">SIBES 360</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Lima, Perú</span>
            {user?.rol === 'SuperAdmin' && (
              <>
                <span className="text-slate-300">/</span>
                <div className="flex items-center gap-1.5 ml-1">
                  <select
                    value={selectedInstitucion}
                    onChange={(e) => setSelectedInstitucion(e.target.value)}
                    className="bg-[#fcfcff] border border-indigo-100 hover:border-indigo-200 text-[11px] font-bold text-indigo-600 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#6c63ff] cursor-pointer shadow-sm transition-all"
                  >
                    <option value="">🏫 Todos los Colegios (Global)</option>
                    {instituciones.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        🏫 {inst.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Servidor Activo</span>
          </div>
        </header>

        {/* Main page content area */}
        <div className="flex-grow overflow-y-auto p-6 bg-[#f4f6fb]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

