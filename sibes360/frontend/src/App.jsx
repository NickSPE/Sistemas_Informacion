import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ParentLayout from './layouts/ParentLayout';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardPadre from './pages/portal/DashboardPadre';
import AsistenciaPadre from './pages/portal/AsistenciaPadre';
import NotasPadre from './pages/portal/NotasPadre';
import ConductaPadre from './pages/portal/ConductaPadre';
import PagosPadre from './pages/portal/PagosPadre';
import Instituciones from './pages/Instituciones';
import GestionarInstitucion from './pages/GestionarInstitucion';
import Usuarios from './pages/Usuarios';
import Estudiantes from './pages/Estudiantes';
import Apoderados from './pages/Apoderados';
import Docentes from './pages/Docentes';
import Matricula from './pages/Matricula';
import Academico from './pages/Academico';
import Horarios from './pages/Horarios';
import Asistencia from './pages/Asistencia';
import Notas from './pages/Notas';
import Libretas from './pages/Libretas';
import Conducta from './pages/Conducta';
import Pagos from './pages/Pagos';
import Comunicacion from './pages/Comunicacion';
import Alertas from './pages/Alertas';
import Reportes from './pages/Reportes';
import Analisis from './pages/Analisis';
import Configuracion from './pages/Configuracion';

// Protected Route Wrapper para Administradores y Profesores
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.rol === 'Apoderado') {
    return <Navigate to="/portal-familia" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Protected Route Wrapper para Apoderados
const ParentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.rol !== 'Apoderado') {
    return <Navigate to="/dashboard" replace />;
  }

  return <ParentLayout>{children}</ParentLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication page */}
          <Route path="/login" element={<Login />} />

          {/* Protected Main pages */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/instituciones" element={<ProtectedRoute><Instituciones /></ProtectedRoute>} />
          <Route path="/instituciones/:id/gestionar" element={<ProtectedRoute><GestionarInstitucion /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          <Route path="/estudiantes" element={<ProtectedRoute><Estudiantes /></ProtectedRoute>} />
          <Route path="/apoderados" element={<ProtectedRoute><Apoderados /></ProtectedRoute>} />
          <Route path="/docentes" element={<ProtectedRoute><Docentes /></ProtectedRoute>} />
          <Route path="/matricula" element={<ProtectedRoute><Matricula /></ProtectedRoute>} />
          <Route path="/academico" element={<ProtectedRoute><Academico /></ProtectedRoute>} />
          <Route path="/horarios" element={<ProtectedRoute><Horarios /></ProtectedRoute>} />
          <Route path="/asistencia" element={<ProtectedRoute><Asistencia /></ProtectedRoute>} />
          <Route path="/notas" element={<ProtectedRoute><Notas /></ProtectedRoute>} />
          <Route path="/libretas" element={<ProtectedRoute><Libretas /></ProtectedRoute>} />
          <Route path="/conducta" element={<ProtectedRoute><Conducta /></ProtectedRoute>} />
          <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>} />
          <Route path="/comunicacion" element={<ProtectedRoute><Comunicacion /></ProtectedRoute>} />
          <Route path="/alertas" element={<ProtectedRoute><Alertas /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
          <Route path="/analisis" element={<ProtectedRoute><Analisis /></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />

          {/* Protected Parent Portal pages */}
          <Route path="/portal-familia" element={<ParentRoute><DashboardPadre /></ParentRoute>} />
          <Route path="/portal-familia/asistencia" element={<ParentRoute><AsistenciaPadre /></ParentRoute>} />
          <Route path="/portal-familia/notas" element={<ParentRoute><NotasPadre /></ParentRoute>} />
          <Route path="/portal-familia/conducta" element={<ParentRoute><ConductaPadre /></ParentRoute>} />
          <Route path="/portal-familia/pagos" element={<ParentRoute><PagosPadre /></ParentRoute>} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
