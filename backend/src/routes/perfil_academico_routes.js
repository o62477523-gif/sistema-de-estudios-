/**
 * Rutas para la Gestión del Perfil Académico
 */

import { Router } from 'express';
import PerfilAcademicoController from '../controllers/perfil_academico_controller.js';
import authMiddleware from '../middlewares/auth_middleware.js';

const router = Router();

// Todas las rutas de perfil académico requieren autenticación JWT
router.use(authMiddleware);

// Endpoints: GET y PUT /api/perfil-academico
router.get('/', PerfilAcademicoController.obtenerPerfil);
router.put('/', PerfilAcademicoController.configurarPerfil);

export default router;
