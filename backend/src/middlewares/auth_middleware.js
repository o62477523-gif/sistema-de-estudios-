/**
 * Middleware de Autenticación JWT
 * 
 * Intercepta peticiones protegidas y valida la firma y vigencia del token JWT (RNF-02).
 * Inyecta los datos de identidad en `req.user`.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'desarrollo_secreto_jwt_para_pruebas_locales_12345';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verificar existencia de la cabecera Authorization
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Token de autenticación no proporcionado'
    });
  }

  // Verificar formato Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      status: 'error',
      message: 'Formato de token inválido. Debe ser: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Inyectar la identidad validada en el request
    req.user = {
      estudianteId: decoded.estudianteId,
      rol: decoded.rol
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token de autenticación inválido o expirado'
    });
  }
};

export default authMiddleware;
