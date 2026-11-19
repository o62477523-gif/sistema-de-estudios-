/**
 * Modelo de Acceso a Datos para Áreas Académicas
 * 
 * Implementa consultas preparadas (Prepared Statements) sobre la tabla areas.
 */

import { db } from '../config/database.js';

export const AreaModel = {
  /**
   * Obtiene todas las áreas activas ordenadas alfabéticamente.
   * @returns {Array<Object>}
   */
  listarActivas() {
    const stmt = db.prepare(`
      SELECT id, nombre, descripcion, estado, created_at
      FROM areas
      WHERE estado = 1
      ORDER BY nombre ASC
    `);

    return stmt.all();
  },

  /**
   * Obtiene todas las áreas (activas e inactivas) para administradores.
   * @returns {Array<Object>}
   */
  listarTodas() {
    const stmt = db.prepare(`
      SELECT id, nombre, descripcion, estado, created_at
      FROM areas
      ORDER BY nombre ASC
    `);

    return stmt.all();
  },

  /**
   * Busca un área por su ID.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarPorId(id) {
    const stmt = db.prepare(`
      SELECT id, nombre, descripcion, estado, created_at
      FROM areas
      WHERE id = ?
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca un área activa por su ID.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarActivaPorId(id) {
    const stmt = db.prepare(`
      SELECT id, nombre, descripcion, estado, created_at
      FROM areas
      WHERE id = ? AND estado = 1
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca un área por nombre exacto (case-insensitive).
   * @param {string} nombre
   * @returns {Object|null}
   */
  buscarPorNombre(nombre) {
    const stmt = db.prepare(`
      SELECT id, nombre, descripcion, estado, created_at
      FROM areas
      WHERE LOWER(nombre) = LOWER(?)
    `);

    return stmt.get(nombre) || null;
  },

  /**
   * Crea una nueva área académica.
   * @param {Object} datos
   * @param {string} datos.nombre
   * @param {string|null} datos.descripcion
   * @returns {Object} Área creada
   */
  crear({ nombre, descripcion }) {
    const stmt = db.prepare(`
      INSERT INTO areas (nombre, descripcion, estado)
      VALUES (?, ?, 1)
    `);

    const info = stmt.run(nombre, descripcion || null);
    return this.buscarPorId(info.lastInsertRowid);
  },

  /**
   * Actualiza el nombre y/o descripción de un área.
   * @param {number|string} id
   * @param {Object} datos
   * @param {string} datos.nombre
   * @param {string|null} datos.descripcion
   * @returns {Object|null} Área actualizada
   */
  actualizar(id, { nombre, descripcion }) {
    const stmt = db.prepare(`
      UPDATE areas
      SET nombre = ?, descripcion = ?
      WHERE id = ?
    `);

    stmt.run(nombre, descripcion || null, id);
    return this.buscarPorId(id);
  },

  /**
   * Desactiva lógicamente un área (soft delete).
   * @param {number|string} id
   * @returns {boolean}
   */
  desactivar(id) {
    const stmt = db.prepare(`
      UPDATE areas
      SET estado = 0
      WHERE id = ?
    `);

    const info = stmt.run(id);
    return info.changes > 0;
  }
};

export default AreaModel;
