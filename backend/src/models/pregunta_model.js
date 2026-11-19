/**
 * Modelo de Acceso a Datos para Preguntas del Banco
 * 
 * Implementa consultas preparadas (Prepared Statements) sobre la tabla preguntas.
 */

import { db } from '../config/database.js';

export const PreguntaModel = {
  /**
   * Obtiene todas las preguntas activas con información jerárquica.
   * @returns {Array<Object>}
   */
  listarActivas() {
    const stmt = db.prepare(`
      SELECT 
        p.id, p.tema_id, p.enunciado, p.dificultad, p.tipo, p.explicacion, p.estado,
        p.created_at, p.updated_at,
        t.nombre AS tema_nombre,
        m.id AS materia_id, m.nombre AS materia_nombre,
        a.id AS area_id, a.nombre AS area_nombre
      FROM preguntas p
      INNER JOIN temas t ON p.tema_id = t.id
      INNER JOIN materias m ON t.materia_id = m.id
      INNER JOIN areas a ON m.area_id = a.id
      WHERE p.estado = 1 AND t.estado = 1 AND m.estado = 1 AND a.estado = 1
      ORDER BY p.id DESC
    `);

    return stmt.all();
  },

  /**
   * Obtiene todas las preguntas activas pertenecientes a un tema específico.
   * @param {number|string} temaId
   * @returns {Array<Object>}
   */
  listarActivasPorTema(temaId) {
    const stmt = db.prepare(`
      SELECT 
        p.id, p.tema_id, p.enunciado, p.dificultad, p.tipo, p.explicacion, p.estado,
        p.created_at, p.updated_at,
        t.nombre AS tema_nombre
      FROM preguntas p
      INNER JOIN temas t ON p.tema_id = t.id
      WHERE p.tema_id = ? AND p.estado = 1 AND t.estado = 1
      ORDER BY p.id ASC
    `);

    return stmt.all(temaId);
  },

  /**
   * Busca una pregunta por su ID, incluyendo detalles del tema, materia y área.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarPorId(id) {
    const stmt = db.prepare(`
      SELECT 
        p.id, p.tema_id, p.enunciado, p.dificultad, p.tipo, p.explicacion, p.estado,
        p.created_at, p.updated_at,
        t.nombre AS tema_nombre, t.estado AS tema_estado,
        m.id AS materia_id, m.nombre AS materia_nombre, m.estado AS materia_estado,
        a.id AS area_id, a.nombre AS area_nombre, a.estado AS area_estado
      FROM preguntas p
      INNER JOIN temas t ON p.tema_id = t.id
      INNER JOIN materias m ON t.materia_id = m.id
      INNER JOIN areas a ON m.area_id = a.id
      WHERE p.id = ?
    `);

    return stmt.get(id) || null;
  },

  /**
   * Busca una pregunta activa por ID asegurando que su jerarquía esté activa.
   * @param {number|string} id
   * @returns {Object|null}
   */
  buscarActivaPorId(id) {
    const stmt = db.prepare(`
      SELECT 
        p.id, p.tema_id, p.enunciado, p.dificultad, p.tipo, p.explicacion, p.estado,
        p.created_at, p.updated_at,
        t.nombre AS tema_nombre,
        m.id AS materia_id, m.nombre AS materia_nombre,
        a.id AS area_id, a.nombre AS area_nombre
      FROM preguntas p
      INNER JOIN temas t ON p.tema_id = t.id
      INNER JOIN materias m ON t.materia_id = m.id
      INNER JOIN areas a ON m.area_id = a.id
      WHERE p.id = ? AND p.estado = 1 AND t.estado = 1 AND m.estado = 1 AND a.estado = 1
    `);

    return stmt.get(id) || null;
  },

  /**
   * Inserta un nuevo registro de pregunta en la tabla preguntas.
   * @param {Object} datos
   * @param {number} datos.tema_id
   * @param {string} datos.enunciado
   * @param {string} datos.dificultad
   * @param {string} [datos.tipo='opcion_multiple']
   * @param {string|null} [datos.explicacion]
   * @returns {number} ID autogenerado de la pregunta
   */
  crear({ tema_id, enunciado, dificultad, tipo = 'opcion_multiple', explicacion = null }) {
    const stmt = db.prepare(`
      INSERT INTO preguntas (tema_id, enunciado, dificultad, tipo, explicacion, estado)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const info = stmt.run(tema_id, enunciado, dificultad, tipo, explicacion);
    return Number(info.lastInsertRowid);
  },

  /**
   * Actualiza los datos de una pregunta existente.
   * @param {number|string} id
   * @param {Object} datos
   * @param {number} [datos.tema_id]
   * @param {string} [datos.enunciado]
   * @param {string} [datos.dificultad]
   * @param {string} [datos.tipo]
   * @param {string|null} [datos.explicacion]
   * @returns {boolean}
   */
  actualizar(id, { tema_id, enunciado, dificultad, tipo, explicacion }) {
    const actual = this.buscarPorId(id);
    if (!actual) return false;

    const nuevoTemaId = tema_id !== undefined ? tema_id : actual.tema_id;
    const nuevoEnunciado = enunciado !== undefined ? enunciado : actual.enunciado;
    const nuevaDificultad = dificultad !== undefined ? dificultad : actual.dificultad;
    const nuevoTipo = tipo !== undefined ? tipo : actual.tipo;
    const nuevaExplicacion = explicacion !== undefined ? explicacion : actual.explicacion;

    const stmt = db.prepare(`
      UPDATE preguntas
      SET tema_id = ?, enunciado = ?, dificultad = ?, tipo = ?, explicacion = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const info = stmt.run(nuevoTemaId, nuevoEnunciado, nuevaDificultad, nuevoTipo, nuevaExplicacion, id);
    return info.changes > 0;
  },

  /**
   * Desactiva lógicamente una pregunta (soft delete).
   * @param {number|string} id
   * @returns {boolean}
   */
  desactivar(id) {
    const stmt = db.prepare(`
      UPDATE preguntas
      SET estado = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const info = stmt.run(id);
    return info.changes > 0;
  }
};

export default PreguntaModel;
