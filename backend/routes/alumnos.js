// backend/routes/alumnos.js
import express from 'express';
import { dbAsync } from '../database.js';

const router = express.Router();

// GET /api/alumnos - Listar todos los alumnos
router.get('/', async (req, res) => {
  try {
    const alumnos = await dbAsync.all(`
      SELECT * FROM alumnos 
      ORDER BY nombre, apellido
    `);
    res.json(alumnos);
  } catch (error) {
    console.error('Error obteniendo alumnos:', error);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});

// GET /api/alumnos/:id - Obtener alumno específico
router.get('/:id', async (req, res) => {
  try {
    const alumno = await dbAsync.get(
      'SELECT * FROM alumnos WHERE id = ?',
      [req.params.id]
    );
    
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    
    res.json(alumno);
  } catch (error) {
    console.error('Error obteniendo alumno:', error);
    res.status(500).json({ error: 'Error al obtener alumno' });
  }
});

// POST /api/alumnos - Crear nuevo alumno
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, instrumento, nivel, observaciones } = req.body;
    
    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: 'Nombre, apellido y email son requeridos' });
    }

    const result = await dbAsync.run(
      `INSERT INTO alumnos (nombre, apellido, email, telefono, instrumento, nivel, observaciones) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, email, telefono, instrumento, nivel, observaciones]
    );

    res.status(201).json({
      message: 'Alumno creado correctamente',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error creando alumno:', error);
    res.status(500).json({ error: 'Error al crear alumno' });
  }
});

// PUT /api/alumnos/:id - Actualizar alumno
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, instrumento, nivel, observaciones } = req.body;
    
    const result = await dbAsync.run(
      `UPDATE alumnos 
       SET nombre = ?, apellido = ?, email = ?, telefono = ?, instrumento = ?, nivel = ?, observaciones = ?
       WHERE id = ?`,
      [nombre, apellido, email, telefono, instrumento, nivel, observaciones, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    res.json({ message: 'Alumno actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando alumno:', error);
    res.status(500).json({ error: 'Error al actualizar alumno' });
  }
});

// DELETE /api/alumnos/:id - Eliminar alumno
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbAsync.run(
      'DELETE FROM alumnos WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    res.json({ message: 'Alumno eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando alumno:', error);
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
});

// GET /api/alumnos/:id/interacciones - Interacciones del alumno
router.get('/:id/interacciones', async (req, res) => {
  try {
    const interacciones = await dbAsync.all(
      `SELECT i.* 
       FROM interacciones i
       WHERE i.alumno_id = ?
       ORDER BY i.fecha DESC`,
      [req.params.id]
    );
    res.json(interacciones);
  } catch (error) {
    console.error('Error obteniendo interacciones:', error);
    res.status(500).json({ error: 'Error al obtener interacciones' });
  }
});

// GET /api/alumnos/:id/clases - Clases del alumno
router.get('/:id/clases', async (req, res) => {
  try {
    const clases = await dbAsync.all(
      `SELECT c.*, a.nombre as aula_nombre, ca.asistio
       FROM clases c
       JOIN clase_alumnos ca ON c.id = ca.clase_id
       JOIN aulas a ON c.aula_id = a.id
       WHERE ca.alumno_id = ?
       ORDER BY c.fecha DESC, c.hora_inicio DESC`,
      [req.params.id]
    );
    res.json(clases);
  } catch (error) {
    console.error('Error obteniendo clases:', error);
    res.status(500).json({ error: 'Error al obtener clases' });
  }
});

export default router;