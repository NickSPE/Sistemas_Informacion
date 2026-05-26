import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import KPICard from '../components/KPICard';

const StaffManagement = () => {
  const [docentes, setDocentes] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);

  // form
  const [dia, setDia] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  const [cursos, setCursos] = useState([]);
  const [secciones, setSecciones] = useState([]);

  const fetchAll = async () => {
    try {
      const [dRes, hRes, cRes, sRes] = await Promise.all([
        axios.get('http://localhost:8000/api/docentes/'),
        axios.get('http://localhost:8000/api/horarios/'),
        axios.get('http://localhost:8000/api/cursos/'),
        axios.get('http://localhost:8000/api/secciones/')
      ]);
      setDocentes(dRes.data);
      setHorarios(hRes.data);
      setCursos(cRes.data || []);
      setSecciones(sRes.data || []);
    } catch (err) {
      console.error('Error cargando datos de personal y horarios', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openDocente = (doc) => {
    setSelectedDocente(doc);
  };

  const openAssignModal = (doc) => {
    setSelectedDocente(doc);
    setIsHorarioModalOpen(true);
  };

  const handleCreateHorario = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/horarios/', {
        docente: selectedDocente.id,
        curso: parseInt(selectedCurso),
        seccion: parseInt(selectedSeccion),
        dia,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });
      setIsHorarioModalOpen(false);
      setDia(''); setHoraInicio(''); setHoraFin(''); setSelectedCurso(''); setSelectedSeccion('');
      fetchAll();
    } catch (err) {
      console.error('No se pudo crear horario', err);
    }
  };

  const handleDeleteHorario = async (id) => {
    if (!confirm('Eliminar horario seleccionado?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/horarios/${id}/`);
      fetchAll();
    } catch (err) {
      console.error('Eliminación fallida', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Control de Personal y Horarios</h1>
        <p className="text-xs text-slate-500">Vista centralizada de docentes, asignación de horarios y reemplazos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold mb-2">Plana Docente</h2>
            <div className="divide-y">
              {docentes.map(d => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold">{d.nombres}</div>
                    <div className="text-xs text-slate-500">{d.especialidad} — DNI {d.dni}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openDocente(d)} className="text-xs px-3 py-1 bg-slate-100 rounded">Ver horarios</button>
                    <button onClick={() => openAssignModal(d)} className="text-xs px-3 py-1 bg-[#6c63ff] text-white rounded">Asignar horario</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold mb-2">Horarios Registrados</h2>
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-600">
                <tr>
                  <th className="text-left">Docente</th>
                  <th className="text-left">Curso</th>
                  <th>Día</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {horarios.map(h => (
                  <tr key={h.id} className="border-t">
                    <td className="py-2">{h.docente_nombre}</td>
                    <td>{h.curso_nombre}</td>
                    <td>{h.dia}</td>
                    <td>{h.hora_inicio}</td>
                    <td>{h.hora_fin}</td>
                    <td><button onClick={() => handleDeleteHorario(h.id)} className="text-xs text-red-600">Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <KPICard title="Docentes" value={docentes.length} subtitle="Personal activo" />
          <KPICard title="Bloques" value={horarios.length} subtitle="Horarios registrados" />
        </div>
      </div>

      {/* Modal: ver horarios docente */}
      <Modal isOpen={!!selectedDocente && !isHorarioModalOpen} onClose={() => setSelectedDocente(null)} title={selectedDocente ? `Horarios de ${selectedDocente.nombres}` : ''}>
        <div className="space-y-3">
          {selectedDocente ? (
            <div>
              <ul className="divide-y">
                {horarios.filter(h => h.docente === selectedDocente.id).length === 0 && <li className="py-3 text-xs text-slate-500">No hay horarios asignados.</li>}
                {horarios.filter(h => h.docente === selectedDocente.id).map(h => (
                  <li key={h.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold">{h.curso_nombre} — {h.seccion_nombre}</div>
                      <div className="text-xs text-slate-500">{h.dia} {h.hora_inicio} - {h.hora_fin}</div>
                    </div>
                    <div><button onClick={() => handleDeleteHorario(h.id)} className="text-xs text-red-600">Eliminar</button></div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Modal>

      {/* Modal: asignar horario */}
      <Modal isOpen={isHorarioModalOpen} onClose={() => setIsHorarioModalOpen(false)} title={selectedDocente ? `Asignar horario a ${selectedDocente.nombres}` : 'Asignar horario'}>
        <form onSubmit={handleCreateHorario} className="space-y-3">
          <div>
            <label className="text-xs">Curso</label>
            <select required value={selectedCurso} onChange={e => setSelectedCurso(e.target.value)} className="w-full p-2 border rounded text-sm">
              <option value="">Seleccione...</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs">Sección</label>
            <select required value={selectedSeccion} onChange={e => setSelectedSeccion(e.target.value)} className="w-full p-2 border rounded text-sm">
              <option value="">Seleccione...</option>
              {secciones.map(s => <option key={s.id} value={s.id}>{s.nombre} — Grado: {s.grado_nombre || s.grado}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs">Día</label>
            <select required value={dia} onChange={e => setDia(e.target.value)} className="w-full p-2 border rounded text-sm">
              <option value="">Seleccione...</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs">Hora Inicio</label>
              <input type="time" required value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="w-full p-2 border rounded text-sm" />
            </div>
            <div>
              <label className="text-xs">Hora Fin</label>
              <input type="time" required value={horaFin} onChange={e => setHoraFin(e.target.value)} className="w-full p-2 border rounded text-sm" />
            </div>
          </div>
          <div>
            <button className="w-full py-2 bg-[#6c63ff] text-white rounded text-sm">Asignar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
