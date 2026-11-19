# Tasks

## 1. Esquema de Base de Datos y Semillero de Simulacros

- [ ] 1.1 Actualizar `backend/src/config/database.js` para crear las tablas `simulacros`, `simulacro_preguntas`, `intentos_simulacro` y `respuestas_estudiante` con claves foráneas, restricciones de unicidad y estados válidos, verificando que la inicialización no altere datos existentes.
- [ ] 1.2 Actualizar el semillero `backend/src/config/seed.js` para incorporar simulacros de prueba en estado publicado asociados a UNMSM y UNI con sus preguntas ordenadas, verificando su ejecución idempotente.

## 2. Capa de Modelos de Datos (Models)

- [ ] 2.1 Crear `backend/src/models/simulacro_model.js` con consultas preparadas para listar todos (admin), listar publicados, listar por id, crear, actualizar, cambiar estado (`publicado`, `inactivo`) y recomendar por universidad/carrera.
- [ ] 2.2 Crear `backend/src/models/simulacro_pregunta_model.js` con consultas preparadas para asociar preguntas a simulacro, listar preguntas ordenadas con alternativas (proyección sin `es_correcta` para estudiantes y completa para admin) y desvincular preguntas.
- [ ] 2.3 Crear `backend/src/models/intento_simulacro_model.js` con consultas preparadas para buscar intento activo por estudiante y simulacro, crear intento (`en_progreso`), buscar por id y finalizar intento.
- [ ] 2.4 Crear `backend/src/models/respuesta_estudiante_model.js` con consultas preparadas para registrar o actualizar respuestas (`UPSERT`) y listar respuestas de un intento.

## 3. Capa de Servicios de Negocio (Services)

- [ ] 3.1 Crear `backend/src/services/simulacro_service.js` gestionando la creación y actualización atómica de simulacros (`db.transaction()`), validando duración positiva, pertenencia de carrera a universidad, preguntas activas sin duplicados, y transiciones de estado para publicación y desactivación.
- [ ] 3.2 Crear `backend/src/services/intento_simulacro_service.js` gestionando el inicio de examen, bloqueo de intentos simultáneos no finalizados, entrega segura de reactivos sin clave correcta, guardado progresivo de respuestas (validando pertenencia de pregunta y alternativa) y finalización del examen.

## 4. Capa de Controladores y Rutas (Controllers & Routes)

- [ ] 4.1 Crear `backend/src/controllers/simulacro_controller.js` y `backend/src/routes/simulacro_routes.js` para la administración de simulacros (CRUD, publicación, desactivación), protegiendo endpoints con `roleMiddleware('administrador')`.
- [ ] 4.2 Crear `backend/src/routes/simulacro_disponible_routes.js` para consulta pública de simulacros publicados y recomendados por perfil para estudiantes autenticados.
- [ ] 4.3 Crear `backend/src/controllers/intento_simulacro_controller.js` y `backend/src/routes/intento_simulacro_routes.js` gestionando `/api/simulacros/:id/iniciar`, `/api/intentos/:intentoId/respuestas` y `/api/intentos/:intentoId/finalizar`.
- [ ] 4.4 Registrar las nuevas rutas en `backend/src/app.js` bajo `/api/simulacros`, `/api/simulacros-disponibles` y `/api/intentos`.

## 5. Documentación y Verificación Integral

- [ ] 5.1 Actualizar `backend/README.md` documentando los endpoints de simulacros, disponibles e intentos, esquemas JSON y ejemplos de solicitud y respuesta.
- [ ] 5.2 Crear y ejecutar la suite de pruebas de integración `backend/tests/simulacros_integration.test.js` verificando creación administrativa, publicación, catálogo disponible y recomendado, inicio de examen, bloqueo de intentos simultáneos, ocultamiento de respuestas correctas, guardado de respuestas y finalización.

## Workflow follow-up

- Validar conformidad con `openspec validate --all`.
- Iniciar la implementación con `/opsx-apply fase-5-simulacros`.
