import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Comunicacion = () => {
  const { selectedInstitucion } = useAuth();
  const [comunicados, setComunicados] = useState([]);
  const [citaciones, setCitaciones] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [selectedInst, setSelectedInst] = useState('');

  const fetchData = async () => {
    try {
      const instParam = selectedInstitucion ? `?institucion=${selectedInstitucion}` : '';
      const [comRes, citRes, instRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/comunicado/${instParam}`),
        axios.get(`http://localhost:8000/api/citacion/${instParam}`),
        axios.get('http://localhost:8000/api/instituciones/')
      ]);
      setComunicados(comRes.data);
      setCitaciones(citRes.data);
      setInstituciones(instRes.data);
    } catch (err) {
      console.error("Failed to load communication:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Pre-select institution from context
    if (selectedInstitucion) {
      setSelectedInst(selectedInstitucion.toString());
    }
  }, [selectedInstitucion]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/comunicado/', {
        titulo,
        mensaje,
        institucion: parseInt(selectedInst),
        fecha_creacion: new Date().toISOString()
      });
      setIsModalOpen(false);
      setTitulo('');
      setMensaje('');
      setSelectedInst('');
      fetchData();
    } catch (err) {
      console.error("Failed to publish notice:", err);
    }
  };

  const columns = [
    { header: 'Título del Comunicado', accessor: 'titulo', width: '250px' },
    { header: 'Mensaje / Anuncio', accessor: 'mensaje' },
    { header: 'Fecha Publicación', accessor: 'fecha_creacion', width: '180px' },
    { header: 'Colegio Emisor', accessor: 'institucion_nombre', width: '180px' }
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Comunicados y Reuniones</h1>
        <p className="text-xs text-[#8898aa]">Tablón de anuncios institucionales y citación a reuniones de padres de familia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Muro de Anuncios Vigentes"
            columns={columns}
            data={comunicados}
            searchField="titulo"
            onAdd={() => setIsModalOpen(true)}
            addLabel="Publicar Anuncio"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Citaciones Citadas" 
            value={citaciones.length} 
            subtitle="Reuniones de tutoría" 
            icon={Bell} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <HelpCircle size={14} className="text-[#6c63ff]" />
              <span>Canal Informativo</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Los comunicados publicados en esta sección se muestran en tiempo real en la aplicación móvil de los apoderados, asegurando que todos estén al tanto del acontecer escolar diario de sus hijos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publicar Nuevo Comunicado">
        <form onSubmit={handleAdd} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Título del Anuncio</label>
            <input 
              type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Suspensión de Clases por Feriado"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Colegio Emisor</label>
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
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Mensaje o Contenido del Aviso</label>
            <textarea 
              required value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Escriba el texto del comunicado aquí..." rows={4}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            Publicar Comunicado
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Comunicacion;
