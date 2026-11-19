/**
 * Modelo de Acceso a Datos para Universidades
 * 
 * Implementa consultas preparadas (Prepared Statements) sobre la tabla universidades.
 */

import { db } from '../config/database.js';

export const UniversidadModel = {
  /**
   * Obtiene todas las universidades activas ordenadas alfabéticamente por nombre.
   * @returns {Array<Object>}
   */
  listarActivas() {
    const stmt = db.prepare(`
      SELECT id, nombre, siglas, descripcion, estado
      FROM universidades
      WHERE estado = 1
      ORDER BY nombre ASC
    `);

    return stmt.all();
  },

  /**
   * Busca una universidad por su ID, incluyendo su estado.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarPorId(id) {
    const stmt = db.prepare(`
      SELECT id, nombre, siglas, descripcion, estado, created_at
      FROM universidades
      WHERE id = ?
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca una universidad por su ID asegurando que se encuentre activa.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarActivaPorId(id) {
    const stmt = db.prepare(`
      SELECT id, nombre, siglas, descripcion, estado, created_at
      FROM universidades
      WHERE id = ? AND estado = 1
    `);

    return stmt.get(id) || null;
  }
};

export default UniversidadModel;
