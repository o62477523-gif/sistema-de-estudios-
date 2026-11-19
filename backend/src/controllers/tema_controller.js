/**
 * Controlador para Temas Académicos
 */

import TemaService from '../services/tema_service.js';

export const TemaController = {
  /**
   * Obtiene la lista de todos los temas activos.
   * GET /api/temas
   */
  listar(req, res, next) {
    try {
      const temas = TemaService.listarTemas();
      return res.status(200).json({
        status: 'success',
        data: {
          temas
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene los temas activos de una materia específica.
   * GET /api/materias/:materiaId/temas
   */
  listarPorMateria(req, res, next) {
    try {
      const { materiaId } = req.params;
      const temas = TemaService.listarTemasPorMateria(materiaId);
      return res.status(200).json({
        status: 'success',
        data: {
          temas
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene los detalles de un tema por ID.
   * GET /api/temas/:id
   */
  obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const tema = TemaService.obtenerTemaPorId(id);
      return res.status(200).json({
        status: 'success',
        data: {
          tema
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Registra un nuevo tema académico (solo administrador).
   * POST /api/temas
   */
  crear(req, res, next) {
    try {
      const { materia_id, nombre, descripcion } = req.body;
      const tema = TemaService.crearTema({ materia_id, nombre, descripcion });
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Tema académico registrado correctamente',
          tema
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualiza los datos de un tema (solo administrador).
   * PUT /api/temas/:id
   */
  actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { materia_id, nombre, descripcion } = req.body;
      const tema = TemaService.actualizarTema(id, { materia_id, nombre, descripcion });
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Tema académico actualizado correctamente',
          tema
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Desactiva lógicamente un tema (solo administrador).
   * DELETE /api/temas/:id
   */
  desactivar(req, res, next) {
    try {
      const { id } = req.params;
      TemaService.desactivarTema(id);
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Tema académico desactivado correctamente'
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default TemaController;
