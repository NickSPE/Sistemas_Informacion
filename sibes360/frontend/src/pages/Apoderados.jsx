import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { ShieldAlert, BookOpen, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Apoderados = () => {
  const { selectedInstitucion } = useAuth();
  const [apoderados, setApoderados] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [nombres, setNombres] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    try {
      const instParam = selectedInstitucion ? `?institucion=${selectedInstitucion}` : '';
      const [apoRes, estRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/apoderados/${instParam}`),
        axios.get(`http://localhost:8000/api/estudiantes/${instParam}`)
      ]);
      setApoderados(apoRes.data);
      setEstudiantes(estRes.data);
    } catch (err) {
      console.error("Failed to load apoderados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedInstitucion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) return; // Validación básica
    const payload = {
      nombres,
      telefono,
      correo,
      parentesco,
      estudiantes: selectedStudents.map(id => parseInt(id))
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:8000/api/apoderados/${editId}/`, payload);
        showNotification("Apoderado actualizado exitosamente");
      } else {
        await axios.post('http://localhost:8000/api/apoderados/', payload);
        showNotification("Apoderado registrado exitosamente");
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error("Failed to save apoderado:", err);
      showNotification("Error al guardar los datos", "error");
    }
  };

  const openEditModal = (row) => {
    setNombres(row.nombres);
    setTelefono(row.telefono || '');
    setCorreo(row.correo || '');
    setParentesco(row.parentesco);
    setSelectedStudents(row.estudiantes.map(id => id.toString()));
    setEditId(row.id);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este apoderado?")) {
      try {
        await axios.delete(`http://localhost:8000/api/apoderados/${id}/`);
        showNotification("Apoderado eliminado correctamente");
        fetchData();
      } catch (err) {
        console.error("Failed to delete apoderado:", err);
        showNotification("Error al eliminar", "error");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setEditId(null);
    setNombres('');
    setTelefono('');
    setCorreo('');
    setParentesco('');
    setSelectedStudents([]);
  };

  const columns = [
    { header: 'Apoderado / Tutor', accessor: 'nombres', width: '220px' },
    { header: 'Parentesco', accessor: 'parentesco', width: '110px' },
    { header: 'Teléfono', accessor: 'telefono', width: '120px' },
    { header: 'Correo Electrónico', accessor: 'correo' },
    { header: 'Alumno(s) Asociado(s)', render: (row) => row.estudiantes_detalle && row.estudiantes_detalle.length > 0 ? row.estudiantes_detalle.map(e => `${e.apellidos}, ${e.nombres}`).join(' | ') : 'Sin asociar' },
    { 
      header: 'Acciones', 
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(row)} className="p-1 text-slate-400 hover:text-[#6c63ff] transition-colors"><Edit size={16} /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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

  return (
    <div className="space-y-6">
      {/* Strict single H1 Constraint */}
      <div>
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Apoderados y Padres de Familia</h1>
        <p className="text-xs text-[#8898aa]">Control y asociación de tutores legales responsables de los educandos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Listado de Apoderados"
            columns={columns}
            data={apoderados}
            searchField="nombres"
            onAdd={() => { 
              closeModal(); 
              setTimeout(() => setIsModalOpen(true), 0);
            }}
            addLabel="Asociar Apoderado"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Tutores Registrados" 
            value={apoderados.length} 
            subtitle="Apoderados activos" 
            icon={ShieldAlert} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <BookOpen size={14} className="text-[#6c63ff]" />
              <span>Canal Informativo</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              La correcta asociación del correo y teléfono de los padres o apoderados garantiza la entrega inmediata de alertas automáticas por inasistencias o incidentes de conducta grave.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-bold transition-all duration-300 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editMode ? "Editar Apoderado" : "Asociar Nuevo Apoderado"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nombre Completo del Apoderado</label>
            <input 
              type="text" required value={nombres} onChange={e => setNombres(e.target.value)} placeholder="Ej. Carlos Quispe"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-white text-[#1a1f36]" style={{ backgroundColor: '#ffffff' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Teléfono de Contacto</label>
              <input 
                type="text" required value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="987654321"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-white text-[#1a1f36]" style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Parentesco / Relación</label>
              <input 
                type="text" required value={parentesco} onChange={e => setParentesco(e.target.value)} placeholder="Ej. Padre, Madre"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-white text-[#1a1f36]" style={{ backgroundColor: '#ffffff' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Correo Electrónico</label>
            <input 
              type="email" required value={correo} onChange={e => setCorreo(e.target.value)} placeholder="apoderado@ejemplo.pe"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-white text-[#1a1f36]" style={{ backgroundColor: '#ffffff' }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estudiante(s) Representado(s)</label>
            <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1 bg-white" style={{ backgroundColor: '#ffffff' }}>
              {estudiantes.length === 0 && <span className="text-xs text-slate-400">No hay estudiantes disponibles</span>}
              {estudiantes.map(e => (
                <label key={e.id} className="flex items-center gap-2 text-xs text-[#1a1f36] p-1 hover:bg-slate-100 rounded cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    value={e.id}
                    checked={(selectedStudents || []).includes(e?.id?.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...(selectedStudents || []), e.target.value]);
                      } else {
                        setSelectedStudents((selectedStudents || []).filter(id => id !== e.target.value));
                      }
                    }}
                    className="rounded border-slate-300 text-[#6c63ff] focus:ring-[#6c63ff]"
                  />
                  {e.apellidos}, {e.nombres}
                </label>
              ))}
            </div>
            {selectedStudents.length === 0 && <span className="text-[10px] text-red-500 mt-1 block">Debe seleccionar al menos un estudiante</span>}
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            {editMode ? "Guardar Cambios" : "Asociar Apoderado"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Apoderados;
