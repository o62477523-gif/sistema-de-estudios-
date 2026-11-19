# Analítica y Tutoría con IA Specification

## Purpose

Proporciona reportes post-evaluación, solucionarios detallados, retroalimentación pedagógica generada por Inteligencia Artificial para preguntas erróneas, y paneles de seguimiento del rendimiento académico histórico.

## Requirements

### Requirement: Reporte detallado post-examen (RF-11)

El sistema SHALL presentar el solucionario completo, puntaje obtenido, comparación frente al puntaje histórico de la carrera y porcentaje de efectividad por materia tras concluir la prueba.

#### Scenario: Visualización del reporte de examen

- **WHEN** un estudiante finaliza o consulta un examen calificado propio
- **THEN** el sistema devuelve el puntaje total, desglose por materia y estado de cada pregunta

### Requirement: Explicación pedagógica con IA generativa (RF-12)

El sistema SHALL permitir al estudiante solicitar explicaciones asistidas por IA para preguntas incorrectas o no respondidas en el solucionario.

#### Scenario: Solicitud de explicación exitosa

- **WHEN** el estudiante solicita la explicación de una pregunta no acertada en su examen
- **THEN** el backend consulta el servicio de IA y retorna concepto clave, resolución paso a paso y explicación del error cometido

### Requirement: Tablero de evolución histórica (RF-13)

El sistema SHALL mostrar la tendencia histórica del puntaje de los últimos simulacros e identificar materias fuertes y críticas a reforzar.

#### Scenario: Consulta de dashboard académico

- **WHEN** un estudiante accede a su panel de estadísticas
- **THEN** el sistema retorna la serie histórica de puntajes y el balance de materias con mayor y menor rendimiento
