/**
 * Servicio de Autenticación y Criptografía
 * 
 * Gestiona el hashing con bcrypt (RNF-01, min 10 rondas),
 * validación segura de credenciales y generación de JWT (RF-02).
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import EstudianteModel from '../models/estudiante_model.js';

const BCRYPT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'desarrollo_secreto_jwt_para_pruebas_locales_12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const AuthService = {
  /**
   * Registra un nuevo estudiante en el sistema.
   * @param {Object} datos
   * @param {string} datos.nombreCompleto
   * @param {string} datos.correo
   * @param {string} datos.contrasena
   * @returns {Promise<Object>} Estudiante registrado (sin contrasena_hash)
   */
  async registrarEstudiante({ nombreCompleto, correo, contrasena }) {
    // Verificar si el correo ya se encuentra registrado
    const yaExiste = EstudianteModel.existeCorreo(correo);
    if (yaExiste) {
      const error = new Error('El correo electrónico ya se encuentra registrado');
      error.statusCode = 409;
      throw error;
    }

    // Hashear contraseña con bcrypt (factor de costo mínimo: 10 rondas)
    const contrasenaHash = await bcrypt.hash(contrasena, BCRYPT_ROUNDS);

    // Persistir estudiante con rol predeterminado
    const nuevoEstudiante = EstudianteModel.crear({
      nombreCompleto,
      correo,
      contrasenaHash,
      rol: 'estudiante'
    });

    return nuevoEstudiante;
  },

  /**
   * Valida credenciales y genera un token JWT.
   * @param {Object} credenciales
   * @param {string} credenciales.correo
   * @param {string} credenciales.contrasena
   * @returns {Promise<{token: string, usuario: Object}>}
   */
  async iniciarSesion({ correo, contrasena }) {
    // Buscar estudiante por correo
    const estudiante = EstudianteModel.buscarPorCorreo(correo);

    // Mensaje genérico de error para evitar enumeración de usuarios
    if (!estudiante) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Comparar hash con la contraseña provista
    const contrasenaValida = await bcrypt.compare(contrasena, estudiante.contrasena_hash);
    if (!contrasenaValida) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Generar token JWT con payload estándar
    const payload = {
      estudianteId: estudiante.id,
      rol: estudiante.rol
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return {
      token,
      usuario: {
        id: estudiante.id,
        nombre_completo: estudiante.nombre_completo,
        correo: estudiante.correo,
        rol: estudiante.rol
      }
    };
  }
};

export default AuthService;
