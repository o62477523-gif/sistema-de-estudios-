# Spec Delta

## MODIFIED Requirements

### Requirement: Generación dinámica de examen (RF-07)

El sistema SHALL permitir la creación, configuración y publicación de simulacros basados en reactivos del banco de preguntas, vinculándolos a universidades y carreras, y recomendándolos a los estudiantes según su meta académica.

#### Scenario: Generación de simulacro general
- **WHEN** un estudiante solicita un simulacro general
- **THEN** el sistema selecciona preguntas aleatorias según la distribución oficial de su universidad meta y responde `201 Created` con la estructura del examen

#### Scenario: Generación de práctica específica
- **WHEN** un estudiante solicita una práctica especificando materia y cantidad
- **THEN** el sistema genera una prueba con la cantidad solicitada de preguntas activas de dicha materia

#### Scenario: Creación administrativa de simulacro
- **WHEN** un administrador registra un simulacro con preguntas activas del banco, sin preguntas duplicadas y con duración mayor a cero
- **THEN** el sistema persiste el simulacro en estado `borrador` y responde `201 Created`

#### Scenario: Publicación de simulacro válido
- **WHEN** un administrador publica un simulacro en estado `borrador` que contiene al menos una pregunta asociada
- **THEN** el sistema actualiza su estado a `publicado` y responde `200 OK`

#### Scenario: Consulta de simulacros recomendados
- **WHEN** un estudiante autenticado con perfil académico solicita `/api/simulacros-disponibles/recomendados`
- **THEN** el sistema responde `200 OK` con los simulacros publicados coincidentes con su universidad y carrera objetivo

### Requirement: Rendición, temporizador y auto-guardado (RF-08)

El sistema SHALL permitir a los estudiantes iniciar intentos de simulacros publicados, entregar los reactivos sin revelar respuestas correctas, y registrar respuestas de manera progresiva e idempotente.

#### Scenario: Persistencia local ante recarga
- **WHEN** el estudiante recarga el navegador o pierde conexión momentánea durante el examen
- **THEN** el estado del cronómetro y las opciones marcadas se restauran desde `localStorage`

#### Scenario: Inicio exitoso de intento de simulacro
- **WHEN** un estudiante autenticado solicita iniciar un simulacro publicado del cual no posee intentos en curso
- **THEN** el sistema crea un intento en estado `en_progreso`, registra la hora de inicio y entrega las preguntas y alternativas sin el campo `es_correcta`

#### Scenario: Intento simultáneo bloqueado
- **WHEN** un estudiante intenta iniciar un simulacro mientras ya cuenta con un intento `en_progreso` para el mismo examen
- **THEN** el sistema rechaza la solicitud con `409 Conflict`

#### Scenario: Guardado progresivo de respuesta
- **WHEN** el estudiante envía una respuesta para una pregunta perteneciente al simulacro de su intento en curso
- **THEN** el sistema registra o actualiza la opción seleccionada y responde `200 OK`

#### Scenario: Respuesta a intento ya finalizado
- **WHEN** el estudiante intenta registrar una respuesta en un intento con estado `finalizado`
- **THEN** el sistema rechaza la solicitud con `400 Bad Request`

### Requirement: Envío automático por expiración de tiempo (RF-09)

El sistema SHALL bloquear la interacción del formulario y registrar la finalización del intento cuando el estudiante lo solicite o cuando el temporizador expire.

#### Scenario: Expiración del temporizador
- **WHEN** el cronómetro descendente llega a cero
- **THEN** la interfaz deshabilita los controles de selección y despacha las respuestas actuales al endpoint de finalización

#### Scenario: Finalización explícita de intento
- **WHEN** un estudiante autenticado solicita finalizar un intento `en_progreso` que le pertenece
- **THEN** el sistema actualiza su estado a `finalizado`, registra la fecha de finalización y responde `200 OK`

### Requirement: Calificación centralizada e inviolable en backend (RF-10)

El backend SHALL procesar las respuestas recibidas comparándolas contra la base de datos y aplicando la fórmula de puntaje según la universidad meta.

#### Scenario: Calificación exitosa
- **WHEN** el cliente envía `examen_id` y el arreglo de marcaciones al backend
- **THEN** el servidor calcula respuestas correctas, incorrectas y en blanco, aplica la ponderación oficial (ej. UNMSM: +20 correcta, -1.125 incorrecta, 0 en blanco), persiste el resultado y responde `200 OK`

#### Scenario: Envío de examen previamente calificado
- **WHEN** se intenta calificar nuevamente un `examen_id` que ya posee resultado registrado
- **THEN** el sistema rechaza la solicitud con `409 Conflict`
