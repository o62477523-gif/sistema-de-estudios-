/**
 * Punto de entrada del servidor HTTP.
 * 
 * Inicia la escucha en el puerto configurado a través de variables de entorno.
 */

import app from './app.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`[Servidor] Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`[Servidor] Modo de entorno: ${NODE_ENV}`);
  console.log(`[Servidor] Verificación de salud: http://localhost:${PORT}/api/health`);
});

// Manejo seguro del cierre del servidor ante señales del sistema
const handleShutdown = (signal) => {
  console.log(`\n[Servidor] Recibida señal ${signal}. Cerrando servidor HTTP...`);
  server.close(() => {
    console.log('[Servidor] Servidor HTTP cerrado correctamente.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default server;
