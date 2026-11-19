/**
 * Servicio de Negocio para Temas Académicos
 * 
 * Implementa validaciones y lógica de negocio para temas y su relación con materias.
 */

import TemaModel from '../models/tema_model.js';
import MateriaModel from '../models/materia_model.js';

export const TemaService = {
  /**
   * Obtiene la lista de todos los temas activos.
   * @returns {Array<Object>}
   */
  listarTemas() {
    return TemaModel.listarActivos();
  },

  /**
   * Obtiene los temas activos de una materia específica.
   * @param {number|string} materiaId
   * @returns {Array<Object>}
   */
  listarTemasPorMateria(materiaId) {
    const numMateriaId = Number(materiaId);
    if (!Number.isInteger(numMateriaId) || numMateriaId <= 0) {
      const error = new Error('Identificador de materia inválido');
      error.statusCode = 400;
      throw error;
    }

    const materia = MateriaModel.buscarActivaPorId(numMateriaId);
    if (!materia) {
      const error = new Error('Materia no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return TemaModel.listarActivosPorMateria(numMateriaId);
  },

  /**
   * Obtiene los detalles de un tema por ID.
   * @param {number|string} id
   * @param {boolean} [soloActivo=true]
   * @returns {Object}
   */
  obtenerTemaPorId(id, soloActivo = true) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de tema inválido');
      error.statusCode = 400;
      throw error;
    }

    const tema = soloActivo
      ? TemaModel.buscarActivoPorId(numId)
      : TemaModel.buscarPorId(numId);

    if (!tema) {
      const error = new Error('Tema no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return tema;
  },

  /**
   * Registra un nuevo tema académico (solo administrador).
   * @param {Object} datos
   * @param {number|string} datos.materia_id
   * @param {string} datos.nombre
   * @param {string} [datos.descripcion]
   * @returns {Object}
   */
  crearTema({ materia_id, nombre, descripcion }) {
    const numMateriaId = Number(materia_id);
    if (!Number.isInteger(numMateriaId) || numMateriaId <= 0) {
      const error = new Error('Identificador de materia inválido');
      error.statusCode = 400;
      throw error;
    }

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      const error = new Error('El nombre del tema es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    const materia = MateriaModel.buscarPorId(numMateriaId);
    if (!materia) {
      const error = new Error('La materia especificada no existe');
      error.statusCode = 404;
      throw error;
    }

    if (materia.estado !== 1) {
      const error = new Error('No se pueden crear temas en una materia inactiva');
      error.statusCode = 400;
      throw error;
    }

    const nombreLimpio = nombre.trim();
    const existente = TemaModel.buscarPorMateriaYNombre(numMateriaId, nombreLimpio);
    if (existente) {
      const error = new Error('Ya existe un tema con ese nombre en esta materia');
      error.statusCode = 409;
      throw error;
    }

    return TemaModel.crear({
      materia_id: numMateriaId,
      nombre: nombreLimpio,
      descripcion: descripcion ? descripcion.trim() : null
    });
  },

  /**
   * Actualiza los datos de un tema académico (solo administrador).
   * @param {number|string} id
   * @param {Object} datos
   * @param {number|string} [datos.materia_id]
   * @param {string} [datos.nombre]
   * @param {string} [datos.descripcion]
   * @returns {Object}
   */
  actualizarTema(id, { materia_id, nombre, descripcion }) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de tema inválido');
      error.statusCode = 400;
      throw error;
    }

    const actual = TemaModel.buscarPorId(numId);
    if (!actual) {
      const error = new Error('Tema no encontrado');
      error.statusCode = 404;
      throw error;
    }

    let nuevoMateriaId = actual.materia_id;
    if (materia_id !== undefined) {
      const parsedMateriaId = Number(materia_id);
      if (!Number.isInteger(parsedMateriaId) || parsedMateriaId <= 0) {
        const error = new Error('Identificador de materia inválido');
        error.statusCode = 400;
        throw error;
      }

      const materia = MateriaModel.buscarPorId(parsedMateriaId);
      if (!materia) {
        const error = new Error('La materia especificada no existe');
        error.statusCode = 404;
        throw error;
      }
      if (materia.estado !== 1) {
        const error = new Error('No se puede asociar un tema a una materia inactiva');
        error.statusCode = 400;
        throw error;
      }
      nuevoMateriaId = parsedMateriaId;
    }

    let nuevoNombre = actual.nombre;
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || !nombre.trim()) {
        const error = new Error('El nombre del tema no puede estar vacío');
        error.statusCode = 400;
        throw error;
      }
      nuevoNombre = nombre.trim();
    }

    // Verificar si el nuevo nombre colisiona con otro tema en la materia
    const existente = TemaModel.buscarPorMateriaYNombre(nuevoMateriaId, nuevoNombre);
    if (existente && existente.id !== numId) {
      const error = new Error('Ya existe un tema con ese nombre en esta materia');
      error.statusCode = 409;
      throw error;
    }

    const nuevaDescripcion = descripcion !== undefined
      ? (descripcion ? descripcion.trim() : null)
      : actual.descripcion;

    return TemaModel.actualizar(numId, {
      materia_id: nuevoMateriaId,
      nombre: nuevoNombre,
      descripcion: nuevaDescripcion
    });
  },

  /**
   * Desactiva lógicamente un tema (soft delete).
   * @param {number|string} id
   * @returns {boolean}
   */
  desactivarTema(id) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de tema inválido');
      error.statusCode = 400;
      throw error;
    }

    const actual = TemaModel.buscarPorId(numId);
    if (!actual) {
      const error = new Error('Tema no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return TemaModel.desactivar(numId);
  }
};

export default TemaService;
