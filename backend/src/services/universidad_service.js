/**
 * Servicio de Negocio para Universidades
 */

import UniversidadModel from '../models/universidad_model.js';

export const UniversidadService = {
  /**
   * Obtiene la lista de todas las universidades activas.
   * @returns {Array<Object>}
   */
  listarUniversidades() {
    return UniversidadModel.listarActivas();
  },

  /**
   * Obtiene una universidad activa por su ID.
   * @param {number|string} id
   * @returns {Object}
   */
  obtenerUniversidadPorId(id) {
    const numId = Number(id);
    if (!numId || numId <= 0) {
      const error = new Error('Identificador de universidad inválido');
      error.statusCode = 400;
      throw error;
    }

    const universidad = UniversidadModel.buscarActivaPorId(numId);
    if (!universidad) {
      const error = new Error('Universidad no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return universidad;
  }
};

export default UniversidadService;
