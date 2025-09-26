// backend/routes/clases.js
import express from 'express';
import { dbAsync } from '../database.js';

const router = express.Router();

// GET /api/clases - Listar clases con filtros
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    let query = `
      SELECT c.*, a.nombre as aula_nombre
      FROM clases c
      JOIN aulas a ON c.aula_id = a.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (fecha) {
      query += ' AND c.fecha = ?';
      params.push(fecha);
    }
    
    query += ' ORDER BY c.fecha DESC, c.hora_inicio DESC';
    
    const clases = await dbAsync.all(query, params);
    res.json(clases);
  } catch (error) {
    console.error('Error obteniendo clases:', error);
    res.status(500).json({ error: 'Error al obtener clases' });
  }
});

// GET /api/clases/:id - Detalle de clase con alumnos
router.get('/:id', async (req, res) => {
  try {
    const clase = await dbAsync.get(
      `SELECT c.*, a.nombre as aula_nombre 
       FROM clases c 
       JOIN aulas a ON c.aula_id = a.id 
       WHERE c.id = ?`,
      [req.params.id]
    );
    
    if (!clase) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }
    
    const alumnos = await dbAsync.all(
      `SELECT a.*, ca.asistio 
       FROM alumnos a
       JOIN clase_alumnos ca ON a.id = ca.alumno_id
       WHERE ca.clase_id = ?`,
      [req.params.id]
    );
    
    res.json({ ...clase, alumnos });
  } catch (error) {
    console.error('Error obteniendo clase:', error);
    res.status(500).json({ error: 'Error al obtener clase' });
  }
});

// POST /api/clases - Crear nueva clase
router.post('/', async (req, res) => {
  try {
    const { fecha, hora_inicio, hora_fin, aula_id, alumno_ids, descripcion } = req.body;
    
    // Validar conflicto de horario en el aula
    const conflicto = await dbAsync.get(
      `SELECT id FROM clases 
       WHERE aula_id = ? AND fecha = ? 
       AND ((hora_inicio BETWEEN ? AND ?) OR (hora_fin BETWEEN ? AND ?))`,
      [aula_id, fecha, hora_inicio, hora_fin, hora_inicio, hora_fin]
    );
    
    if (conflicto) {
      return res.status(400).json({ error: 'El aula está ocupada en ese horario' });
    }
    
    // Crear la clase
    const result = await dbAsync.run(
      `INSERT INTO clases (fecha, hora_inicio, hora_fin, aula_id, descripcion) 
       VALUES (?, ?, ?, ?, ?)`,
      [fecha, hora_inicio, hora_fin, aula_id, descripcion]
    );
    
    const claseId = result.lastID;
    
    // Asignar alumnos a la clase
    if (alumno_ids && alumno_ids.length > 0) {
      for (const alumnoId of alumno_ids) {
        await dbAsync.run(
          'INSERT INTO clase_alumnos (clase_id, alumno_id) VALUES (?, ?)',
          [claseId, alumnoId]
        );
      }
    }
    
    res.status(201).json({
      message: 'Clase creada correctamente',
      id: claseId
    });
  } catch (error) {
    console.error('Error creando clase:', error);
    res.status(500).json({ error: 'Error al crear clase' });
  }
});

// PUT /api/clases/:id - Actualizar clase
router.put('/:id', async (req, res) => {
  try {
    const { fecha, hora_inicio, hora_fin, aula_id, descripcion } = req.body;
    
    // Validar conflicto de horario (excluyendo la clase actual)
    const conflicto = await dbAsync.get(
      `SELECT id FROM clases 
       WHERE aula_id = ? AND fecha = ? AND id != ?
       AND ((hora_inicio BETWEEN ? AND ?) OR (hora_fin BETWEEN ? AND ?))`,
      [aula_id, fecha, req.params.id, hora_inicio, hora_fin, hora_inicio, hora_fin]
    );
    
    if (conflicto) {
      return res.status(400).json({ error: 'El aula está ocupada en ese horario' });
    }
    
    const result = await dbAsync.run(
      `UPDATE clases 
       SET fecha = ?, hora_inicio = ?, hora_fin = ?, aula_id = ?, descripcion = ?
       WHERE id = ?`,
      [fecha, hora_inicio, hora_fin, aula_id, descripcion, req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }
    
    res.json({ message: 'Clase actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando clase:', error);
    res.status(500).json({ error: 'Error al actualizar clase' });
  }
});

// DELETE /api/clases/:id - Eliminar clase
router.delete('/:id', async (req, res) => {
  try {
    // Primero eliminar las relaciones con alumnos
    await dbAsync.run('DELETE FROM clase_alumnos WHERE clase_id = ?', [req.params.id]);
    
    // Luego eliminar la clase
    const result = await dbAsync.run('DELETE FROM clases WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }
    
    res.json({ message: 'Clase eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando clase:', error);
    res.status(500).json({ error: 'Error al eliminar clase' });
  }
});

export default router;