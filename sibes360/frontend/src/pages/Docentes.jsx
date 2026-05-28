import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Briefcase, UserCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Docentes = () => {
  const { user, selectedInstitucion } = useAuth();
  const [docentes, setDocentes] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewCoursesOpen, setIsViewCoursesOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);

  // Form states
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [selectedInst, setSelectedInst] = useState('');

  const canAdd = user?.rol === 'SuperAdmin' || user?.rol === 'Director';

  const fetchData = async () => {
    try {
      const url = selectedInstitucion 
        ? `http://localhost:8000/api/docentes/?institucion=${selectedInstitucion}` 
        : 'http://localhost:8000/api/docentes/';
      const [docRes, instRes] = await Promise.all([
        axios.get(url),
        axios.get('http://localhost:8000/api/instituciones/')
      ]);
      setDocentes(docRes.data);
      setInstituciones(instRes.data);
    } catch (err) {
      console.error("Failed to load teachers data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedInstitucion]);


  useEffect(() => {
    if (user?.institucion_id) {
      setSelectedInst(user.institucion_id.toString());
    }
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const instId = user?.rol === 'SuperAdmin' ? parseInt(selectedInst) : user?.institucion_id;
      await axios.post('http://localhost:8000/api/docentes/', {
        dni,
        nombres,
        especialidad,
        institucion: instId,
        estado: true
      });
      setIsModalOpen(false);
      setDni('');
      setNombres('');
      setEspecialidad('');
      if (user?.rol === 'SuperAdmin') {
        setSelectedInst('');
      }
      fetchData();
    } catch (err) {
      console.error("Failed to add docent:", err);
    }
  };

  const handleViewCourses = (docente) => {
    setSelectedDocente(docente);
    setIsViewCoursesOpen(true);
  };

  const columns = [
    { header: 'DNI', accessor: 'dni', width: '100px' },
    { header: 'Nombre del Docente', accessor: 'nombres', width: '200px' },
    { header: 'Especialidad principal', accessor: 'especialidad', width: '150px' },
    { header: 'Colegio Asignado', accessor: 'institucion_nombre' },
    { 
      header: 'Estado', 
      accessor: 'estado', 
      width: '90px',
      render: (row) => <Badge type={row.estado ? 'Presente' : 'Falta'} text={row.estado ? 'Activo' : 'Cesado'} />
    },
    {
      header: 'Cursos Asignados',
      width: '140px',
      render: (row) => (
        <button 
          onClick={() => handleViewCourses(row)}
          className="text-[10px] font-bold text-[#6c63ff] hover:underline flex items-center gap-1"
        >
          <BookOpen size={12} />
          <span>Ver Cursos ({row.cursos_asignados?.length || 0})</span>
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Plana Docente Especializada</h1>
        <p className="text-xs text-[#8898aa]">Gestión de personal de enseñanza, áreas asignadas y perfiles profesionales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Registro de Docentes"
            columns={columns}
            data={docentes}
            searchField="nombres"
            onAdd={canAdd ? () => setIsModalOpen(true) : undefined}
            addLabel={canAdd ? "Registrar Docente" : undefined}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Docentes en Lima" 
            value={docentes.length} 
            subtitle="Plana docente activa" 
            icon={Briefcase} 
            color="warning"
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <UserCheck size={14} className="text-[#6c63ff]" />
              <span>Competencia Profesional</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El personal docente registrado puede ser asignado a cursos específicos del plan académico bimestral y registrar asistencia escolar diaria de las secciones bajo su tutoría.
            </p>
          </div>
        </div>
      </div>

      {/* Modal - Registrar */}
      {canAdd && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Docente">
          <form onSubmit={handleAdd} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">DNI (8 dígitos)</label>
                <input 
                  type="text" required maxLength={8} value={dni} onChange={e => setDni(e.target.value)} placeholder="DNI"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Especialidad</label>
                <input 
                  type="text" required value={especialidad} onChange={e => setEspecialidad(e.target.value)} placeholder="Ej. Matemática"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nombre Completo</label>
              <input 
                type="text" required value={nombres} onChange={e => setNombres(e.target.value)} placeholder="Ej. Prof. Juan Pérez"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            {user?.rol === 'SuperAdmin' && (
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Colegio Asignación</label>
                <select 
                  required value={selectedInst} onChange={e => setSelectedInst(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                >
                  <option value="">Seleccione colegio...</option>
                  {instituciones.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
              Registrar Docente
            </button>
          </form>
        </Modal>
      )}

      {/* Modal - Cursos Asignados */}
      {isViewCoursesOpen && selectedDocente && (
        <Modal 
          isOpen={isViewCoursesOpen} 
          onClose={() => { setIsViewCoursesOpen(false); setSelectedDocente(null); }} 
          title={`Cursos de ${selectedDocente.nombres}`}
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500">
              Listado oficial de asignaturas y secciones a cargo para el periodo lectivo vigente.
            </p>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[#1a1f36] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-2 text-[9px] font-bold">Curso / Asignatura</th>
                    <th className="px-4 py-2 text-[9px] font-bold">Área Curricular</th>
                    <th className="px-4 py-2 text-[9px] font-bold">Sección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                  {selectedDocente.cursos_asignados && selectedDocente.cursos_asignados.length > 0 ? (
                    selectedDocente.cursos_asignados.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-[#1a1f36]">{c.nombre}</td>
                        <td className="px-4 py-2.5 text-slate-500">{c.area || 'N/A'}</td>
                        <td className="px-4 py-2.5 font-bold text-[#6c63ff]">
                          {c.seccion_nombre}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                        No tiene cursos asignados en su horario semanal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => { setIsViewCoursesOpen(false); setSelectedDocente(null); }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors mt-2"
            >
              Cerrar Vista
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Docentes;
