import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Smile, ShieldAlert } from 'lucide-react';

const Conducta = () => {
  const [conductas, setConductas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [tipo, setTipo] = useState('Positiva');
  const [descripcion, setDescripcion] = useState('');

  const fetchData = async () => {
    try {
      const [condRes, estRes] = await Promise.all([
        axios.get('http://localhost:8000/api/conducta/'),
        axios.get('http://localhost:8000/api/estudiantes/')
      ]);
      setConductas(condRes.data);
      setEstudiantes(estRes.data);
    } catch (err) {
      console.error("Failed to load behavior logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/conducta/', {
        estudiante: parseInt(selectedStudent),
        fecha: new Date().toISOString().split('T')[0],
        tipo,
        descripcion
      });
      setIsModalOpen(false);
      setSelectedStudent('');
      setDescripcion('');
      fetchData();
    } catch (err) {
      console.error("Behavior insertion failed:", err);
    }
  };

  const columns = [
    { header: 'Fecha', accessor: 'fecha', width: '110px' },
    { header: 'Estudiante', render: (row) => `${row.estudiante_apellidos || ''}, ${row.estudiante_nombres || ''}` },
    { 
      header: 'Tipo de Incidencia', 
      accessor: 'tipo', 
      width: '120px',
      render: (row) => <Badge type={row.tipo} text={row.tipo} />
    },
    { header: 'Descripción / Incidente', accessor: 'descripcion' }
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Registro de Conducta y Disciplina</h1>
        <p className="text-xs text-[#8898aa]">Control de incidencias de comportamiento escolar, deméritos y reconocimientos positivos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Bitácora de Disciplina"
            columns={columns}
            data={conductas}
            searchField="estudiante_apellidos"
            onAdd={() => setIsModalOpen(true)}
            addLabel="Registrar Incidencia"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Incidencias Registradas" 
            value={conductas.length} 
            subtitle="Incidentes de conducta" 
            icon={Smile} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldAlert size={14} className="text-[#6c63ff]" />
              <span>Clasificación de Faltas</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Las incidencias se categorizan en:
              <br />• <b>Positivas:</b> Felicitaciones y méritos.
              <br />• <b>Leves:</b> Incumplimiento menor de uniforme o desorden.
              <br />• <b>Graves:</b> Faltas de respeto o inconductas graves que gatillan citaciones inmediatas.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Incidencia de Conducta">
        <form onSubmit={handleAdd} className="space-y-4 text-left">
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
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Tipo de Incidencia</label>
            <select 
              required value={tipo} onChange={e => setTipo(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            >
              <option value="Positiva">Positiva (Mérito)</option>
              <option value="Leve">Falta Leve</option>
              <option value="Grave">Falta Grave</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Descripción Detallada</label>
            <textarea 
              required value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describa el suceso u observación..." rows={3}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            Registrar Incidencia
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Conducta;
