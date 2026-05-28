import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Users, UserCheck, ShieldAlert, Key, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  const { user, selectedInstitucion } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Password reset states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRol, setSelectedRol] = useState('');
  const [selectedInst, setSelectedInst] = useState('');
  const [dni, setDni] = useState('');

  const fetchData = async () => {
    try {
      const url = selectedInstitucion
        ? `http://localhost:8000/api/usuarios/?institucion=${selectedInstitucion}`
        : 'http://localhost:8000/api/usuarios/';
      const [usrRes, rolRes, instRes] = await Promise.all([
        axios.get(url),
        axios.get('http://localhost:8000/api/roles/'),
        axios.get('http://localhost:8000/api/instituciones/')
      ]);
      setUsuarios(usrRes.data);
      setRoles(rolRes.data);
      setInstituciones(instRes.data);
    } catch (err) {
      console.error("Failed to load user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedInstitucion]);

  const resetForm = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setSelectedRol('');
    setSelectedInst('');
    setDni('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleStartEdit = (usr) => {
    setEditingUser(usr);
    setUsername(usr.username);
    setPassword(''); // No password in main edit
    setEmail(usr.email);
    setFirstName(usr.first_name);
    setLastName(usr.last_name);
    setSelectedRol(usr.rol ? usr.rol.toString() : '');
    setSelectedInst(usr.institucion ? usr.institucion.toString() : '');
    setDni(usr.dni || '');
    setIsModalOpen(true);
  };

  const handleStartReset = (usr) => {
    setResettingUser(usr);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        rol: selectedRol ? parseInt(selectedRol) : null,
        institucion: selectedInst ? parseInt(selectedInst) : null,
        dni: dni || null,
      };

      if (editingUser) {
        await axios.patch(`http://localhost:8000/api/usuarios/${editingUser.id}/`, payload);
      } else {
        payload.password = password;
        payload.estado = true;
        await axios.post('http://localhost:8000/api/usuarios/', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Failed to save user:", err);
      alert(err.response?.data?.detail || "Ocurrió un error al guardar los datos.");
    }
  };

  const handleToggleStatus = async (usr) => {
    try {
      await axios.patch(`http://localhost:8000/api/usuarios/${usr.id}/`, {
        estado: !usr.estado
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert("Error al cambiar el estado del usuario.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    try {
      await axios.patch(`http://localhost:8000/api/usuarios/${resettingUser.id}/`, {
        password: newPassword
      });
      setIsResetModalOpen(false);
      alert("Contraseña restablecida exitosamente.");
    } catch (err) {
      console.error("Failed to reset password:", err);
      alert("Error al cambiar la contraseña.");
    }
  };

  const columns = [
    { header: 'Username', accessor: 'username', width: '120px' },
    { header: 'DNI', accessor: 'dni', width: '90px' },
    { header: 'Nombre Completo', render: (row) => `${row.first_name || ''} ${row.last_name || ''}` },
    { header: 'Email', accessor: 'email' },
    { header: 'Institución', accessor: 'institucion_nombre', width: '160px' },
    { 
      header: 'Rol', 
      accessor: 'rol_nombre', 
      width: '110px',
      render: (row) => <Badge type={row.rol_nombre === 'SuperAdmin' ? 'presente' : row.rol_nombre === 'Director' ? 'justificada' : 'pendiente'} text={row.rol_nombre || 'Sin Rol'} />
    },
    { 
      header: 'Estado', 
      accessor: 'estado', 
      width: '90px',
      render: (row) => (
        <button 
          onClick={() => handleToggleStatus(row)}
          className="flex items-center gap-1 group focus:outline-none"
          title="Haz clic para cambiar el estado"
        >
          <Badge type={row.estado ? 'Presente' : 'Falta'} text={row.estado ? 'Activo' : 'Inactivo'} />
        </button>
      )
    },
    {
      header: 'Acciones',
      width: '140px',
      render: (row) => (
        <div className="flex gap-2.5 items-center">
          <button 
            onClick={() => handleStartEdit(row)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
            title="Editar Usuario"
          >
            <Edit size={12} />
            <span>Editar</span>
          </button>
          <button 
            onClick={() => handleStartReset(row)}
            className="text-[10px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-0.5 hover:underline"
            title="Restablecer Contraseña"
          >
            <Key size={12} />
            <span>Clave</span>
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

  const activeUsersCount = usuarios.filter(u => u.estado).length;

  return (
    <div className="space-y-6">
      {/* Strict single H1 Constraint */}
      <div>
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Gestión de Usuarios y Roles</h1>
        <p className="text-xs text-[#8898aa]">Administre las credenciales, perfiles y estados de directores, docentes, apoderados y personal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column: Data Table */}
        <div className="lg:col-span-2">
          <DataTable
            title={selectedInstitucion ? "Cuentas del Colegio Filtrado" : "Cuentas del Sistema SIBES 360"}
            columns={columns}
            data={usuarios}
            searchField="username"
            onAdd={handleOpenAdd}
            addLabel="Nuevo Usuario"
          />
        </div>

        {/* Right Column: Mini Info Stats */}
        <div className="space-y-6">
          <KPICard 
            title="Usuarios Activos" 
            value={activeUsersCount} 
            subtitle={`De ${usuarios.length} usuarios totales`} 
            icon={Users} 
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <UserCheck size={14} className="text-[#6c63ff]" />
              <span>Roles Jerárquicos SIBES</span>
            </h3>
            <div className="space-y-3">
              {roles.map(r => (
                <div key={r.id} className="text-xs">
                  <span className="font-bold text-[#1a1f36] block">{r.nombre_rol}</span>
                  <span className="text-slate-400 text-[10px] block">{r.descripcion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Modal Create/Edit */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); resetForm(); }} 
          title={editingUser ? "Modificar Usuario" : "Crear Nuevo Usuario"}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Usuario (Login)</label>
                <input 
                  type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Contraseña</label>
                  <input 
                    type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                  />
                </div>
              )}
              {editingUser && (
                <div className="flex items-center text-xs text-amber-500 font-medium pt-5 pl-2 leading-tight">
                  <span>* Para cambiar la contraseña, usa el botón "Clave" en la tabla.</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nombres</label>
                <input 
                  type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Nombres"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Apellidos</label>
                <input 
                  type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Apellidos"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">DNI (8 dígitos)</label>
                <input 
                  type="text" maxLength={8} pattern="\d{8}" required value={dni} onChange={e => setDni(e.target.value)} placeholder="Ej. 70654321"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Correo Electrónico</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.pe"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Rol Asignado</label>
                <select 
                  required value={selectedRol} onChange={e => setSelectedRol(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                >
                  <option value="">Seleccione rol...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre_rol}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Colegio Pertenencia</label>
                <select 
                  value={selectedInst} onChange={e => setSelectedInst(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
                >
                  <option value="">Ninguno / Central (SuperAdmin)</option>
                  {instituciones.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
              {editingUser ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </form>
        </Modal>
      )}

      {/* Password Reset Modal */}
      {isResetModalOpen && resettingUser && (
        <Modal 
          isOpen={isResetModalOpen} 
          onClose={() => { setIsResetModalOpen(false); setResettingUser(null); }} 
          title={`Restablecer Clave: ${resettingUser.username}`}
        >
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-left">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex gap-2">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Acción de Soporte Técnico</p>
                <p className="mt-0.5 leading-relaxed">
                  Esta acción sobrescribirá directamente la contraseña del usuario. Asegúrate de comunicársela de forma segura al propietario de la cuenta.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Nueva Contraseña</label>
              <input 
                type="password" 
                required 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Ingresar nueva contraseña"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors mt-2">
              Restablecer Contraseña
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Usuarios;
