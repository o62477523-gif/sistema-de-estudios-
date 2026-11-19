# Proposal

## Why

Para que los estudiantes de la plataforma puedan personalizar su preparación preuniversitaria, enfocar sus simulacros y recibir estadísticas relevantes para su objetivo, es necesario implementar la gestión del perfil académico (RF-03).

Esta Fase 3 amplía la arquitectura existente creando los catálogos relacionales de universidades y carreras profesionales en SQLite, relacionándolos con la entidad `estudiantes` y exponiendo endpoints seguros protegidos con JWT que validan la pertenencia e integridad de la selección académica.

## What Changes

- **Modelo de Base de Datos y Migraciones:**
  - Creación de la tabla `universidades` (`id`, `nombre`, `siglas`, `descripcion`, `estado`, `created_at`).
  - Creación de la tabla `carreras` (`id`, `universidad_id`, `nombre`, `descripcion`, `estado`, `created_at`).
  - Ampliación de la tabla `estudiantes` para incluir `universidad_id` y `carrera_id` como claves foráneas nulables.
  - Implementación de un mecanismo seguro de inicialización/migración de esquema y datos de prueba (*seeds*) para UNMSM, UNI, UNSA y UNT con sus respectivas carreras.
- **Capa de Modelos (Models):**
  - `src/models/universidad_model.js`: Consultas preparadas para listar y obtener universidades activas.
  - `src/models/carrera_model.js`: Consultas preparadas para listar carreras activas por universidad y validar su pertenencia.
  - Actualización de `src/models/estudiante_model.js` para actualizar y consultar las metas académicas del estudiante.
- **Capa de Servicios (Services):**
  - `src/services/universidad_service.js`: Lógica de consulta de universidades.
  - `src/services/carrera_service.js`: Lógica de consulta y validación de carreras.
  - `src/services/perfil_academico_service.js`: Lógica para configurar, actualizar y consultar el perfil académico, validando que la carrera pertenezca a la universidad y que ambas estén activas.
- **Capa de Controladores (Controllers):**
  - `src/controllers/universidad_controller.js`: Endpoints `GET /api/universidades` y `GET /api/universidades/:id`.
  - `src/controllers/carrera_controller.js`: Endpoints `GET /api/universidades/:universidadId/carreras` y `GET /api/carreras/:id`.
  - `src/controllers/perfil_academico_controller.js`: Endpoints `GET /api/perfil-academico` y `PUT /api/perfil-academico`.
- **Rutas e Integración Express:**
  - `src/routes/universidad_routes.js`, `src/routes/carrera_routes.js` y `src/routes/perfil_academico_routes.js`.
  - Integración en `src/app.js` con protección mediante `authMiddleware`.
- **Documentación y Pruebas:**
  - Actualización de `backend/README.md`.
  - Suite de pruebas de integración completa para universidades, carreras y perfil académico.

## Capabilities

### New Capabilities
<!-- No se agregan nuevas capacidades raíz; se amplía perfil-academico -->

### Modified Capabilities
- `perfil-academico`: Se incorporan los requerimientos para la consulta del catálogo de universidades activas, catálogo de carreras asociadas y las reglas de validación de pertenencia e integridad de la meta académica (RF-03, RN-01 a RN-10).

## Impact

- **Código:** Se crean controladores, servicios y modelos para universidades, carreras y perfil académico, manteniendo el desacoplamiento de capas.
- **Base de Datos:** Se aplican cambios DDL en SQLite agregando `universidades`, `carreras` y alterando `estudiantes` preservando los datos existentes y claves foráneas (`PRAGMA foreign_keys = ON;`).
- **Seguridad:** Todas las operaciones sobre el perfil académico se vinculan estrictamente al `req.user.estudianteId` del JWT verificado.
