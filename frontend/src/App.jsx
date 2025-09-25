// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Alumnos from './components/Alumnos';
import AlumnoForm from './components/AlumnoForm';
import AlumnoDetalle from './components/AlumnoDetalle';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Ruta de login pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Redirección automática desde / a /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="alumnos" element={<Alumnos />} />
            <Route path="alumnos/nuevo" element={<AlumnoForm />} />
            <Route path="alumnos/editar/:id" element={<AlumnoForm />} />
            <Route path="alumnos/:id" element={<AlumnoDetalle />} />
            
            {/* Rutas para futuros componentes */}
            <Route path="*" element={
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Página en desarrollo</h2>
                  <p className="text-gray-600">Esta sección estará disponible pronto</p>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;