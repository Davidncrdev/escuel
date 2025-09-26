// backend/routes/export.js
import express from 'express';
import { dbAsync } from '../database.js';

const router = express.Router();

// GET /api/export/alumnos - Exportar alumnos a CSV
router.get('/alumnos', async (req, res) => {
  try {
    const alumnos = await dbAsync.all('SELECT * FROM alumnos ORDER BY nombre, apellido');
    
    let csv = 'ID,Nombre,Apellido,Email,Telefono,Instrumento,Nivel,Observaciones\n';
    
    alumnos.forEach(alumno => {
      csv += `"${alumno.id}","${alumno.nombre}","${alumno.apellido}","${alumno.email}","${alumno.telefono || ''}","${alumno.instrumento || ''}","${alumno.nivel || ''}","${alumno.observaciones || ''}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=alumnos.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exportando alumnos:', error);
    res.status(500).json({ error: 'Error al exportar alumnos' });
  }
});

// GET /api/export/clases - Exportar clases a CSV
router.get('/clases', async (req, res) => {
  try {
    const { fecha } = req.query;
    let query = `
      SELECT c.*, a.nombre as aula_nombre
      FROM clases c
      JOIN aulas a ON c.aula_id = a.id
    `;
    const params = [];
    
    if (fecha) {
      query += ' WHERE c.fecha = ?';
      params.push(fecha);
    }
    
    query += ' ORDER BY c.fecha DESC, c.hora_inicio DESC';
    
    const clases = await dbAsync.all(query, params);
    
    let csv = 'ID,Fecha,Hora Inicio,Hora Fin,Aula,Descripcion\n';
    
    clases.forEach(clase => {
      csv += `"${clase.id}","${clase.fecha}","${clase.hora_inicio}","${clase.hora_fin}","${clase.aula_nombre}","${clase.descripcion || ''}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clases.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exportando clases:', error);
    res.status(500).json({ error: 'Error al exportar clases' });
  }
});

// GET /api/export/alumno/:id/reporte - Reporte individual de alumno
router.get('/alumno/:id/reporte', async (req, res) => {
  try {
    const alumno = await dbAsync.get(
      'SELECT * FROM alumnos WHERE id = ?',
      [req.params.id]
    );
    
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    
    const clases = await dbAsync.all(
      `SELECT c.*, a.nombre as aula_nombre, ca.asistio
       FROM clases c
       JOIN clase_alumnos ca ON c.id = ca.clase_id
       JOIN aulas a ON c.aula_id = a.id
       WHERE ca.alumno_id = ?
       ORDER BY c.fecha DESC`,
      [req.params.id]
    );
    
    const interacciones = await dbAsync.all(
      'SELECT * FROM interacciones WHERE alumno_id = ? ORDER BY fecha DESC',
      [req.params.id]
    );
    
    let csv = `Reporte del Alumno: ${alumno.nombre} ${alumno.apellido}\n`;
    csv += `Email: ${alumno.email}, Teléfono: ${alumno.telefono || 'N/A'}\n`;
    csv += `Instrumento: ${alumno.instrumento || 'N/A'}, Nivel: ${alumno.nivel || 'N/A'}\n\n`;
    
    csv += 'CLASES:\n';
    csv += 'Fecha,Aula,Hora Inicio,Hora Fin,Asistió\n';
    clases.forEach(clase => {
      csv += `"${clase.fecha}","${clase.aula_nombre}","${clase.hora_inicio}","${clase.hora_fin}","${clase.asistio ? 'Sí' : 'No'}"\n`;
    });
    
    csv += '\nINTERACCIONES:\n';
    csv += 'Fecha,Tipo,Descripción\n';
    interacciones.forEach(interaccion => {
      csv += `"${interaccion.fecha}","${interaccion.tipo}","${interaccion.descripcion || ''}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${alumno.nombre}-${alumno.apellido}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exportando reporte:', error);
    res.status(500).json({ error: 'Error al exportar reporte' });
  }
});

export default router;