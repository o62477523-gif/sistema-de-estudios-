/**
 * Modelo de Acceso a Datos para Materias Académicas
 * 
 * Implementa consultas preparadas (Prepared Statements) sobre la tabla materias.
 */

import { db } from '../config/database.js';

export const MateriaModel = {
  /**
   * Obtiene todas las materias activas con información de su área.
   * @returns {Array<Object>}
   */
  listarActivas() {
    const stmt = db.prepare(`
      SELECT 
        m.id, m.area_id, m.nombre, m.descripcion, m.estado, m.created_at,
        a.nombre AS area_nombre
      FROM materias m
      INNER JOIN areas a ON m.area_id = a.id
      WHERE m.estado = 1 AND a.estado = 1
      ORDER BY m.nombre ASC
    `);

    return stmt.all();
  },

  /**
   * Obtiene todas las materias activas de un área específica.
   * @param {number|string} areaId
   * @returns {Array<Object>}
   */
  listarActivasPorArea(areaId) {
    const stmt = db.prepare(`
      SELECT 
        m.id, m.area_id, m.nombre, m.descripcion, m.estado, m.created_at,
        a.nombre AS area_nombre
      FROM materias m
      INNER JOIN areas a ON m.area_id = a.id
      WHERE m.area_id = ? AND m.estado = 1 AND a.estado = 1
      ORDER BY m.nombre ASC
    `);

    return stmt.all(areaId);
  },

  /**
   * Busca una materia por ID con datos del área.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarPorId(id) {
    const stmt = db.prepare(`
      SELECT 
        m.id, m.area_id, m.nombre, m.descripcion, m.estado, m.created_at,
        a.nombre AS area_nombre, a.estado AS area_estado
      FROM materias m
      INNER JOIN areas a ON m.area_id = a.id
      WHERE m.id = ?
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca una materia activa por ID verificando que su área también esté activa.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarActivaPorId(id) {
    const stmt = db.prepare(`
      SELECT 
        m.id, m.area_id, m.nombre, m.descripcion, m.estado, m.created_at,
        a.nombre AS area_nombre
      FROM materias m
      INNER JOIN areas a ON m.area_id = a.id
      WHERE m.id = ? AND m.estado = 1 AND a.estado = 1
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca si ya existe una materia con el mismo nombre en un área (case-insensitive).
   * @param {number|string} areaId
   * @param {string} nombre
   * @returns {Object|null}
   */
  buscarPorAreaYNombre(areaId, nombre) {
    const stmt = db.prepare(`
      SELECT id, area_id, nombre, descripcion, estado
      FROM materias
      WHERE area_id = ? AND LOWER(nombre) = LOWER(?)
    `);

    return stmt.get(areaId, nombre) || null;
  },

  /**
   * Crea una nueva materia académica.
   * @param {Object} datos
   * @param {number} datos.area_id
   * @param {string} datos.nombre
   * @param {string|null} datos.descripcion
   * @returns {Object} Materia creada
   */
  crear({ area_id, nombre, descripcion }) {
    const stmt = db.prepare(`
      INSERT INTO materias (area_id, nombre, descripcion, estado)
      VALUES (?, ?, ?, 1)
    `);

    const info = stmt.run(area_id, nombre, descripcion || null);
    return this.buscarPorId(info.lastInsertRowid);
  },

  /**
   * Actualiza una materia académica.
   * @param {number|string} id
   * @param {Object} datos
   * @param {number} [datos.area_id]
   * @param {string} [datos.nombre]
   * @param {string|null} [datos.descripcion]
   * @returns {Object|null} Materia actualizada
   */
  actualizar(id, { area_id, nombre, descripcion }) {
    const actual = this.buscarPorId(id);
    if (!actual) return null;

    const nuevoAreaId = area_id !== undefined ? area_id : actual.area_id;
    const nuevoNombre = nombre !== undefined ? nombre : actual.nombre;
    const nuevaDescripcion = descripcion !== undefined ? descripcion : actual.descripcion;

    const stmt = db.prepare(`
      UPDATE materias
      SET area_id = ?, nombre = ?, descripcion = ?
      WHERE id = ?
    `);

    stmt.run(nuevoAreaId, nuevoNombre, nuevaDescripcion || null, id);
    return this.buscarPorId(id);
  },

  /**
   * Desactiva lógicamente una materia (soft delete).
   * @param {number|string} id
   * @returns {boolean}
   */
  desactivar(id) {
    const stmt = db.prepare(`
      UPDATE materias
      SET estado = 0
      WHERE id = ?
    `);

    const info = stmt.run(id);
    return info.changes > 0;
  }
};

export default MateriaModel;
