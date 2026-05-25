import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { ShieldAlert, BookOpen } from 'lucide-react';

const Apoderados = () => {
  const [apoderados, setApoderados] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [nombres, setNombres] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const fetchData = async () => {
    try {
      const [apoRes, estRes] = await Promise.all([
        axios.get('http://localhost:8000/api/apoderados/'),
        axios.get('http://localhost:8000/api/estudiantes/')
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
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/apoderados/', {
        nombres,
        telefono,
        correo,
        parentesco,
        estudiante: parseInt(selectedStudent)
      });
      setIsModalOpen(false);
      setNombres('');
      setTelefono('');
      setCorreo('');
      setParentesco('');
      setSelectedStudent('');
      fetchData();
    } catch (err) {
      console.error("Failed to add apoderado:", err);
    }
  };

  const columns = [
    { header: 'Apoderado / Tutor', accessor: 'nombres', width: '220px' },
    { header: 'Parentesco', accessor: 'parentesco', width: '110px' },
    { header: 'Teléfono', accessor: 'telefono', width: '120px' },
    { header: 'Correo Electrónico', accessor: 'correo' },
    { header: 'Alumno Asociado', render: (row) => `${row.estudiante_apellido || ''}, ${row.estudiante_nombre || ''}` }
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
            onAdd={() => setIsModalOpen(true)}
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

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Asociar Nuevo Apoderado">
        <form onSubmit={handleAdd} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nombre Completo del Apoderado</label>
            <input 
              type="text" required value={nombres} onChange={e => setNombres(e.target.value)} placeholder="Ej. Carlos Quispe"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Teléfono de Contacto</label>
              <input 
                type="text" required value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="987654321"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Parentesco / Relación</label>
              <input 
                type="text" required value={parentesco} onChange={e => setParentesco(e.target.value)} placeholder="Ej. Padre, Madre"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Correo Electrónico</label>
            <input 
              type="email" required value={correo} onChange={e => setCorreo(e.target.value)} placeholder="apoderado@ejemplo.pe"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Estudiante Representado</label>
            <select 
              required value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            >
              <option value="">Seleccione estudiante...</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>{e.apellidos}, {e.nombres}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            Asociar Apoderado
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Apoderados;
