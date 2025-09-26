// backend/database.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'escuela-musica.db');

// Asegurar que el directorio data existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('📁 Base de datos:', dbPath);

// Crear conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a SQLite:', err.message);
  } else {
    console.log('✅ Conectado a SQLite local');
    // Habilitar claves foráneas
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Conversión a promesas para usar async/await
const dbAsync = {
  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Error en db.all:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  }),
  
  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('❌ Error en db.get:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  }),
  
  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Error en db.run:', err.message);
        reject(err);
      } else {
        resolve({ 
          lastID: this.lastID, 
          changes: this.changes 
        });
      }
    });
  }),
  
  exec: (sql) => new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        console.error('❌ Error en db.exec:', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  })
};

// Función para probar conexión
const testConnection = () => {
  return new Promise((resolve) => {
    db.get('SELECT 1 as test', (err) => {
      if (err) {
        console.error('❌ Error probando conexión:', err.message);
        resolve(false);
      } else {
        console.log('✅ Conexión a BD verificada');
        resolve(true);
      }
    });
  });
};

// Exportar correctamente para ES modules
export { db, dbAsync, testConnection };