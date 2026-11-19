/**
 * Modelo de Acceso a Datos para Alternativas de Preguntas
 * 
 * Implementa consultas preparadas (Prepared Statements) sobre la tabla alternativas.
 */

import { db } from '../config/database.js';

export const AlternativaModel = {
  /**
   * Obtiene las alternativas asociadas a una pregunta.
   * @param {number|string} preguntaId
   * @returns {Array<Object>}
   */
  listarPorPregunta(preguntaId) {
    const stmt = db.prepare(`
      SELECT id, pregunta_id, texto, es_correcta, created_at
      FROM alternativas
      WHERE pregunta_id = ?
      ORDER BY id ASC
    `);

    return stmt.all(preguntaId).map(alt => ({
      ...alt,
      es_correcta: Boolean(alt.es_correcta)
    }));
  },

  /**
   * Crea una nueva alternativa para una pregunta.
   * @param {Object} datos
   * @param {number} datos.pregunta_id
   * @param {string} datos.texto
   * @param {boolean|number} datos.es_correcta
   * @returns {Object} Alternativa creada
   */
  crear({ pregunta_id, texto, es_correcta }) {
    const stmt = db.prepare(`
      INSERT INTO alternativas (pregunta_id, texto, es_correcta)
      VALUES (?, ?, ?)
    `);

    const info = stmt.run(pregunta_id, texto, es_correcta ? 1 : 0);
    return {
      id: Number(info.lastInsertRowid),
      pregunta_id,
      texto,
      es_correcta: Boolean(es_correcta)
    };
  },

  /**
   * Elimina todas las alternativas de una pregunta (utilizado en actualizaciones atómicas).
   * @param {number|string} preguntaId
   * @returns {number} Número de alternativas eliminadas
   */
  eliminarPorPregunta(preguntaId) {
    const stmt = db.prepare(`
      DELETE FROM alternativas
      WHERE pregunta_id = ?
    `);

    const info = stmt.run(preguntaId);
    return info.changes;
  }
};

export default AlternativaModel;
