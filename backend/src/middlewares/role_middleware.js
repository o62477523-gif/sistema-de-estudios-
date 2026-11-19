/**
 * Middleware de Autorización Basado en Roles
 * 
 * Fábrica de middleware para restringir acceso a rutas según los roles permitidos.
 * Ejemplo de uso: autorizarRoles('administrador')
 */

export const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    // Verificar que la petición haya pasado previamente por authMiddleware
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Acceso no autorizado: sesión no iniciada'
      });
    }

    // Verificar si el rol del usuario figura entre los permitidos
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    return next();
  };
};

export default autorizarRoles;
