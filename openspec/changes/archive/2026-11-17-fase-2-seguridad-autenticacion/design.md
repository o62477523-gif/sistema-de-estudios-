# Design

## Context

Sobre la arquitectura de 3 capas creada en la Fase 1, se requiere implementar el subsistema de autenticación, seguridad y autorización para estudiantes y administradores. Este componente es crítico para salvaguardar la privacidad de los alumnos y garantizar que únicamente usuarios autenticados accedan a la rendición de simulacros y que las acciones privilegiadas queden reservadas para administradores.

## Goals / Non-Goals

**Goals:**
- Implementar la persistencia relacional en SQLite 3 para la entidad `estudiantes` con clave primaria, correo único, contraseña hasheada y rol.
- Implementar la capa de datos `src/models/estudiante_model.js` exclusivamente con consultas SQL preparadas (*Prepared Statements*), protegiendo contra inyecciones SQL (RNF-03).
- Implementar la capa de servicio `src/services/auth_service.js` para hashing de contraseñas con `bcrypt` ($\ge 10$ rondas) y generación/verificación de tokens con `jsonwebtoken`.
- Implementar el controlador `src/controllers/auth_controller.js` con validaciones rigurosas (campos obligatorios, formato email, política de contraseña de al menos 8 caracteres, 1 mayúscula y 1 número).
- Implementar el middleware de autenticación `src/middlewares/auth_middleware.js` para validar la cabecera `Authorization: Bearer <token>` e inyectar `req.user`.
- Implementar el middleware de autorización `src/middlewares/role_middleware.js` (`autorizarRoles('administrador', ...)`) con respuesta `403 Forbidden`.
- Mantener las respuestas JSON estandarizadas (`status: "success"` / `status: "error"`).

**Non-Goals:**
- No implementar recuperación de contraseña por correo ni confirmación de email (fuera del alcance de la fase).
- No implementar la selección de universidad/carrera ni perfil académico extendido (Fase 3).
- No implementar CRUD de preguntas ni endpoints de simulacros.

## Decisions

### 1. Driver de Persistencia SQLite 3 y Manejo de Conexión
- **Decisión:** Utilizar `better-sqlite3` para la conexión y ejecución de consultas preparadas sincrónicas y de alto rendimiento en SQLite, integrando la inicialización DDL de la tabla `estudiantes` en `src/config/database.js`.
- **Justificación:** `better-sqlite3` proporciona la API más limpia, rápida y segura para consultas preparadas sincrónicas (`db.prepare(...).get(...)`, `db.prepare(...).run(...)`), eliminando la complejidad asíncrona innecesaria en la base de datos embebida y garantizando la ejecución de `PRAGMA foreign_keys = ON;`.
- **Alternativas consideradas:** `sqlite3` tradicional con callbacks (más propenso a errores de concurrencia y callback hell) y `sqlite` wrapper asíncrono.

### 2. Estructura y Seguridad del Token JWT
- **Decisión:** El JWT contendrá únicamente `estudianteId` y `rol` en el payload, con expiración configurada en 24 horas (`JWT_EXPIRES_IN=24h`).
- **Justificación:** Mantiene el token ligero, no incluye datos sensibles (como correos o hashes) y cumple la política de sesión de 24 horas definida en el SRS (RF-02).
- **Alternativas consideradas:** Incluir nombre completo y correo en el JWT. Descartado para minimizar el tamaño del token en cada cabecera HTTP y evitar exponer PII en tokens no cifrados.

### 3. Mitigación de Enumeración de Usuarios (Timing & Mensajes)
- **Decisión:** Tanto cuando el correo no existe como cuando la contraseña es incorrecta, el endpoint `/api/auth/login` responderá con código `401 Unauthorized` y el mensaje genérico `"Credenciales inválidas"`.
- **Justificación:** Evita que atacantes deduzcan qué correos están registrados en la plataforma.
- **Alternativas consideradas:** Responder "Usuario no encontrado" vs "Contraseña errónea". Descartado por ser una vulnerabilidad de divulgación de cuentas.

### 4. Middleware de Autorización por Factoría de Roles
- **Decisión:** Implementar `autorizarRoles(...rolesPermitidos)` como una función de orden superior que retorna un middleware Express.
- **Justificación:** Permite su reutilización declarativa en cualquier ruta: `router.post('/admin/preguntas', authMiddleware, autorizarRoles('administrador'), ...)`.
- **Alternativas consideradas:** Middlewares separados por cada rol (`esAdmin`, `esEstudiante`). Descartado por falta de escalabilidad ante nuevos roles.

## Risks / Trade-offs

- **[Riesgo: Falta de `JWT_SECRET` en variables de entorno]** → *Mitigación:* La aplicación validará al inicializarse o en el servicio de autenticación que `JWT_SECRET` esté definido; en modo producción lanzará un error crítico si la clave está ausente o es la predeterminada de desarrollo.
- **[Riesgo: Fuga de contraseñas o hashes en respuestas JSON]** → *Mitigación:* El modelo y servicio filtrarán explícitamente `contrasena_hash` antes de retornar el objeto usuario al controlador.
- **[Riesgo: Corrupción de base de datos o bloqueos en SQLite]** → *Mitigación:* Se activará el modo WAL (`PRAGMA journal_mode = WAL;`) en la conexión SQLite para soportar lecturas concurrentes sin bloquear escrituras.
