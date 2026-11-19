# Design: Fase 5 - Desarrollo del Módulo de Simulacros de Admisión

## Context

Las Fases 1 a 4 establecieron la arquitectura en 3 capas, autenticación JWT con roles, configuración del perfil académico y el banco jerárquico de preguntas con alternativas. La Fase 5 materializa el propósito central del sistema: la configuración de simulacros preuniversitarios por los administradores y la experiencia de evaluación cronometrada para los postulantes (RF-07, RF-08, RF-09).

## Goals / Non-Goals

**Goals:**
- Implementar 4 tablas relacionales en SQLite (`simulacros`, `simulacro_preguntas`, `intentos_simulacro`, `respuestas_estudiante`) con integridad referencial (`PRAGMA foreign_keys = ON;`).
- Proveer endpoints CRUD administrativos para simulacros con transacciones atómicas (`db.transaction()`) al asociar preguntas ordenadas sin duplicados.
- Gestionar el ciclo de vida del examen: `borrador` → `publicado` → `inactivo`.
- Exponer catálogo de simulacros disponibles y recomendados por perfil académico (universidad y carrera del estudiante).
- Gestionar intentos de examen (`POST /api/simulacros/:id/iniciar`), impidiendo que un estudiante mantenga dos intentos en progreso del mismo simulacro simultáneamente (409 Conflict).
- Proteger las respuestas correctas de las preguntas entregadas durante el examen (nunca enviar `es_correcta` en el payload).
- Permitir el guardado progresivo e idempotente de respuestas (UPSERT) y respuestas en blanco (`alternativa_id: null`).
- Finalizar intentos de examen bloqueando modificaciones posteriores.

**Non-Goals:**
- No calcular puntajes, notas ponderadas ni estadísticas en esta fase (RF-10 se desarrollará en la Fase 6).
- No implementar integración con IA generativa para explicaciones (Fase 6).
- No implementar generación procedural aleatoria masiva de exámenes en esta fase.

## Decisions

### 1. Modelo de Datos y Restricciones de Examen
- **Decisión:** Separar la definición del simulacro (`simulacros`), su composición de preguntas (`simulacro_preguntas`), la sesión de evaluación del postulante (`intentos_simulacro`) y las marcaciones individuales (`respuestas_estudiante`).
- **Razón:** Desacopla la plantilla del examen de los intentos individuales de los alumnos, permitiendo que múltiples estudiantes rindan el mismo simulacro en diferentes momentos y que cada intento guarde su propia auditoría temporal.
- **Alternativas consideradas:** Almacenar respuestas como arreglo JSON en `intentos_simulacro`. Descartado porque impide validar la integridad referencial de `alternativa_id` y dificulta la calificación estructurada posterior en SQLite.

### 2. Transaccionalidad en el Registro de Preguntas
- **Decisión:** Al registrar o actualizar preguntas en un simulacro (`POST /api/simulacros`, `PUT /api/simulacros/:id`), la inserción del simulacro y de sus filas en `simulacro_preguntas` se ejecuta dentro de `db.transaction()`.
- **Razón:** Evita simulacros vacíos o inconsistentes en caso de que alguna pregunta falle la validación (por inactiva o inexistente).
- **Alternativas consideradas:** Guardar preguntas secuencialmente sin transacción. Descartado por riesgo de inconsistencias.

### 3. Seguridad de Reactivos: Omisión de `es_correcta` en Entrega
- **Decisión:** En el endpoint `POST /api/simulacros/:id/iniciar`, las alternativas entregadas al cliente se proyectan exclusivamente con `{ id, texto }`, eliminando explícitamente `es_correcta`.
- **Razón:** Previene trampas o inspección de tráfico por herramientas de desarrollo del navegador que revelarían la clave correcta al postulante.
- **Alternativas consideradas:** Confiar en que el frontend no muestre la clave. Descartado por ser una grave vulnerabilidad de seguridad del lado del cliente.

### 4. Operación Idempotente de Respuestas (UPSERT)
- **Decisión:** `respuestas_estudiante` posee una restricción de unicidad `UNIQUE(intento_id, pregunta_id)` y el servicio ejecuta `INSERT INTO ... ON CONFLICT(intento_id, pregunta_id) DO UPDATE SET alternativa_id = excluded.alternativa_id, fecha_respuesta = CURRENT_TIMESTAMP`.
- **Razón:** El estudiante puede cambiar de alternativa múltiples veces o dejarla en blanco (`null`); el UPSERT evita crear registros duplicados y garantiza la última marcación registrada.

### 5. Control de Intentos Concurrentes (Bloqueo de Estado)
- **Decisión:** Al solicitar iniciar un simulacro, el servicio consulta si existe un intento con `estudiante_id = ? AND simulacro_id = ? AND estado = 'en_progreso'`. Si existe, rechaza con `409 Conflict`.
- **Razón:** Garantiza que el estudiante termine o cierre su intento actual antes de abrir uno nuevo para el mismo examen.

## Risks / Trade-offs

- **[Riesgo: Alumno intenta responder preguntas ajenas al simulacro]** → *Mitigación:* `POST /api/intentos/:intentoId/respuestas` valida estrictamente que `pregunta_id` forme parte de `simulacro_preguntas` para el simulacro de dicho intento.
- **[Riesgo: Marcaciones posteriores a la finalización]** → *Mitigación:* Se valida que el intento tenga `estado === 'en_progreso'`. Si está `finalizado`, se rechaza con `400 Bad Request`.
- **[Riesgo: Violación de privacidad entre postulantes]** → *Mitigación:* Todas las operaciones sobre intentos extraen el `estudiante_id` de `req.user.estudianteId` (JWT) y validan que el intento corresponda a ese usuario.
