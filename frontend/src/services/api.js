import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify'),
};

// Servicios de alumnos
export const alumnosAPI = {
  getAll: () => api.get('/alumnos'),
  getById: (id) => api.get(`/alumnos/${id}`),
  create: (alumnoData) => api.post('/alumnos', alumnoData),
  update: (id, alumnoData) => api.put(`/alumnos/${id}`, alumnoData),
  delete: (id) => api.delete(`/alumnos/${id}`),
  getInteracciones: (id) => api.get(`/alumnos/${id}/interacciones`),
  getClases: (id) => api.get(`/alumnos/${id}/clases`),
};

// Servicios de profesores
export const profesoresAPI = {
  getAll: () => api.get('/profesores'),
  getById: (id) => api.get(`/profesores/${id}`),
  getClases: (id) => api.get(`/profesores/${id}/clases`),
  getAulasDisponibles: () => api.get('/profesores/aulas/disponibles'),
};

// Servicios de clases
export const clasesAPI = {
  getAll: (params = {}) => api.get('/clases', { params }),
  getById: (id) => api.get(`/clases/${id}`),
  create: (claseData) => api.post('/clases', claseData),
  update: (id, claseData) => api.put(`/clases/${id}`, claseData),
  delete: (id) => api.delete(`/clases/${id}`),
  updateAsistencia: (claseId, alumnoId, asistio) => 
    api.put(`/clases/${claseId}/asistencia/${alumnoId}`, { asistio }),
};

// Servicios de interacciones
export const interaccionesAPI = {
  getAll: () => api.get('/interacciones'),
  getById: (id) => api.get(`/interacciones/${id}`),
  create: (interaccionData) => api.post('/interacciones', interaccionData),
  update: (id, interaccionData) => api.put(`/interacciones/${id}`, interaccionData),
  delete: (id) => api.delete(`/interacciones/${id}`),
};

// Servicios de incidencias
export const incidenciasAPI = {
  getAll: (params = {}) => api.get('/incidencias', { params }),
  getById: (id) => api.get(`/incidencias/${id}`),
  create: (incidenciaData) => api.post('/incidencias', incidenciaData),
  update: (id, incidenciaData) => api.put(`/incidencias/${id}`, incidenciaData),
  delete: (id) => api.delete(`/incidencias/${id}`),
  updateEstado: (id, resuelto) => api.patch(`/incidencias/${id}/estado`, { resuelto }),
  getStats: () => api.get('/incidencias/stats/resumen'),
};

// Servicios de exportación
export const exportAPI = {
  alumnos: () => api.get('/export/alumnos', { responseType: 'blob' }),
  clases: (fechaInicio, fechaFin) => api.get('/export/clases', { 
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    responseType: 'blob' 
  }),
  interacciones: () => api.get('/export/interacciones', { responseType: 'blob' }),
  incidencias: () => api.get('/export/incidencias', { responseType: 'blob' }),
  alumnoReporte: (id) => api.get(`/export/alumno/${id}/reporte`, { responseType: 'blob' }),
};

// Función helper para descargar archivos
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;