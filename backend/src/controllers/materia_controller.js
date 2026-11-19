/**
 * Controlador para Materias Académicas
 */

import MateriaService from '../services/materia_service.js';

export const MateriaController = {
  /**
   * Obtiene la lista de todas las materias activas.
   * GET /api/materias
   */
  listar(req, res, next) {
    try {
      const materias = MateriaService.listarMaterias();
      return res.status(200).json({
        status: 'success',
        data: {
          materias
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene las materias activas de un área específica.
   * GET /api/areas/:areaId/materias
   */
  listarPorArea(req, res, next) {
    try {
      const { areaId } = req.params;
      const materias = MateriaService.listarMateriasPorArea(areaId);
      return res.status(200).json({
        status: 'success',
        data: {
          materias
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene los detalles de una materia por ID.
   * GET /api/materias/:id
   */
  obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const materia = MateriaService.obtenerMateriaPorId(id);
      return res.status(200).json({
        status: 'success',
        data: {
          materia
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Registra una nueva materia académica (solo administrador).
   * POST /api/materias
   */
  crear(req, res, next) {
    try {
      const { area_id, nombre, descripcion } = req.body;
      const materia = MateriaService.crearMateria({ area_id, nombre, descripcion });
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Materia académica registrada correctamente',
          materia
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualiza los datos de una materia (solo administrador).
   * PUT /api/materias/:id
   */
  actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { area_id, nombre, descripcion } = req.body;
      const materia = MateriaService.actualizarMateria(id, { area_id, nombre, descripcion });
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Materia académica actualizada correctamente',
          materia
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Desactiva lógicamente una materia (solo administrador).
   * DELETE /api/materias/:id
   */
  desactivar(req, res, next) {
    try {
      const { id } = req.params;
      MateriaService.desactivarMateria(id);
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Materia académica desactivada correctamente'
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default MateriaController;
