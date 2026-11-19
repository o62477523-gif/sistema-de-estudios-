/**
 * Rutas para Áreas Académicas
 */

import { Router } from 'express';
import AreaController from '../controllers/area_controller.js';
import MateriaController from '../controllers/materia_controller.js';
import authMiddleware from '../middlewares/auth_middleware.js';
import roleMiddleware from '../middlewares/role_middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de consulta (estudiantes y administradores)
router.get('/', AreaController.listar);
router.get('/:id', AreaController.obtenerPorId);

// Endpoint jerárquico: GET /api/areas/:areaId/materias
router.get('/:areaId/materias', MateriaController.listarPorArea);

// Rutas administrativas (solo administrador)
router.post('/', roleMiddleware('administrador'), AreaController.crear);
router.put('/:id', roleMiddleware('administrador'), AreaController.actualizar);
router.delete('/:id', roleMiddleware('administrador'), AreaController.desactivar);

export default router;
