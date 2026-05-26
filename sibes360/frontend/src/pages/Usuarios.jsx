import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import { Users, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRol, setSelectedRol] = useState('');
  const [selectedInst, setSelectedInst] = useState('');

  const fetchData = async () => {
    try {
      const [usrRes, rolRes, instRes] = await Promise.all([
        axios.get('http://localhost:8000/api/usuarios/'),
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
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/usuarios/', {
        username,
        password,
        email,
        first_name: firstName,
        last_name: lastName,
        rol: selectedRol ? parseInt(selectedRol) : null,
        institucion: selectedInst ? parseInt(selectedInst) : null,
        estado: true
      });
      setIsModalOpen(false);
      setUsername('');
      setPassword('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setSelectedRol('');
      setSelectedInst('');
      fetchData();
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  const { user: currentUser } = useAuth();

  const openEdit = (u) => {
    setEditingUser(u);
    // populate form
    setUsername(u.username || '');
    setEmail(u.email || '');
    setFirstName(u.first_name || '');
    setLastName(u.last_name || '');
    setSelectedRol(u.rol || '');
    setSelectedInst(u.institucion || '');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await axios.put(`http://localhost:8000/api/usuarios/${editingUser.id}/`, {
        username,
        ...(password ? { password } : {}),
        email,
        first_name: firstName,
        last_name: lastName,
        rol: selectedRol ? parseInt(selectedRol) : null,
        institucion: selectedInst ? parseInt(selectedInst) : null,
        estado: true
      });
      setIsModalOpen(false);
      setEditingUser(null);
      setUsername(''); setPassword(''); setEmail(''); setFirstName(''); setLastName(''); setSelectedRol(''); setSelectedInst('');
      fetchData();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar usuario seleccionado? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`http://localhost:8000/api/usuarios/${id}/`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('No se pudo eliminar el usuario. Revisa permisos o dependencias.');
    }
  };

  const columns = [
    { header: 'Username', accessor: 'username', width: '120px' },
    { header: 'Nombre Completo', render: (row) => `${row.first_name || ''} ${row.last_name || ''}` },
    { header: 'Email', accessor: 'email' },
    { header: 'Institución', accessor: 'institucion_nombre', width: '180px' },
    { 
      header: 'Rol', 
      accessor: 'rol_nombre', 
      width: '120px',
      render: (row) => <Badge type={row.rol_nombre === 'SuperAdmin' ? 'presente' : row.rol_nombre === 'Director' ? 'justificada' : 'pendiente'} text={row.rol_nombre || 'Sin Rol'} />
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      width: '160px',
      render: (row) => {
        const role = currentUser?.rol || null;
        const isSuper = role === 'SuperAdmin';
        const isDirector = role === 'Director' && currentUser?.institucion_id === row.institucion;
        const canManage = isSuper || isDirector;
        return (
          <div className="flex gap-2">
            {canManage && <button onClick={() => openEdit(row)} className="text-xs px-2 py-1 bg-yellow-100 rounded">Editar</button>}
            {canManage && <button onClick={() => handleDelete(row.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">Eliminar</button>}
          </div>
        );
      }
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
        <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Gestión de Usuarios y Roles</h1>
        <p className="text-xs text-[#8898aa]">Administre las cuentas de directores, docentes, apoderados y personal administrativo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Column: Data Table */}
        <div className="lg:col-span-2">
          <DataTable
            title="Cuentas del Sistema SIBES 360"
            columns={columns}
            data={usuarios}
            searchField="username"
            onAdd={() => { setEditingUser(null); setIsModalOpen(true); }}
            addLabel="Nuevo Usuario"
          />
        </div>

        {/* Right Column: Mini Info Stats */}
        <div className="space-y-6">
          <KPICard 
            title="Usuarios Activos" 
            value={usuarios.length} 
            subtitle="Cuentas con credenciales JWT" 
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

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}>
        <form onSubmit={editingUser ? handleUpdate : handleAdd} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Usuario (Login)</label>
              <input 
                type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider mb-1.5">Contraseña</label>
              <input 
                type="password" required={!editingUser} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6c63ff] bg-slate-50/10 text-[#1a1f36]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                <option value="">Ninguno / Central</option>
                {instituciones.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-[#6c63ff] text-white rounded-lg text-xs font-bold hover:bg-[#5b52e0] transition-colors mt-2">
            {editingUser ? 'Guardar cambios' : 'Crear Usuario'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;
