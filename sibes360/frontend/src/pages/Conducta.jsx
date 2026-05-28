import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Smile, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Conducta = () => {
  const { selectedInstitucion } = useAuth();
  const [conductas, setConductas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConducta, setEditingConducta] = useState(null);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [tipo, setTipo] = useState('Positiva');
  const [descripcion, setDescripcion] = useState('');

  const fetchData = async () => {
    try {
      const instParam = selectedInstitucion ? `?institucion=${selectedInstitucion}` : '';
      const [condRes, estRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/conducta/${instParam}`),
        axios.get(`http://localhost:8000/api/estudiantes/${instParam}`)
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
  }, [selectedInstitucion]);

  const handleOpenAdd = () => {
    setEditingConducta(null);
    setSelectedStudent('');
    setTipo('Positiva');
    setDescripcion('');
    setIsModalOpen(true);
  };

  const handleStartEdit = (row) => {
    setEditingConducta(row);
    setSelectedStudent(row.estudiante ? row.estudiante.toString() : '');
    setTipo(row.tipo);
    setDescripcion(row.descripcion);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este registro de conducta?")) {
      try {
        await axios.delete(`http://localhost:8000/api/conducta/${id}/`);
        fetchData();
      } catch (err) {
        console.error("Behavior deletion failed:", err);
        alert("Error al eliminar la incidencia.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        estudiante: parseInt(selectedStudent),
        fecha: editingConducta ? editingConducta.fecha : new Date().toISOString().split('T')[0],
        tipo,
        descripcion
      };

      if (editingConducta) {
        await axios.put(`http://localhost:8000/api/conducta/${editingConducta.id}/`, payload);
      } else {
        await axios.post('http://localhost:8000/api/conducta/', payload);
      }
      setIsModalOpen(false);
      setEditingConducta(null);
      setSelectedStudent('');
      setDescripcion('');
      fetchData();
    } catch (err) {
      console.error("Behavior saving failed:", err);
      alert("Error al guardar la incidencia.");
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
    { header: 'Descripción / Incidente', accessor: 'descripcion' },
    {
      header: 'Acciones',
      width: '140px',
      render: (row) => (
        <div className="flex gap-2.5 items-center">
          <button 
            onClick={() => handleStartEdit(row)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
            title="Editar Incidencia"
          >
            <Edit size={12} />
            <span>Editar</span>
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 hover:underline"
            title="Eliminar Incidencia"
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Registro de Conducta y Convivencia</h1>
        <p className="text-xs text-[#8898aa]">Control de incidencias de comportamiento escolar, deméritos y reconocimientos positivos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Bitácora de Convivencia Escolar"
            columns={columns}
            data={conductas}
            searchField="estudiante_apellidos"
            onAdd={handleOpenAdd}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingConducta ? "Modificar Incidencia de Conducta" : "Registrar Incidencia de Conducta"}>
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
            {editingConducta ? "Guardar Cambios" : "Registrar Incidencia"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Conducta;
