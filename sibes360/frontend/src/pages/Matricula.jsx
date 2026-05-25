import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { UserPlus, Settings } from 'lucide-react';

const Matricula = () => {
  const [matriculas, setMatriculas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');

  const fetchData = async () => {
    try {
      const [matRes, estRes, gradRes, seccRes, perRes] = await Promise.all([
        axios.get('http://localhost:8000/api/matricula/'),
        axios.get('http://localhost:8000/api/estudiantes/'),
        axios.get('http://localhost:8000/api/grado/'),
        axios.get('http://localhost:8000/api/seccion/'),
        axios.get('http://localhost:8000/api/periodo/')
      ]);
      setMatriculas(matRes.data);
      setEstudiantes(estRes.data);
      setGrados(gradRes.data);
      setSecciones(seccRes.data);
      setPeriodos(perRes.data);
    } catch (err) {
      console.error("Failed to load enrollment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/matricula/', {
        estudiante: parseInt(selectedStudent),
        periodo: parseInt(selectedPeriod),
        grado: parseInt(selectedGrado),
        seccion: parseInt(selectedSeccion),
        estado: 'Activo'
      });
      setIsModalOpen(false);
      setSelectedStudent('');
      setSelectedPeriod('');
      setSelectedGrado('');
      setSelectedSeccion('');
      fetchData();
    } catch (err) {
      console.error("Enrollment failed:", err);
    }
  };

  const columns = [
    { header: 'Código', accessor: 'id', width: '80px' },
    { header: 'Estudiante', render: (row) => `${row.estudiante_apellidos || ''}, ${row.estudiante_nombres || ''}` },
    { header: 'Periodo Académico', accessor: 'periodo_bimestre', width: '130px' },
    { header: 'Grado Asignado', accessor: 'grado_nombre', width: '120px' },
    { header: 'Sección', accessor: 'seccion_nombre', width: '80px' },
    { 
      header: 'Estado', 
      accessor: 'estado', 
      width: '100px',
      render: (row) => <Badge type={row.estado === 'Activo' ? 'Presente' : 'Falta'} text={row.estado} />
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Proceso de Matrícula</h1>
        <p className="text-xs text-[#8898aa]">Gestión de matrículas activas, asignaciones de aula y periodos vigentes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Matrículas Escolares 2025"
            columns={columns}
            data={matriculas}
            searchField="estudiante_apellidos"
            onAdd={() => setIsModalOpen(true)}
            addLabel="Matricular Alumno"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Alumnos Matriculados" 
            value={matriculas.length} 
            subtitle="Matrículas en periodo vigente" 
            icon={UserPlus} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Settings size={14} className="text-[#6c63ff]" />
              <span>Pautas de Aula</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Las matrículas escolares asignan al educando a un grado y sección específicos. Esta adscripción permite automatizar su asistencia escolar diaria y su libreta académica.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Matrícula Escolar">
        <form onSubmit={handleEnroll} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estudiante</label>
            <select 
              required value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            >
              <option value="">Seleccione estudiante...</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>{e.apellidos}, {e.nombres}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Periodo Escolar</label>
              <select 
                required value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              >
                <option value="">Seleccione...</option>
                {periodos.map(p => (
                  <option key={p.id} value={p.id}>{p.bimestre} {p.anio}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Grado Académico</label>
              <select 
                required value={selectedGrado} onChange={e => setSelectedGrado(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              >
                <option value="">Seleccione...</option>
                {grados.map(g => (
                  <option key={g.id} value={g.id}>{g.nombre} ({g.nivel_nombre})</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Sección de Aula</label>
            <select 
              required value={selectedSeccion} onChange={e => setSelectedSeccion(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            >
              <option value="">Seleccione...</option>
              {secciones.map(s => (
                <option key={s.id} value={s.id}>Aula {s.nombre} - (Grado: {s.grado_nombre})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            Matricular Alumno
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Matricula;
