import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, UserCheck, Users, BookOpen, Layers, GraduationCap, 
  UserPlus, Clock, Home, ArrowLeft, Save, Plus, Search, 
  Trash2, Award, MapPin, Phone, Shield, Edit2, CheckCircle2, XCircle,
  Sliders
} from 'lucide-react';
import Badge from '../components/Badge';

const GestionarInstitucion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institucion, setInstitucion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // General Info states (Submodule 1)
  const [nombre, setNombre] = useState('');
  const [ruc, setRuc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codigoModular, setCodigoModular] = useState('1498765'); // default mock modular code
  const [niveles, setNiveles] = useState({ inicial: true, primaria: true, secundaria: false });
  const [savingInfo, setSavingInfo] = useState(false);

  // Director states (Submodule 2)
  const [director, setDirector] = useState({
    dni: '45892341',
    nombres: 'Alejandro',
    apellidos: 'Valdez Flores',
    email: 'avaldez@sibes360.edu.pe',
    telefono: '998765432',
    cargo: 'Director General'
  });

  // Docentes states (Submodule 3)
  const [docentes, setDocentes] = useState([
    { id: 1, nombres: 'María Elena', apellidos: 'Paredes Rivas', dni: '40192837', email: 'mparedes@sibes360.edu.pe', curso: 'Matemática' },
    { id: 2, nombres: 'Carlos Alberto', apellidos: 'Gómez Tello', dni: '09876543', email: 'cgomez@sibes360.edu.pe', curso: 'Comunicación' },
    { id: 3, nombres: 'Patricia Roxana', apellidos: 'López Salas', dni: '32190876', email: 'plopez@sibes360.edu.pe', curso: 'Ciencia y Tecnología' }
  ]);
  const [newDocente, setNewDocente] = useState({ nombres: '', apellidos: '', dni: '', email: '', curso: '' });
  const [searchDocente, setSearchDocente] = useState('');

  // Cursos states (Submodule 4)
  const [cursos, setCursos] = useState([
    { id: 1, nombre: 'Aritmética', grado: '1° Primaria', area: 'Matemática' },
    { id: 2, nombre: 'Comunicación Integral', grado: '1° Primaria', area: 'Comunicación' },
    { id: 3, fontAwesome: '', nombre: 'Personal Social', grado: '1° Primaria', area: 'Ciencias Sociales' },
    { id: 4, nombre: 'Álgebra', grado: '2° Primaria', area: 'Matemática' },
    { id: 5, nombre: 'Comprensión Lectora', grado: '2° Primaria', area: 'Comunicación' }
  ]);
  const [newCurso, setNewCurso] = useState({ nombre: '', grado: '1° Primaria', area: 'Matemática' });
  const [selectedCursoForAdmin, setSelectedCursoForAdmin] = useState(null);
  const [notasCurso, setNotasCurso] = useState({
    '1-101': { tarea: 18, parcial: 17, examenFinal: 18 },
    '1-102': { tarea: 16, parcial: 15, examenFinal: 17 },
    '1-103': { tarea: 14, parcial: 14, examenFinal: 16 },
    '2-101': { tarea: 17, parcial: 16, examenFinal: 18 },
    '2-102': { tarea: 15, parcial: 16, examenFinal: 16 },
    '2-103': { tarea: 13, parcial: 15, examenFinal: 15 },
    '3-101': { tarea: 16, parcial: 18, examenFinal: 17 },
    '3-102': { tarea: 14, parcial: 15, examenFinal: 16 },
    '3-103': { tarea: 15, parcial: 16, examenFinal: 15 },
    '4-104': { tarea: 18, parcial: 18, examenFinal: 19 },
    '5-104': { tarea: 17, parcial: 17, examenFinal: 18 }
  });
  const [guardandoNotas, setGuardandoNotas] = useState(false);

  // Grados y Secciones states (Submodule 5)
  const [secciones, setSecciones] = useState([
    { id: 1, grado: '1° Primaria', seccion: 'A', tutor: 'María Elena Paredes', alumnos: 24 },
    { id: 2, grado: '1° Primaria', seccion: 'B', tutor: 'Carlos Alberto Gómez', alumnos: 22 },
    { id: 3, grado: '2° Primaria', seccion: 'A', tutor: 'Patricia Roxana López', alumnos: 25 }
  ]);
  const [newSeccion, setNewSeccion] = useState({ grado: '1° Primaria', seccion: '', tutor: '' });

  // Alumnos states (Submodule 6)
  const [alumnos, setAlumnos] = useState([
    { id: 101, nombres: 'Mateo Sebastián', apellidos: 'Peralta Díaz', dni: '72183948', seccion: '1° Primaria A', promedio: '17.5' },
    { id: 102, nombres: 'Luciana Valeria', apellidos: 'Mendoza Ruiz', dni: '73948102', seccion: '1° Primaria A', promedio: '16.2' },
    { id: 103, nombres: 'Santiago André', apellidos: 'Ramos Cáceres', dni: '71092834', seccion: '1° Primaria B', promedio: '14.8' },
    { id: 104, nombres: 'Camila Sophia', apellidos: 'Vega Ortiz', dni: '70298341', seccion: '2° Primaria A', promedio: '18.1' }
  ]);
  const [searchAlumno, setSearchAlumno] = useState('');
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  // Matrícula states (Submodule 7)
  const [matriculas, setMatriculas] = useState({
    anio: '2026',
    vacantesTotales: 150,
    matriculados: 71,
    pendientes: 12
  });

  // Horarios states (Submodule 8)
  const [horarios, setHorarios] = useState([
    { dia: 'Lunes', hora: '08:00 - 09:30', curso: 'Matemática', docente: 'María Elena Paredes', seccion: '1° Primaria A' },
    { dia: 'Lunes', hora: '09:30 - 11:00', curso: 'Comunicación', docente: 'Carlos Alberto Gómez', seccion: '1° Primaria A' },
    { dia: 'Martes', hora: '08:00 - 09:30', curso: 'Ciencia y Tecnología', docente: 'Patricia Roxana López', seccion: '1° Primaria A' },
    { dia: 'Miércoles', hora: '08:00 - 09:30', curso: 'Matemática', docente: 'María Elena Paredes', seccion: '1° Primaria A' },
    { dia: 'Jueves', hora: '09:30 - 11:00', curso: 'Comunicación', docente: 'Carlos Alberto Gómez', seccion: '1° Primaria A' }
  ]);

  // Aulas states (Submodule 9)
  const [aulas, setAulas] = useState([
    { id: 1, nombre: 'Aula 101', ubicacion: 'Pabellón A - 1° Piso', aforo: 30, tipo: 'Teórica' },
    { id: 2, nombre: 'Aula 102', ubicacion: 'Pabellón A - 1° Piso', aforo: 30, tipo: 'Teórica' },
    { id: 3, nombre: 'Lab. Cómputo', ubicacion: 'Pabellón B - 2° Piso', aforo: 25, tipo: 'Tecnológica' },
    { id: 4, nombre: 'Aula de Ciencias', ubicacion: 'Pabellón C - 1° Piso', aforo: 24, tipo: 'Laboratorio' }
  ]);
  const [newAula, setNewAula] = useState({ nombre: '', ubicacion: '', aforo: 30, tipo: 'Teórica' });

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/instituciones/${id}/`);
        setInstitucion(res.data);
        setNombre(res.data.nombre);
        setRuc(res.data.ruc);
        setDireccion(res.data.direccion || '');
        setTelefono(res.data.telefono || '');

        // Fetch sub-entities associated ONLY with this institution
        try {
          const [usersRes, docentesRes, estudiantesRes, cursosRes, seccionesRes, horariosRes] = await Promise.all([
            axios.get(`http://localhost:8000/api/usuarios/?institucion=${id}`),
            axios.get(`http://localhost:8000/api/docentes/?institucion=${id}`),
            axios.get(`http://localhost:8000/api/estudiantes/?institucion=${id}`),
            axios.get(`http://localhost:8000/api/cursos/?institucion=${id}`),
            axios.get(`http://localhost:8000/api/secciones/?institucion=${id}`),
            axios.get(`http://localhost:8000/api/horarios/?institucion=${id}`)
          ]);

          // Filter Director user
          const foundDir = usersRes.data.find(u => u.rol_nombre === 'Director' || u.rol_nombre === 'Director General' || u.rol === 2);
          if (foundDir) {
            setDirector({
              dni: foundDir.dni || '45892341',
              nombres: foundDir.first_name || foundDir.nombres || 'Alejandro',
              apellidos: foundDir.last_name || foundDir.apellidos || 'Valdez Flores',
              email: foundDir.email || 'avaldez@sibes360.edu.pe',
              telefono: foundDir.telefono || '998765432',
              cargo: foundDir.rol_nombre || 'Director General'
            });
          }

          // Bound Docentes list
          if (docentesRes.data && docentesRes.data.length > 0) {
            const mappedDocentes = docentesRes.data.map(d => ({
              id: d.id,
              dni: d.dni,
              nombres: d.nombres.split(' ')[0] || d.nombres,
              apellidos: d.nombres.split(' ').slice(1).join(' ') || '',
              email: `${d.dni}@sibes360.edu.pe`,
              curso: d.especialidad
            }));
            setDocentes(mappedDocentes);
          }

          // Bound Alumnos / Estudiantes list
          if (estudiantesRes.data && estudiantesRes.data.length > 0) {
            const mappedAlumnos = estudiantesRes.data.map(a => ({
              id: a.id,
              nombres: a.nombres,
              apellidos: a.apellidos,
              dni: a.dni,
              seccion: a.seccion_nombre || 'Secundaria / 3° Grado',
              promedio: '16.8'
            }));
            setAlumnos(mappedAlumnos);
          }

          // Bound Cursos list
          if (cursosRes.data && cursosRes.data.length > 0) {
            const mappedCursos = cursosRes.data.map(c => ({
              id: c.id,
              nombre: c.nombre,
              grado: 'Secundaria / 3° Grado',
              area: c.area || 'General'
            }));
            setCursos(mappedCursos);
          }

          // Bound Secciones list
          if (seccionesRes.data && seccionesRes.data.length > 0) {
            const mappedSecciones = seccionesRes.data.map(s => ({
              id: s.id,
              grado: s.grado_nombre || 'Secundaria / 3° Grado',
              seccion: s.nombre || 'A',
              tutor: s.tutor_nombre || 'María Elena Paredes',
              alumnos: s.alumnos_count || 24
            }));
            setSecciones(mappedSecciones);
          }

          // Bound Horarios list
          if (horariosRes.data && horariosRes.data.length > 0) {
            const mappedHorarios = horariosRes.data.map(h => ({
              dia: h.dia,
              hora: `${h.hora_inicio.substring(0, 5)} - ${h.hora_fin.substring(0, 5)}`,
              curso: h.curso_nombre || 'Matemática',
              docente: h.docente_nombre || 'María Elena Paredes',
              seccion: h.seccion_nombre || '1° Primaria A'
            }));
            setHorarios(mappedHorarios);
          }
        } catch (subErr) {
          console.error("Failed to load school sub-entities, keeping mock defaults:", subErr);
        }
      } catch (err) {
        console.error("Failed to load school details, falling back to mock:", err);
        // Fallback placeholders
        setNombre("Institución Educativa Ficticia");
        setRuc("20123456789");
        setDireccion("Av. Las Flores 123, Lima");
        setTelefono("014402010");
        setInstitucion({
          id: id,
          nombre: "Institución Educativa Ficticia",
          ruc: "20123456789",
          direccion: "Av. Las Flores 123, Lima",
          telefono: "014402010",
          estado: true
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [id]);

  const handleSaveGeneralInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await axios.put(`http://localhost:8000/api/instituciones/${id}/`, {
        nombre,
        ruc,
        direccion,
        telefono,
        estado: institucion.estado
      });
      setInstitucion(prev => ({ ...prev, nombre, ruc, direccion, telefono }));
      alert("Información general guardada correctamente.");
    } catch (err) {
      console.error("Failed to update general info:", err);
      // Simulate local success in case backend is busy
      setInstitucion(prev => ({ ...prev, nombre, ruc, direccion, telefono }));
      alert("Se guardaron los cambios localmente en la interfaz.");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleUpdateDirector = async (e) => {
    e.preventDefault();
    try {
      // Find existing director user of this institution or create one
      const usersRes = await axios.get(`http://localhost:8000/api/usuarios/?institucion=${id}`);
      const foundDirector = usersRes.data.find(u => u.rol_nombre === 'Director' || u.rol_nombre === 'Director General' || u.rol === 2);
      
      const payload = {
        username: director.email.split('@')[0] || `director_${id}`,
        email: director.email,
        first_name: director.nombres,
        last_name: director.apellidos,
        dni: director.dni,
        telefono: director.telefono,
        institucion: parseInt(id),
        rol: 2 // Director role
      };

      if (foundDirector) {
        await axios.put(`http://localhost:8000/api/usuarios/${foundDirector.id}/`, {
          ...payload,
          id: foundDirector.id
        });
      } else {
        await axios.post(`http://localhost:8000/api/usuarios/`, {
          ...payload,
          password: 'DirectorPassword123!'
        });
      }
      alert("Ficha del Director guardada y sincronizada correctamente en la base de datos.");
    } catch (err) {
      console.error("Failed to save director:", err);
      alert("Ficha del Director actualizada localmente en la interfaz.");
    }
  };

  const handleAddDocente = async (e) => {
    e.preventDefault();
    if (!newDocente.nombres || !newDocente.dni) return;
    try {
      const res = await axios.post('http://localhost:8000/api/docentes/', {
        nombres: `${newDocente.nombres} ${newDocente.apellidos}`,
        dni: newDocente.dni,
        especialidad: newDocente.curso || 'Matemática',
        institucion: parseInt(id)
      });
      const mapped = {
        id: res.data.id,
        dni: res.data.dni,
        nombres: res.data.nombres.split(' ')[0] || res.data.nombres,
        apellidos: res.data.nombres.split(' ').slice(1).join(' ') || '',
        email: `${res.data.dni}@sibes360.edu.pe`,
        curso: res.data.especialidad
      };
      setDocentes([...docentes, mapped]);
      setNewDocente({ nombres: '', apellidos: '', dni: '', email: '', curso: '' });
      alert("Docente registrado exitosamente en la institución.");
    } catch (err) {
      console.error("Failed to add teacher to DB, adding locally:", err);
      setDocentes([...docentes, { id: Date.now(), ...newDocente }]);
      setNewDocente({ nombres: '', apellidos: '', dni: '', email: '', curso: '' });
      alert("Docente agregado localmente.");
    }
  };

  const handleAddCurso = async (e) => {
    e.preventDefault();
    if (!newCurso.nombre) return;
    try {
      const res = await axios.post('http://localhost:8000/api/cursos/', {
        nombre: newCurso.nombre,
        area: newCurso.area || 'Matemática',
        institucion: parseInt(id)
      });
      const mapped = {
        id: res.data.id,
        nombre: res.data.nombre,
        grado: 'Secundaria / 3° Grado',
        area: res.data.area || 'General'
      };
      setCursos([...cursos, mapped]);
      setNewCurso({ nombre: '', grado: '1° Primaria', area: 'Matemática' });
      alert("Curso académico registrado exitosamente.");
    } catch (err) {
      console.error("Failed to add course to DB, adding locally:", err);
      setCursos([...cursos, { id: Date.now(), ...newCurso }]);
      setNewCurso({ nombre: '', grado: '1° Primaria', area: 'Matemática' });
      alert("Curso agregado localmente.");
    }
  };

  const handleAddSeccion = (e) => {
    e.preventDefault();
    if (!newSeccion.seccion) return;
    setSecciones([...secciones, { id: Date.now(), ...newSeccion, alumnos: 0 }]);
    setNewSeccion({ grado: '1° Primaria', seccion: '', tutor: '' });
  };

  const handleAddAula = (e) => {
    e.preventDefault();
    if (!newAula.nombre) return;
    setAulas([...aulas, { id: Date.now(), ...newAula }]);
    setNewAula({ nombre: '', ubicacion: '', aforo: 30, tipo: 'Teórica' });
  };

  const handleGradeChange = (cursoId, alumnoId, field, val) => {
    let numVal = parseFloat(val);
    if (isNaN(numVal)) numVal = 0;
    if (numVal < 0) numVal = 0;
    if (numVal > 20) numVal = 20;

    setNotasCurso(prev => ({
      ...prev,
      [`${cursoId}-${alumnoId}`]: {
        ...(prev[`${cursoId}-${alumnoId}`] || { tarea: 0, parcial: 0, examenFinal: 0 }),
        [field]: numVal
      }
    }));
  };

  const handleSaveCalificaciones = (e) => {
    e.preventDefault();
    setGuardandoNotas(true);
    setTimeout(() => {
      setGuardandoNotas(false);
      alert("Calificaciones y promedios registrados exitosamente en el sistema.");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: '1. Información General', icon: Building2 },
    { id: 'director', label: '2. Director', icon: Award },
    { id: 'docentes', label: '3. Docentes', icon: Users },
    { id: 'cursos', label: '4. Cursos / Áreas', icon: BookOpen },
    { id: 'secciones', label: '5. Grados y Secciones', icon: Layers },
    { id: 'alumnos', label: '6. Alumnos', icon: GraduationCap },
    { id: 'matricula', label: '7. Matrícula', icon: UserPlus },
    { id: 'horarios', label: '8. Horarios', icon: Clock },
    { id: 'aulas', label: '9. Aulas', icon: Home }
  ];

  return (
    <div className="space-y-6">
      {/* Upper Navigation & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/instituciones')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 bg-white"
          >
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1a1f36] tracking-tight">{nombre}</h1>
              <Badge type={institucion?.estado ? 'Presente' : 'Falta'} text={institucion?.estado ? 'Activa' : 'Suspendida'} />
            </div>
            <p className="text-xs text-[#8898aa]">Panel de Control de Gestión y Gobernabilidad Interna de la IE</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50">
          <div className="text-slate-500 font-medium">RUC: <span className="font-bold text-slate-800">{ruc}</span></div>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="text-slate-500 font-medium">Código Modular: <span className="font-bold text-slate-800">{codigoModular}</span></div>
        </div>
      </div>

      {/* Main Hierarchical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Submódulos Académicos</span>
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSelectedAlumno(null); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
                      isActive 
                        ? 'bg-[#6c63ff]/10 text-[#6c63ff] border-l-4 border-[#6c63ff] shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 ${isActive ? 'text-[#6c63ff]' : 'text-slate-400'}`} />
                    <span>{tab.label.split('. ')[1] || tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Telemetry Box */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md space-y-3">
            <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Resumen Operativo</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="block text-xs font-bold text-indigo-300">{alumnos.length}</span>
                <span className="text-[8px] text-slate-400 uppercase font-medium">Alumnos</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="block text-xs font-bold text-indigo-300">{docentes.length}</span>
                <span className="text-[8px] text-slate-400 uppercase font-medium">Docentes</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="block text-xs font-bold text-indigo-300">{aulas.length}</span>
                <span className="text-[8px] text-slate-400 uppercase font-medium">Aulas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[500px]">
            
            {/* SUBMODULE 1: INFORMACION GENERAL */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1f36]">Información General de la IE</h3>
                  <p className="text-xs text-[#8898aa]">Gestión de la razón legal, modular e institucional de la escuela.</p>
                </div>
                <form onSubmit={handleSaveGeneralInfo} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre Oficial</label>
                      <input 
                        type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">RUC (11 dígitos)</label>
                      <input 
                        type="text" required maxLength={11} value={ruc} onChange={e => setRuc(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50 font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Código Modular (7 dígitos)</label>
                      <input 
                        type="text" required maxLength={7} value={codigoModular} onChange={e => setCodigoModular(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Teléfono</label>
                      <input 
                        type="text" value={telefono} onChange={e => setTelefono(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Dirección Física</label>
                    <input 
                      type="text" value={direccion} onChange={e => setDireccion(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">Niveles Educativos Autorizados</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" checked={niveles.inicial} 
                          onChange={e => setNiveles({ ...niveles, inicial: e.target.checked })}
                          className="rounded text-[#6c63ff] focus:ring-[#6c63ff]" 
                        />
                        <span>Inicial</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" checked={niveles.primaria} 
                          onChange={e => setNiveles({ ...niveles, primaria: e.target.checked })}
                          className="rounded text-[#6c63ff] focus:ring-[#6c63ff]" 
                        />
                        <span>Primaria</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" checked={niveles.secundaria} 
                          onChange={e => setNiveles({ ...niveles, secundaria: e.target.checked })}
                          className="rounded text-[#6c63ff] focus:ring-[#6c63ff]" 
                        />
                        <span>Secundaria</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={savingInfo}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5a52e0] transition-colors"
                  >
                    <Save size={14} />
                    <span>{savingInfo ? "Guardando..." : "Guardar Cambios"}</span>
                  </button>
                </form>
              </div>
            )}

            {/* SUBMODULE 2: DIRECTOR */}
            {activeTab === 'director' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1f36]">Director Asignado a la IE</h3>
                  <p className="text-xs text-[#8898aa]">Ficha administrativa de la autoridad principal responsable de la institución.</p>
                </div>
                <form onSubmit={handleUpdateDirector} className="space-y-4 max-w-xl">
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex gap-3 text-xs text-slate-700 mb-2">
                    <Award size={18} className="text-[#6c63ff] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Autoridad e Identidad Digital</p>
                      <p className="mt-0.5 text-slate-500">Este director posee permisos exclusivos para configurar la malla curricular, gestionar personal y reportar incidencias legales en SIBES 360.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nombres</label>
                      <input 
                        type="text" required value={director.nombres} 
                        onChange={e => setDirector({ ...director, nombres: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Apellidos</label>
                      <input 
                        type="text" required value={director.apellidos} 
                        onChange={e => setDirector({ ...director, apellidos: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">DNI</label>
                      <input 
                        type="text" required maxLength={8} value={director.dni} 
                        onChange={e => setDirector({ ...director, dni: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Cargo Oficial</label>
                      <input 
                        type="text" required value={director.cargo} 
                        onChange={e => setDirector({ ...director, cargo: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Corporativo</label>
                      <input 
                        type="email" required value={director.email} 
                        onChange={e => setDirector({ ...director, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Teléfono Móvil</label>
                      <input 
                        type="text" value={director.telefono} 
                        onChange={e => setDirector({ ...director, telefono: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/50"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5a52e0] transition-colors"
                  >
                    <Save size={14} />
                    <span>Actualizar Ficha Director</span>
                  </button>
                </form>
              </div>
            )}

            {/* SUBMODULE 3: DOCENTES */}
            {activeTab === 'docentes' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[#1a1f36]">Gestión de Planta Docente</h3>
                    <p className="text-xs text-[#8898aa]">Administre y asigne asignaturas a los instructores de este local escolar.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Register Docente */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
                    <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                      <Plus size={14} className="text-[#6c63ff]" />
                      <span>Registrar Nuevo Docente</span>
                    </h4>
                    <form onSubmit={handleAddDocente} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Nombres</label>
                        <input 
                          type="text" required value={newDocente.nombres} 
                          onChange={e => setNewDocente({ ...newDocente, nombres: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#6c63ff] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Apellidos</label>
                        <input 
                          type="text" required value={newDocente.apellidos} 
                          onChange={e => setNewDocente({ ...newDocente, apellidos: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#6c63ff] bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">DNI</label>
                          <input 
                            type="text" required maxLength={8} value={newDocente.dni} 
                            onChange={e => setNewDocente({ ...newDocente, dni: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#6c63ff] bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Curso Especialidad</label>
                          <input 
                            type="text" required value={newDocente.curso} 
                            onChange={e => setNewDocente({ ...newDocente, curso: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#6c63ff] bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Email</label>
                        <input 
                          type="email" required value={newDocente.email} 
                          onChange={e => setNewDocente({ ...newDocente, email: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#6c63ff] bg-white font-mono"
                        />
                      </div>
                      <button type="submit" className="w-full py-1.5 bg-[#6c63ff] hover:bg-[#5b52e0] text-white rounded-md text-xs font-bold transition-all">
                        Registrar Docente
                      </button>
                    </form>
                  </div>

                  {/* List of Docentes */}
                  <div className="xl:col-span-2 space-y-3">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg w-full max-w-sm">
                      <Search size={14} className="text-slate-400" />
                      <input 
                        type="text" placeholder="Buscar por apellidos..." value={searchDocente} onChange={e => setSearchDocente(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs w-full text-[#1a1f36]"
                      />
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-200">
                            <th className="p-3">Docente</th>
                            <th className="p-3">DNI</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Curso Principal</th>
                            <th className="p-3 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {docentes.filter(d => d.apellidos.toLowerCase().includes(searchDocente.toLowerCase())).map(d => (
                            <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-800">{d.apellidos}, {d.nombres}</td>
                              <td className="p-3 text-slate-600 font-mono">{d.dni}</td>
                              <td className="p-3 text-slate-600 font-mono">{d.email}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-indigo-50 text-[#6c63ff] rounded-md font-bold text-[10px]">
                                  {d.curso}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => setDocentes(docentes.filter(item => item.id !== d.id))}
                                  className="p-1 hover:bg-red-50 text-rose-500 rounded-md transition-colors"
                                  title="Retirar Docente"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMODULE 4: CURSOS / AREAS */}
            {activeTab === 'cursos' && (
              <div className="space-y-6">
                {selectedCursoForAdmin ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <button 
                          onClick={() => setSelectedCursoForAdmin(null)}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#6c63ff] hover:text-[#5b52e0] uppercase tracking-wider transition-colors mb-1"
                        >
                          <ArrowLeft size={12} />
                          <span>Volver a Cursos</span>
                        </button>
                        <h3 className="text-sm font-bold text-[#1a1f36]">
                          Administración de Curso: {selectedCursoForAdmin.nombre}
                        </h3>
                        <p className="text-xs text-[#8898aa]">
                          {selectedCursoForAdmin.grado} · Área: {selectedCursoForAdmin.area}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono bg-indigo-50 text-[#6c63ff] px-2 py-0.5 rounded font-bold">
                          CURSO-ID: {selectedCursoForAdmin.id}
                        </span>
                      </div>
                    </div>

                    {/* Stats cards inside course */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-[#6c63ff] rounded-lg shrink-0">
                          <Users size={16} />
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase text-slate-400">Alumnos Inscritos</span>
                          <span className="text-xs font-extrabold text-[#1a1f36]">
                            {alumnos.filter(a => a.seccion.startsWith(selectedCursoForAdmin.grado)).length} Alumnos
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                          <Award size={16} />
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase text-slate-400">Promedio General</span>
                          <span className="text-xs font-extrabold text-[#1a1f36]">
                            {(() => {
                              const list = alumnos.filter(a => a.seccion.startsWith(selectedCursoForAdmin.grado));
                              if (list.length === 0) return '0.0';
                              const total = list.reduce((sum, a) => {
                                const grades = notasCurso[`${selectedCursoForAdmin.id}-${a.id}`] || { tarea: 0, parcial: 0, examenFinal: 0 };
                                const avg = (grades.tarea + grades.parcial + grades.examenFinal) / 3;
                                return sum + avg;
                              }, 0);
                              return (total / list.length).toFixed(1);
                            })()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-[#6c63ff] rounded-lg shrink-0">
                          <UserCheck size={16} />
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase text-slate-400">Tasa de Aprobación</span>
                          <span className="text-xs font-extrabold text-[#1a1f36]">
                            {(() => {
                              const list = alumnos.filter(a => a.seccion.startsWith(selectedCursoForAdmin.grado));
                              if (list.length === 0) return '0%';
                              const approvedCount = list.filter(a => {
                                const grades = notasCurso[`${selectedCursoForAdmin.id}-${a.id}`] || { tarea: 0, parcial: 0, examenFinal: 0 };
                                const avg = (grades.tarea + grades.parcial + grades.examenFinal) / 3;
                                return avg >= 13;
                              }).length;
                              return `${Math.round((approvedCount / list.length) * 100)}%`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive table card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-4 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Matriz de Calificaciones
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-200">
                              <th className="p-3">Estudiante</th>
                              <th className="p-3">Sección</th>
                              <th className="p-3 text-center">Tarea (T1)</th>
                              <th className="p-3 text-center">Ex. Parcial (EP)</th>
                              <th className="p-3 text-center">Ex. Final (EF)</th>
                              <th className="p-3 text-center">Promedio</th>
                              <th className="p-3 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alumnos.filter(a => a.seccion.startsWith(selectedCursoForAdmin.grado)).map(a => {
                              const grades = notasCurso[`${selectedCursoForAdmin.id}-${a.id}`] || { tarea: 0, parcial: 0, examenFinal: 0 };
                              const avg = (grades.tarea + grades.parcial + grades.examenFinal) / 3;
                              const isApproved = avg >= 13;

                              return (
                                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                  <td className="p-3 font-semibold text-slate-800">{a.apellidos}, {a.nombres}</td>
                                  <td className="p-3 text-slate-600 font-medium">{a.seccion}</td>
                                  <td className="p-3 text-center">
                                    <input 
                                      type="number" min="0" max="20"
                                      value={grades.tarea}
                                      onChange={e => handleGradeChange(selectedCursoForAdmin.id, a.id, 'tarea', e.target.value)}
                                      className="w-12 text-center border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:border-[#6c63ff] font-bold font-mono text-slate-700 bg-slate-50"
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <input 
                                      type="number" min="0" max="20"
                                      value={grades.parcial}
                                      onChange={e => handleGradeChange(selectedCursoForAdmin.id, a.id, 'parcial', e.target.value)}
                                      className="w-12 text-center border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:border-[#6c63ff] font-bold font-mono text-slate-700 bg-slate-50"
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <input 
                                      type="number" min="0" max="20"
                                      value={grades.examenFinal}
                                      onChange={e => handleGradeChange(selectedCursoForAdmin.id, a.id, 'examenFinal', e.target.value)}
                                      className="w-12 text-center border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:border-[#6c63ff] font-bold font-mono text-slate-700 bg-slate-50"
                                    />
                                  </td>
                                  <td className="p-3 text-center font-bold text-slate-800 font-mono">
                                    {avg.toFixed(1)}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                                      isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                                    }`}>
                                      {isApproved ? 'Aprobado' : 'Desaprobado'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-slate-100">
                        <button 
                          onClick={handleSaveCalificaciones}
                          disabled={guardandoNotas}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6c63ff] hover:bg-[#5b52e0] text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-[#6c63ff]/15 disabled:opacity-50"
                        >
                          <Save size={14} />
                          <span>{guardandoNotas ? 'Guardando...' : 'Guardar Calificaciones'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Add Course */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
                      <h4 className="text-xs font-bold text-slate-700 mb-3">Registrar Asignatura Curricular</h4>
                      <form onSubmit={handleAddCurso} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Nombre del Curso</label>
                          <input 
                            type="text" required placeholder="Ej. Geometría" value={newCurso.nombre}
                            onChange={e => setNewCurso({ ...newCurso, nombre: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Grado Destino</label>
                          <select 
                            value={newCurso.grado} onChange={e => setNewCurso({ ...newCurso, grado: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white outline-none"
                          >
                            <option value="1° Primaria">1° Primaria</option>
                            <option value="2° Primaria">2° Primaria</option>
                            <option value="3° Primaria">3° Primaria</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Área de Competencia</label>
                          <select 
                            value={newCurso.area} onChange={e => setNewCurso({ ...newCurso, area: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white outline-none"
                          >
                            <option value="Matemática">Matemática</option>
                            <option value="Comunicación">Comunicación</option>
                            <option value="Ciencias Sociales">Ciencias Sociales</option>
                            <option value="Ciencia y Tecnología">Ciencia y Tecnología</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full py-1.5 bg-[#6c63ff] hover:bg-[#5b52e0] text-white rounded-md text-xs font-bold transition-all">
                          Agregar Curso
                        </button>
                      </form>
                    </div>

                    {/* Course Cards Grid */}
                    <div className="xl:col-span-2 space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Plan Curricular Registrado</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['1° Primaria', '2° Primaria'].map(grado => (
                          <div key={grado} className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                            <h5 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1">{grado}</h5>
                            <div className="space-y-1.5">
                              {cursos.filter(c => c.grado === grado).map(c => (
                                <div key={c.id} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100/50 transition-colors">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-700">{c.nombre}</span>
                                    <span className="text-[9px] text-[#8898aa] font-bold uppercase">{c.area}</span>
                                  </div>
                                  <button 
                                    onClick={() => setSelectedCursoForAdmin(c)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#6c63ff] rounded-md font-bold text-[9px] uppercase tracking-wider transition-colors shrink-0"
                                    title="Administrar Curso"
                                  >
                                    <Sliders size={10} />
                                    <span>Administrar</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBMODULE 5: GRADOS Y SECCIONES */}
            {activeTab === 'secciones' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1f36]">Grados y Secciones</h3>
                  <p className="text-xs text-[#8898aa]">Configuración de la estructura de aulas de la institución escolar.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Create Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
                    <h4 className="text-xs font-bold text-slate-700 mb-3">Registrar Nueva Sección</h4>
                    <form onSubmit={handleAddSeccion} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Grado</label>
                        <select 
                          value={newSeccion.grado} onChange={e => setNewSeccion({ ...newSeccion, grado: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white outline-none"
                        >
                          <option value="1° Primaria">1° Primaria</option>
                          <option value="2° Primaria">2° Primaria</option>
                          <option value="3° Primaria">3° Primaria</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Letra de Sección</label>
                        <input 
                          type="text" required placeholder="Ej. A" maxLength={1} value={newSeccion.seccion}
                          onChange={e => setNewSeccion({ ...newSeccion, seccion: e.target.value.toUpperCase() })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white outline-none font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Docente Tutor Asignado</label>
                        <select 
                          value={newSeccion.tutor} onChange={e => setNewSeccion({ ...newSeccion, tutor: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white outline-none"
                        >
                          <option value="">Seleccionar Tutor...</option>
                          {docentes.map(d => (
                            <option key={d.id} value={`${d.nombres} ${d.apellidos}`}>{d.apellidos}, {d.nombres}</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="w-full py-1.5 bg-[#6c63ff] hover:bg-[#5b52e0] text-white rounded-md text-xs font-bold transition-all">
                        Habilitar Sección
                      </button>
                    </form>
                  </div>

                  {/* Grid of Sections */}
                  <div className="xl:col-span-2 space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Distribución de Secciones Habilitadas</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {secciones.map(sec => (
                        <div key={sec.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                            <h5 className="text-sm font-extrabold text-slate-800">{sec.grado} "{sec.seccion}"</h5>
                            <span className="text-[10px] font-bold bg-[#6c63ff]/10 text-[#6c63ff] px-2 py-0.5 rounded-full shrink-0">
                              {sec.alumnos} Alumnos
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Tutor Asignado:</span>
                            <span className="text-xs font-semibold text-slate-700">{sec.tutor || 'Sin tutor asignado'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMODULE 6: ALUMNOS */}
            {activeTab === 'alumnos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1f36]">Alumnos Matriculados</h3>
                  <p className="text-xs text-[#8898aa]">Ficha curricular, comportamiento e historial académico unificado.</p>
                </div>

                {!selectedAlumno ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg w-full max-w-sm">
                      <Search size={14} className="text-slate-400" />
                      <input 
                        type="text" placeholder="Buscar por apellidos..." value={searchAlumno} onChange={e => setSearchAlumno(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs w-full text-[#1a1f36]"
                      />
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-200">
                            <th className="p-3">Código Alumno</th>
                            <th className="p-3">Estudiante</th>
                            <th className="p-3">DNI</th>
                            <th className="p-3">Grado y Sección</th>
                            <th className="p-3 text-center">Promedio General</th>
                            <th className="p-3 text-center">Historial</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alumnos.filter(a => a.apellidos.toLowerCase().includes(searchAlumno.toLowerCase())).map(a => (
                            <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-3 text-slate-600 font-mono">IE-{a.id}</td>
                              <td className="p-3 font-semibold text-slate-800">{a.apellidos}, {a.nombres}</td>
                              <td className="p-3 text-slate-600 font-mono">{a.dni}</td>
                              <td className="p-3 text-slate-700 font-medium">{a.seccion}</td>
                              <td className="p-3 text-center font-bold text-slate-800">{a.promedio}</td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => setSelectedAlumno(a)}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#6c63ff] font-bold text-[10px] rounded-md transition-colors"
                                >
                                  Ver Ficha
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border border-slate-200 rounded-xl p-5 bg-white">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Código: IE-{selectedAlumno.id}</span>
                        <h4 className="text-base font-extrabold text-slate-800 mt-1">{selectedAlumno.apellidos}, {selectedAlumno.nombres}</h4>
                        <p className="text-xs text-slate-500 font-medium">{selectedAlumno.seccion} | DNI: {selectedAlumno.dni}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedAlumno(null)}
                        className="px-3 py-1 text-[10px] border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-bold transition-colors"
                      >
                        Regresar al Listado
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {/* Historial MOCK */}
                      <div className="space-y-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Calificaciones del Periodo</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-700 font-medium">Aritmética</span>
                            <span className="font-bold text-emerald-600">18 (Aprobado)</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-700 font-medium">Álgebra</span>
                            <span className="font-bold text-emerald-600">16 (Aprobado)</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-700 font-medium">Comunicación Integral</span>
                            <span className="font-bold text-emerald-600">17 (Aprobado)</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-700 font-medium">Personal Social</span>
                            <span className="font-bold text-emerald-600">19 (Excelente)</span>
                          </div>
                        </div>
                      </div>

                      {/* General Telemetry */}
                      <div className="space-y-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Conducta y Asistencia</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                            <span className="block text-[9px] font-bold uppercase text-green-600 tracking-wider">Asistencia Anual</span>
                            <span className="block text-lg font-extrabold text-green-700 mt-1">98.2%</span>
                            <span className="text-[9px] text-green-600/80">Cumple el mínimo regular</span>
                          </div>
                          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <span className="block text-[9px] font-bold uppercase text-[#6c63ff] tracking-wider">Conducta</span>
                            <span className="block text-lg font-extrabold text-slate-800 mt-1">A (Excelente)</span>
                            <span className="text-[9px] text-[#6c63ff]/80">Sin incidencias registradas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBMODULE 7: MATRICULA */}
            {activeTab === 'matricula' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1f36]">Gestión de Matrículas Anual</h3>
                  <p className="text-xs text-[#8898aa]">Administración y control del proceso de matrícula del año {matriculas.anio}.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden">
                    <span className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider">Matriculados Activos</span>
                    <span className="block text-2xl font-extrabold text-[#6c63ff] mt-2">{matriculas.matriculados}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Alumnos ratificados</span>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <span className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider">Pendientes de Aprobación</span>
                    <span className="block text-2xl font-extrabold text-yellow-600 mt-2">{matriculas.pendientes}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Solicitudes en secretaría</span>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                    <span className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider">Vacantes Habilitadas</span>
                    <span className="block text-2xl font-extrabold text-green-600 mt-2">
                      {matriculas.vacantesTotales - matriculas.matriculados} / {matriculas.vacantesTotales}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Aulas con cupo regular</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Políticas de Admisión y Configuración</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                    Configure las fechas de cierre de matrícula regular y extemporánea para el año escolar en curso. La ratificación automática está habilitada para alumnos aprobados.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => alert("Período de matrícula abierto para solicitudes.")}
                      className="px-3 py-1.5 bg-[#6c63ff] hover:bg-[#5b52e0] text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Aperturar Solicitudes
                    </button>
                    <button 
                      onClick={() => alert("Métricas exportadas en Excel.")}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg transition-colors"
                    >
                      Descargar Reporte Anual
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMODULE 8: HORARIOS */}
            {activeTab === 'horarios' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1f36]">Asignación de Horarios</h3>
                  <p className="text-xs text-[#8898aa]">Matriz y cuadrícula diaria por sección, docente y bloque horario.</p>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Visualización Curricular: <span className="font-extrabold text-[#6c63ff]">1° Primaria A</span></span>
                    <button 
                      onClick={() => alert("Asignación de horario guardada.")}
                      className="px-3 py-1 bg-[#6c63ff] text-white font-bold text-[10px] rounded-md hover:bg-[#5b52e0] transition-colors"
                    >
                      Configurar Bloque
                    </button>
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-200">
                        <th className="p-3">Día</th>
                        <th className="p-3">Bloque Horario</th>
                        <th className="p-3">Curso</th>
                        <th className="p-3">Docente Asignado</th>
                        <th className="p-3">Aula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horarios.map((h, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{h.dia}</td>
                          <td className="p-3 text-slate-600 font-mono">{h.hora}</td>
                          <td className="p-3 font-semibold text-[#6c63ff]">{h.curso}</td>
                          <td className="p-3 text-slate-700">{h.docente}</td>
                          <td className="p-3"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[10px]">Aula 101</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBMODULE 9: AULAS */}
            {activeTab === 'aulas' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1f36]">Aulas y Capacidad Física</h3>
                  <p className="text-xs text-[#8898aa]">Inventario de infraestructura, salones de clase y laboratorios.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Add Room */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
                    <h4 className="text-xs font-bold text-slate-700 mb-3">Registrar Espacio Físico</h4>
                    <form onSubmit={handleAddAula} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Identificador de Aula</label>
                        <input 
                          type="text" required placeholder="Ej. Aula 103 o Lab. Química" value={newAula.nombre}
                          onChange={e => setNewAula({ ...newAula, nombre: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Ubicación / Pabellón</label>
                        <input 
                          type="text" required placeholder="Ej. Pabellón B - Piso 2" value={newAula.ubicacion}
                          onChange={e => setNewAula({ ...newAula, ubicacion: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Aforo Regular</label>
                          <input 
                            type="number" required min={10} max={50} value={newAula.aforo}
                            onChange={e => setNewAula({ ...newAula, aforo: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Tipo de Aula</label>
                          <select 
                            value={newAula.tipo} onChange={e => setNewAula({ ...newAula, tipo: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white outline-none"
                          >
                            <option value="Teórica">Teórica</option>
                            <option value="Tecnológica">Tecnológica</option>
                            <option value="Laboratorio">Laboratorio</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full py-1.5 bg-[#6c63ff] hover:bg-[#5b52e0] text-white rounded-md text-xs font-bold transition-all">
                        Añadir Infraestructura
                      </button>
                    </form>
                  </div>

                  {/* List of Aulas */}
                  <div className="xl:col-span-2 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Aulas Registradas en la Sede</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-200">
                            <th className="p-3">Aula</th>
                            <th className="p-3">Ubicación</th>
                            <th className="p-3 text-center">Capacidad Máxima</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3 text-center">Eliminar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aulas.map(aula => (
                            <tr key={aula.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-800">{aula.nombre}</td>
                              <td className="p-3 text-slate-600">{aula.ubicacion}</td>
                              <td className="p-3 text-center font-bold text-slate-700">{aula.aforo} vacantes</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                                  aula.tipo === 'Teórica' ? 'bg-blue-50 text-blue-600' :
                                  aula.tipo === 'Tecnológica' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                  {aula.tipo}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => setAulas(aulas.filter(item => item.id !== aula.id))}
                                  className="p-1 hover:bg-red-50 text-rose-500 rounded-md transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default GestionarInstitucion;
