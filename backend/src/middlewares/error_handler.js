/**
 * Middleware centralizado de manejo global de errores.
 * 
 * Estandariza las respuestas de error en:
 * {
 *   "status": "error",
 *   "message": "..."
 * }
 * Evita la filtración de información sensible o stack traces al cliente.
 */

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  
  // Registro en consola del servidor para facilitar diagnóstico y depuración
  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode}`);
  console.error(err.stack || err.message || err);

  // Mensaje amigable para el cliente; evita exponer detalles internos en producción
  const isProduction = process.env.NODE_ENV === 'production';
  const clientMessage = (statusCode === 500 && isProduction)
    ? 'Error interno del servidor'
    : (err.message || 'Error interno del servidor');

  return res.status(statusCode).json({
    status: 'error',
    message: clientMessage
  });
};

export default errorHandler;
