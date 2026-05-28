import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { GraduationCap, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Estudiantes = () => {
  const { user, selectedInstitucion } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form states
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [selectedInst, setSelectedInst] = useState('');

  const canAdd = user?.rol === 'SuperAdmin' || user?.rol === 'Director';
  const canEdit = user?.rol === 'SuperAdmin' || user?.rol === 'Director' || user?.rol === 'Docente';

  const fetchData = async () => {
    try {
      const url = selectedInstitucion 
        ? `http://localhost:8000/api/estudiantes/?institucion=${selectedInstitucion}` 
        : 'http://localhost:8000/api/estudiantes/';
      const [estRes, instRes] = await Promise.all([
        axios.get(url),
        axios.get('http://localhost:8000/api/instituciones/')
      ]);
      setEstudiantes(estRes.data);
      setInstituciones(instRes.data);
    } catch (err) {
      console.error("Failed to load students data:", err);
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

  const handleStartEdit = (student) => {
    setEditingStudent(student);
    setDni(student.dni);
    setNombres(student.nombres);
    setApellidos(student.apellidos);
    setFechaNacimiento(student.fecha_nacimiento);
    setSelectedInst(student.institucion ? student.institucion.toString() : '');
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setDni('');
    setNombres('');
    setApellidos('');
    setFechaNacimiento('');
    if (user?.institucion_id) {
      setSelectedInst(user.institucion_id.toString());
    } else {
      setSelectedInst('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const instId = user?.rol === 'SuperAdmin' ? parseInt(selectedInst) : user?.institucion_id;
      const payload = {
        dni,
        nombres,
        apellidos,
        fecha_nacimiento: fechaNacimiento,
        institucion: instId,
        estado: true
      };

      if (editingStudent) {
        // Docente cannot modify names or surnames
        if (user?.rol === 'Docente') {
          delete payload.nombres;
          delete payload.apellidos;
        }
        await axios.put(`http://localhost:8000/api/estudiantes/${editingStudent.id}/`, payload);
      } else {
        await axios.post('http://localhost:8000/api/estudiantes/', payload);
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      setDni('');
      setNombres('');
      setApellidos('');
      setFechaNacimiento('');
      if (user?.rol === 'SuperAdmin') {
        setSelectedInst('');
      }
      fetchData();
    } catch (err) {
      console.error("Failed to save student:", err);
      alert(err.response?.data?.detail || "Ocurrió un error al guardar los datos.");
    }
  };

  const columns = [
    { header: 'DNI', accessor: 'dni', width: '100px' },
    { header: 'Apellidos', accessor: 'apellidos', width: '180px' },
    { header: 'Nombres', accessor: 'nombres', width: '180px' },
    { header: 'F. Nacimiento', accessor: 'fecha_nacimiento', width: '120px' },
    { header: 'Institución', accessor: 'institucion_nombre' },
    { 
      header: 'Estado', 
      accessor: 'estado', 
      width: '90px',
      render: (row) => <Badge type={row.estado ? 'Presente' : 'Falta'} text={row.estado ? 'Activo' : 'Retirado'} />
    },
    {
      header: 'Acciones',
      width: '80px',
      render: (row) => {
        if (!canEdit) return null;
        return (
          <button 
            onClick={() => handleStartEdit(row)}
            className="text-[10px] font-bold text-[#6c63ff] hover:underline"
          >
            Editar
          </button>
        );
      }
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Estudiantes de Lima</h1>
        <p className="text-xs text-[#8898aa]">Matrícula y control general de expedientes estudiantiles en SIBES 360.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column: Data Table */}
        <div className="lg:col-span-2">
          <DataTable
            title="Padrón de Estudiantes Registrados"
            columns={columns}
            data={estudiantes}
            searchField="apellidos"
            onAdd={canAdd ? handleOpenAdd : undefined}
            addLabel={canAdd ? "Registrar Estudiante" : undefined}
          />
        </div>

        {/* Right Column: Mini Info Stats */}
        <div className="space-y-6">
          <KPICard 
            title="Total Alumnos" 
            value={estudiantes.length} 
            subtitle="Matrículas registradas" 
            icon={GraduationCap} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Award size={14} className="text-[#6c63ff]" />
              <span>Matrícula SIAGIE</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toda inserción académica en SIBES 360 se acopla a las pautas de validación DNI del Registro Nacional de Identidad y Estado Civil (RENIEC) de Perú, facilitando la consistencia de datos para traslados a la plataforma oficial SIAGIE del Minedu.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingStudent(null); }} 
          title={editingStudent ? "Modificar Datos Estudiante" : "Registrar Nuevo Estudiante"}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">DNI (8 dígitos)</label>
                <input 
                  type="text" required maxLength={8} value={dni} onChange={e => setDni(e.target.value)} placeholder="DNI"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">F. de Nacimiento</label>
                <input 
                  type="date" required value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nombres</label>
                <input 
                  type="text" 
                  required 
                  disabled={user?.rol === 'Docente'} 
                  value={nombres} 
                  onChange={e => setNombres(e.target.value)} 
                  placeholder="Nombres"
                  className={`w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] text-[#1a1f36] ${user?.rol === 'Docente' ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50/10'}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Apellidos</label>
                <input 
                  type="text" 
                  required 
                  disabled={user?.rol === 'Docente'} 
                  value={apellidos} 
                  onChange={e => setApellidos(e.target.value)} 
                  placeholder="Apellidos"
                  className={`w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] text-[#1a1f36] ${user?.rol === 'Docente' ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50/10'}`}
                />
              </div>
            </div>
            {user?.rol === 'SuperAdmin' && (
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Institución</label>
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
              {editingStudent ? "Guardar Cambios" : "Registrar Estudiante"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Estudiantes;
