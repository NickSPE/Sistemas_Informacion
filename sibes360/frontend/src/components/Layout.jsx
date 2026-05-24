import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
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
