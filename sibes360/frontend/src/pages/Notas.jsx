import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { FileSpreadsheet, Award, Edit, Trash2 } from 'lucide-react';

const Notas = () => {
  const [notas, setNotas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNota, setEditingNota] = useState(null);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedEval, setSelectedEval] = useState('');
  const [calificacion, setCalificacion] = useState('');

  const fetchData = async () => {
    try {
      const [notaRes, estRes, evalRes] = await Promise.all([
        axios.get('http://localhost:8000/api/notas/'),
        axios.get('http://localhost:8000/api/estudiantes/'),
        axios.get('http://localhost:8000/api/evaluaciones/')
      ]);
      setNotas(notaRes.data);
      setEstudiantes(estRes.data);
      setEvaluaciones(evalRes.data);
    } catch (err) {
      console.error("Failed to load grades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingNota(null);
    setSelectedStudent('');
    setSelectedEval('');
    setCalificacion('');
    setIsModalOpen(true);
  };

  const handleStartEdit = (row) => {
    setEditingNota(row);
    setSelectedStudent(row.estudiante ? row.estudiante.toString() : '');
    setSelectedEval(row.evaluacion ? row.evaluacion.toString() : '');
    setCalificacion(row.calificacion.toString());
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta calificación?")) {
      try {
        await axios.delete(`http://localhost:8000/api/notas/${id}/`);
        fetchData();
      } catch (err) {
        console.error("Grade deletion failed:", err);
        alert("Error al eliminar la calificación.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(calificacion);
    if (isNaN(val) || val < 0 || val > 20) {
      alert("La calificacion debe ser entre 0 y 20.");
      return;
    }
    try {
      const payload = {
        estudiante: parseInt(selectedStudent),
        evaluacion: parseInt(selectedEval),
        calificacion: val
      };

      if (editingNota) {
        await axios.put(`http://localhost:8000/api/notas/${editingNota.id}/`, payload);
      } else {
        await axios.post('http://localhost:8000/api/notas/', payload);
      }
      setIsModalOpen(false);
      setEditingNota(null);
      setSelectedStudent('');
      setSelectedEval('');
      setCalificacion('');
      fetchData();
    } catch (err) {
      console.error("Grade saving failed:", err);
      alert("Error al guardar la calificación.");
    }
  };

  const getGradeStyle = (val) => {
    if (val >= 13) return 'bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded';
    if (val >= 11) return 'bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded';
    return 'bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold';
  };

  const columns = [
    { header: 'Código', accessor: 'id', width: '80px' },
    { header: 'Estudiante', render: (row) => `${row.estudiante_apellidos || ''}, ${row.estudiante_nombres || ''}` },
    { header: 'Evaluación', accessor: 'evaluacion_tipo', width: '180px' },
    { header: 'Curso', accessor: 'curso_nombre', width: '180px' },
    { 
      header: 'Calificación', 
      accessor: 'calificacion', 
      width: '110px',
      render: (row) => <span className={getGradeStyle(parseFloat(row.calificacion))}>{row.calificacion}</span>
    },
    {
      header: 'Acciones',
      width: '140px',
      render: (row) => (
        <div className="flex gap-2.5 items-center">
          <button 
            onClick={() => handleStartEdit(row)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
            title="Editar Calificación"
          >
            <Edit size={12} />
            <span>Editar</span>
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 hover:underline"
            title="Eliminar Calificación"
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Registro de Calificaciones Generales</h1>
        <p className="text-xs text-[#8898aa]">Gestión de notas de evaluaciones parciales y exámenes (escala oficial de 0 a 20).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Cuaderno de Calificaciones Escolar"
            columns={columns}
            data={notas}
            searchField="estudiante_apellidos"
            onAdd={handleOpenAdd}
            addLabel="Registrar Calificación"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Notas Registradas" 
            value={notas.length} 
            subtitle="Evaluaciones calificadas" 
            icon={FileSpreadsheet} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Award size={14} className="text-[#6c63ff]" />
              <span>Escala Vigesimal</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              En el sistema escolar de Lima Metropolitana se utiliza la escala vigesimal (0 a 20). La nota mínima aprobatoria estándar es de once (11). Las calificaciones menores a 11 se marcan automáticamente en color rojo de alerta académica.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNota ? "Modificar Calificación Académica" : "Registrar Nota Académica"}>
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
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Evaluación Planificada</label>
            <select 
              required value={selectedEval} onChange={e => setSelectedEval(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            >
              <option value="">Seleccione evaluación...</option>
              {evaluaciones.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.tipo} - {ev.curso_nombre} ({ev.periodo_bimestre})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Calificación (0 - 20)</label>
            <input 
              type="number" step="0.1" min="0" max="20" required value={calificacion} onChange={e => setCalificacion(e.target.value)} placeholder="Ej. 17.5"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            {editingNota ? "Guardar Cambios" : "Registrar Calificación"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Notas;
