/**
 * Modelo de Acceso a Datos para Estudiantes
 * 
 * Implementa consultas preparadas (Prepared Statements) para prevenir SQL Injection (RNF-03).
 */

import { db } from '../config/database.js';

export const EstudianteModel = {
  /**
   * Inserta un nuevo estudiante con su contraseña ya hasheada.
   * @param {Object} datos
   * @param {string} datos.nombreCompleto
   * @param {string} datos.correo
   * @param {string} datos.contrasenaHash
   * @param {string} [datos.rol='estudiante']
   * @returns {Object} Datos del estudiante creado (excluyendo el hash)
   */
  crear({ nombreCompleto, correo, contrasenaHash, rol = 'estudiante' }) {
    const stmt = db.prepare(`
      INSERT INTO estudiantes (nombre_completo, correo, contrasena_hash, rol)
      VALUES (?, ?, ?, ?)
    `);

    const info = stmt.run(nombreCompleto, correo, contrasenaHash, rol);

    return {
      id: Number(info.lastInsertRowid),
      nombre_completo: nombreCompleto,
      correo: correo,
      rol: rol
    };
  },

  /**
   * Busca un estudiante por su correo electrónico (incluye contrasena_hash para autenticación interna).
   * @param {string} correo
   * @returns {Object|null}
   */
  buscarPorCorreo(correo) {
    const stmt = db.prepare(`
      SELECT id, nombre_completo, correo, contrasena_hash, rol, created_at, universidad_id, carrera_id
      FROM estudiantes
      WHERE correo = ?
    `);

    return stmt.get(correo) || null;
  },

  /**
   * Busca un estudiante por su ID excluyendo la contraseña por seguridad.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarPorId(id) {
    const stmt = db.prepare(`
      SELECT id, nombre_completo, correo, rol, created_at, universidad_id, carrera_id
      FROM estudiantes
      WHERE id = ?
    `);

    return stmt.get(id) || null;
  },

  /**
   * Verifica si ya existe un estudiante registrado con el correo indicado.
   * @param {string} correo
   * @returns {boolean}
   */
  existeCorreo(correo) {
    const stmt = db.prepare(`
      SELECT 1 FROM estudiantes WHERE correo = ? LIMIT 1
    `);

    return Boolean(stmt.get(correo));
  },

  /**
   * Actualiza la meta académica del estudiante (universidad y carrera objetivo).
   * @param {number|string} estudianteId
   * @param {Object} meta
   * @param {number} meta.universidadId
   * @param {number} meta.carreraId
   * @returns {boolean}
   */
  actualizarPerfilAcademico(estudianteId, { universidadId, carreraId }) {
    const stmt = db.prepare(`
      UPDATE estudiantes
      SET universidad_id = ?, carrera_id = ?
      WHERE id = ?
    `);

    const info = stmt.run(universidadId, carreraId, estudianteId);
    return info.changes > 0;
  },

  /**
   * Obtiene la información académica del estudiante con JOIN a universidades y carreras.
   * @param {number|string} estudianteId
   * @returns {Object|null}
   */
  obtenerPerfilAcademico(estudianteId) {
    const stmt = db.prepare(`
      SELECT 
        e.id AS estudiante_id,
        e.nombre_completo,
        e.correo,
        e.universidad_id,
        e.carrera_id,
        u.id AS u_id,
        u.nombre AS u_nombre,
        u.siglas AS u_siglas,
        c.id AS c_id,
        c.nombre AS c_nombre
      FROM estudiantes e
      LEFT JOIN universidades u ON e.universidad_id = u.id
      LEFT JOIN carreras c ON e.carrera_id = c.id
      WHERE e.id = ?
    `);

    const row = stmt.get(estudianteId);
    if (!row) return null;

    const configurado = Boolean(row.universidad_id && row.carrera_id);

    return {
      estudiante_id: row.estudiante_id,
      nombre_completo: row.nombre_completo,
      correo: row.correo,
      universidad: configurado ? {
        id: row.u_id,
        nombre: row.u_nombre,
        siglas: row.u_siglas
      } : null,
      carrera: configurado ? {
        id: row.c_id,
        nombre: row.c_nombre
      } : null,
      configurado
    };
  }
};

export default EstudianteModel;
