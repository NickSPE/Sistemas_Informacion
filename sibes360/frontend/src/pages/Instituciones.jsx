import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Building2, ShieldCheck, Edit, ShieldAlert, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Instituciones = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstitucion, setEditingInstitucion] = useState(null);
  
  // Form fields
  const [nombre, setNombre] = useState('');
  const [ruc, setRuc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');

  const fetchInstituciones = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/instituciones/');
      setInstituciones(res.data);
    } catch (err) {
      console.error("Failed to load institutions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstituciones();
  }, []);

  const resetForm = () => {
    setEditingInstitucion(null);
    setNombre('');
    setRuc('');
    setDireccion('');
    setTelefono('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleStartEdit = (inst) => {
    setEditingInstitucion(inst);
    setNombre(inst.nombre);
    setRuc(inst.ruc);
    setDireccion(inst.direccion || '');
    setTelefono(inst.telefono || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre,
        ruc,
        direccion,
        telefono,
      };

      if (editingInstitucion) {
        payload.estado = editingInstitucion.estado;
        await axios.put(`http://localhost:8000/api/instituciones/${editingInstitucion.id}/`, payload);
      } else {
        payload.estado = true;
        await axios.post('http://localhost:8000/api/instituciones/', payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchInstituciones();
    } catch (err) {
      console.error("Failed to save institution:", err);
      alert(err.response?.data?.detail || "Ocurrió un error al registrar la institución.");
    }
  };

  const handleToggleStatus = async (inst) => {
    const confirmMsg = inst.estado 
      ? `¿Estás seguro de desactivar el colegio "${inst.nombre}"?\nEsto suspenderá inmediatamente el acceso a todos sus directores, docentes y alumnos.`
      : `¿Estás seguro de activar el colegio "${inst.nombre}"?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.patch(`http://localhost:8000/api/instituciones/${inst.id}/`, {
        estado: !inst.estado
      });
      fetchInstituciones();
    } catch (err) {
      console.error("Failed to toggle institution status:", err);
      alert("Error al cambiar el estado del colegio.");
    }
  };

  const columns = [
    { header: 'RUC', accessor: 'ruc', width: '120px' },
    { header: 'Nombre', accessor: 'nombre', width: '220px' },
    { header: 'Dirección', accessor: 'direccion' },
    { header: 'Teléfono', accessor: 'telefono', width: '120px' },
    { 
      header: 'Estado', 
      accessor: 'estado', 
      width: '100px',
      render: (row) => (
        <button 
          onClick={() => handleToggleStatus(row)}
          className="focus:outline-none"
          title="Haz clic para suspender/activar colegio"
        >
          <Badge type={row.estado ? 'Presente' : 'Falta'} text={row.estado ? 'Activo' : 'Suspendido'} />
        </button>
      )
    },
    {
      header: 'Acciones',
      width: '180px',
      render: (row) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleStartEdit(row)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-855 flex items-center gap-0.5 hover:underline"
            title="Editar Colegio"
          >
            <Edit size={12} />
            <span>Editar</span>
          </button>
          <button 
            onClick={() => navigate(`/instituciones/${row.id}/gestionar`)}
            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 hover:underline"
            title="Gestionar Colegio (Ver Submódulos)"
          >
            <Sliders size={12} className="stroke-[2.5]" />
            <span>Gestionar</span>
          </button>
        </div>
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

  const activeInstitutionsCount = instituciones.filter(inst => inst.estado).length;

  return (
    <div className="space-y-6">
      {/* Strict single H1 Constraint */}
      <div>
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Instituciones Educativas</h1>
        <p className="text-xs text-[#8898aa]">Gestione los centros escolares afiliados y supervise sus ciclos operativos en Lima Metropolitana.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column: Data Table (2/3 width) */}
        <div className="lg:col-span-2">
          <DataTable
            title="Locales Escolares Registrados"
            columns={columns}
            data={instituciones}
            searchField="nombre"
            onAdd={handleOpenAdd}
            addLabel="Registrar Institución"
          />
        </div>

        {/* Right Column: Mini Info Stats & Actions (1/3 width) */}
        <div className="space-y-6">
          <KPICard 
            title="Centros de Lima" 
            value={activeInstitutionsCount} 
            subtitle={`De ${instituciones.length} colegios afiliados`} 
            icon={Building2} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck size={14} className="text-[#6c63ff]" />
              <span>Políticas de Suspensión</span>
            </h3>
            <div className="p-3 bg-red-50/50 border border-red-100 text-[#ff6584] rounded-xl text-xs flex gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Suspensión Completa (SaaS)</p>
                <p className="mt-0.5 leading-relaxed text-[11px] text-slate-600">
                  Al suspender un colegio, se denegará en tiempo real el inicio de sesión a todos los usuarios asignados (directores, docentes, tutores, alumnos), garantizando una desconexión total.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); resetForm(); }} 
          title={editingInstitucion ? "Modificar Datos Colegio" : "Registrar Nueva Institución"}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nombre del Colegio</label>
              <input 
                type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Colegio ..."
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">RUC (11 dígitos)</label>
                <input 
                  type="text" required maxLength={11} value={ruc} onChange={e => setRuc(e.target.value)} placeholder="20123456789"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Teléfono de Contacto</label>
                <input 
                  type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="014402010"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Dirección Física</label>
              <input 
                type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Av. Principal, Lima"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
              {editingInstitucion ? "Guardar Cambios" : "Registrar Institución"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Instituciones;
