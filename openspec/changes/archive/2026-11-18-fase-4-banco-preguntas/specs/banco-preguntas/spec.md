# Spec Delta

## MODIFIED Requirements

### Requirement: Estructura jerárquica de contenidos (RF-04)

El sistema SHALL clasificar cada pregunta en una jerarquía estricta de 3 niveles: Área General, Materia y Tema específico, manteniendo la integridad referencial y el estado activo.

#### Scenario: Creación de pregunta con jerarquía válida
- **WHEN** un administrador registra una pregunta asociándola a un tema existente que pertenece a una materia y área válidas
- **THEN** el sistema vincula la pregunta y responde `201 Created`

#### Scenario: Asignación de tema inexistente
- **WHEN** se intenta crear una pregunta con un `tema_id` no registrado
- **THEN** el sistema rechaza la operación con `400 Bad Request` por violación de clave foránea o inexistencia

#### Scenario: Asignación de tema inactivo
- **WHEN** se intenta asociar una pregunta a un tema desactivado (`estado = 0`)
- **THEN** el sistema rechaza la operación con `400 Bad Request`

### Requirement: Estructura de pregunta y alternativas (RF-05)

El sistema SHALL validar que cada pregunta contenga un enunciado en texto (con soporte para notación LaTeX `$ ... $`), dificultad válida, tipo de pregunta y sus alternativas con exactamente una correcta.

#### Scenario: Pregunta con 4 o 5 alternativas y una correcta
- **WHEN** se envía una pregunta con 4 o 5 alternativas y una única marcada como `es_correcta = 1`
- **THEN** el sistema almacena la pregunta y sus opciones asociadas dentro de una transacción atómica

#### Scenario: Pregunta con ninguna o múltiples respuestas correctas
- **WHEN** una solicitud incluye cero alternativas correctas o más de una correcta
- **THEN** el sistema rechaza la solicitud con `400 Bad Request`

#### Scenario: Pregunta con menos de dos alternativas
- **WHEN** se envía una pregunta de opción múltiple con menos de 2 alternativas
- **THEN** el sistema rechaza la solicitud con `400 Bad Request`

#### Scenario: Pregunta sin enunciado
- **WHEN** se intenta registrar una pregunta con enunciado vacío o ausente
- **THEN** el sistema rechaza la solicitud con `400 Bad Request`

### Requirement: Operaciones administrativas CRUD (RF-06)

El sistema SHALL permitir únicamente a usuarios con rol `administrador` crear, editar, listar, filtrar y desactivar áreas, materias, temas y preguntas mediante operaciones atómicas y borrado lógico.

#### Scenario: Administrador actualiza pregunta
- **WHEN** un usuario con rol `administrador` envía cambios sobre el enunciado o alternativas de una pregunta existente
- **THEN** el sistema actualiza el registro y responde `200 OK`

#### Scenario: Usuario no administrador intenta modificar preguntas
- **WHEN** un usuario con rol `estudiante` o no autenticado intenta realizar operaciones CRUD sobre el banco
- **THEN** el sistema responde `403 Forbidden` o `401 Unauthorized` según corresponda

#### Scenario: Desactivación lógica de pregunta
- **WHEN** un administrador ejecuta `DELETE /api/preguntas/:id`
- **THEN** el sistema actualiza el estado a `0` sin eliminar físicamente el registro y responde `200 OK`

#### Scenario: Desactivación lógica de área o materia
- **WHEN** un administrador desactiva un área, materia o tema
- **THEN** el sistema actualiza su estado a `0` preservando la integridad histórica de sus dependencias

## ADDED Requirements

### Requirement: Consulta estudiantil del catálogo académico

El sistema SHALL permitir a los estudiantes autenticados consultar el catálogo de áreas activas, materias por área y temas por materia.

#### Scenario: Estudiante lista áreas activas
- **WHEN** un estudiante autenticado envía `GET /api/areas`
- **THEN** el sistema responde `200 OK` con la lista de áreas con `estado = 1`

#### Scenario: Estudiante lista materias de un área
- **WHEN** un estudiante autenticado envía `GET /api/areas/:areaId/materias`
- **THEN** el sistema responde `200 OK` con las materias activas pertenecientes a dicha área

#### Scenario: Estudiante lista temas de una materia
- **WHEN** un estudiante autenticado envía `GET /api/materias/:materiaId/temas`
- **THEN** el sistema responde `200 OK` con los temas activos pertenecientes a dicha materia

### Requirement: Consulta estudiantil de preguntas activas

El sistema SHALL permitir a los estudiantes autenticados listar preguntas activas por tema y consultar una pregunta por identificador sin exponer reactivos desactivados ni soluciones no autorizadas.

#### Scenario: Estudiante consulta preguntas activas por tema
- **WHEN** un estudiante autenticado solicita `GET /api/temas/:temaId/preguntas` para un tema activo
- **THEN** el sistema responde `200 OK` con las preguntas activas y sus alternativas

#### Scenario: Estudiante consulta pregunta específica activa
- **WHEN** un estudiante autenticado solicita `GET /api/preguntas/:id` para una pregunta activa
- **THEN** el sistema responde `200 OK` con la pregunta y sus alternativas

#### Scenario: Estudiante intenta consultar pregunta inactiva
- **WHEN** un estudiante autenticado solicita una pregunta con `estado = 0`
- **THEN** el sistema responde `404 Not Found` impidiendo la visualización de reactivos desactivados
