/**
 * Modelo de Acceso a Datos para Temas Académicos
 * 
 * Implementa consultas preparadas (Prepared Statements) sobre la tabla temas.
 */

import { db } from '../config/database.js';

export const TemaModel = {
  /**
   * Obtiene todos los temas activos con información de materia y área.
   * @returns {Array<Object>}
   */
  listarActivos() {
    const stmt = db.prepare(`
      SELECT 
        t.id, t.materia_id, t.nombre, t.descripcion, t.estado, t.created_at,
        m.nombre AS materia_nombre,
        a.id AS area_id, a.nombre AS area_nombre
      FROM temas t
      INNER JOIN materias m ON t.materia_id = m.id
      INNER JOIN areas a ON m.area_id = a.id
      WHERE t.estado = 1 AND m.estado = 1 AND a.estado = 1
      ORDER BY t.nombre ASC
    `);

    return stmt.all();
  },

  /**
   * Obtiene todos los temas activos de una materia específica.
   * @param {number|string} materiaId
   * @returns {Array<Object>}
   */
  listarActivosPorMateria(materiaId) {
    const stmt = db.prepare(`
      SELECT 
        t.id, t.materia_id, t.nombre, t.descripcion, t.estado, t.created_at,
        m.nombre AS materia_nombre
      FROM temas t
      INNER JOIN materias m ON t.materia_id = m.id
      WHERE t.materia_id = ? AND t.estado = 1 AND m.estado = 1
      ORDER BY t.nombre ASC
    `);

    return stmt.all(materiaId);
  },

  /**
   * Busca un tema por ID con detalles de materia y área.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarPorId(id) {
    const stmt = db.prepare(`
      SELECT 
        t.id, t.materia_id, t.nombre, t.descripcion, t.estado, t.created_at,
        m.nombre AS materia_nombre, m.estado AS materia_estado,
        a.id AS area_id, a.nombre AS area_nombre, a.estado AS area_estado
      FROM temas t
      INNER JOIN materias m ON t.materia_id = m.id
      INNER JOIN areas a ON m.area_id = a.id
      WHERE t.id = ?
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca un tema activo por ID asegurando que su materia y área estén activas.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarActivoPorId(id) {
    const stmt = db.prepare(`
      SELECT 
        t.id, t.materia_id, t.nombre, t.descripcion, t.estado, t.created_at,
        m.nombre AS materia_nombre,
        a.id AS area_id, a.nombre AS area_nombre
      FROM temas t
      INNER JOIN materias m ON t.materia_id = m.id
      INNER JOIN areas a ON m.area_id = a.id
      WHERE t.id = ? AND t.estado = 1 AND m.estado = 1 AND a.estado = 1
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca si ya existe un tema con el mismo nombre en una materia (case-insensitive).
   * @param {number|string} materiaId
   * @param {string} nombre
   * @returns {Object|null}
   */
  buscarPorMateriaYNombre(materiaId, nombre) {
    const stmt = db.prepare(`
      SELECT id, materia_id, nombre, descripcion, estado
      FROM temas
      WHERE materia_id = ? AND LOWER(nombre) = LOWER(?)
    `);

    return stmt.get(materiaId, nombre) || null;
  },

  /**
   * Crea un nuevo tema académico.
   * @param {Object} datos
   * @param {number} datos.materia_id
   * @param {string} datos.nombre
   * @param {string|null} datos.descripcion
   * @returns {Object} Tema creado
   */
  crear({ materia_id, nombre, descripcion }) {
    const stmt = db.prepare(`
      INSERT INTO temas (materia_id, nombre, descripcion, estado)
      VALUES (?, ?, ?, 1)
    `);

    const info = stmt.run(materia_id, nombre, descripcion || null);
    return this.buscarPorId(info.lastInsertRowid);
  },

  /**
   * Actualiza un tema académico.
   * @param {number|string} id
   * @param {Object} datos
   * @param {number} [datos.materia_id]
   * @param {string} [datos.nombre]
   * @param {string|null} [datos.descripcion]
   * @returns {Object|null} Tema actualizado
   */
  actualizar(id, { materia_id, nombre, descripcion }) {
    const actual = this.buscarPorId(id);
    if (!actual) return null;

    const nuevoMateriaId = materia_id !== undefined ? materia_id : actual.materia_id;
    const nuevoNombre = nombre !== undefined ? nombre : actual.nombre;
    const nuevaDescripcion = descripcion !== undefined ? descripcion : actual.descripcion;

    const stmt = db.prepare(`
      UPDATE temas
      SET materia_id = ?, nombre = ?, descripcion = ?
      WHERE id = ?
    `);

    stmt.run(nuevoMateriaId, nuevoNombre, nuevaDescripcion || null, id);
    return this.buscarPorId(id);
  },

  /**
   * Desactiva lógicamente un tema (soft delete).
   * @param {number|string} id
   * @returns {boolean}
   */
  desactivar(id) {
    const stmt = db.prepare(`
      UPDATE temas
      SET estado = 0
      WHERE id = ?
    `);

    const info = stmt.run(id);
    return info.changes > 0;
  }
};

export default TemaModel;
