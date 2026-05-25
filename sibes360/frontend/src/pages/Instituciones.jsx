import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Building2, Plus, Phone, ShieldCheck } from 'lucide-react';

const Instituciones = () => {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/instituciones/', {
        nombre,
        ruc,
        direccion,
        telefono,
        estado: true
      });
      setIsModalOpen(false);
      setNombre('');
      setRuc('');
      setDireccion('');
      setTelefono('');
      fetchInstituciones();
    } catch (err) {
      console.error("Failed to add institution:", err);
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
      render: (row) => <Badge type={row.estado ? 'Presente' : 'Falta'} text={row.estado ? 'Activo' : 'Inactivo'} />
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Instituciones Educativas</h1>
        <p className="text-xs text-[#8898aa]">Gestione los centros escolares afiliados en la UGEL Metropolitana de Lima.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column: Data Table (2/3 width) */}
        <div className="lg:col-span-2">
          <DataTable
            title="Locales Escolares Registrados"
            columns={columns}
            data={instituciones}
            searchField="nombre"
            onAdd={() => setIsModalOpen(true)}
            addLabel="Registrar Institución"
          />
        </div>

        {/* Right Column: Mini Info Stats & Actions (1/3 width) */}
        <div className="space-y-6">
          <KPICard 
            title="Centros de Lima" 
            value={instituciones.length} 
            subtitle="Colegios afiliados activos" 
            icon={Building2} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck size={14} className="text-[#6c63ff]" />
              <span>Marco Normativo RUC</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              De acuerdo a directivas del Ministerio de Educación de Perú, toda institución educativa privada o pública en Lima Metropolitana debe registrar su número RUC de 11 dígitos y su respectivo código de local escolar para emisión de actas oficiales.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nueva Institución">
        <form onSubmit={handleAdd} className="space-y-4 text-left">
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
            Registrar Institución
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Instituciones;
