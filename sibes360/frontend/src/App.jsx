import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Instituciones from './pages/Instituciones';
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

// Protected Route Wrapper
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

  return <Layout>{children}</Layout>;
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
