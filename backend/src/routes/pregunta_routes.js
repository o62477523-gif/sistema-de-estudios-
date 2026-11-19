/**
 * Rutas para Preguntas del Banco
 */

import { Router } from 'express';
import PreguntaController from '../controllers/pregunta_controller.js';
import authMiddleware from '../middlewares/auth_middleware.js';
import roleMiddleware from '../middlewares/role_middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de consulta (estudiantes y administradores)
router.get('/', PreguntaController.listar);
router.get('/:id', PreguntaController.obtenerPorId);

// Rutas administrativas (solo administrador)
router.post('/', roleMiddleware('administrador'), PreguntaController.crear);
router.put('/:id', roleMiddleware('administrador'), PreguntaController.actualizar);
router.delete('/:id', roleMiddleware('administrador'), PreguntaController.desactivar);

export default router;
