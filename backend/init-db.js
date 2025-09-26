// backend/init-db.js
import { dbAsync } from './database.js';
import bcrypt from 'bcryptjs';

async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando base de datos...');

    // 1. Tabla de profesores
    await dbAsync.exec(`
      CREATE TABLE IF NOT EXISTS profesores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Tabla de aulas
    await dbAsync.exec(`
      CREATE TABLE IF NOT EXISTS aulas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        capacidad INTEGER,
        descripcion TEXT
      )
    `);

    // 3. Tabla de alumnos
    await dbAsync.exec(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        email TEXT NOT NULL,
        telefono TEXT,
        instrumento TEXT,
        nivel TEXT DEFAULT 'Principiante',
        observaciones TEXT,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Tabla de clases
    await dbAsync.exec(`
      CREATE TABLE IF NOT EXISTS clases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        aula_id INTEGER,
        descripcion TEXT,
        FOREIGN KEY (aula_id) REFERENCES aulas (id)
      )
    `);

    // 5. Tabla relación clases-alumnos
    await dbAsync.exec(`
      CREATE TABLE IF NOT EXISTS clase_alumnos (
        clase_id INTEGER,
        alumno_id INTEGER,
        asistio BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (clase_id, alumno_id),
        FOREIGN KEY (clase_id) REFERENCES clases (id),
        FOREIGN KEY (alumno_id) REFERENCES alumnos (id)
      )
    `);

    // 6. Tabla de interacciones
    await dbAsync.exec(`
      CREATE TABLE IF NOT EXISTS interacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alumno_id INTEGER,
        tipo TEXT NOT NULL,
        descripcion TEXT,
        fecha DATE DEFAULT CURRENT_DATE,
        FOREIGN KEY (alumno_id) REFERENCES alumnos (id)
      )
    `);

    // 7. Tabla de incidencias
    await dbAsync.exec(`
      CREATE TABLE IF NOT EXISTS incidencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aula_id INTEGER,
        descripcion TEXT NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        fecha_reporte DATE DEFAULT CURRENT_DATE,
        FOREIGN KEY (aula_id) REFERENCES aulas (id)
      )
    `);

    // Insertar datos iniciales
    await insertInitialData();
    
    console.log('✅ Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    return false;
  }
}

async function insertInitialData() {
  try {
    // Insertar aulas
    const aulasCount = await dbAsync.get('SELECT COUNT(*) as count FROM aulas');
    if (aulasCount.count === 0) {
      await dbAsync.run('INSERT INTO aulas (nombre, capacidad, descripcion) VALUES (?, ?, ?)', 
        ['Aula 1', 10, 'Aula principal']);
      await dbAsync.run('INSERT INTO aulas (nombre, capacidad, descripcion) VALUES (?, ?, ?)', 
        ['Aula 2', 8, 'Aula de práctica']);
      await dbAsync.run('INSERT INTO aulas (nombre, capacidad, descripcion) VALUES (?, ?, ?)', 
        ['Aula 3', 6, 'Aula individual']);
      console.log('✅ Aulas insertadas');
    }

    // Insertar profesor admin
    const profCount = await dbAsync.get('SELECT COUNT(*) as count FROM profesores');
    if (profCount.count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await dbAsync.run(
        'INSERT INTO profesores (nombre, email, password) VALUES (?, ?, ?)',
        ['Administrador', 'admin@escuela.com', hashedPassword]
      );
      console.log('✅ Usuario admin creado');
    }

    // Insertar alumnos de ejemplo
    const alumnosCount = await dbAsync.get('SELECT COUNT(*) as count FROM alumnos');
    if (alumnosCount.count === 0) {
      const alumnosEjemplo = [
        ['María', 'Gómez', 'maria@email.com', '123-456-789', 'Piano', 'Intermedio'],
        ['Carlos', 'López', 'carlos@email.com', '123-456-780', 'Guitarra', 'Principiante'],
        ['Ana', 'Martínez', 'ana@email.com', '123-456-781', 'Violín', 'Avanzado']
      ];
      
      for (const alumno of alumnosEjemplo) {
        await dbAsync.run(
          'INSERT INTO alumnos (nombre, apellido, email, telefono, instrumento, nivel) VALUES (?, ?, ?, ?, ?, ?)',
          alumno
        );
      }
      console.log('✅ Alumnos de ejemplo insertados');
    }

  } catch (error) {
    console.error('Error insertando datos iniciales:', error);
  }
}

export default initializeDatabase;