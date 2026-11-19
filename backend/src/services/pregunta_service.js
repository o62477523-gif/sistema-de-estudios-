/**
 * Servicio de Negocio para el Banco de Preguntas
 * 
 * Implementa validaciones y transacciones atómicas para preguntas y alternativas (RF-04, RF-05, RF-06).
 */

import { db } from '../config/database.js';
import PreguntaModel from '../models/pregunta_model.js';
import AlternativaModel from '../models/alternativa_model.js';
import TemaModel from '../models/tema_model.js';

const DIFICULTADES_VALIDAS = ['facil', 'intermedia', 'dificil'];

export const PreguntaService = {
  /**
   * Obtiene todas las preguntas activas con sus alternativas.
   * @returns {Array<Object>}
   */
  listarPreguntasActivas() {
    const preguntas = PreguntaModel.listarActivas();
    return preguntas.map(p => ({
      ...p,
      alternativas: AlternativaModel.listarPorPregunta(p.id)
    }));
  },

  /**
   * Obtiene las preguntas activas de un tema con sus alternativas.
   * @param {number|string} temaId
   * @returns {Array<Object>}
   */
  listarPreguntasPorTema(temaId) {
    const numTemaId = Number(temaId);
    if (!Number.isInteger(numTemaId) || numTemaId <= 0) {
      const error = new Error('Identificador de tema inválido');
      error.statusCode = 400;
      throw error;
    }

    const tema = TemaModel.buscarActivoPorId(numTemaId);
    if (!tema) {
      const error = new Error('Tema no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const preguntas = PreguntaModel.listarActivasPorTema(numTemaId);
    return preguntas.map(p => ({
      ...p,
      alternativas: AlternativaModel.listarPorPregunta(p.id)
    }));
  },

  /**
   * Obtiene el detalle de una pregunta con sus alternativas.
   * @param {number|string} id
   * @param {boolean} [soloActiva=true]
   * @returns {Object}
   */
  obtenerPreguntaPorId(id, soloActiva = true) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de pregunta inválido');
      error.statusCode = 400;
      throw error;
    }

    const pregunta = soloActiva
      ? PreguntaModel.buscarActivaPorId(numId)
      : PreguntaModel.buscarPorId(numId);

    if (!pregunta) {
      const error = new Error('Pregunta no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...pregunta,
      alternativas: AlternativaModel.listarPorPregunta(numId)
    };
  },

  /**
   * Registra una pregunta y sus alternativas de forma atómica (solo administrador).
   * @param {Object} datos
   * @param {number|string} datos.tema_id
   * @param {string} datos.enunciado
   * @param {string} [datos.dificultad='intermedia']
   * @param {string} [datos.tipo='opcion_multiple']
   * @param {string|null} [datos.explicacion]
   * @param {Array<Object>} datos.alternativas
   * @returns {Object} Pregunta creada con sus alternativas
   */
  crearPregunta({
    tema_id,
    enunciado,
    dificultad = 'intermedia',
    tipo = 'opcion_multiple',
    explicacion = null,
    alternativas
  }) {
    // 1. Validar tema_id
    const numTemaId = Number(tema_id);
    if (!Number.isInteger(numTemaId) || numTemaId <= 0) {
      const error = new Error('Identificador de tema inválido');
      error.statusCode = 400;
      throw error;
    }

    const tema = TemaModel.buscarPorId(numTemaId);
    if (!tema) {
      const error = new Error('El tema especificado no existe');
      error.statusCode = 404;
      throw error;
    }

    if (tema.estado !== 1) {
      const error = new Error('No se pueden registrar preguntas en un tema inactivo');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validar enunciado
    if (!enunciado || typeof enunciado !== 'string' || !enunciado.trim()) {
      const error = new Error('El enunciado de la pregunta es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validar dificultad
    const difLimpia = dificultad ? dificultad.trim().toLowerCase() : 'intermedia';
    if (!DIFICULTADES_VALIDAS.includes(difLimpia)) {
      const error = new Error(`Dificultad inválida. Debe ser una de: ${DIFICULTADES_VALIDAS.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // 4. Validar alternativas
    if (!Array.isArray(alternativas) || alternativas.length < 2) {
      const error = new Error('Toda pregunta de opción múltiple debe tener al menos dos alternativas');
      error.statusCode = 400;
      throw error;
    }

    let correctasCount = 0;
    for (const alt of alternativas) {
      if (!alt.texto || typeof alt.texto !== 'string' || !alt.texto.trim()) {
        const error = new Error('El texto de cada alternativa es obligatorio');
        error.statusCode = 400;
        throw error;
      }
      if (alt.es_correcta === true || alt.es_correcta === 1) {
        correctasCount++;
      }
    }

    if (correctasCount !== 1) {
      const error = new Error('La pregunta debe tener exactamente una alternativa correcta');
      error.statusCode = 400;
      throw error;
    }

    // 5. Transacción atómica en SQLite
    const transaccion = db.transaction(() => {
      const preguntaId = PreguntaModel.crear({
        tema_id: numTemaId,
        enunciado: enunciado.trim(),
        dificultad: difLimpia,
        tipo: tipo ? tipo.trim() : 'opcion_multiple',
        explicacion: explicacion ? explicacion.trim() : null
      });

      const alternativasCreadas = [];
      for (const alt of alternativas) {
        const altCreada = AlternativaModel.crear({
          pregunta_id: preguntaId,
          texto: alt.texto.trim(),
          es_correcta: Boolean(alt.es_correcta)
        });
        alternativasCreadas.push(altCreada);
      }

      return {
        id: preguntaId,
        tema_id: numTemaId,
        enunciado: enunciado.trim(),
        dificultad: difLimpia,
        tipo,
        explicacion: explicacion ? explicacion.trim() : null,
        alternativas: alternativasCreadas
      };
    });

    return transaccion();
  },

  /**
   * Actualiza una pregunta y opcionalmente sus alternativas de forma atómica.
   * @param {number|string} id
   * @param {Object} datos
   * @returns {Object}
   */
  actualizarPregunta(id, {
    tema_id,
    enunciado,
    dificultad,
    tipo,
    explicacion,
    alternativas
  }) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de pregunta inválido');
      error.statusCode = 400;
      throw error;
    }

    const actual = PreguntaModel.buscarPorId(numId);
    if (!actual) {
      const error = new Error('Pregunta no encontrada');
      error.statusCode = 404;
      throw error;
    }

    let nuevoTemaId = actual.tema_id;
    if (tema_id !== undefined) {
      const parsedTemaId = Number(tema_id);
      if (!Number.isInteger(parsedTemaId) || parsedTemaId <= 0) {
        const error = new Error('Identificador de tema inválido');
        error.statusCode = 400;
        throw error;
      }
      const tema = TemaModel.buscarPorId(parsedTemaId);
      if (!tema) {
        const error = new Error('El tema especificado no existe');
        error.statusCode = 404;
        throw error;
      }
      if (tema.estado !== 1) {
        const error = new Error('No se pueden asociar preguntas a un tema inactivo');
        error.statusCode = 400;
        throw error;
      }
      nuevoTemaId = parsedTemaId;
    }

    let nuevoEnunciado = actual.enunciado;
    if (enunciado !== undefined) {
      if (typeof enunciado !== 'string' || !enunciado.trim()) {
        const error = new Error('El enunciado de la pregunta no puede estar vacío');
        error.statusCode = 400;
        throw error;
      }
      nuevoEnunciado = enunciado.trim();
    }

    let nuevaDificultad = actual.dificultad;
    if (dificultad !== undefined) {
      const difLimpia = dificultad ? dificultad.trim().toLowerCase() : '';
      if (!DIFICULTADES_VALIDAS.includes(difLimpia)) {
        const error = new Error(`Dificultad inválida. Debe ser una de: ${DIFICULTADES_VALIDAS.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      nuevaDificultad = difLimpia;
    }

    if (alternativas !== undefined) {
      if (!Array.isArray(alternativas) || alternativas.length < 2) {
        const error = new Error('Toda pregunta de opción múltiple debe tener al menos dos alternativas');
        error.statusCode = 400;
        throw error;
      }

      let correctasCount = 0;
      for (const alt of alternativas) {
        if (!alt.texto || typeof alt.texto !== 'string' || !alt.texto.trim()) {
          const error = new Error('El texto de cada alternativa es obligatorio');
          error.statusCode = 400;
          throw error;
        }
        if (alt.es_correcta === true || alt.es_correcta === 1) {
          correctasCount++;
        }
      }

      if (correctasCount !== 1) {
        const error = new Error('La pregunta debe tener exactamente una alternativa correcta');
        error.statusCode = 400;
        throw error;
      }
    }

    const nuevaExplicacion = explicacion !== undefined
      ? (explicacion ? explicacion.trim() : null)
      : actual.explicacion;

    const nuevoTipo = tipo !== undefined ? tipo.trim() : actual.tipo;

    // Transacción atómica
    const transaccion = db.transaction(() => {
      PreguntaModel.actualizar(numId, {
        tema_id: nuevoTemaId,
        enunciado: nuevoEnunciado,
        dificultad: nuevaDificultad,
        tipo: nuevoTipo,
        explicacion: nuevaExplicacion
      });

      if (alternativas !== undefined) {
        AlternativaModel.eliminarPorPregunta(numId);
        for (const alt of alternativas) {
          AlternativaModel.crear({
            pregunta_id: numId,
            texto: alt.texto.trim(),
            es_correcta: Boolean(alt.es_correcta)
          });
        }
      }

      return this.obtenerPreguntaPorId(numId, false);
    });

    return transaccion();
  },

  /**
   * Desactiva lógicamente una pregunta (soft delete).
   * @param {number|string} id
   * @returns {boolean}
   */
  desactivarPregunta(id) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de pregunta inválido');
      error.statusCode = 400;
      throw error;
    }

    const actual = PreguntaModel.buscarPorId(numId);
    if (!actual) {
      const error = new Error('Pregunta no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return PreguntaModel.desactivar(numId);
  }
};

export default PreguntaService;
