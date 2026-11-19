/**
 * Controlador para la Gestión del Perfil Académico
 * 
 * Vincula la identidad del estudiante desde req.user.estudianteId (JWT).
 */

import PerfilAcademicoService from '../services/perfil_academico_service.js';

export const PerfilAcademicoController = {
  /**
   * Consulta el perfil académico del estudiante autenticado.
   * GET /api/perfil-academico
   */
  obtenerPerfil(req, res, next) {
    try {
      const estudianteId = req.user.estudianteId;
      const resultado = PerfilAcademicoService.consultarPerfil(estudianteId);

      return res.status(200).json({
        status: 'success',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Configura o actualiza la universidad y carrera objetivo del estudiante.
   * PUT /api/perfil-academico
   */
  configurarPerfil(req, res, next) {
    try {
      const estudianteId = req.user.estudianteId;
      const { universidad_id, carrera_id } = req.body;

      const resultado = PerfilAcademicoService.configurarPerfil(estudianteId, {
        universidad_id,
        carrera_id
      });

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Perfil académico configurado correctamente',
          perfil_academico: resultado
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default PerfilAcademicoController;
