# Tasks

## 1. Esquema de Base de Datos y Semillero de Datos

- [x] 1.1 Actualizar `backend/src/config/database.js` para crear las tablas `universidades` y `carreras`, y agregar incrementalmente las columnas `universidad_id` y `carrera_id` en la tabla `estudiantes` verificando la integridad de las columnas existentes.
- [x] 1.2 Crear el script de semillero idempotente `backend/src/config/seed.js` para insertar universidades (UNMSM, UNI, UNSA, UNT) y carreras de prueba, verificando que no genere duplicados en múltiples ejecuciones.

## 2. Capa de Modelos de Datos (Models)

- [x] 2.1 Crear `backend/src/models/universidad_model.js` implementando consultas preparadas para listar universidades activas y buscar por ID.
- [x] 2.2 Crear `backend/src/models/carrera_model.js` implementando consultas preparadas para listar carreras activas por universidad y buscar por ID.
- [x] 2.3 Actualizar `backend/src/models/estudiante_model.js` agregando métodos para actualizar la meta académica y consultar el perfil del estudiante con detalles de universidad y carrera.

## 3. Capa de Servicios de Negocio (Services)

- [x] 3.1 Crear `backend/src/services/universidad_service.js` implementando la lógica de obtención y validación de universidades activas.
- [x] 3.2 Crear `backend/src/services/carrera_service.js` implementando la lógica de obtención y validación de carreras activas.
- [x] 3.3 Crear `backend/src/services/perfil_academico_service.js` implementando la consulta y actualización del perfil académico con validación de pertenencia (carrera pertenece a universidad) y estados activos.

## 4. Capa de Controladores (Controllers)

- [x] 4.1 Crear `backend/src/controllers/universidad_controller.js` con los métodos `listar` y `obtenerPorId` retornando respuestas JSON estandarizadas.
- [x] 4.2 Crear `backend/src/controllers/carrera_controller.js` con los métodos `listarPorUniversidad` y `obtenerPorId` retornando respuestas JSON estandarizadas.
- [x] 4.3 Crear `backend/src/controllers/perfil_academico_controller.js` con los métodos `obtenerPerfil` y `configurarPerfil` vinculando la identidad desde `req.user.estudianteId`.

## 5. Rutas e Integración en Express

- [x] 5.1 Crear `backend/src/routes/universidad_routes.js` y `backend/src/routes/carrera_routes.js` con protección mediante `authMiddleware`.
- [x] 5.2 Crear `backend/src/routes/perfil_academico_routes.js` con endpoints `GET` y `PUT` protegidos con `authMiddleware`.
- [x] 5.3 Registrar las nuevas rutas en `backend/src/app.js` bajo `/api/universidades`, `/api/carreras` y `/api/perfil-academico`.

## 6. Documentación y Verificación Integral

- [x] 6.1 Actualizar `backend/README.md` documentando los nuevos endpoints del catálogo académico y perfil de estudiante con ejemplos de solicitud y respuesta.
- [x] 6.2 Crear y ejecutar la suite de pruebas de integración `backend/tests/perfil_academico_integration.test.js` verificando el catálogo de universidades, carreras, perfil no configurado, configuración válida, modificación, rechazo por incompatibilidad de carrera/universidad y protección con JWT.

## Workflow follow-up

- Validar conformidad con `openspec validate --all`.
- Iniciar la implementación con `/opsx-apply fase-3-perfil-academico`.
