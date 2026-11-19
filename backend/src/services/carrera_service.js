/**
 * Servicio de Negocio para Carreras Profesionales
 */

import CarreraModel from '../models/carrera_model.js';
import UniversidadModel from '../models/universidad_model.js';

export const CarreraService = {
  /**
   * Obtiene todas las carreras activas pertenecientes a una universidad activa.
   * @param {number|string} universidadId
   * @returns {Array<Object>}
   */
  listarCarrerasPorUniversidad(universidadId) {
    const numUniId = Number(universidadId);
    if (!numUniId || numUniId <= 0) {
      const error = new Error('Identificador de universidad inválido');
      error.statusCode = 400;
      throw error;
    }

    // Validar que la universidad exista y se encuentre activa
    const universidad = UniversidadModel.buscarActivaPorId(numUniId);
    if (!universidad) {
      const error = new Error('Universidad no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return CarreraModel.listarActivasPorUniversidad(numUniId);
  },

  /**
   * Obtiene una carrera activa por su ID.
   * @param {number|string} id
   * @returns {Object}
   */
  obtenerCarreraPorId(id) {
    const numId = Number(id);
    if (!numId || numId <= 0) {
      const error = new Error('Identificador de carrera inválido');
      error.statusCode = 400;
      throw error;
    }

    const carrera = CarreraModel.buscarActivaPorId(numId);
    if (!carrera) {
      const error = new Error('Carrera no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return carrera;
  }
};

export default CarreraService;
