/**
 * Rutas para el Catálogo de Universidades
 */

import { Router } from 'express';
import UniversidadController from '../controllers/universidad_controller.js';
import CarreraController from '../controllers/carrera_controller.js';
import authMiddleware from '../middlewares/auth_middleware.js';

const router = Router();

// Todas las rutas del catálogo requieren autenticación JWT
router.use(authMiddleware);

// Endpoints de universidades
router.get('/', UniversidadController.listar);
router.get('/:id', UniversidadController.obtenerPorId);

// Endpoint de carreras pertenecientes a una universidad: GET /api/universidades/:universidadId/carreras
router.get('/:universidadId/carreras', CarreraController.listarPorUniversidad);

export default router;
