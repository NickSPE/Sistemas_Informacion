import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Clock, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Horarios = () => {
  const { selectedInstitucion } = useAuth();
  const [horarios, setHorarios] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [dia, setDia] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [selectedDocente, setSelectedDocente] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');

  const fetchData = async () => {
    try {
      const instParam = selectedInstitucion ? `?institucion=${selectedInstitucion}` : '';
      const [horRes, docRes, curRes, secRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/horarios/${instParam}`),
        axios.get(`http://localhost:8000/api/docentes/${instParam}`),
        axios.get(`http://localhost:8000/api/cursos/${instParam}`),
        axios.get(`http://localhost:8000/api/secciones/${instParam}`)
      ]);
      setHorarios(horRes.data);
      setDocentes(docRes.data);
      setCursos(curRes.data);
      setSecciones(secRes.data);
    } catch (err) {
      console.error("Failed to load schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedInstitucion]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/horarios/', {
        docente: parseInt(selectedDocente),
        curso: parseInt(selectedCurso),
        seccion: parseInt(selectedSeccion),
        dia,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });
      setIsModalOpen(false);
      setDia('');
      setHoraInicio('');
      setHoraFin('');
      setSelectedDocente('');
      setSelectedCurso('');
      setSelectedSeccion('');
      fetchData();
    } catch (err) {
      console.error("Schedule creation failed:", err);
    }
  };

  const columns = [
    { header: 'Curso', accessor: 'curso_nombre', width: '180px' },
    { header: 'Docente Asignado', accessor: 'docente_nombre', width: '200px' },
    { header: 'Aula / Sección', accessor: 'seccion_nombre', width: '120px' },
    { header: 'Día', accessor: 'dia', width: '110px' },
    { header: 'Hora Inicio', accessor: 'hora_inicio', width: '110px' },
    { header: 'Hora Fin', accessor: 'hora_fin', width: '110px' }
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Horarios de Clases</h1>
        <p className="text-xs text-[#8898aa]">Administración de franjas horarias lectivas, distribución de aulas y docentes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Cuadro de Distribución de Horas"
            columns={columns}
            data={horarios}
            searchField="curso_nombre"
            onAdd={() => setIsModalOpen(true)}
            addLabel="Asignar Horario"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Bloques Programados" 
            value={horarios.length} 
            subtitle="Horas lectivas semanales" 
            icon={Clock} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Info size={14} className="text-[#6c63ff]" />
              <span>Cruce de Horas</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El motor de asignación de horarios de SIBES 360 valida de manera lógica que ningún docente ni aula tenga cruces de horarios durante el mismo día de clases.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Asignar Horario de Clase">
        <form onSubmit={handleAdd} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Curso</label>
              <select 
                required value={selectedCurso} onChange={e => setSelectedCurso(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              >
                <option value="">Seleccione...</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Docente</label>
              <select 
                required value={selectedDocente} onChange={e => setSelectedDocente(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              >
                <option value="">Seleccione...</option>
                {docentes.map(d => (
                  <option key={d.id} value={d.id}>{d.nombres}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Aula / Sección</label>
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
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Día de la Semana</label>
              <select 
                required value={dia} onChange={e => setDia(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              >
                <option value="">Seleccione...</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Hora Inicio</label>
              <input 
                type="time" required value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Hora Fin</label>
              <input 
                type="time" required value={horaFin} onChange={e => setHoraFin(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            Registrar Horario
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Horarios;
