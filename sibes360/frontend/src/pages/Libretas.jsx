import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { FileDown, Printer, FileText, Eye, Trash2 } from 'lucide-react';

const Libretas = () => {
  const [libretas, setLibretas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeLibreta, setActiveLibreta] = useState(null);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const fetchData = async () => {
    try {
      const [libRes, estRes, perRes] = await Promise.all([
        axios.get('http://localhost:8000/api/libretas/'),
        axios.get('http://localhost:8000/api/estudiantes/'),
        axios.get('http://localhost:8000/api/periodos/')
      ]);
      setLibretas(libRes.data);
      setEstudiantes(estRes.data);
      setPeriodos(perRes.data);
    } catch (err) {
      console.error("Failed to load bulletins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/libretas/', {
        estudiante: parseInt(selectedStudent),
        periodo: parseInt(selectedPeriod)
      });
      setIsModalOpen(false);
      setSelectedStudent('');
      setSelectedPeriod('');
      fetchData();
    } catch (err) {
      console.error("Bulletin emission failed:", err);
      alert("Error al emitir la libreta académica.");
    }
  };

  const handleStartView = (row) => {
    setActiveLibreta(row);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea anular/eliminar esta libreta emitida?")) {
      try {
        await axios.delete(`http://localhost:8000/api/libretas/${id}/`);
        fetchData();
      } catch (err) {
        console.error("Bulletin deletion failed:", err);
        alert("Error al eliminar la libreta.");
      }
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-report-card").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <html>
        <head>
          <title>Libreta de Calificaciones - SICOLE</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1f36; background: #white; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 12px; }
            th { background: #f8fafc; font-weight: bold; }
            .header-print { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6c63ff; padding-bottom: 15px; }
            .sign-grid { display: flex; justify-content: space-around; margin-top: 80px; }
            .sign-line { border-top: 1px dashed #64748b; width: 200px; text-align: center; padding-top: 5px; font-size: 11px; }
            .score-red { color: #e11d48; font-weight: bold; }
            .score-blue { color: #0d9488; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore react bindings safely
  };

  const columns = [
    { header: 'Código', accessor: 'id', width: '80px' },
    { header: 'Estudiante', render: (row) => `${row.estudiante_apellidos || ''}, ${row.estudiante_nombres || ''}` },
    { header: 'Periodo Académico', accessor: 'periodo_bimestre', width: '180px' },
    { header: 'Fecha de Emisión', accessor: 'fecha_emision', width: '180px' },
    { 
      header: 'Acciones', 
      width: '180px',
      render: (row) => (
        <div className="flex gap-2.5 items-center">
          <button 
            onClick={() => handleStartView(row)}
            className="flex items-center gap-1 text-[10px] font-bold text-[#6c63ff] hover:text-[#5b52e0] bg-indigo-50 hover:bg-indigo-100/50 px-2 py-1 rounded"
          >
            <Eye size={12} />
            <span>Ver Libreta</span>
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/50 px-2 py-1 rounded"
          >
            <Trash2 size={12} />
            <span>Eliminar</span>
          </button>
        </div>
      )
    }
  ];

  // Mock report card courses data representing a typical school curriculum
  const mockReportCardData = [
    { area: "Matemática", b1: 16, b2: 17, b3: 15, b4: 18 },
    { area: "Comunicación (Lengua y Literatura)", b1: 18, b2: 19, b3: 17, b4: 19 },
    { area: "Ciencia, Tecnología y Ambiente", b1: 14, b2: 15, b3: 16, b4: 15 },
    { area: "Ciencias Sociales (Historia y Geo)", b1: 12, b2: 11, b3: 13, b4: 12 },
    { area: "Educación Física", b1: 18, b2: 18, b3: 19, b4: 20 },
    { area: "Inglés e Idiomas Extranjeros", b1: 15, b2: 16, b3: 15, b4: 17 },
    { area: "Desarrollo Personal, Ciudadanía y Cívica", b1: 14, b2: 14, b3: 15, b4: 15 }
  ];

  const calculateFinalAverage = (course) => {
    return ((course.b1 + course.b2 + course.b3 + course.b4) / 4).toFixed(2);
  };

  const getScoreClass = (score) => {
    return parseFloat(score) >= 11 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold";
  };

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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Emisión de Libretas Escolares</h1>
        <p className="text-xs text-[#8898aa]">Generación de libretas académicas bimestrales y actas consolidadas de rendimiento escolar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column */}
        <div className="lg:col-span-2">
          <DataTable
            title="Consolidado de Libretas Emitidas"
            columns={columns}
            data={libretas}
            searchField="estudiante_apellidos"
            onAdd={() => setIsModalOpen(true)}
            addLabel="Emitir Libreta"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <KPICard 
            title="Libretas Emitidas" 
            value={libretas.length} 
            subtitle="Consolidados bimestrales" 
            icon={FileDown} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText size={14} className="text-[#6c63ff]" />
              <span>Visado y Certificación</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Las libretas consolidadas en SIBES 360 se generan integrando el promedio ponderado de todas las evaluaciones bimestrales cargadas por los docentes, facilitando el visado directo de la Dirección Escolar.
            </p>
          </div>
        </div>
      </div>

      {/* Issuing Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Emitir Nueva Libreta Escolar">
        <form onSubmit={handleEmit} className="space-y-4 text-left">
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
            <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Periodo Académico</label>
            <select 
              required value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
            >
              <option value="">Seleccione periodo...</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.bimestre} {p.anio}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            Emitir Libreta
          </button>
        </form>
      </Modal>

      {/* Visual Report Card Viewer Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Visualizador Oficial de Libreta de Calificaciones">
        {activeLibreta && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1 text-left">
            <div className="flex justify-end gap-2 border-b border-slate-100 pb-3">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-[#6c63ff] hover:bg-[#5b52e0] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors"
              >
                <Printer size={14} />
                <span>Imprimir / PDF</span>
              </button>
            </div>

            {/* Printable Area */}
            <div id="printable-report-card" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="header-print flex items-center justify-between border-b-2 border-[#6c63ff] pb-4">
                <div>
                  <h2 className="text-sm font-black text-[#1a1f36] uppercase tracking-wide">REPÚBLICA DEL PERÚ</h2>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ministerio de Educación</h3>
                  <h4 className="text-xs font-bold text-[#6c63ff]">SIBES 360 / SICOLE SCHOOL SYSTEM</h4>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-black text-[#1a1f36] uppercase">LIBRETA DE CALIFICACIONES</h2>
                  <p className="text-[10px] text-slate-500 font-bold">Año Lectivo: {activeLibreta.periodo_anio || new Date().getFullYear()}</p>
                  <p className="text-[9px] text-slate-400">Código de Libreta: L-{activeLibreta.id}</p>
                </div>
              </div>

              {/* Student Metadata Card Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 border border-slate-100 rounded-lg p-3 text-[11px] leading-relaxed">
                <div>
                  <span className="font-bold text-slate-500 block uppercase text-[8px] tracking-wider">Estudiante</span>
                  <span className="text-[#1a1f36] font-bold">{activeLibreta.estudiante_apellidos}, {activeLibreta.estudiante_nombres}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block uppercase text-[8px] tracking-wider">Nivel / Grado</span>
                  <span className="text-[#1a1f36] font-bold">Secundaria / 3° Grado</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block uppercase text-[8px] tracking-wider">Sección / Aula</span>
                  <span className="text-[#1a1f36] font-bold">Única ("A")</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block uppercase text-[8px] tracking-wider">Periodo Reportado</span>
                  <span className="text-[#6c63ff] font-bold">{activeLibreta.periodo_bimestre}</span>
                </div>
              </div>

              {/* Main Grades Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Área Curricular / Asignaturas</th>
                      <th className="border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[65px]">I Bim</th>
                      <th className="border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[65px]">II Bim</th>
                      <th className="border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[65px]">III Bim</th>
                      <th className="border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[65px]">IV Bim</th>
                      <th className="border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[90px]">Prom. Final</th>
                      <th className="border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[100px]">Situación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockReportCardData.map((course, idx) => {
                      const avg = calculateFinalAverage(course);
                      const isApproved = parseFloat(avg) >= 11;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="border border-slate-200 px-3 py-2 text-xs font-bold text-[#1a1f36]">{course.area}</td>
                          <td className="border border-slate-200 px-3 py-2 text-xs text-center text-slate-600">{course.b1}</td>
                          <td className="border border-slate-200 px-3 py-2 text-xs text-center text-slate-600">{course.b2}</td>
                          <td className="border border-slate-200 px-3 py-2 text-xs text-center text-slate-600">{course.b3}</td>
                          <td className="border border-slate-200 px-3 py-2 text-xs text-center text-slate-600">{course.b4}</td>
                          <td className="border border-slate-200 px-3 py-2 text-xs text-center font-black">
                            <span className={getScoreClass(avg)}>{avg}</span>
                          </td>
                          <td className="border border-slate-200 px-3 py-2 text-center text-[10px] font-bold uppercase">
                            {isApproved ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">Aprobado</span>
                            ) : (
                              <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-md">Desaprobado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Behavior & General Observation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                <div className="md:col-span-2 border border-slate-200 rounded-lg p-3 space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Observación Pedagógica General</span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "El alumno demuestra un alto desempeño en las áreas lógicas y lingüísticas. Se recomienda reforzar el análisis espacial y la participación activa en eventos de debate escolar."
                  </p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3 text-center flex flex-col justify-center items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Calificación Conductual</span>
                  <span className="text-xl font-black text-emerald-600 bg-emerald-50 border border-emerald-200 h-10 w-10 flex items-center justify-center rounded-full shadow-inner">A</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">Comportamiento Óptimo</span>
                </div>
              </div>

              {/* Official Signatures Box */}
              <div className="flex justify-around items-center pt-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="border-t border-dashed border-slate-400 w-44 pt-1.5">
                    <span className="text-xs font-bold text-[#1a1f36] block">Prof. Tutor de Aula</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Firma y Sello</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="border-t border-dashed border-slate-400 w-44 pt-1.5">
                    <span className="text-xs font-bold text-[#1a1f36] block">Director General</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Sello Oficial Colegio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Libretas;
