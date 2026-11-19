/**
 * Controlador para Consulta de Universidades
 */

import UniversidadService from '../services/universidad_service.js';

export const UniversidadController = {
  /**
   * Obtiene la lista de universidades activas.
   * GET /api/universidades
   */
  listar(req, res, next) {
    try {
      const universidades = UniversidadService.listarUniversidades();
      return res.status(200).json({
        status: 'success',
        data: {
          universidades
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene los detalles de una universidad por ID.
   * GET /api/universidades/:id
   */
  obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const universidad = UniversidadService.obtenerUniversidadPorId(id);
      return res.status(200).json({
        status: 'success',
        data: {
          universidad
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default UniversidadController;
