/**
 * Rutas para Materias Académicas
 */

import { Router } from 'express';
import MateriaController from '../controllers/materia_controller.js';
import TemaController from '../controllers/tema_controller.js';
import authMiddleware from '../middlewares/auth_middleware.js';
import roleMiddleware from '../middlewares/role_middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de consulta (estudiantes y administradores)
router.get('/', MateriaController.listar);
router.get('/:id', MateriaController.obtenerPorId);

// Endpoint jerárquico: GET /api/materias/:materiaId/temas
router.get('/:materiaId/temas', TemaController.listarPorMateria);

// Rutas administrativas (solo administrador)
router.post('/', roleMiddleware('administrador'), MateriaController.crear);
router.put('/:id', roleMiddleware('administrador'), MateriaController.actualizar);
router.delete('/:id', roleMiddleware('administrador'), MateriaController.desactivar);

export default router;
