/**
 * Servicio de Negocio para la Gestión del Perfil Académico
 * 
 * Implementa las reglas de negocio RN-01 a RN-10 (RF-03).
 */

import EstudianteModel from '../models/estudiante_model.js';
import UniversidadModel from '../models/universidad_model.js';
import CarreraModel from '../models/carrera_model.js';

export const PerfilAcademicoService = {
  /**
   * Consulta el perfil académico del estudiante autenticado.
   * @param {number|string} estudianteId
   * @returns {Object}
   */
  consultarPerfil(estudianteId) {
    const perfil = EstudianteModel.obtenerPerfilAcademico(estudianteId);
    if (!perfil) {
      const error = new Error('Estudiante no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return {
      perfil_academico: perfil
    };
  },

  /**
   * Configura o actualiza la universidad y carrera meta del estudiante.
   * @param {number|string} estudianteId
   * @param {Object} datos
   * @param {number} datos.universidad_id
   * @param {number} datos.carrera_id
   * @returns {Object}
   */
  configurarPerfil(estudianteId, { universidad_id, carrera_id }) {
    // RN-01 y RN-02: Campos obligatorios
    if (universidad_id === undefined || universidad_id === null) {
      const error = new Error('Debe seleccionar una universidad');
      error.statusCode = 400;
      throw error;
    }

    if (carrera_id === undefined || carrera_id === null) {
      const error = new Error('Debe seleccionar una carrera');
      error.statusCode = 400;
      throw error;
    }

    const numUniId = Number(universidad_id);
    const numCarId = Number(carrera_id);

    if (!Number.isInteger(numUniId) || numUniId <= 0 || !Number.isInteger(numCarId) || numCarId <= 0) {
      const error = new Error('Los identificadores de universidad y carrera deben ser números enteros positivos');
      error.statusCode = 400;
      throw error;
    }

    // Validar existencia de la universidad
    const universidad = UniversidadModel.buscarPorId(numUniId);
    if (!universidad) {
      const error = new Error('La universidad seleccionada no existe');
      error.statusCode = 404;
      throw error;
    }

    // RN-04: Universidad activa
    if (universidad.estado !== 1) {
      const error = new Error('La universidad seleccionada se encuentra inactiva');
      error.statusCode = 400;
      throw error;
    }

    // Validar existencia de la carrera
    const carrera = CarreraModel.buscarPorId(numCarId);
    if (!carrera) {
      const error = new Error('La carrera seleccionada no existe');
      error.statusCode = 404;
      throw error;
    }

    // RN-05: Carrera activa
    if (carrera.estado !== 1) {
      const error = new Error('La carrera seleccionada se encuentra inactiva');
      error.statusCode = 400;
      throw error;
    }

    // RN-03: Relación de pertenencia entre carrera y universidad
    if (carrera.universidad_id !== numUniId) {
      const error = new Error('La carrera seleccionada no pertenece a la universidad elegida');
      error.statusCode = 400;
      throw error;
    }

    // Actualizar registro del estudiante
    const actualizado = EstudianteModel.actualizarPerfilAcademico(estudianteId, {
      universidadId: numUniId,
      carreraId: numCarId
    });

    if (!actualizado) {
      const error = new Error('No se pudo actualizar el perfil del estudiante');
      error.statusCode = 500;
      throw error;
    }

    return EstudianteModel.obtenerPerfilAcademico(estudianteId);
  }
};

export default PerfilAcademicoService;
