/**
 * Rutas para Carreras Profesionales
 */

import { Router } from 'express';
import CarreraController from '../controllers/carrera_controller.js';
import authMiddleware from '../middlewares/auth_middleware.js';

const router = Router();

// Todas las rutas requieren autenticación JWT
router.use(authMiddleware);

// Endpoint de detalle de carrera: GET /api/carreras/:id
router.get('/:id', CarreraController.obtenerPorId);

export default router;
