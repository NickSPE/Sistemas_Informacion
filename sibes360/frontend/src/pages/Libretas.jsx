import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { FileDown, Printer, FileText } from 'lucide-react';

const Libretas = () => {
  const [libretas, setLibretas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const fetchData = async () => {
    try {
      const [libRes, estRes, perRes] = await Promise.all([
        axios.get('http://localhost:8000/api/libretas/'),
        axios.get('http://localhost:8000/api/estudiantes/'),
        axios.get('http://localhost:8000/api/periodos/')
      ]);
      setLibretas(libRes.data);
      setEstudiantes(estRes.data);
      setPeriodos(perRes.data);
    } catch (err) {
      console.error("Failed to load bulletins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/libretas/', {
        estudiante: parseInt(selectedStudent),
        periodo: parseInt(selectedPeriod)
      });
      setIsModalOpen(false);
      setSelectedStudent('');
      setSelectedPeriod('');
      fetchData();
    } catch (err) {
      console.error("Bulletin emission failed:", err);
    }
  };

  const columns = [
    { header: 'Código', accessor: 'id', width: '80px' },
    { header: 'Estudiante', render: (row) => `${row.estudiante_apellidos || ''}, ${row.estudiante_nombres || ''}` },
    { header: 'Periodo Académico', accessor: 'periodo_bimestre', width: '180px' },
    { header: 'Fecha de Emisión', accessor: 'fecha_emision', width: '180px' },
    { 
      header: 'Acciones', 
      width: '120px',
      render: (row) => (
        <button 
          onClick={() => alert(`Imprimiendo Libreta de ${row.estudiante_nombres} ${row.estudiante_apellidos} ...`)}
          className="flex items-center gap-1 text-[10px] font-bold text-[#6c63ff] hover:text-[#5b52e0] bg-indigo-50 hover:bg-indigo-100/50 px-2 py-1 rounded"
        >
          <Printer size={12} />
          <span>Imprimir</span>
        </button>
      )
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Emisión de Libretas de Notas</h1>
        <p className="text-xs text-[#8898aa]">Generación de libretas académicas bimestrales y actas consolidadas de rendimiento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Consolidado de Libretas Emitidas"
            columns={columns}
            data={libretas}
            searchField="estudiante_apellidos"
            onAdd={() => setIsModalOpen(true)}
            addLabel="Emitir Libreta"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Libretas Emitidas" 
            value={libretas.length} 
            subtitle="Consolidados bimestrales" 
            icon={FileDown} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText size={14} className="text-[#6c63ff]" />
              <span>Visado y Certificación</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Las libretas consolidadas en SIBES 360 se generan integrando el promedio ponderado de todas las evaluaciones bimestrales cargadas por los docentes, facilitando el visado directo de la Dirección Escolar.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Emitir Nueva Libreta Escolar">
        <form onSubmit={handleEmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estudiante</label>
            <select 
              required value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            >
              <option value="">Seleccione alumno...</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>{e.apellidos}, {e.nombres}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Periodo Académico</label>
            <select 
              required value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            >
              <option value="">Seleccione periodo...</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.bimestre} {p.anio}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            Emitir Libreta
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Libretas;
