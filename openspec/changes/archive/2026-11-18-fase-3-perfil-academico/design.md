# Design

## Context

En las Fases 1 y 2 se establecieron la arquitectura base con Express y SQLite (`better-sqlite3`), el manejo de errores y el sistema de autenticación con JWT y bcrypt. La Fase 3 introduce el módulo de perfil académico (RF-03), que vincula al estudiante con una universidad y carrera objetivo. Esta meta académica condicionará posteriormente la ponderación de puntajes y la distribución de preguntas en los simulacros de admisión.

## Goals / Non-Goals

**Goals:**
- Crear las tablas relacionales `universidades` y `carreras` con claves foráneas e integridad referencial (`PRAGMA foreign_keys = ON;`).
- Ampliar la tabla `estudiantes` agregando `universidad_id` y `carrera_id` de forma incremental y segura sin pérdida de datos existentes.
- Implementar los modelos de acceso a datos (`universidad_model.js`, `carrera_model.js`, `perfil_academico_model.js`) utilizando consultas preparadas (*Prepared Statements*).
- Implementar servicios y controladores para listar y consultar universidades y carreras activas.
- Implementar la consulta y actualización del perfil académico (`GET` y `PUT /api/perfil-academico`) garantizando que la carrera pertenezca a la universidad elegida y que ambas estén activas.
- Proveer un mecanismo idempotente de sembrado de datos iniciales (*seeds*) para universidades (UNMSM, UNI, UNSA, UNT) y carreras de referencia.
- Aislar la modificación del perfil para que cada estudiante opere exclusivamente sobre su propia cuenta (`req.user.estudianteId`).

**Non-Goals:**
- No implementar el banco de preguntas ni la categorización por materias (Fase 4).
- No implementar el motor de cálculo de simulacros ni ponderaciones (Fase 5).
- No implementar paneles administrativos de gestión masiva de universidades en esta etapa.

## Decisions

### 1. Estrategia de Migración Incremental para SQLite
- **Decisión:** Al inicializar la conexión en `src/config/database.js`, se verifica mediante `PRAGMA table_info(estudiantes)` si las columnas `universidad_id` y `carrera_id` ya existen. Si no están presentes, se ejecutan sentencias `ALTER TABLE estudiantes ADD COLUMN ...` dentro de un bloque seguro.
- **Justificación:** SQLite no soporta migraciones complejas de forma nativa sin recrear tablas si hay restricciones previas, pero añadir columnas nulables con `ALTER TABLE ADD COLUMN` es una operación nativa, atómica y segura que no compromete los registros de estudiantes creados en la Fase 2.
- **Alternativas consideradas:** Recrear la base de datos completa. Descartado porque violaría el criterio de conservación de datos y usuarios existentes.

### 2. Validación de Integridad de la Meta Académica en la Capa de Servicio
- **Decisión:** En `perfil_academico_service.js`, antes de persistir, se verifica:
  1. Que la universidad exista y tenga `estado = 1`.
  2. Que la carrera exista y tenga `estado = 1`.
  3. Que `carrera.universidad_id === universidad.id`.
- **Justificación:** Previene estados inconsistentes en la base de datos donde un postulante pueda registrarse en una carrera que no se dicta en su universidad meta (ej. Medicina en UNI).
- **Alternativas consideradas:** Confiar únicamente en claves foráneas independientes. Descartado porque SQLite por sí solo no restringe la correspondencia jerárquica entre dos claves foráneas sin un trigger o validación de negocio.

### 3. Seguridad y Privacidad del Perfil Académico
- **Decisión:** Los endpoints de consulta y modificación de perfil obtienen el identificador del estudiante directamente de `req.user.estudianteId`, inyectado por `auth_middleware.js`. Se ignora cualquier `id` o `estudiante_id` enviado en el cuerpo o parámetros de la petición.
- **Justificación:** Cumple la regla RN-06 impidiendo ataques de escalamiento horizontal (IDOR).
- **Alternativas consideradas:** Permitir enviar `estudiante_id` en el cuerpo. Descartado por ser vulnerable a suplantación.

### 4. Semillero de Datos Idempotente (*Seed*)
- **Decisión:** Crear `src/config/seed.js` que utiliza `INSERT OR IGNORE` sobre siglas únicas de universidades y pares únicos de carrera-universidad.
- **Justificación:** Permite ejecutar la carga inicial de datos cuantas veces sea necesario en entornos de desarrollo o pruebas sin generar registros duplicados ni alterar secuencias.
- **Alternativas consideradas:** Carga manual vía sentencias SQL en README. Descartado por ser propenso a errores humanos.

## Risks / Trade-offs

- **[Riesgo: Estudiante recién registrado sin perfil académico]** → *Mitigación:* Los campos `universidad_id` y `carrera_id` son nulables; `GET /api/perfil-academico` responde con valores `null` y el indicador `configurado: false` sin lanzar error 404 ni 500.
- **[Riesgo: Pérdida o alteración de simulacros futuros al cambiar de carrera]** → *Mitigación:* El modelo separa la meta actual del estudiante del historial de exámenes; cada simulacro futuro guardará su propia copia de la ponderación aplicada en su momento (RN-09).
