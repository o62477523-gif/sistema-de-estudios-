/**
 * Controlador para Preguntas del Banco
 */

import PreguntaService from '../services/pregunta_service.js';

export const PreguntaController = {
  /**
   * Obtiene la lista de preguntas activas.
   * GET /api/preguntas
   */
  listar(req, res, next) {
    try {
      const preguntas = PreguntaService.listarPreguntasActivas();
      return res.status(200).json({
        status: 'success',
        data: {
          preguntas
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene las preguntas activas de un tema específico.
   * GET /api/temas/:temaId/preguntas
   */
  listarPorTema(req, res, next) {
    try {
      const { temaId } = req.params;
      const preguntas = PreguntaService.listarPreguntasPorTema(temaId);
      return res.status(200).json({
        status: 'success',
        data: {
          preguntas
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene el detalle de una pregunta por su ID.
   * GET /api/preguntas/:id
   */
  obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const esAdmin = req.user && req.user.rol === 'administrador';
      const pregunta = PreguntaService.obtenerPreguntaPorId(id, !esAdmin);
      return res.status(200).json({
        status: 'success',
        data: {
          pregunta
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Registra una nueva pregunta con alternativas (solo administrador).
   * POST /api/preguntas
   */
  crear(req, res, next) {
    try {
      const {
        tema_id,
        enunciado,
        dificultad,
        tipo,
        explicacion,
        alternativas
      } = req.body;

      const pregunta = PreguntaService.crearPregunta({
        tema_id,
        enunciado,
        dificultad,
        tipo,
        explicacion,
        alternativas
      });

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Pregunta registrada correctamente',
          pregunta
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualiza una pregunta y sus alternativas (solo administrador).
   * PUT /api/preguntas/:id
   */
  actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const {
        tema_id,
        enunciado,
        dificultad,
        tipo,
        explicacion,
        alternativas
      } = req.body;

      const pregunta = PreguntaService.actualizarPregunta(id, {
        tema_id,
        enunciado,
        dificultad,
        tipo,
        explicacion,
        alternativas
      });

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Pregunta actualizada correctamente',
          pregunta
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Desactiva lógicamente una pregunta (solo administrador).
   * DELETE /api/preguntas/:id
   */
  desactivar(req, res, next) {
    try {
      const { id } = req.params;
      PreguntaService.desactivarPregunta(id);
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Pregunta desactivada correctamente'
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default PreguntaController;
