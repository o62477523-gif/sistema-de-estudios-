/**
 * Rutas de verificación de salud del sistema.
 */

import { Router } from 'express';
import { getHealth } from '../controllers/health_controller.js';

const router = Router();

// Endpoint de monitoreo de salud: GET /api/health
router.get('/health', getHealth);

export default router;
