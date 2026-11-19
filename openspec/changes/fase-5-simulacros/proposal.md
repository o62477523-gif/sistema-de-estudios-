# Proposal: Fase 5 - Desarrollo del Módulo de Simulacros de Admisión

## Why

Una vez implementados el catálogo académico, el perfil de metas y el banco de preguntas jerarquizado (Fases 1 a 4), la plataforma requiere permitir el ensamblado de exámenes de admisión (simulacros), su vinculación con universidades y carreras, la rendición cronometrada por parte de los estudiantes y el registro persistente de sus respuestas (RF-07, RF-08, RF-09). Esta fase sienta las bases operativas de las evaluaciones preuniversitarias antes de abordar la calificación algorítmica en la siguiente etapa.

## What Changes

- **Esquema de Base de Datos para Evaluaciones:** Creación de 4 nuevas tablas normalizadas en SQLite (`simulacros`, `simulacro_preguntas`, `intentos_simulacro`, `respuestas_estudiante`) con claves foráneas, restricciones de unicidad e índices para garantizar consistencia e integridad referencial.
- **Gestión Administrativa del Ciclo de Vida de Simulacros:**
  - Creación atómica de simulacros asociando preguntas existentes del banco (`POST /api/simulacros`) validando duración positiva, pertenencia de carrera a universidad y unicidad de preguntas (sin reactivos duplicados).
  - Listado y detalle administrativo de simulacros (`GET /api/simulacros`, `GET /api/simulacros/:id`).
  - Edición y transición de estados: borrador (`borrador`), publicación (`publicado`) tras validar preguntas asociadas, y desactivación (`inactivo`).
- **Catálogo de Simulacros para Estudiantes:**
  - Consulta de simulacros publicados (`GET /api/simulacros-disponibles`, `GET /api/simulacros-disponibles/:id`).
  - Recomendación personalizada (`GET /api/simulacros-disponibles/recomendados`) basada en la meta académica del estudiante (Fase 3).
- **Rendición de Examen y Control de Intentos:**
  - Inicio de simulacro (`POST /api/simulacros/:id/iniciar`): creación de intento en estado `en_progreso`, bloqueo de intentos simultáneos no terminados del mismo examen para el estudiante y entrega de reactivos y alternativas **sin exponer las respuestas correctas** (`es_correcta`).
  - Guardado y actualización atómica de respuestas (`POST /api/intentos/:intentoId/respuestas`) durante el intento en curso, permitiendo respuestas en blanco (`alternativa_id: null`).
  - Finalización de simulacro (`POST /api/intentos/:intentoId/finalizar`): marca de tiempo final, transición a estado `finalizado` y bloqueo de modificaciones posteriores.
- **Exclusiones Explícitas (Fase Posterior):**
  - En esta fase **no** se implementa el cálculo de puntajes ni ponderaciones universitarias (RF-10 se completará en la Fase 6).

## Capabilities

### New Capabilities
*(Ninguna nueva capacidad raíz; se amplía y formaliza la capacidad existente `simulacros`).*

### Modified Capabilities
- `simulacros`: Modifica y detalla la creación de simulacros a partir del banco de preguntas, el ciclo de vida de publicación, la consulta de simulacros disponibles y recomendados, el inicio de intentos protegidos sin filtración de respuestas correctas, el registro progresivo de respuestas y la finalización del examen (RF-07, RF-08, RF-09).

## Impact

- **Código Backend:**
  - Nuevos modelos: `simulacro_model.js`, `simulacro_pregunta_model.js`, `intento_simulacro_model.js`, `respuesta_estudiante_model.js`.
  - Nuevos servicios: `simulacro_service.js`, `intento_simulacro_service.js`.
  - Nuevos controladores: `simulacro_controller.js`, `intento_simulacro_controller.js`.
  - Nuevas rutas: `simulacro_routes.js`, `simulacro_disponible_routes.js`, `intento_simulacro_routes.js`.
  - Integración en `src/app.js` registrando `/api/simulacros`, `/api/simulacros-disponibles` y `/api/intentos`.
  - Migración en `src/config/database.js` para crear las tablas del módulo.
- **Seguridad:** Aislamiento total de intentos por estudiante (`req.user.estudianteId`), supresión de `es_correcta` en respuestas hacia el cliente y protección de endpoints administrativos con `roleMiddleware('administrador')`.
