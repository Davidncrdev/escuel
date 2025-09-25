// src/components/AlumnoDetalle.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AlumnoDetalle = () => {
  const { id } = useParams();
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/alumnos" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={20} />
          Volver a Alumnos
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Alumno</h1>
          <p className="text-gray-600">ID: {id} - Vista en desarrollo</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <p className="text-gray-600">La vista detallada del alumno estará disponible en la próxima actualización.</p>
      </div>
    </div>
  );
};

export default AlumnoDetalle;