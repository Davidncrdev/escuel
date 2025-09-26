// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { dbAsync } from "../database.js"; // 👈 asegúrate de que database.js también use export/import

const router = express.Router();

router.get("/login", (req, res) => {
  res.send("Ruta de login funcionando ✅");
});

// Middleware para verificar token (opcional, para rutas protegidas)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Token de acceso requerido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el profesor aún existe en la base de datos
    const professor = await dbAsync.get(
      "SELECT id, nombre, email FROM profesores WHERE id = ?",
      [decoded.id]
    );

    if (!professor) {
      return res.status(401).json({ error: "Profesor no encontrado" });
    }

    req.professor = professor;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// ------------------- Rutas -------------------

// Registro de nuevos profesores
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: "Todos los campos son requeridos",
        campos: { nombre: "Requerido", email: "Requerido", password: "Requerido" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existingProfessor = await dbAsync.get(
      "SELECT id FROM profesores WHERE email = ?",
      [email]
    );

    if (existingProfessor) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await dbAsync.run(
      "INSERT INTO profesores (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.lastID, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Profesor registrado correctamente",
      data: {
        id: result.lastID,
        nombre,
        email,
        token,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);

    if (error.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    res.status(500).json({
      error: "Error interno del servidor",
      detalles: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Login de profesores
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y contraseña son requeridos",
        campos: { email: "Requerido", password: "Requerido" },
      });
    }

    const professor = await dbAsync.get(
      "SELECT * FROM profesores WHERE email = ?",
      [email]
    );

    if (!professor) {
      return res.status(401).json({ success: false, error: "Credenciales inválidas" });
    }

    const validPassword = await bcrypt.compare(password, professor.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: professor.id, email: professor.email, nombre: professor.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        token,
        professor: {
          id: professor.id,
          nombre: professor.nombre,
          email: professor.email,
          creado_en: professor.creado_en,
        },
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      detalles: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Verificar token
router.get("/verify", authenticateToken, async (req, res) => {
  res.json({
    success: true,
    message: "Token válido",
    data: {
      professor: req.professor,
      valid: true,
      expiresIn: "24h",
    },
  });
});

// Obtener perfil
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const professor = await dbAsync.get(
      "SELECT id, nombre, email, creado_en FROM profesores WHERE id = ?",
      [req.professor.id]
    );

    if (!professor) {
      return res.status(404).json({ success: false, error: "Profesor no encontrado" });
    }

    const stats = await dbAsync.get(`
      SELECT 
        (SELECT COUNT(*) FROM alumnos) as total_alumnos,
        (SELECT COUNT(*) FROM clases WHERE fecha >= date('now')) as clases_proximas,
        (SELECT COUNT(*) FROM incidencias WHERE estado = 'pendiente') as incidencias_pendientes
    `);

    res.json({
      success: true,
      data: { professor, estadisticas: stats },
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ success: false, error: "Error al obtener perfil" });
  }
});

// Actualizar perfil
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { nombre, email } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ success: false, error: "Nombre y email son requeridos" });
    }

    const existingProfessor = await dbAsync.get(
      "SELECT id FROM profesores WHERE email = ? AND id != ?",
      [email, req.professor.id]
    );

    if (existingProfessor) {
      return res.status(409).json({ success: false, error: "El email ya está en uso" });
    }

    const result = await dbAsync.run(
      "UPDATE profesores SET nombre = ?, email = ? WHERE id = ?",
      [nombre, email, req.professor.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: "Profesor no encontrado" });
    }

    const updatedProfessor = await dbAsync.get(
      "SELECT id, nombre, email, creado_en FROM profesores WHERE id = ?",
      [req.professor.id]
    );

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: { professor: updatedProfessor },
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ success: false, error: "Error al actualizar perfil" });
  }
});

// Cambiar contraseña
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Contraseña actual y nueva requerida" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const professor = await dbAsync.get(
      "SELECT * FROM profesores WHERE id = ?",
      [req.professor.id]
    );

    const validCurrentPassword = await bcrypt.compare(currentPassword, professor.password);
    if (!validCurrentPassword) {
      return res.status(401).json({ success: false, error: "Contraseña actual incorrecta" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await dbAsync.run(
      "UPDATE profesores SET password = ? WHERE id = ?",
      [hashedNewPassword, req.professor.id]
    );

    res.json({ success: true, message: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    res.status(500).json({ success: false, error: "Error al cambiar contraseña" });
  }
});

// Listar profesores
router.get("/profesores", authenticateToken, async (req, res) => {
  try {
    const profesores = await dbAsync.all(`
      SELECT id, nombre, email, creado_en 
      FROM profesores 
      ORDER BY nombre
    `);

    res.json({ success: true, data: { profesores, total: profesores.length } });
  } catch (error) {
    console.error("Error obteniendo profesores:", error);
    res.status(500).json({ success: false, error: "Error al obtener lista de profesores" });
  }
});

// Logout
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ success: true, message: "Logout exitoso. Elimina el token en el cliente." });
});

// 👇 Exportación correcta para ES Modules
export default router;