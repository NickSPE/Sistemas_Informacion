import React, { useState } from 'react';
import { 
  Settings, Shield, Database, Activity, Save, RefreshCw, Download, 
  Trash2, ToggleLeft, ToggleRight, Check, AlertCircle 
} from 'lucide-react';
import KPICard from '../components/KPICard';

const Configuracion = () => {
  const [activeSubTab, setActiveSubTab] = useState('parametros'); // 'parametros', 'permisos', 'respaldo', 'auditoria'
  
  // General System State
  const [appName, setAppName] = useState('SICOLE 360');
  const [scaleType, setScaleType] = useState('vigesimal'); // vigesimal (0-20), literal (A-B-C)
  const [academicYear, setAcademicYear] = useState('2025');
  const [academicPeriods, setAcademicPeriods] = useState('4'); // 4 Bimestres, 3 Trimestres
  const [supportEmail, setSupportEmail] = useState('soporte@sicole360.edu.pe');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Permission settings matrix
  const [permissions, setPermissions] = useState([
    { id: 1, modulo: 'Matrícula', superAdmin: true, director: true, docente: false, apoderado: false },
    { id: 2, modulo: 'Notas / Calificaciones', superAdmin: true, director: true, docente: true, apoderado: false },
    { id: 3, modulo: 'Asistencia Escolar', superAdmin: true, director: true, docente: true, apoderado: false },
    { id: 4, modulo: 'Conducta / Incidencias', superAdmin: true, director: true, docente: true, apoderado: false },
    { id: 5, modulo: 'Caja y Pensiones', superAdmin: true, director: true, docente: false, apoderado: false },
    { id: 6, modulo: 'Emisión de Libretas', superAdmin: true, director: true, docente: true, apoderado: false },
    { id: 7, modulo: 'Configuración General', superAdmin: true, director: false, docente: false, apoderado: false },
  ]);

  // System audit logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 'LOG-3042', fecha: '2026-05-26 01:22:45', usuario: 'admin', accion: 'Calificaciones registradas', detalle: 'Ingreso masivo de notas para el curso Aritmética 1° Primaria', ip: '192.168.1.15' },
    { id: 'LOG-3041', fecha: '2026-05-26 00:54:12', usuario: 'admin', accion: 'Creación de Matrícula', detalle: 'Matrícula exitosa de Peralta Díaz, Mateo Sebastián en 1° Primaria A', ip: '192.168.1.15' },
    { id: 'LOG-3040', fecha: '2026-05-25 23:10:05', usuario: 'director_agustin', accion: 'Asignación de Horario', detalle: 'Asignó docente Evaristo Jara al curso Álgebra de 2° Primaria', ip: '192.168.1.88' },
    { id: 'LOG-3039', fecha: '2026-05-25 18:40:22', usuario: 'admin', accion: 'Configuración del Sistema', detalle: 'Cambio de escala de evaluación a Vigesimal (0-20)', ip: '127.0.0.1' },
    { id: 'LOG-3038', fecha: '2026-05-25 14:15:33', usuario: 'director_agustin', accion: 'Creación de Docente', detalle: 'Registró nuevo docente en Colegio San Agustín', ip: '192.168.1.92' },
  ]);

  const togglePermission = (id, roleKey) => {
    setPermissions(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [roleKey]: !p[roleKey] };
      }
      return p;
    }));
  };

  const handleSaveParams = (e) => {
    e.preventDefault();
    alert('Parámetros de configuración general de SICOLE actualizados exitosamente en la base de datos central.');
    // In a real application, you would perform an axios.post/patch here
  };

  const handleBackup = () => {
    alert('Preparando copia de seguridad consolidada de SICOLE 360...\n- Base de datos relacional (PostgreSQL/SQLite)\n- Repositorios de Archivos de Matrículas\n- Historial de Transacciones de Caja\n\nDescarga iniciada exitosamente en formato .SQL.GZ');
  };

  const handleClearCache = () => {
    if (window.confirm('¿Está seguro de que desea limpiar la caché operativa de SICOLE? Esto forzará la recarga de sesiones activas.')) {
      alert('Caché del servidor purgada exitosamente.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight flex items-center gap-2">
          <Settings className="text-[#6c63ff]" size={22} />
          <span>Configuración del Sistema</span>
        </h1>
        <p className="text-xs text-[#8898aa]">
          Gestión centralizada del año lectivo, escalas de calificación, matriz de permisos de seguridad, auditorías y copias de seguridad de SICOLE.
        </p>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-slate-200 gap-1 bg-white p-1 rounded-xl border max-w-2xl">
        <button
          onClick={() => setActiveSubTab('parametros')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'parametros' ? 'bg-[#6c63ff] text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Settings size={14} />
          <span>Parámetros</span>
        </button>
        <button
          onClick={() => setActiveSubTab('permisos')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'permisos' ? 'bg-[#6c63ff] text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Shield size={14} />
          <span>Roles y Permisos</span>
        </button>
        <button
          onClick={() => setActiveSubTab('respaldo')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'respaldo' ? 'bg-[#6c63ff] text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Database size={14} />
          <span>Mantenimiento</span>
        </button>
        <button
          onClick={() => setActiveSubTab('auditoria')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'auditoria' ? 'bg-[#6c63ff] text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Activity size={14} />
          <span>Logs de Auditoría</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main interactive area (Col span 2) */}
        <div className="lg:col-span-2">
          {activeSubTab === 'parametros' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1a1f36] mb-4 pb-2 border-b border-slate-100">
                Parámetros Generales de Operación
              </h2>
              <form onSubmit={handleSaveParams} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nombre del Sistema</label>
                    <input 
                      type="text" required value={appName} onChange={e => setAppName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Año Escolar por Defecto</label>
                    <select 
                      value={academicYear} onChange={e => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                    >
                      <option value="2025">2025 (Periodo Lectivo Activo)</option>
                      <option value="2026">2026 (Planificación y Matrícula)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Escala de Evaluación</label>
                    <select 
                      value={scaleType} onChange={e => setScaleType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                    >
                      <option value="vigesimal">Vigesimal (Perú SIAGIE: 0 - 20)</option>
                      <option value="literal">Literal (Competencias: AD, A, B, C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Periodos por Año</label>
                    <select 
                      value={academicPeriods} onChange={e => setAcademicPeriods(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                    >
                      <option value="4">4 Bimestres (Estándar Colegios Privados)</option>
                      <option value="3">3 Trimestres (Estándar Estatal)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Correo de Soporte Técnico</label>
                  <input 
                    type="email" required value={supportEmail} onChange={e => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div>
                    <span className="text-xs font-bold text-[#1a1f36] block">Modo de Mantenimiento</span>
                    <span className="text-[10px] text-slate-400 block">Restringe el acceso temporalmente a todos los roles excepto Super Administradores.</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                    className="text-[#6c63ff] hover:text-[#5b52e0] focus:outline-none"
                  >
                    {isMaintenanceMode ? <ToggleRight size={38} className="text-rose-500" /> : <ToggleLeft size={38} className="text-slate-400" />}
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors"
                >
                  <Save size={14} />
                  <span>Guardar Parámetros Globales</span>
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'permisos' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-[#1a1f36]">
                  Matriz de Control de Accesos y Privilegios
                </h2>
                <span className="text-[10px] font-bold bg-indigo-50 text-[#6c63ff] px-2 py-0.5 rounded border border-indigo-200">
                  Seguridad RBAC Activa
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                Configure las capacidades operativas de cada rol en los submódulos escolares. Los cambios se propagan de forma reactiva al token de sesión de cada usuario.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[#1a1f36] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-2.5 text-[9px] font-bold">Módulo Académico</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-center">SuperAdmin</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-center">Director</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-center">Docente</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-center">Apoderado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {permissions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#1a1f36]">{p.modulo}</td>
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="checkbox" checked={p.superAdmin} disabled
                            className="w-4 h-4 text-[#6c63ff] border-slate-300 rounded focus:ring-[#6c63ff] cursor-not-allowed opacity-60"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button" onClick={() => togglePermission(p.id, 'director')}
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center border transition-all ${
                              p.director ? 'bg-indigo-50 border-[#6c63ff] text-[#6c63ff]' : 'border-slate-200 text-slate-300'
                            }`}
                          >
                            {p.director && <Check size={12} strokeWidth={3} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button" onClick={() => togglePermission(p.id, 'docente')}
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center border transition-all ${
                              p.docente ? 'bg-indigo-50 border-[#6c63ff] text-[#6c63ff]' : 'border-slate-200 text-slate-300'
                            }`}
                          >
                            {p.docente && <Check size={12} strokeWidth={3} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button" onClick={() => togglePermission(p.id, 'apoderado')}
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center border transition-all ${
                              p.apoderado ? 'bg-indigo-50 border-[#6c63ff] text-[#6c63ff]' : 'border-slate-200 text-slate-300'
                            }`}
                          >
                            {p.apoderado && <Check size={12} strokeWidth={3} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'respaldo' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36] pb-2 border-b border-slate-100">
                  Resguardo de Datos y Mantenimiento del Servidor
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Realice copias de seguridad de toda la base de datos multiinstitucional o limpie la caché para liberar memoria del sistema en caliente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <LandmarkIcon title="Respaldar Base de Datos" icon={Database} />
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Genera un dump cifrado de las tablas de instituciones, docentes, alumnos, notas y facturación escolar.
                    </p>
                  </div>
                  <button 
                    onClick={handleBackup}
                    className="mt-4 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <Download size={14} />
                    <span>Descargar Backup (.SQL)</span>
                  </button>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <LandmarkIcon title="Limpieza de Caché del Servidor" icon={RefreshCw} />
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Purga los esquemas cacheados de consultas SQL complejas de promedios generales y listados de morosidad.
                    </p>
                  </div>
                  <button 
                    onClick={handleClearCache}
                    className="mt-4 flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Purgar Caché Operativa</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'auditoria' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#1a1f36] pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Registro de Actividad (Audit Trail)</span>
                <span className="text-[9px] font-bold text-slate-400 font-mono">Últimas 5 acciones</span>
              </h2>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[#1a1f36] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-2 text-[9px] font-bold">Fecha / Hora</th>
                      <th className="px-4 py-2 text-[9px] font-bold">Usuario</th>
                      <th className="px-4 py-2 text-[9px] font-bold">Acción</th>
                      <th className="px-4 py-2 text-[9px] font-bold">Detalle</th>
                      <th className="px-4 py-2 text-[9px] font-bold">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{log.fecha}</td>
                        <td className="px-4 py-2.5 font-bold text-[#1a1f36]">{log.usuario}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 text-[10px]">
                            {log.accion}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-medium">{log.detalle}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-400 text-[10px]">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Column */}
        <div className="space-y-6">
          <KPICard 
            title="Estado del Servidor" 
            value="Excelente" 
            subtitle="Tasa de respuesta: 45ms" 
            icon={Activity} 
            color="success"
          />
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <AlertCircle size={14} className="text-[#6c63ff]" />
              <span>Gobernabilidad de SICOLE</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Como <strong>Super Administrador</strong>, sus configuraciones modifican las políticas del núcleo del sistema (SIAGIE-compliant) y controlan la gobernabilidad interna de todos los colegios de la red en tiempo real.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper internal component for layout cards
const LandmarkIcon = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
    <Icon className="text-[#6c63ff]" size={16} />
    <span className="text-xs font-bold text-[#1a1f36]">{title}</span>
  </div>
);

export default Configuracion;
