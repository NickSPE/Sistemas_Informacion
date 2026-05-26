import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Calendar, UserCheck, Edit, Trash2 } from 'lucide-react';

const Asistencia = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsistencia, setEditingAsistencia] = useState(null);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [estado, setEstado] = useState('P');
  const [observacion, setObservacion] = useState('');

  const fetchData = async () => {
    try {
      const [asistRes, estRes] = await Promise.all([
        axios.get('http://localhost:8000/api/asistencia/'),
        axios.get('http://localhost:8000/api/estudiantes/')
      ]);
      setAsistencias(asistRes.data);
      setEstudiantes(estRes.data);
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingAsistencia(null);
    setSelectedStudent('');
    setFecha(new Date().toISOString().split('T')[0]);
    setEstado('P');
    setObservacion('');
    setIsModalOpen(true);
  };

  const handleStartEdit = (row) => {
    setEditingAsistencia(row);
    setSelectedStudent(row.estudiante ? row.estudiante.toString() : '');
    setFecha(row.fecha);
    setEstado(row.estado);
    setObservacion(row.observacion || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este registro de asistencia?")) {
      try {
        await axios.delete(`http://localhost:8000/api/asistencia/${id}/`);
        fetchData();
      } catch (err) {
        console.error("Attendance deletion failed:", err);
        alert("Error al eliminar el registro de asistencia.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        estudiante: parseInt(selectedStudent),
        fecha,
        estado,
        observacion
      };

      if (editingAsistencia) {
        await axios.put(`http://localhost:8000/api/asistencia/${editingAsistencia.id}/`, payload);
      } else {
        await axios.post('http://localhost:8000/api/asistencia/', payload);
      }
      setIsModalOpen(false);
      setEditingAsistencia(null);
      setSelectedStudent('');
      setObservacion('');
      fetchData();
    } catch (err) {
      console.error("Attendance saving failed:", err);
      alert("Error al guardar la asistencia.");
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'P': return 'Presente';
      case 'F': return 'Falta';
      case 'T': return 'Tardanza';
      case 'FJ': return 'Justificada';
      default: return status;
    }
  };

  const columns = [
    { header: 'Fecha', accessor: 'fecha', width: '110px' },
    { header: 'Estudiante', render: (row) => `${row.estudiante_apellidos || ''}, ${row.estudiante_nombres || ''}` },
    { 
      header: 'Estado', 
      accessor: 'estado', 
      width: '120px',
      render: (row) => <Badge type={row.estado} text={getStatusText(row.estado)} />
    },
    { header: 'Observación', accessor: 'observacion' },
    {
      header: 'Acciones',
      width: '140px',
      render: (row) => (
        <div className="flex gap-2.5 items-center">
          <button 
            onClick={() => handleStartEdit(row)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
            title="Editar Registro"
          >
            <Edit size={12} />
            <span>Editar</span>
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 hover:underline"
            title="Eliminar Registro"
          >
            <Trash2 size={12} />
            <span>Eliminar</span>
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

  return (
    <div className="space-y-6">
      {/* Strict single H1 Constraint */}
      <div>
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Control de Asistencia General</h1>
        <p className="text-xs text-[#8898aa]">Toma de asistencia escolar diaria, retardos y gestión de justificaciones oficiales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Bitácora de Asistencia Escolar"
            columns={columns}
            data={asistencias}
            searchField="estudiante_apellidos"
            onAdd={handleOpenAdd}
            addLabel="Registrar Asistencia"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Registros Consolidados" 
            value={asistencias.length} 
            subtitle="Toma de firmas y retardos" 
            icon={Calendar} 
            color="success"
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <UserCheck size={14} className="text-[#6c63ff]" />
              <span>Metodología de Retardos</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              La hora límite estipulada de ingreso en Lima Metropolitana es a las 08:00 am. Los registros posteriores serán catalogados automáticamente como tardanza ('T') o inasistencia si supera el umbral de tolerancia.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsistencia ? "Modificar Registro de Asistencia" : "Registrar Asistencia Estudiantil"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Fecha</label>
              <input 
                type="date" required value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estado</label>
              <select 
                required value={estado} onChange={e => setEstado(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              >
                <option value="P">Presente</option>
                <option value="T">Tardanza</option>
                <option value="F">Falta Injustificada</option>
                <option value="FJ">Falta Justificada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Observación / Nota</label>
            <input 
              type="text" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. A tiempo, justificado por salud"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            {editingAsistencia ? "Guardar Cambios" : "Registrar Asistencia"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Asistencia;
