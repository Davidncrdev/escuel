import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alumnosAPI, clasesAPI, incidenciasAPI } from '../services/api';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Music,
  Clock,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAlumnos: 0,
    clasesHoy: 0,
    incidenciasPendientes: 0,
    loading: true
  });
  const [proximasClases, setProximasClases] = useState([]);
  const [incidenciasRecientes, setIncidenciasRecientes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar estadísticas básicas
      const [alumnosRes, clasesRes, incidenciasRes] = await Promise.all([
        alumnosAPI.getAll(),
        clasesAPI.getAll(),
        incidenciasAPI.getAll()
      ]);

      // Calcular clases de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const clasesHoy = clasesRes.data.filter(clase => clase.fecha === hoy);

      // Incidencias pendientes
      const incidenciasPendientes = incidenciasRes.data.filter(inc => !inc.resuelto);

      setStats({
        totalAlumnos: alumnosRes.data.length,
        clasesHoy: clasesHoy.length,
        incidenciasPendientes: incidenciasPendientes.length,
        loading: false
      });

      // Próximas clases (próximos 3 días)
      const proximasFechas = [];
      for (let i = 0; i < 3; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + i);
        proximasFechas.push(fecha.toISOString().split('T')[0]);
      }
      
      const proximasClasesData = clasesRes.data
        .filter(clase => proximasFechas.includes(clase.fecha))
        .sort((a, b) => new Date(a.fecha + 'T' + a.hora_inicio) - new Date(b.fecha + 'T' + b.hora_inicio))
        .slice(0, 5);

      setProximasClases(proximasClasesData);

      // Incidencias recientes (últimas 3)
      const incidenciasRecientesData = incidenciasRes.data
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 3);

      setIncidenciasRecientes(incidenciasRecientesData);

    } catch (error) {
      console.error('Error cargando datos:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatearHora = (hora) => {
    return hora.substring(0, 5);
  };

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Resumen general de la escuela de música
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Alumnos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalAlumnos}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/alumnos" className="font-medium text-indigo-700 hover:text-indigo-900">
                Ver todos los alumnos
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clases Hoy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.clasesHoy}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/clases" className="font-medium text-indigo-700 hover:text-indigo-900">
                Ver todas las clases
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Incidencias Pendientes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.incidenciasPendientes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/incidencias" className="font-medium text-indigo-700 hover:text-indigo-900">
                Ver incidencias
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Estado General
                  </dt>
                  <dd className="text-lg font-medium text-green-600">
                    Operativo
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones de información */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Próximas clases */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Próximas Clases
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Clases programadas para los próximos días
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {proximasClases.length > 0 ? proximasClases.map((clase) => (
              <li key={clase.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Music className="flex-shrink-0 h-5 w-5 text-indigo-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {clase.tipo_instrumento}
                      </p>
                      <p className="text-sm text-gray-500">
                        Aula {clase.aula_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {formatearFecha(clase.fecha)} - {formatearHora(clase.hora_inicio)}
                  </div>
                </div>
              </li>
            )) : (
              <li className="px-4 py-4 text-center text-gray-500">
                No hay clases programadas
              </li>
            )}
          </ul>
          <div className="bg-gray-50 px-4 py-3">
            <div className="text-sm">
              <Link to="/clases" className="font-medium text-indigo-700 hover:text-indigo-900">
                Ver todas las clases →
              </Link>
            </div>
          </div>
        </div>

        {/* Incidencias recientes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Incidencias Recientes
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Últimas incidencias reportadas
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {incidenciasRecientes.length > 0 ? incidenciasRecientes.map((incidencia) => (
              <li key={incidencia.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {incidencia.resuelto ? (
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="flex-shrink-0 h-5 w-5 text-yellow-400" />
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {incidencia.titulo}
                      </p>
                      <p className="text-sm text-gray-500">
                        Aula {incidencia.aula_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    {formatearFecha(incidencia.fecha)}
                  </div>
                </div>
              </li>
            )) : (
              <li className="px-4 py-4 text-center text-gray-500">
                No hay incidencias registradas
              </li>
            )}
          </ul>
          <div className="bg-gray-50 px-4 py-3">
            <div className="text-sm">
              <Link to="/incidencias" className="font-medium text-indigo-700 hover:text-indigo-900">
                Ver todas las incidencias →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;