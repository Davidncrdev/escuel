// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();
const PORT = process.env.PORT || 3000;

// Importar rutas
import authRoutes from './routes/auth.js';
import alumnosRoutes from './routes/alumnos.js';
import clasesRoutes from './routes/clases.js';
import interaccionesRoutes from './routes/interacciones.js';
import incidenciasRoutes from './routes/incidencias.js';
import exportRoutes from './routes/export.js';

// Importar inicialización de BD
import initializeDatabase from './init-db.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/clases', clasesRoutes);
app.use('/api/interacciones', interaccionesRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/export', exportRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de escuela de música funcionando',
    database: 'SQLite local',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba de base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const { dbAsync } = await import('./database.js');
    const result = await dbAsync.get('SELECT 1 as test, datetime() as current_time');
    res.json({ 
      database: 'Conectado correctamente',
      test: result 
    });
  } catch (error) {
    res.status(500).json({ 
      database: 'Error de conexión',
      error: error.message 
    });
  }
});

// Ruta para información del sistema
app.get('/api/info', async (req, res) => {
  try {
    const { dbAsync } = await import('./database.js');
    
    const tables = await dbAsync.all(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    
    const tableCounts = {};
    for (const table of tables) {
      const count = await dbAsync.get(`SELECT COUNT(*) as count FROM ${table.name}`);
      tableCounts[table.name] = count.count;
    }
    
    res.json({
      sistema: 'Escuela de Música API',
      version: '1.0.0',
      base_datos: 'SQLite local',
      tablas: tableCounts,
      credenciales: {
        admin: 'admin@escuela.com / admin123'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    disponible: `${req.protocol}://${req.get('host')}/api/health`
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    detalles: process.env.NODE_ENV === 'development' ? error.message : 'Contacta al administrador'
  });
});

// Inicializar y arrancar el servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor de escuela de música...');
    
    // Inicializar base de datos
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      throw new Error('No se pudo inicializar la base de datos');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n🎵 ====================================');
      console.log('🎵  ESCUELA DE MÚSICA - BACKEND');
      console.log('🎵 ====================================');
      console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📊 Base de datos: SQLite local`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);
      console.log(`🔗 Info sistema: http://localhost:${PORT}/api/info`);
      console.log(`👤 Admin: admin@escuela.com / admin123`);
      console.log('🎵 ====================================\n');
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();