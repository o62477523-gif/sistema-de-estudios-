/**
 * Controlador para Áreas Académicas
 */

import AreaService from '../services/area_service.js';

export const AreaController = {
  /**
   * Obtiene la lista de áreas activas.
   * GET /api/areas
   */
  listar(req, res, next) {
    try {
      const areas = AreaService.listarAreas();
      return res.status(200).json({
        status: 'success',
        data: {
          areas
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene un área por su ID.
   * GET /api/areas/:id
   */
  obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const area = AreaService.obtenerAreaPorId(id);
      return res.status(200).json({
        status: 'success',
        data: {
          area
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Registra una nueva área académica (solo administrador).
   * POST /api/areas
   */
  crear(req, res, next) {
    try {
      const { nombre, descripcion } = req.body;
      const area = AreaService.crearArea({ nombre, descripcion });
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Área académica registrada correctamente',
          area
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualiza los datos de un área (solo administrador).
   * PUT /api/areas/:id
   */
  actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      const area = AreaService.actualizarArea(id, { nombre, descripcion });
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Área académica actualizada correctamente',
          area
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Desactiva lógicamente un área (solo administrador).
   * DELETE /api/areas/:id
   */
  desactivar(req, res, next) {
    try {
      const { id } = req.params;
      AreaService.desactivarArea(id);
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Área académica desactivada correctamente'
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default AreaController;
