# Design: Fase 4 - Desarrollo del Banco de Preguntas

## Context

Las Fases 1, 2 y 3 dotaron al sistema de una arquitectura modular de 3 capas (Routes → Controllers → Services → Models → SQLite con `better-sqlite3`), autenticación mediante JWT (con expiración de 24 horas y roles `estudiante` y `administrador`), y gestión de perfil académico. La Fase 4 construye el núcleo del repositorio de contenidos: la jerarquía académica (Áreas → Materias → Temas) y el banco de preguntas con alternativas de opción múltiple, requeridos para alimentar los simulacros de admisión (RF-04, RF-05, RF-06).

## Goals / Non-Goals

**Goals:**
- Implementar las 5 tablas normalizadas (`areas`, `materias`, `temas`, `preguntas`, `alternativas`) en SQLite con restricciones de clave foránea (`PRAGMA foreign_keys = ON;`).
- Garantizar la creación y actualización atómica de preguntas y sus alternativas mediante transacciones síncronas de base de datos (`db.transaction()`).
- Implementar validaciones de negocio estrictas: al menos 2 alternativas por pregunta (típicamente 4 o 5) y exactamente 1 alternativa marcada como correcta (`es_correcta = 1`).
- Aplicar borrado lógico (*soft delete*) con `estado = 0` para preservar la trazabilidad histórica de evaluaciones.
- Proteger endpoints de mutación (`POST`, `PUT`, `DELETE`) exigiendo rol `administrador` mediante `roleMiddleware('administrador')`.
- Permitir a estudiantes autenticados consultar el catálogo académico y preguntas activas por tema.
- Mantener consultas preparadas (*Prepared Statements*) en todos los modelos para prevenir inyecciones SQL.

**Non-Goals:**
- No implementar el motor de ensamblado ni cálculo de puntajes de simulacros (Fase 5).
- No implementar la calificación de respuestas de estudiantes ni almacenamiento de exámenes rendidos (Fase 5).
- No integrar la API externa de IA generativa para explicaciones en esta etapa (Fase 6 / analitica-ia).

## Decisions

### 1. Modelo de Datos y Restricciones Jerárquicas
- **Decisión:** Modelar la jerarquía en cascada estricta: `areas` (1) → (N) `materias` (1) → (N) `temas` (1) → (N) `preguntas` (1) → (N) `alternativas`.
- **Razón:** Refleja la organización pedagógica de los temarios de admisión universitaria en Perú (ej. UNMSM, UNI) y simplifica los filtros de navegación.
- **Alternativas consideradas:** Tabla desnormalizada única con tags. Descartada por provocar inconsistencias de nomenclatura y violar el SRS (RF-04).

### 2. Transaccionalidad Atómica en Preguntas y Alternativas
- **Decisión:** Ejecutar la inserción y actualización de preguntas junto con sus alternativas dentro de `db.transaction()` en `pregunta_service.js`.
- **Razón:** Si una pregunta se inserta pero falla la inserción de una alternativa, o si la validación detecta más de una respuesta correcta, la transacción se revierte automáticamente sin dejar preguntas huérfanas o incompletas en la base de datos.
- **Alternativas consideradas:** Inserciones secuenciales separadas. Descartadas por riesgo de corrupción ante errores en runtime.

### 3. Borrado Lógico (*Soft Delete*)
- **Decisión:** Al recibir peticiones `DELETE`, el sistema ejecuta `UPDATE ... SET estado = 0` en lugar de `DELETE FROM ...`.
- **Razón:** Las preguntas desactivadas pueden haber sido respondidas en simulacros históricos o requerirse en reportes analíticos futuros; el borrado físico rompería la integridad referencial histórica.
- **Alternativas consideradas:** `DELETE CASCADE` físico. Descartado por pérdida irrecuperable de datos históricos.

### 4. Control de Acceso Basado en Roles (RBAC)
- **Decisión:** Reutilizar `role_middleware.js` parametrizado con `roleMiddleware('administrador')` para interceptar `POST`, `PUT` y `DELETE` en `/api/areas`, `/api/materias`, `/api/temas` y `/api/preguntas`.
- **Razón:** Centraliza la política de autorización y garantiza que los estudiantes autenticados solo tengan acceso de lectura (`GET`).
- **Alternativas consideradas:** Validar el rol manualmente en cada controlador. Descartado por redundancia y riesgo de omisión.

### 5. Estructura de Rutas Jerárquicas y Planas
- **Decisión:** Exponer rutas directas por recurso (`/api/materias`, `/api/temas`, `/api/preguntas`) y rutas anidadas para filtrado relacional (`/api/areas/:areaId/materias`, `/api/materias/:materiaId/temas`, `/api/temas/:temaId/preguntas`).
- **Razón:** Ofrece máxima flexibilidad a los clientes frontend (listados generales y combos desplegables dependientes).

## Risks / Trade-offs

- **[Riesgo: Consultas de estudiantes visualizan preguntas desactivadas]** → *Mitigación:* Los métodos de consulta para estudiantes (`listarActivasPorTema`, `buscarActivaPorId`) filtran explícitamente `WHERE p.estado = 1 AND t.estado = 1`.
- **[Riesgo: Modificación de alternativas deja registros huérfanos]** → *Mitigación:* Al actualizar una pregunta (`PUT /api/preguntas/:id`), dentro de la transacción se eliminan las alternativas anteriores asociadas y se reinserta el nuevo conjunto validado de alternativas.
- **[Riesgo: Concurrencia de escrituras en SQLite]** → *Mitigación:* `better-sqlite3` opera de forma síncrona en transacciones con `journal_mode = WAL`, asegurando lecturas no bloqueantes y escrituras atómicas serializadas.
