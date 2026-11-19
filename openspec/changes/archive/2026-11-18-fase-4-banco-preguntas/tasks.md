# Tasks

## 1. Esquema de Base de Datos y Semillero de Contenidos

- [x] 1.1 Actualizar `backend/src/config/database.js` para crear las tablas `areas`, `materias`, `temas`, `preguntas` y `alternativas` con claves foráneas, restricciones UNIQUE/CHECK y estados por defecto, verificando que la inicialización no altere datos existentes.
- [x] 1.2 Actualizar el semillero `backend/src/config/seed.js` para incorporar áreas, materias, temas y preguntas de prueba con alternativas de forma idempotente, verificando su ejecución sin duplicados.

## 2. Capa de Modelos de Datos (Models)

- [x] 2.1 Crear `backend/src/models/area_model.js` con consultas preparadas para listar activas, buscar por ID, insertar, actualizar y desactivar (soft delete).
- [x] 2.2 Crear `backend/src/models/materia_model.js` con consultas preparadas para listar activas, listar por área, buscar por ID, insertar, actualizar y desactivar.
- [x] 2.3 Crear `backend/src/models/tema_model.js` con consultas preparadas para listar activos, listar por materia, buscar por ID, insertar, actualizar y desactivar.
- [x] 2.4 Crear `backend/src/models/pregunta_model.js` y `backend/src/models/alternativa_model.js` con consultas preparadas para inserción de preguntas y alternativas, búsqueda por ID con alternativas, listado por tema y actualización atómica.

## 3. Capa de Servicios de Negocio (Services)

- [x] 3.1 Crear `backend/src/services/area_service.js` con validaciones de unicidad de nombre, campos obligatorios no vacíos y control de existencia y estado.
- [x] 3.2 Crear `backend/src/services/materia_service.js` con validaciones de pertenencia a área activa, unicidad y campos no vacíos.
- [x] 3.3 Crear `backend/src/services/tema_service.js` con validaciones de pertenencia a materia activa, unicidad y campos no vacíos.
- [x] 3.4 Crear `backend/src/services/pregunta_service.js` gestionando transacciones atómicas (`db.transaction()`), validando que el tema exista y esté activo, enunciado no vacío, mínimo 2 alternativas y exactamente una alternativa correcta (`es_correcta = 1`).

## 4. Capa de Controladores y Rutas (Controllers & Routes)

- [x] 4.1 Crear `backend/src/controllers/area_controller.js` y `backend/src/routes/area_routes.js` con respuestas JSON estandarizadas, protegiendo lecturas con `authMiddleware` y mutaciones con `roleMiddleware('administrador')`.
- [x] 4.2 Crear `backend/src/controllers/materia_controller.js` y `backend/src/routes/materia_routes.js` permitiendo listar globales o por área, y mutaciones administrativas.
- [x] 4.3 Crear `backend/src/controllers/tema_controller.js` y `backend/src/routes/tema_routes.js` permitiendo listar globales o por materia, y mutaciones administrativas.
- [x] 4.4 Crear `backend/src/controllers/pregunta_controller.js` y `backend/src/routes/pregunta_routes.js` permitiendo consulta por tema y por ID para estudiantes, y CRUD administrativo transaccional.
- [x] 4.5 Registrar las nuevas rutas en `backend/src/app.js` bajo `/api/areas`, `/api/materias`, `/api/temas` y `/api/preguntas`.

## 5. Documentación y Verificación Integral

- [x] 5.1 Actualizar `backend/README.md` documentando los endpoints del catálogo académico y banco de preguntas, esquemas JSON y ejemplos de solicitud y respuesta.
- [x] 5.2 Crear y ejecutar la suite de pruebas de integración `backend/tests/banco_preguntas_integration.test.js` verificando jerarquía completa, transaccionalidad de preguntas, validación de alternativas, restricciones de rol administrativo y consultas de estudiantes.

## Workflow follow-up

- Validar conformidad con `openspec validate --all`.
- Iniciar la implementación con `/opsx-apply fase-4-banco-preguntas`.
