/**
 * Middleware para capturar rutas no encontradas (404 Not Found).
 * 
 * Retorna una respuesta JSON estandarizada con status: "error".
 */

export const notFoundHandler = (req, res, next) => {
  return res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
};

export default notFoundHandler;
