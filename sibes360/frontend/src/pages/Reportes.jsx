import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { BarChart3, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportes = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/reportes/');
      setReportes(res.data);
    } catch (err) {
      console.error("Failed to load audit reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const chartData = [
    { name: 'San Agustín', estudiantes: 16, docentes: 8 },
    { name: 'Inmaculada', estudiantes: 2, docentes: 0 },
    { name: 'Fe y Alegría', estudiantes: 2, docentes: 0 },
  ];

  const columns = [
    { header: 'Código', accessor: 'id', width: '80px' },
    { header: 'Tipo de Reporte', accessor: 'tipo', width: '220px' },
    { header: 'Fecha de Generación', accessor: 'fecha_creacion', width: '180px' },
    { header: 'Usuario Solicitante', accessor: 'usuario_nombre' },
    { header: 'Colegio Pertenencia', accessor: 'institucion_nombre', width: '180px' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strict single H1 Constraint */}
      <div>
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Reportes y Auditoría de Gestión</h1>
        <p className="text-xs text-[#8898aa]">Consolidado de auditoría escolar, tasas de morosidad y ratios de enseñanza.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column: Data and Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#1a1f36] mb-4">Distribución por Colegio (RENIEC / SIAGIE)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#8898aa" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8898aa" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="estudiantes" fill="#6c63ff" radius={[4, 4, 0, 0]} name="Alumnos Matriculados" />
                  <Bar dataKey="docentes" fill="#ffb236" radius={[4, 4, 0, 0]} name="Docentes Especializados" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <DataTable
            title="Historial de Auditoría de Reportes"
            columns={columns}
            data={reportes}
            searchField="tipo"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Consolidados Generados" 
            value={reportes.length} 
            subtitle="Auditorías en el sistema" 
            icon={BarChart3} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck size={14} className="text-[#6c63ff]" />
              <span>Transparencia de Datos</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Todo reporte generado por un Director o Administrador es logueado de forma indeleble en el sistema de auditoría de SIBES 360, permitiendo registrar qué funcionario accedió a información confidencial de notas y finanzas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
