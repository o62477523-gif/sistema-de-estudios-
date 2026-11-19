/**
 * Configuración principal de la aplicación Express.
 * 
 * Desacoplada del inicio del servidor para facilitar pruebas automatizadas.
 */

import express from 'express';
import dotenv from 'dotenv';
import healthRoutes from './routes/health_routes.js';
import authRoutes from './routes/auth_routes.js';
import universidadRoutes from './routes/universidad_routes.js';
import carreraRoutes from './routes/carrera_routes.js';
import perfilAcademicoRoutes from './routes/perfil_academico_routes.js';
import areaRoutes from './routes/area_routes.js';
import materiaRoutes from './routes/materia_routes.js';
import temaRoutes from './routes/tema_routes.js';
import preguntaRoutes from './routes/pregunta_routes.js';
import notFoundHandler from './middlewares/not_found_handler.js';
import errorHandler from './middlewares/error_handler.js';

// Carga de variables de entorno desde .env si existe
dotenv.config();

const app = express();

// Middlewares globales de parsing
app.use(express.json());

// Registro centralizado de rutas bajo el prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/universidades', universidadRoutes);
app.use('/api/carreras', carreraRoutes);
app.use('/api/perfil-academico', perfilAcademicoRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/temas', temaRoutes);
app.use('/api/preguntas', preguntaRoutes);
app.use('/api', healthRoutes);

// Manejo de rutas inexistentes (404)
app.use(notFoundHandler);

// Manejo centralizado de errores (500)
app.use(errorHandler);

export default app;
