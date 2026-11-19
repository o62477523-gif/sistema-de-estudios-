# Proposal

## Why

Para proteger la información personal, perfiles académicos y resultados de simulacros de los postulantes, es fundamental implementar un sistema robusto y seguro de autenticación y autorización basado en JSON Web Tokens (JWT), cifrado de contraseñas con bcrypt y persistencia relacional en SQLite 3.

Esta Fase 2 implementa los requerimientos funcionales RF-01 (Registro de Estudiante), RF-02 (Inicio de Sesión y Control de Sesión con JWT) y los requerimientos no funcionales RNF-01 (Encriptación con bcrypt $\ge 10$ rondas), RNF-02 (Protección de rutas privadas) y RNF-03 (Consultas preparadas en SQLite), siguiendo estrictamente el patrón Controller → Service → Model sobre la infraestructura construida en la Fase 1.

## What Changes

- **Persistencia y Modelo de Estudiantes:** Creación de la tabla `estudiantes` en SQLite 3 con campos `id`, `nombre_completo`, `correo` (único), `contrasena_hash`, `rol` (por defecto `estudiante`) y `created_at`.
- **Capa de Acceso a Datos (`src/models/estudiante_model.js`):** Implementación de operaciones CRUD básicas utilizando exclusivamente consultas SQL preparadas (*Prepared Statements*).
- **Lógica de Autenticación (`src/services/auth_service.js`):**
  - Hashing seguro de contraseñas mediante `bcrypt` con un costo mínimo de 10 rondas.
  - Validación de credenciales y generación de JWT firmados con expiración de 24 horas (`JWT_EXPIRES_IN=24h`).
  - Comparación segura de contraseñas sin revelar la existencia o no de un correo electrónico en intentos fallidos.
- **Controlador de Autenticación (`src/controllers/auth_controller.js`):**
  - Validación de datos de entrada (nombre no vacío, formato de correo, contraseña $\ge 8$ caracteres con al menos una mayúscula y un número).
  - Sanitización de respuestas para garantizar que nunca se expongan contraseñas ni hashes.
- **Rutas de Autenticación (`src/routes/auth_routes.js`):**
  - `POST /api/auth/registro` (creación de cuenta con respuesta `201 Created` o `409 Conflict`).
  - `POST /api/auth/login` (autenticación con respuesta `200 OK` o `401 Unauthorized`).
- **Middlewares de Seguridad y Control de Acceso:**
  - `src/middlewares/auth_middleware.js`: Validación de cabecera `Authorization: Bearer <token>`, verificación de firma y expiración del JWT, e inyección de datos de identidad en `req.user`.
  - `src/middlewares/role_middleware.js`: Middleware reutilizable (`autorizarRoles('administrador', ...)`) para control de acceso basado en roles con respuesta `403 Forbidden`.
- **Configuración y Dependencias:**
  - Instalación de `bcrypt`, `jsonwebtoken` y el driver de base de datos SQLite en `backend/package.json`.
  - Actualización de `backend/.env.example` con `JWT_SECRET` y `JWT_EXPIRES_IN`.

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad de dominio; se refina la capacidad viva ya existente -->

### Modified Capabilities
- `autenticacion`: Se especifican con exactitud las reglas de persistencia, validaciones de formato de contraseña (mínimo 8 caracteres, al menos una mayúscula y un número), factor de costo bcrypt $\ge 10$, estructura de carga útil en JWT (`estudiante_id`, `rol`) y el mecanismo de autorización por roles (RF-01, RF-02, RNF-01, RNF-02, RNF-03).

## Impact

- **Código:** Se agregan `auth_controller.js`, `auth_service.js`, `estudiante_model.js`, `auth_routes.js`, `auth_middleware.js` y `role_middleware.js`, y se conecta la inicialización de la tabla en `database.js`.
- **APIs:** Se publican los endpoints `POST /api/auth/registro` y `POST /api/auth/login`, y se prepara el soporte de cabecera `Authorization: Bearer <token>` para rutas protegidas.
- **Dependencias:** Adición de `bcrypt`, `jsonwebtoken` y `better-sqlite3` (o `sqlite3`) en `backend/package.json`.
- **Seguridad:** Cero almacenamiento de contraseñas en texto plano, protección contra inyección SQL mediante consultas preparadas y rechazo genérico en credenciales incorrectas.
