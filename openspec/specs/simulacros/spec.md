# Motor de Simulacros Specification

## Purpose

Controla la generación de exámenes (simulacros generales y prácticas específicas), la administración del tiempo y la persistencia local de avance durante la rendición, y la calificación inviolable centralizada en el backend.

## Requirements

### Requirement: Generación dinámica de examen (RF-07)

El sistema SHALL generar exámenes bajo las modalidades de Simulacro General (basado en la universidad objetivo del estudiante) o Práctica Específica (por materia y cantidad seleccionada).

#### Scenario: Generación de simulacro general

- **WHEN** un estudiante solicita un simulacro general
- **THEN** el sistema selecciona preguntas aleatorias según la distribución oficial de su universidad meta y responde `201 Created` con la estructura del examen

#### Scenario: Generación de práctica específica

- **WHEN** un estudiante solicita una práctica especificando materia y cantidad
- **THEN** el sistema genera una prueba con la cantidad solicitada de preguntas activas de dicha materia

### Requirement: Rendición, temporizador y auto-guardado (RF-08)

El sistema SHALL proveer una interfaz de rendición con temporizador descendente, navegación y persistencia local del estado de respuestas en `localStorage`.

#### Scenario: Persistencia local ante recarga

- **WHEN** el estudiante recarga el navegador o pierde conexión momentánea durante el examen
- **THEN** el estado del cronómetro y las opciones marcadas se restauran desde `localStorage`

### Requirement: Envío automático por expiración de tiempo (RF-09)

El sistema SHALL bloquear la interacción del formulario y enviar automáticamente las respuestas cuando el temporizador llegue a `00:00:00`.

#### Scenario: Expiración del temporizador

- **WHEN** el cronómetro descendente llega a cero
- **THEN** la interfaz deshabilita los controles de selección y despacha las respuestas actuales al endpoint de finalización

### Requirement: Calificación centralizada e inviolable en backend (RF-10)

El backend SHALL procesar las respuestas recibidas comparándolas contra la base de datos y aplicando la fórmula de puntaje según la universidad meta.

#### Scenario: Calificación exitosa

- **WHEN** el cliente envía `examen_id` y el arreglo de marcaciones al backend
- **THEN** el servidor calcula respuestas correctas, incorrectas y en blanco, aplica la ponderación oficial (ej. UNMSM: +20 correcta, -1.125 incorrecta, 0 en blanco), persiste el resultado y responde `200 OK`

#### Scenario: Envío de examen previamente calificado

- **WHEN** se intenta calificar nuevamente un `examen_id` que ya posee resultado registrado
- **THEN** el sistema rechaza la solicitud con `409 Conflict`
