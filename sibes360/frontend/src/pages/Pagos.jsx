import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { CreditCard, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Pagos = () => {
  const { selectedInstitucion } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [pensiones, setPensiones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [comprobante, setComprobante] = useState('');

  const fetchData = async () => {
    try {
      const instParam = selectedInstitucion ? `?institucion=${selectedInstitucion}` : '';
      const [pagRes, penRes, estRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/pagos/${instParam}`),
        axios.get(`http://localhost:8000/api/pension/${instParam}`),
        axios.get(`http://localhost:8000/api/estudiantes/${instParam}`)
      ]);
      setPagos(pagRes.data);
      setPensiones(penRes.data);
      setEstudiantes(estRes.data);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedInstitucion]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/pagos/', {
        estudiante: parseInt(selectedStudent),
        monto: parseFloat(monto),
        concepto,
        comprobante,
        fecha_pago: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(false);
      setSelectedStudent('');
      setConcepto('');
      setMonto('');
      setComprobante('');
      fetchData();
    } catch (err) {
      console.error("Payment registration failed:", err);
    }
  };

  const columns = [
    { header: 'Comprobante', accessor: 'comprobante', width: '130px' },
    { header: 'Estudiante', render: (row) => `${row.estudiante_apellidos || ''}, ${row.estudiante_nombres || ''}` },
    { header: 'Concepto / Glosa', accessor: 'concepto' },
    { header: 'Fecha', accessor: 'fecha_pago', width: '110px' },
    { 
      header: 'Monto Cobrado', 
      accessor: 'monto', 
      width: '120px',
      render: (row) => <span className="font-bold text-[#1a1f36]">S/ {parseFloat(row.monto).toFixed(2)}</span>
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Caja y Control de Pensiones</h1>
        <p className="text-xs text-[#8898aa]">Control de pensiones mensuales, emisión de boletas y recaudación en Soles (S/).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Historial de Pagos Recaudados"
            columns={columns}
            data={pagos}
            searchField="estudiante_apellidos"
            onAdd={() => setIsModalOpen(true)}
            addLabel="Registrar Cobro"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Recaudado Caja" 
            value={`S/ ${pagos.reduce((acc, p) => acc + parseFloat(p.monto), 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} 
            subtitle="Ingresos consolidados" 
            icon={CreditCard} 
            color="success"
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Landmark size={14} className="text-[#6c63ff]" />
              <span>Estado de Cuentas</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Las pensiones mensuales del año lectivo 2025 se facturan de forma anticipada. Los pagos cargados aquí amortizan directamente las pensiones del alumno para evitar que figure en estado de morosidad o vencido.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Cobro en Caja">
        <form onSubmit={handleAdd} className="space-y-4 text-left">
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
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Monto Recibido (S/)</label>
              <input 
                type="number" step="0.01" required value={monto} onChange={e => setMonto(e.target.value)} placeholder="Ej. 600.00"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">N° Boleta / Comprobante</label>
              <input 
                type="text" required value={comprobante} onChange={e => setComprobante(e.target.value)} placeholder="B001-000100"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Concepto del Pago</label>
            <input 
              type="text" required value={concepto} onChange={e => setConcepto(e.target.value)} placeholder="Ej. Pensión de Mayo 2025"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            Registrar Pago en Caja
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Pagos;
