// src/components/AlumnoForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { alumnosAPI } from '../services/api';
import { ArrowLeft, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AlumnoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    instrumento: '',
    nivel: '',
    observaciones: ''
  });

  const instrumentos = ['Piano', 'Guitarra', 'Violín', 'Batería', 'Canto', 'Flauta', 'Saxofón'];
  const niveles = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'];

  // Cargar datos del alumno si estamos editando
  useEffect(() => {
    if (isEditing) {
      cargarAlumno();
    }
  }, [id]);

  const cargarAlumno = async () => {
    try {
      setLoading(true);
      const response = await alumnosAPI.getById(id);
      setFormData(response.data);
    } catch (error) {
      toast.error('Error al cargar el alumno');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.instrumento) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        await alumnosAPI.update(id, formData);
        toast.success('Alumno actualizado correctamente');
      } else {
        await alumnosAPI.create(formData);
        toast.success('Alumno creado correctamente');
      }
      
      navigate('/alumnos');
    } catch (error) {
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el alumno`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/alumnos" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={20} />
          Volver
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifica la información del alumno' : 'Agrega un nuevo alumno al sistema'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Instrumento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrumento *
              </label>
              <select
                name="instrumento"
                value={formData.instrumento}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Seleccionar instrumento</option>
                {instrumentos.map(instr => (
                  <option key={instr} value={instr}>{instr}</option>
                ))}
              </select>
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel
              </label>
              <select
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Seleccionar nivel</option>
                {niveles.map(nivel => (
                  <option key={nivel} value={nivel}>{nivel}</option>
                ))}
              </select>
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded-lg"
                placeholder="Notas adicionales sobre el alumno..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <Link to="/alumnos" className="btn-secondary">
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Alumno')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlumnoForm;