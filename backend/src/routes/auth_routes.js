/**
 * Rutas de Autenticación y Autorización
 */

import { Router } from 'express';
import AuthController from '../controllers/auth_controller.js';
import authMiddleware from '../middlewares/auth_middleware.js';
import autorizarRoles from '../middlewares/role_middleware.js';
import EstudianteModel from '../models/estudiante_model.js';

const router = Router();

// Endpoints públicos
router.post('/registro', AuthController.registro);
router.post('/login', AuthController.login);

// Endpoint protegido: consulta de perfil propio
router.get('/perfil', authMiddleware, (req, res) => {
  const estudiante = EstudianteModel.buscarPorId(req.user.estudianteId);

  if (!estudiante) {
    return res.status(404).json({
      status: 'error',
      message: 'Estudiante no encontrado'
    });
  }

  return res.status(200).json({
    status: 'success',
    data: {
      usuario: estudiante
    }
  });
});

// Endpoint protegido exclusivo para rol administrador (prueba de autorización)
router.get('/admin-test', authMiddleware, autorizarRoles('administrador'), (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      message: 'Acceso concedido al área administrativa'
    }
  });
});

export default router;
