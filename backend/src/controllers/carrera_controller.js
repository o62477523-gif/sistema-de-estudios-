/**
 * Controlador para Consulta de Carreras Profesionales
 */

import CarreraService from '../services/carrera_service.js';

export const CarreraController = {
  /**
   * Obtiene la lista de carreras activas de una universidad.
   * GET /api/universidades/:universidadId/carreras
   */
  listarPorUniversidad(req, res, next) {
    try {
      const { universidadId } = req.params;
      const carreras = CarreraService.listarCarrerasPorUniversidad(universidadId);
      return res.status(200).json({
        status: 'success',
        data: {
          carreras
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene los detalles de una carrera por ID.
   * GET /api/carreras/:id
   */
  obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const carrera = CarreraService.obtenerCarreraPorId(id);
      return res.status(200).json({
        status: 'success',
        data: {
          carrera
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default CarreraController;
