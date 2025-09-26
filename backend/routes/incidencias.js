// backend/routes/incidencias.js
import express from 'express';
import { dbAsync } from '../database.js';

const router = express.Router();

// GET /api/incidencias - Listar todas las incidencias
router.get('/', async (req, res) => {
  try {
    const incidencias = await dbAsync.all(`
      SELECT i.*, a.nombre as aula_nombre
      FROM incidencias i
      LEFT JOIN aulas a ON i.aula_id = a.id
      ORDER BY i.fecha_reporte DESC
    `);
    res.json(incidencias);
  } catch (error) {
    console.error('Error obteniendo incidencias:', error);
    res.status(500).json({ error: 'Error al obtener incidencias' });
  }
});

// GET /api/incidencias/:id - Obtener incidencia específica
router.get('/:id', async (req, res) => {
  try {
    const incidencia = await dbAsync.get(
      `SELECT i.*, a.nombre as aula_nombre
       FROM incidencias i
       LEFT JOIN aulas a ON i.aula_id = a.id
       WHERE i.id = ?`,
      [req.params.id]
    );
    
    if (!incidencia) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }
    
    res.json(incidencia);
  } catch (error) {
    console.error('Error obteniendo incidencia:', error);
    res.status(500).json({ error: 'Error al obtener incidencia' });
  }
});

// POST /api/incidencias - Crear nueva incidencia
router.post('/', async (req, res) => {
  try {
    const { aula_id, descripcion, estado } = req.body;
    
    if (!descripcion) {
      return res.status(400).json({ error: 'La descripción es requerida' });
    }

    const result = await dbAsync.run(
      'INSERT INTO incidencias (aula_id, descripcion, estado) VALUES (?, ?, ?)',
      [aula_id, descripcion, estado || 'pendiente']
    );

    res.status(201).json({
      message: 'Incidencia creada correctamente',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error creando incidencia:', error);
    res.status(500).json({ error: 'Error al crear incidencia' });
  }
});

// PUT /api/incidencias/:id - Actualizar incidencia
router.put('/:id', async (req, res) => {
  try {
    const { aula_id, descripcion, estado } = req.body;
    
    const result = await dbAsync.run(
      `UPDATE incidencias 
       SET aula_id = ?, descripcion = ?, estado = ?
       WHERE id = ?`,
      [aula_id, descripcion, estado, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }

    res.json({ message: 'Incidencia actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando incidencia:', error);
    res.status(500).json({ error: 'Error al actualizar incidencia' });
  }
});

// DELETE /api/incidencias/:id - Eliminar incidencia
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbAsync.run(
      'DELETE FROM incidencias WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }

    res.json({ message: 'Incidencia eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando incidencia:', error);
    res.status(500).json({ error: 'Error al eliminar incidencia' });
  }
});

// GET /api/incidencias/stats/resumen - Estadísticas de incidencias
router.get('/stats/resumen', async (req, res) => {
  try {
    const stats = await dbAsync.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltas
      FROM incidencias
    `);
    
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;