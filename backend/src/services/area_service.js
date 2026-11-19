/**
 * Servicio de Negocio para Áreas Académicas
 * 
 * Implementa validaciones y lógica de negocio para el catálogo de áreas.
 */

import AreaModel from '../models/area_model.js';

export const AreaService = {
  /**
   * Obtiene la lista de áreas activas.
   * @param {boolean} [soloActivas=true]
   * @returns {Array<Object>}
   */
  listarAreas(soloActivas = true) {
    if (soloActivas) {
      return AreaModel.listarActivas();
    }
    return AreaModel.listarTodas();
  },

  /**
   * Obtiene un área por su ID.
   * @param {number|string} id
   * @param {boolean} [soloActiva=true]
   * @returns {Object}
   */
  obtenerAreaPorId(id, soloActiva = true) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de área inválido');
      error.statusCode = 400;
      throw error;
    }

    const area = soloActiva ? AreaModel.buscarActivaPorId(numId) : AreaModel.buscarPorId(numId);
    if (!area) {
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return area;
  },

  /**
   * Registra una nueva área académica (solo administrador).
   * @param {Object} datos
   * @param {string} datos.nombre
   * @param {string} [datos.descripcion]
   * @returns {Object}
   */
  crearArea({ nombre, descripcion }) {
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      const error = new Error('El nombre del área es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    const nombreLimpio = nombre.trim();
    const existente = AreaModel.buscarPorNombre(nombreLimpio);
    if (existente) {
      const error = new Error('Ya existe un área con ese nombre');
      error.statusCode = 409;
      throw error;
    }

    return AreaModel.crear({
      nombre: nombreLimpio,
      descripcion: descripcion ? descripcion.trim() : null
    });
  },

  /**
   * Actualiza los datos de un área académica (solo administrador).
   * @param {number|string} id
   * @param {Object} datos
   * @param {string} [datos.nombre]
   * @param {string} [datos.descripcion]
   * @returns {Object}
   */
  actualizarArea(id, { nombre, descripcion }) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de área inválido');
      error.statusCode = 400;
      throw error;
    }

    const actual = AreaModel.buscarPorId(numId);
    if (!actual) {
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }

    let nuevoNombre = actual.nombre;
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || !nombre.trim()) {
        const error = new Error('El nombre del área no puede estar vacío');
        error.statusCode = 400;
        throw error;
      }
      nuevoNombre = nombre.trim();

      // Verificar que el nuevo nombre no colisione con otra área
      const existente = AreaModel.buscarPorNombre(nuevoNombre);
      if (existente && existente.id !== numId) {
        const error = new Error('Ya existe otra área con ese nombre');
        error.statusCode = 409;
        throw error;
      }
    }

    const nuevaDescripcion = descripcion !== undefined
      ? (descripcion ? descripcion.trim() : null)
      : actual.descripcion;

    return AreaModel.actualizar(numId, {
      nombre: nuevoNombre,
      descripcion: nuevaDescripcion
    });
  },

  /**
   * Desactiva lógicamente un área (soft delete).
   * @param {number|string} id
   * @returns {boolean}
   */
  desactivarArea(id) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de área inválido');
      error.statusCode = 400;
      throw error;
    }

    const actual = AreaModel.buscarPorId(numId);
    if (!actual) {
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return AreaModel.desactivar(numId);
  }
};

export default AreaService;
