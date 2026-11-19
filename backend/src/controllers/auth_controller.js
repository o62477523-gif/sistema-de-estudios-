/**
 * Controlador de Autenticación
 * 
 * Valida solicitudes de registro y login, delega la lógica al servicio
 * y retorna respuestas HTTP estandarizadas.
 */

import AuthService from '../services/auth_service.js';

// Expresión regular para validar formato básico de correo electrónico
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthController = {
  /**
   * Procesa el registro de un nuevo estudiante.
   * POST /api/auth/registro
   */
  async registro(req, res, next) {
    try {
      const { nombre_completo, correo, contrasena } = req.body;

      // Validación de nombre completo
      if (!nombre_completo || typeof nombre_completo !== 'string' || nombre_completo.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El nombre completo es obligatorio y no puede estar vacío'
        });
      }

      // Validación de correo electrónico
      if (!correo || typeof correo !== 'string' || !EMAIL_REGEX.test(correo.trim())) {
        return res.status(400).json({
          status: 'error',
          message: 'Debe proporcionar un correo electrónico válido'
        });
      }

      // Validación de política de contraseña: min 8 caracteres, 1 mayúscula, 1 número
      if (!contrasena || typeof contrasena !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'La contraseña es obligatoria'
        });
      }

      if (contrasena.length < 8) {
        return res.status(400).json({
          status: 'error',
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      if (!/[A-Z]/.test(contrasena)) {
        return res.status(400).json({
          status: 'error',
          message: 'La contraseña debe contener al menos una letra mayúscula'
        });
      }

      if (!/[0-9]/.test(contrasena)) {
        return res.status(400).json({
          status: 'error',
          message: 'La contraseña debe contener al menos un número'
        });
      }

      const estudiante = await AuthService.registrarEstudiante({
        nombreCompleto: nombre_completo.trim(),
        correo: correo.trim().toLowerCase(),
        contrasena
      });

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Estudiante registrado correctamente',
          estudiante
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Procesa el inicio de sesión y emisión de JWT.
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { correo, contrasena } = req.body;

      // Validación de campos requeridos
      if (!correo || !contrasena || typeof correo !== 'string' || typeof contrasena !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Debe ingresar su correo electrónico y contraseña'
        });
      }

      const resultado = await AuthService.iniciarSesion({
        correo: correo.trim().toLowerCase(),
        contrasena
      });

      return res.status(200).json({
        status: 'success',
        data: {
          token: resultado.token,
          usuario: resultado.usuario
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default AuthController;
