import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertas = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/alertas/');
      setAlertas(res.data);
    } catch (err) {
      console.error("Failed to load warnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  const handleResolve = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/alertas/${id}/`, {
        estado: 'Resuelta'
      });
      fetchAlertas();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const columns = [
    { header: 'Código', accessor: 'id', width: '80px' },
    { header: 'Estudiante', render: (row) => `${row.estudiante_apellidos || ''}, ${row.estudiante_nombres || ''}`, width: '200px' },
    { header: 'Tipo Alerta', accessor: 'tipo', width: '180px' },
    { header: 'Descripción de Incidencia', accessor: 'descripcion' },
    { 
      header: 'Estado', 
      accessor: 'estado', 
      width: '100px',
      render: (row) => <Badge type={row.estado === 'Activa' ? 'grave' : 'aprobada'} text={row.estado} />
    },
    {
      header: 'Acción',
      width: '110px',
      render: (row) => row.estado === 'Activa' ? (
        <button 
          onClick={() => handleResolve(row.id)}
          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 px-2 py-1 rounded"
        >
          Resolver
        </button>
      ) : <span className="text-[10px] font-semibold text-slate-400">Resuelta</span>
    }
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Alertas Académicas y Conductuales</h1>
        <p className="text-xs text-[#8898aa]">Módulo automático de alertas preventivas por inasistencia reiterada o bajo rendimiento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Consolidado de Alertas del Sistema"
            columns={columns}
            data={alertas}
            searchField="estudiante_apellidos"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Alertas Críticas" 
            value={alertas.filter(a => a.estado === 'Activa').length} 
            subtitle="Alertas que requieren acción" 
            icon={AlertTriangle} 
            color="danger"
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck size={14} className="text-[#6c63ff]" />
              <span>Gatillador Preventivo</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Las alertas preventivas son generadas automáticamente por el motor analítico de SIBES 360 cuando:
              <br />• El promedio de un alumno desciende de 11.
              <br />• Se acumulan más de 3 inasistencias en el mismo bimestre.
              <br />• Se carga un reporte disciplinario de tipo 'Grave'.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alertas;
