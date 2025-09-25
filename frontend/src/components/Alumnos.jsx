// src/components/Alumnos.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alumnosAPI } from '../services/api';
import { Search, Plus, Edit, Trash2, User, Music, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstrumento, setFilterInstrumento] = useState('');
  const [filterNivel, setFilterNivel] = useState('');

  // Instrumentos y niveles disponibles
  const instrumentos = ['Piano', 'Guitarra', 'Violín', 'Batería', 'Canto', 'Flauta', 'Saxofón'];
  const niveles = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'];

  // Cargar alumnos al montar el componente
  useEffect(() => {
    cargarAlumnos();
  }, []);

  const cargarAlumnos = async () => {
    try {
      setLoading(true);
      const response = await alumnosAPI.getAll();
      setAlumnos(response.data);
    } catch (error) {
      toast.error('Error al cargar los alumnos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarAlumno = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;
    
    try {
      await alumnosAPI.delete(id);
      toast.success('Alumno eliminado correctamente');
      cargarAlumnos(); // Recargar lista
    } catch (error) {
      toast.error('Error al eliminar el alumno');
      console.error('Error:', error);
    }
  };

  // Filtrar alumnos según búsqueda y filtros
  const alumnosFiltrados = alumnos.filter(alumno => {
    const coincideNombre = alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideInstrumento = !filterInstrumento || alumno.instrumento === filterInstrumento;
    const coincideNivel = !filterNivel || alumno.nivel === filterNivel;
    
    return coincideNombre && coincideInstrumento && coincideNivel;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header con título y botón agregar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h1>
          <p className="text-gray-600">Total: {alumnosFiltrados.length} alumnos</p>
        </div>
        <Link 
          to="/alumnos/nuevo" 
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Alumno
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda por nombre */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="pl-10 w-full p-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por instrumento */}
          <select 
            className="p-2 border rounded-lg"
            value={filterInstrumento}
            onChange={(e) => setFilterInstrumento(e.target.value)}
          >
            <option value="">Todos los instrumentos</option>
            {instrumentos.map(instr => (
              <option key={instr} value={instr}>{instr}</option>
            ))}
          </select>

          {/* Filtro por nivel */}
          <select 
            className="p-2 border rounded-lg"
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
          >
            <option value="">Todos los niveles</option>
            {niveles.map(nivel => (
              <option key={nivel} value={nivel}>{nivel}</option>
            ))}
          </select>

          {/* Botón limpiar filtros */}
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterInstrumento('');
              setFilterNivel('');
            }}
            className="btn-secondary"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de alumnos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {alumnosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No se encontraron alumnos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instrumento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alumnosFiltrados.map((alumno) => (
                  <tr key={alumno.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {alumno.nombre} {alumno.apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            {alumno.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Music className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-900">{alumno.instrumento}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alumno.nivel === 'Principiante' ? 'bg-green-100 text-green-800' :
                        alumno.nivel === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                        alumno.nivel === 'Avanzado' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <Star size={12} className="mr-1" />
                        {alumno.nivel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alumno.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/alumnos/${alumno.id}`}
                          className="btn-secondary-small flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Ver
                        </Link>
                        <Link
                          to={`/alumnos/editar/${alumno.id}`}
                          className="btn-primary-small flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Editar
                        </Link>
                        <button
                          onClick={() => eliminarAlumno(alumno.id, `${alumno.nombre} ${alumno.apellido}`)}
                          className="btn-danger-small flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumnos;