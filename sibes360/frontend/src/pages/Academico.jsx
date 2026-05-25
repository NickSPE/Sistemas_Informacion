import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { 
  BookOpen, 
  CalendarRange, 
  ArrowLeft, 
  FileSpreadsheet, 
  Smile, 
  Plus, 
  Award,
  Users,
  GraduationCap,
  ClipboardCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Academico = () => {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new course
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState('');
  const [selectedInst, setSelectedInst] = useState('');

  // Nested Course Detail view state
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [activeTab, setActiveTab] = useState('horarios'); // 'horarios', 'estudiantes', 'notas', 'asistencia', 'conducta'
  
  // Data retrieved for the selected course
  const [cursoEvaluaciones, setCursoEvaluaciones] = useState([]);
  const [cursoNotas, setCursoNotas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [conductas, setConductas] = useState([]);
  
  const [detailLoading, setDetailLoading] = useState(false);

  // Modals inside course details
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [isConductaModalOpen, setIsConductaModalOpen] = useState(false);
  const [isAsistenciaModalOpen, setIsAsistenciaModalOpen] = useState(false);
  
  // Grade Form State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedEval, setSelectedEval] = useState('');
  const [calificacion, setCalificacion] = useState('');

  // Conduct Form State
  const [selectedConductStudent, setSelectedConductStudent] = useState('');
  const [conductTipo, setConductTipo] = useState('Positiva');
  const [conductDescripcion, setConductDescripcion] = useState('');

  // Attendance Form State
  const [selectedAsistStudent, setSelectedAsistStudent] = useState('');
  const [asistFecha, setAsistFecha] = useState(new Date().toISOString().split('T')[0]);
  const [asistEstado, setAsistEstado] = useState('P');
  const [asistObservacion, setAsistObservacion] = useState('');

  const canAddCurso = user?.rol === 'SuperAdmin' || user?.rol === 'Director';

  const fetchData = async () => {
    try {
      const [curRes, perRes, instRes] = await Promise.all([
        axios.get('http://localhost:8000/api/cursos/'),
        axios.get('http://localhost:8000/api/periodos/'),
        axios.get('http://localhost:8000/api/instituciones/')
      ]);
      setCursos(curRes.data);
      setPeriodos(perRes.data);
      setInstituciones(instRes.data);
    } catch (err) {
      console.error("Failed to load academic data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.institucion_id) {
      setSelectedInst(user.institucion_id.toString());
    }
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const instId = user?.rol === 'SuperAdmin' ? parseInt(selectedInst) : user?.institucion_id;
      await axios.post('http://localhost:8000/api/cursos/', {
        nombre,
        area,
        institucion: instId,
        estado: true
      });
      setIsModalOpen(false);
      setNombre('');
      setArea('');
      if (user?.rol === 'SuperAdmin') {
        setSelectedInst('');
      }
      fetchData();
    } catch (err) {
      console.error("Course insertion failed:", err);
    }
  };

  // Nested view handlers
  const handleSelectCurso = async (curso) => {
    setSelectedCurso(curso);
    setDetailLoading(true);
    setActiveTab('horarios'); // Default tab: Horarios
    try {
      const [evalRes, notaRes, horRes, matRes, asistRes, condRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/evaluaciones/?curso=${curso.id}`),
        axios.get(`http://localhost:8000/api/notas/?curso=${curso.id}`),
        axios.get(`http://localhost:8000/api/horarios/?curso=${curso.id}`),
        axios.get('http://localhost:8000/api/matricula/'),
        axios.get('http://localhost:8000/api/asistencia/'),
        axios.get('http://localhost:8000/api/conducta/')
      ]);
      setCursoEvaluaciones(evalRes.data);
      setCursoNotas(notaRes.data);
      setHorarios(horRes.data);
      setMatriculas(matRes.data);
      setAsistencias(asistRes.data);
      setConductas(condRes.data);
    } catch (err) {
      console.error("Failed to load course details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefreshDetails = async () => {
    if (!selectedCurso) return;
    setDetailLoading(true);
    try {
      const [evalRes, notaRes, horRes, matRes, asistRes, condRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/evaluaciones/?curso=${selectedCurso.id}`),
        axios.get(`http://localhost:8000/api/notas/?curso=${selectedCurso.id}`),
        axios.get(`http://localhost:8000/api/horarios/?curso=${selectedCurso.id}`),
        axios.get('http://localhost:8000/api/matricula/'),
        axios.get('http://localhost:8000/api/asistencia/'),
        axios.get('http://localhost:8000/api/conducta/')
      ]);
      setCursoEvaluaciones(evalRes.data);
      setCursoNotas(notaRes.data);
      setHorarios(horRes.data);
      setMatriculas(matRes.data);
      setAsistencias(asistRes.data);
      setConductas(condRes.data);
    } catch (err) {
      console.error("Failed to refresh course details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddNota = async (e) => {
    e.preventDefault();
    const val = parseFloat(calificacion);
    if (isNaN(val) || val < 0 || val > 20) {
      alert("La calificación debe estar entre 0 y 20.");
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/notas/', {
        estudiante: parseInt(selectedStudent),
        evaluacion: parseInt(selectedEval),
        calificacion: val
      });
      setIsNotaModalOpen(false);
      setSelectedStudent('');
      setSelectedEval('');
      setCalificacion('');
      handleRefreshDetails();
    } catch (err) {
      console.error("Grade recording failed:", err);
      alert(err.response?.data?.detail || "Error al registrar la calificación.");
    }
  };

  const handleAddConducta = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/conducta/', {
        estudiante: parseInt(selectedConductStudent),
        fecha: new Date().toISOString().split('T')[0],
        tipo: conductTipo,
        descripcion: conductDescripcion
      });
      setIsConductaModalOpen(false);
      setSelectedConductStudent('');
      setConductDescripcion('');
      handleRefreshDetails();
    } catch (err) {
      console.error("Behavior insertion failed:", err);
      alert(err.response?.data?.detail || "Error al registrar la conducta.");
    }
  };

  const handleAddAsistencia = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/asistencia/', {
        estudiante: parseInt(selectedAsistStudent),
        fecha: asistFecha,
        estado: asistEstado,
        observacion: asistObservacion
      });
      setIsAsistenciaModalOpen(false);
      setSelectedAsistStudent('');
      setAsistObservacion('');
      handleRefreshDetails();
    } catch (err) {
      console.error("Attendance recording failed:", err);
      alert(err.response?.data?.detail || "Error al registrar la asistencia.");
    }
  };

  const getGradeStyle = (val) => {
    if (val >= 13) return 'bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded';
    if (val >= 11) return 'bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded';
    return 'bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold';
  };

  // Derive unique teachers and full schedules
  const uniqueDocentes = [];
  const docenteIds = new Set();
  horarios.forEach(h => {
    if (h.docente && !docenteIds.has(h.docente)) {
      docenteIds.add(h.docente);
      uniqueDocentes.push({
        id: h.docente,
        nombres: h.docente_nombre,
        dia: h.dia,
        hora: `${h.hora_inicio} - ${h.hora_fin}`,
        seccion: h.seccion_nombre
      });
    }
  });

  // Derive sections linked to this course
  const seccionIds = Array.from(new Set(horarios.map(h => h.seccion)));

  // Derive students enrolled in these sections via matriculas
  const enrolledStudents = matriculas
    .filter(m => seccionIds.includes(m.seccion))
    .map(m => ({
      id: m.estudiante,
      nombres: m.estudiante_nombres,
      apellidos: m.estudiante_apellidos,
      seccion_nombre: m.seccion_nombre,
      grado_nombre: m.grado_nombre
    }));

  // Deduplicate enrolled students
  const uniqueEnrolledStudents = [];
  const seenStudentIds = new Set();
  enrolledStudents.forEach(s => {
    if (!seenStudentIds.has(s.id)) {
      seenStudentIds.add(s.id);
      uniqueEnrolledStudents.push(s);
    }
  });

  const enrolledStudentIds = uniqueEnrolledStudents.map(s => s.id);

  // Filter attendance records to those of enrolled students
  const courseAsistencias = asistencias.filter(asist => enrolledStudentIds.includes(asist.estudiante));

  // Filter conduct records to those of enrolled students
  const courseConductas = conductas.filter(c => enrolledStudentIds.includes(c.estudiante));

  const columns = [
    { header: 'Código', accessor: 'id', width: '85px' },
    { header: 'Curso / Asignatura', accessor: 'nombre', width: '200px' },
    { header: 'Área Curricular', accessor: 'area', width: '150px' },
    { header: 'Institución', accessor: 'institucion_nombre' },
    { 
      header: 'Estado', 
      accessor: 'estado', 
      width: '90px',
      render: (row) => <Badge type={row.estado ? 'Presente' : 'Falta'} text={row.estado ? 'Vigente' : 'Inactivo'} />
    },
    {
      header: 'Acción',
      width: '180px',
      render: (row) => (
        <button 
          onClick={() => handleSelectCurso(row)}
          className="text-[10px] font-bold bg-[#6c63ff]/10 text-[#6c63ff] hover:bg-[#6c63ff]/20 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <BookOpen size={12} />
          <span>Ingresar al Curso / Gestionar</span>
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

  // Render nested course details if selected
  if (selectedCurso) {
    const isHorarioTab = activeTab === 'horarios';
    const isStudentTab = activeTab === 'estudiantes';
    const isGradesTab = activeTab === 'notas';
    const isAttendanceTab = activeTab === 'asistencia';
    const isConductTab = activeTab === 'conducta';

    return (
      <div className="space-y-6 animate-fadeIn text-left">
        <button 
          onClick={() => setSelectedCurso(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#6c63ff] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Volver al Catálogo de Cursos</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold bg-indigo-50 text-[#6c63ff] border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                {selectedCurso.area || 'Asignatura'}
              </span>
              <h2 className="text-lg font-bold text-[#1a1f36] tracking-tight">{selectedCurso.nombre}</h2>
              <p className="text-xs text-[#8898aa]">Administración centralizada de horarios, docentes, estudiantes, calificaciones, asistencias y conducta.</p>
            </div>
            
            {/* Quick Action Button contextually matches the active tab */}
            {(isGradesTab || isAttendanceTab || isConductTab) && (
              <div>
                <button 
                  onClick={() => {
                    if (isGradesTab) setIsNotaModalOpen(true);
                    else if (isAttendanceTab) setIsAsistenciaModalOpen(true);
                    else if (isConductTab) setIsConductaModalOpen(true);
                  }}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-sm ${
                    isGradesTab ? 'bg-[#6c63ff] hover:bg-[#5b52e0]' : 
                    isAttendanceTab ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  <Plus size={14} />
                  <span>
                    {isGradesTab ? 'Registrar Calificación' : 
                     isAttendanceTab ? 'Registrar Asistencia' : 'Registrar Conducta'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs - Holds the 5 sections */}
          <div className="flex flex-wrap border-b border-slate-100 mt-4 gap-1">
            <button 
              onClick={() => setActiveTab('horarios')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                isHorarioTab ? 'border-[#6c63ff] text-[#6c63ff]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Clock size={14} />
              <span>Horarios y Docentes</span>
            </button>
            <button 
              onClick={() => setActiveTab('estudiantes')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                isStudentTab ? 'border-[#6c63ff] text-[#6c63ff]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <GraduationCap size={14} />
              <span>Estudiantes ({uniqueEnrolledStudents.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('notas')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                isGradesTab ? 'border-[#6c63ff] text-[#6c63ff]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Calificaciones (Notas)</span>
            </button>
            <button 
              onClick={() => setActiveTab('asistencia')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                isAttendanceTab ? 'border-[#6c63ff] text-[#6c63ff]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <ClipboardCheck size={14} />
              <span>Asistencia</span>
            </button>
            <button 
              onClick={() => setActiveTab('conducta')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                isConductTab ? 'border-[#6c63ff] text-[#6c63ff]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Smile size={14} />
              <span>Conducta</span>
            </button>
          </div>

          <div className="mt-6">
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6c63ff]"></div>
              </div>
            ) : isHorarioTab ? (
              /* TAB 1: HORARIOS Y DOCENTES */
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[#1a1f36] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-4 py-2 text-[9px] font-bold">Día de Clases</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Bloque Horario</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Sección / Aula</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Docente Asignado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                      {horarios.length > 0 ? (
                        horarios.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-[#1a1f36]">{h.dia}</td>
                            <td className="px-4 py-2.5 text-slate-500 font-medium">
                              <span className="bg-indigo-50 text-[#6c63ff] px-2 py-0.5 rounded border border-indigo-100">
                                {h.hora_inicio} - {h.hora_fin}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-bold text-slate-700">{h.seccion_nombre}</td>
                            <td className="px-4 py-2.5 font-bold text-[#6c63ff]">{h.docente_nombre || 'Sin docente'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                            No se registran horarios ni docentes asociados a este curso en el periodo actual.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : isStudentTab ? (
              /* TAB 2: ESTUDIANTES */
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[#1a1f36] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-4 py-2 text-[9px] font-bold">ID Alumno</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Apellidos</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Nombres</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Grado Académico</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Sección Enrolada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                      {uniqueEnrolledStudents.length > 0 ? (
                        uniqueEnrolledStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5 text-slate-400 font-mono">#{s.id}</td>
                            <td className="px-4 py-2.5 font-bold text-[#1a1f36]">{s.apellidos}</td>
                            <td className="px-4 py-2.5 text-slate-600">{s.nombres}</td>
                            <td className="px-4 py-2.5 text-slate-500 font-medium">{s.grado_nombre}</td>
                            <td className="px-4 py-2.5 font-bold text-[#6c63ff]">{s.seccion_nombre}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                            Ningún alumno matriculado en las secciones asignadas a este curso.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : isGradesTab ? (
              /* TAB 3: CALIFICACIONES (NOTAS) */
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[#1a1f36] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-4 py-2 text-[9px] font-bold">Estudiante</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Evaluación</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Bimestre</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Calificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                      {cursoNotas && cursoNotas.length > 0 ? (
                        cursoNotas.map((n) => (
                          <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-[#1a1f36]">
                              {n.estudiante_apellidos}, {n.estudiante_nombres}
                            </td>
                            <td className="px-4 py-2.5 text-slate-500">{n.evaluacion_tipo}</td>
                            <td className="px-4 py-2.5 text-slate-500">{n.evaluacion_periodo_bimestre || 'I Bimestre'}</td>
                            <td className="px-4 py-2.5">
                              <span className={getGradeStyle(parseFloat(n.calificacion))}>{n.calificacion}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                            No se registran notas de evaluaciones para este curso en el periodo actual.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : isAttendanceTab ? (
              /* TAB 4: ASISTENCIA */
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[#1a1f36] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-4 py-2 text-[9px] font-bold">Fecha</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Estudiante</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Estado de Asistencia</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Observación / Bitácora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                      {courseAsistencias && courseAsistencias.length > 0 ? (
                        courseAsistencias.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5 text-slate-500">{a.fecha}</td>
                            <td className="px-4 py-2.5 font-bold text-[#1a1f36]">
                              {a.estudiante_apellidos}, {a.estudiante_nombres}
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge 
                                type={
                                  a.estado === 'P' ? 'Presente' : 
                                  a.estado === 'F' ? 'Falta' : 'Tardanza'
                                } 
                                text={
                                  a.estado === 'P' ? 'Presente' : 
                                  a.estado === 'F' ? 'Falta' : 
                                  a.estado === 'FJ' ? 'Falta Justificada' : 'Tardanza'
                                } 
                              />
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 italic">{a.observacion || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                            No se registran bitácoras de asistencia escolar diaria de los estudiantes matriculados en este curso.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* TAB 5: CONDUCTA */
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[#1a1f36] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-4 py-2 text-[9px] font-bold">Fecha</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Estudiante</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Incidencia</th>
                        <th className="px-4 py-2 text-[9px] font-bold">Detalle / Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                      {courseConductas && courseConductas.length > 0 ? (
                        courseConductas.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5 text-slate-500">{c.fecha}</td>
                            <td className="px-4 py-2.5 font-bold text-[#1a1f36]">
                              {c.estudiante_apellidos}, {c.estudiante_nombres}
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge type={c.tipo} text={c.tipo} />
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 font-medium">{c.descripcion}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                            No se registran reportes disciplinarios ni méritos de conducta de los estudiantes matriculados en este curso.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested Modal: Registrar Nota */}
        {isNotaModalOpen && (
          <Modal isOpen={isNotaModalOpen} onClose={() => setIsNotaModalOpen(false)} title="Registrar Nota Académica">
            <form onSubmit={handleAddNota} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estudiante Enrolado</label>
                <select 
                  required value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                >
                  <option value="">Seleccione alumno...</option>
                  {uniqueEnrolledStudents.map(e => (
                    <option key={e.id} value={e.id}>{e.apellidos}, {e.nombres} ({e.seccion_nombre})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Evaluación Programada</label>
                <select 
                  required value={selectedEval} onChange={e => setSelectedEval(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                >
                  <option value="">Seleccione evaluación...</option>
                  {cursoEvaluaciones.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.tipo} - {ev.periodo_bimestre || 'I Bimestre'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Calificación (0 - 20)</label>
                <input 
                  type="number" step="0.1" min="0" max="20" required value={calificacion} onChange={e => setCalificacion(e.target.value)} placeholder="Ej. 16.5"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
                Registrar Calificación
              </button>
            </form>
          </Modal>
        )}

        {/* Nested Modal: Registrar Asistencia */}
        {isAsistenciaModalOpen && (
          <Modal isOpen={isAsistenciaModalOpen} onClose={() => setIsAsistenciaModalOpen(false)} title="Registrar Asistencia del Curso">
            <form onSubmit={handleAddAsistencia} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estudiante Enrolado</label>
                <select 
                  required value={selectedAsistStudent} onChange={e => setSelectedAsistStudent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                >
                  <option value="">Seleccione alumno...</option>
                  {uniqueEnrolledStudents.map(e => (
                    <option key={e.id} value={e.id}>{e.apellidos}, {e.nombres} ({e.seccion_nombre})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Fecha</label>
                  <input 
                    type="date" required value={asistFecha} onChange={e => setAsistFecha(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estado</label>
                  <select 
                    required value={asistEstado} onChange={e => setAsistEstado(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                  >
                    <option value="P">Presente</option>
                    <option value="F">Falta Injustificada</option>
                    <option value="FJ">Falta Justificada</option>
                    <option value="T">Tardanza</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Observación / Bitácora</label>
                <input 
                  type="text" value={asistObservacion} onChange={e => setAsistObservacion(e.target.value)} placeholder="Ej. Llegó tarde por tráfico"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors mt-2">
                Registrar Asistencia
              </button>
            </form>
          </Modal>
        )}

        {/* Nested Modal: Registrar Conducta */}
        {isConductaModalOpen && (
          <Modal isOpen={isConductaModalOpen} onClose={() => setIsConductaModalOpen(false)} title="Registrar Incidencia de Conducta">
            <form onSubmit={handleAddConducta} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estudiante Enrolado</label>
                <select 
                  required value={selectedConductStudent} onChange={e => setSelectedConductStudent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                >
                  <option value="">Seleccione alumno...</option>
                  {uniqueEnrolledStudents.map(e => (
                    <option key={e.id} value={e.id}>{e.apellidos}, {e.nombres} ({e.seccion_nombre})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Tipo de Incidencia</label>
                <select 
                  required value={conductTipo} onChange={e => setConductTipo(e.target.value)}
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
                  required value={conductDescripcion} onChange={e => setConductDescripcion(e.target.value)} placeholder="Describa el comportamiento..." rows={3}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors mt-2">
                Registrar Incidencia
              </button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Strict single H1 Constraint */}
      <div>
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Catálogo de Cursos</h1>
        <p className="text-xs text-[#8898aa]">Administración del catálogo de cursos, planes de estudio curriculares y asignaciones académicas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Cursos Académicos Registrados"
            columns={columns}
            data={cursos}
            searchField="nombre"
            onAdd={canAddCurso ? () => setIsModalOpen(true) : undefined}
            addLabel={canAddCurso ? "Agregar Curso" : undefined}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Asignaturas de Plan" 
            value={cursos.length} 
            subtitle="Cursos activos registrados" 
            icon={BookOpen} 
          />
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <CalendarRange size={14} className="text-[#6c63ff]" />
              <span>Bimestres y Año Lectivo</span>
            </h3>
            <div className="space-y-3">
              {periodos.map(p => (
                <div key={p.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-[#1a1f36]">{p.bimestre} {p.anio}</span>
                    <span className="text-[10px] text-slate-400 block">Lima Metropolitana</span>
                  </div>
                  <Badge type={p.estado ? 'Presente' : 'Falta'} text={p.estado ? 'Activo' : 'Cerrado'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Registrar Curso */}
      {canAddCurso && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Curso">
          <form onSubmit={handleAdd} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nombre del Curso</label>
              <input 
                type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Álgebra y Geometría"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Área Curricular</label>
                <input 
                  type="text" required value={area} onChange={e => setArea(e.target.value)} placeholder="Ej. Matemática"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              {user?.rol === 'SuperAdmin' && (
                <div>
                  <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Colegio Pertenencia</label>
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
            </div>
            <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
              Registrar Curso
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Academico;
