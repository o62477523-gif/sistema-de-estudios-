/**
 * Servicio de Negocio para Materias Académicas
 * 
 * Implementa validaciones y lógica de negocio para materias y su relación con áreas.
 */

import MateriaModel from '../models/materia_model.js';
import AreaModel from '../models/area_model.js';

export const MateriaService = {
  /**
   * Obtiene la lista de todas las materias activas.
   * @returns {Array<Object>}
   */
  listarMaterias() {
    return MateriaModel.listarActivas();
  },

  /**
   * Obtiene las materias activas pertenecientes a un área específica.
   * @param {number|string} areaId
   * @returns {Array<Object>}
   */
  listarMateriasPorArea(areaId) {
    const numAreaId = Number(areaId);
    if (!Number.isInteger(numAreaId) || numAreaId <= 0) {
      const error = new Error('Identificador de área inválido');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que el área exista y se encuentre activa
    const area = AreaModel.buscarActivaPorId(numAreaId);
    if (!area) {
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return MateriaModel.listarActivasPorArea(numAreaId);
  },

  /**
   * Obtiene los detalles de una materia por su ID.
   * @param {number|string} id
   * @param {boolean} [soloActiva=true]
   * @returns {Object}
   */
  obtenerMateriaPorId(id, soloActiva = true) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de materia inválido');
      error.statusCode = 400;
      throw error;
    }

    const materia = soloActiva
      ? MateriaModel.buscarActivaPorId(numId)
      : MateriaModel.buscarPorId(numId);

    if (!materia) {
      const error = new Error('Materia no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return materia;
  },

  /**
   * Registra una nueva materia dentro de un área académica (solo administrador).
   * @param {Object} datos
   * @param {number|string} datos.area_id
   * @param {string} datos.nombre
   * @param {string} [datos.descripcion]
   * @returns {Object}
   */
  crearMateria({ area_id, nombre, descripcion }) {
    const numAreaId = Number(area_id);
    if (!Number.isInteger(numAreaId) || numAreaId <= 0) {
      const error = new Error('Identificador de área inválido');
      error.statusCode = 400;
      throw error;
    }

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      const error = new Error('El nombre de la materia es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que el área exista
    const area = AreaModel.buscarPorId(numAreaId);
    if (!area) {
      const error = new Error('El área especificada no existe');
      error.statusCode = 404;
      throw error;
    }

    if (area.estado !== 1) {
      const error = new Error('No se pueden crear materias en un área inactiva');
      error.statusCode = 400;
      throw error;
    }

    const nombreLimpio = nombre.trim();
    const existente = MateriaModel.buscarPorAreaYNombre(numAreaId, nombreLimpio);
    if (existente) {
      const error = new Error('Ya existe una materia con ese nombre en esta área');
      error.statusCode = 409;
      throw error;
    }

    return MateriaModel.crear({
      area_id: numAreaId,
      nombre: nombreLimpio,
      descripcion: descripcion ? descripcion.trim() : null
    });
  },

  /**
   * Actualiza los datos de una materia (solo administrador).
   * @param {number|string} id
   * @param {Object} datos
   * @param {number|string} [datos.area_id]
   * @param {string} [datos.nombre]
   * @param {string} [datos.descripcion]
   * @returns {Object}
   */
  actualizarMateria(id, { area_id, nombre, descripcion }) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de materia inválido');
      error.statusCode = 400;
      throw error;
    }

    const actual = MateriaModel.buscarPorId(numId);
    if (!actual) {
      const error = new Error('Materia no encontrada');
      error.statusCode = 404;
      throw error;
    }

    let nuevoAreaId = actual.area_id;
    if (area_id !== undefined) {
      const parsedAreaId = Number(area_id);
      if (!Number.isInteger(parsedAreaId) || parsedAreaId <= 0) {
        const error = new Error('Identificador de área inválido');
        error.statusCode = 400;
        throw error;
      }

      const area = AreaModel.buscarPorId(parsedAreaId);
      if (!area) {
        const error = new Error('El área especificada no existe');
        error.statusCode = 404;
        throw error;
      }
      if (area.estado !== 1) {
        const error = new Error('No se puede asociar una materia a un área inactiva');
        error.statusCode = 400;
        throw error;
      }
      nuevoAreaId = parsedAreaId;
    }

    let nuevoNombre = actual.nombre;
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || !nombre.trim()) {
        const error = new Error('El nombre de la materia no puede estar vacío');
        error.statusCode = 400;
        throw error;
      }
      nuevoNombre = nombre.trim();
    }

    // Verificar si el nuevo nombre colisiona con otra materia en el área
    const existente = MateriaModel.buscarPorAreaYNombre(nuevoAreaId, nuevoNombre);
    if (existente && existente.id !== numId) {
      const error = new Error('Ya existe una materia con ese nombre en esta área');
      error.statusCode = 409;
      throw error;
    }

    const nuevaDescripcion = descripcion !== undefined
      ? (descripcion ? descripcion.trim() : null)
      : actual.descripcion;

    return MateriaModel.actualizar(numId, {
      area_id: nuevoAreaId,
      nombre: nuevoNombre,
      descripcion: nuevaDescripcion
    });
  },

  /**
   * Desactiva lógicamente una materia (soft delete).
   * @param {number|string} id
   * @returns {boolean}
   */
  desactivarMateria(id) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      const error = new Error('Identificador de materia inválido');
      error.statusCode = 400;
      throw error;
    }

    const actual = MateriaModel.buscarPorId(numId);
    if (!actual) {
      const error = new Error('Materia no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return MateriaModel.desactivar(numId);
  }
};

export default MateriaService;
