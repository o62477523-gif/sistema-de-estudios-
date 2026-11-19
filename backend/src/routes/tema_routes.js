/**
 * Rutas para Temas Académicos
 */

import { Router } from 'express';
import TemaController from '../controllers/tema_controller.js';
import PreguntaController from '../controllers/pregunta_controller.js';
import authMiddleware from '../middlewares/auth_middleware.js';
import roleMiddleware from '../middlewares/role_middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de consulta (estudiantes y administradores)
router.get('/', TemaController.listar);
router.get('/:id', TemaController.obtenerPorId);

// Endpoint jerárquico: GET /api/temas/:temaId/preguntas
router.get('/:temaId/preguntas', PreguntaController.listarPorTema);

// Rutas administrativas (solo administrador)
router.post('/', roleMiddleware('administrador'), TemaController.crear);
router.put('/:id', roleMiddleware('administrador'), TemaController.actualizar);
router.delete('/:id', roleMiddleware('administrador'), TemaController.desactivar);

export default router;
