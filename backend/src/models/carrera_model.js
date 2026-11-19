/**
 * Modelo de Acceso a Datos para Carreras Profesionales
 * 
 * Implementa consultas preparadas (Prepared Statements) sobre la tabla carreras.
 */

import { db } from '../config/database.js';

export const CarreraModel = {
  /**
   * Obtiene todas las carreras activas asociadas a una universidad, ordenadas alfabéticamente.
   * @param {number|string} universidadId
   * @returns {Array<Object>}
   */
  listarActivasPorUniversidad(universidadId) {
    const stmt = db.prepare(`
      SELECT id, universidad_id, nombre, descripcion, estado
      FROM carreras
      WHERE universidad_id = ? AND estado = 1
      ORDER BY nombre ASC
    `);

    return stmt.all(universidadId);
  },

  /**
   * Busca una carrera por su ID, incluyendo detalles de su universidad.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarPorId(id) {
    const stmt = db.prepare(`
      SELECT 
        c.id, c.universidad_id, c.nombre, c.descripcion, c.estado, c.created_at,
        u.nombre AS universidad_nombre, u.siglas AS universidad_siglas, u.estado AS universidad_estado
      FROM carreras c
      INNER JOIN universidades u ON c.universidad_id = u.id
      WHERE c.id = ?
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca una carrera activa por su ID asegurando que su universidad también se encuentre activa.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarActivaPorId(id) {
    const stmt = db.prepare(`
      SELECT 
        c.id, c.universidad_id, c.nombre, c.descripcion, c.estado,
        u.id AS universidad_id, u.nombre AS universidad_nombre, u.siglas AS universidad_siglas
      FROM carreras c
      INNER JOIN universidades u ON c.universidad_id = u.id
      WHERE c.id = ? AND c.estado = 1 AND u.estado = 1
    `);

    return stmt.get(id) || null;
  }
};

export default CarreraModel;
