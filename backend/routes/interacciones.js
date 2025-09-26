// backend/routes/interacciones.js
import express from 'express';
import { dbAsync } from '../database.js';

const router = express.Router();

// GET /api/interacciones - Listar todas las interacciones
router.get('/', async (req, res) => {
  try {
    const interacciones = await dbAsync.all(`
      SELECT i.*, a.nombre as alumno_nombre, a.apellido as alumno_apellido
      FROM interacciones i
      JOIN alumnos a ON i.alumno_id = a.id
      ORDER BY i.fecha DESC
    `);
    res.json(interacciones);
  } catch (error) {
    console.error('Error obteniendo interacciones:', error);
    res.status(500).json({ error: 'Error al obtener interacciones' });
  }
});

// GET /api/interacciones/:id - Obtener interacción específica
router.get('/:id', async (req, res) => {
  try {
    const interaccion = await dbAsync.get(
      `SELECT i.*, a.nombre as alumno_nombre, a.apellido as alumno_apellido
       FROM interacciones i
       JOIN alumnos a ON i.alumno_id = a.id
       WHERE i.id = ?`,
      [req.params.id]
    );
    
    if (!interaccion) {
      return res.status(404).json({ error: 'Interacción no encontrada' });
    }
    
    res.json(interaccion);
  } catch (error) {
    console.error('Error obteniendo interacción:', error);
    res.status(500).json({ error: 'Error al obtener interacción' });
  }
});

// POST /api/interacciones - Crear nueva interacción
router.post('/', async (req, res) => {
  try {
    const { alumno_id, tipo, descripcion, fecha } = req.body;
    
    if (!alumno_id || !tipo) {
      return res.status(400).json({ error: 'Alumno ID y tipo son requeridos' });
    }

    const result = await dbAsync.run(
      'INSERT INTO interacciones (alumno_id, tipo, descripcion, fecha) VALUES (?, ?, ?, ?)',
      [alumno_id, tipo, descripcion, fecha || new Date().toISOString().split('T')[0]]
    );

    res.status(201).json({
      message: 'Interacción creada correctamente',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error creando interacción:', error);
    res.status(500).json({ error: 'Error al crear interacción' });
  }
});

// PUT /api/interacciones/:id - Actualizar interacción
router.put('/:id', async (req, res) => {
  try {
    const { alumno_id, tipo, descripcion, fecha } = req.body;
    
    const result = await dbAsync.run(
      `UPDATE interacciones 
       SET alumno_id = ?, tipo = ?, descripcion = ?, fecha = ?
       WHERE id = ?`,
      [alumno_id, tipo, descripcion, fecha, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Interacción no encontrada' });
    }

    res.json({ message: 'Interacción actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando interacción:', error);
    res.status(500).json({ error: 'Error al actualizar interacción' });
  }
});

// DELETE /api/interacciones/:id - Eliminar interacción
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbAsync.run(
      'DELETE FROM interacciones WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Interacción no encontrada' });
    }

    res.json({ message: 'Interacción eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando interacción:', error);
    res.status(500).json({ error: 'Error al eliminar interacción' });
  }
});

export default router;