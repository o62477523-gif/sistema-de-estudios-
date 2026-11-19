# Perfil Académico Specification

## Purpose

Permite a los estudiantes configurar y actualizar su meta académica (universidad y carrera objetivo), determinando las ponderaciones de puntaje y la estructura temática de los simulacros.

## Requirements

### Requirement: Configuración de meta académica (RF-03)

El sistema SHALL permitir al estudiante autenticado consultar, seleccionar y actualizar su universidad y carrera objetivo, validando la existencia activa y la relación de pertenencia entre ambas entidades.

#### Scenario: Asignación exitosa de universidad y carrera
- **WHEN** un estudiante autenticado envía un `universidad_id` y `carrera_id` válidos y activos, donde la carrera pertenece a dicha universidad
- **THEN** el sistema actualiza su perfil académico y responde `200 OK`

#### Scenario: Selección de entidad inexistente
- **WHEN** el estudiante envía un `universidad_id` o `carrera_id` que no existe en el catálogo
- **THEN** el sistema rechaza la solicitud con `404 Not Found` y no modifica el perfil

#### Scenario: Consulta de perfil académico
- **WHEN** un estudiante autenticado con perfil configurado solicita su información académica
- **THEN** el sistema responde `200 OK` con los datos de la universidad y carrera seleccionadas y `configurado: true`

#### Scenario: Consulta de perfil académico no configurado
- **WHEN** un estudiante autenticado que aún no ha elegido universidad o carrera solicita su información académica
- **THEN** el sistema responde `200 OK` con valores nulos para universidad y carrera y `configurado: false`

#### Scenario: Carrera no pertenece a la universidad seleccionada
- **WHEN** el estudiante intenta asociar una carrera que no corresponde a la universidad indicada
- **THEN** el sistema rechaza la solicitud con `400 Bad Request` indicando la incompatibilidad

#### Scenario: Universidad o carrera desactivada
- **WHEN** el estudiante intenta seleccionar una universidad o carrera con estado inactivo (`estado = 0`)
- **THEN** el sistema rechaza la solicitud con `400 Bad Request`

### Requirement: Consulta del catálogo de universidades

El sistema SHALL permitir a los estudiantes autenticados consultar el listado general de universidades activas y el detalle de una universidad por su identificador.

#### Scenario: Listado de universidades activas
- **WHEN** un usuario autenticado solicita el listado en `GET /api/universidades`
- **THEN** el sistema responde `200 OK` con el arreglo de universidades activas ordenadas alfabéticamente

#### Scenario: Consulta de universidad por id existente
- **WHEN** un usuario autenticado solicita una universidad existente y activa por su id
- **THEN** el sistema responde `200 OK` con los datos de la universidad

#### Scenario: Consulta de universidad inexistente o inactiva
- **WHEN** un usuario solicita una universidad cuyo id no existe o se encuentra desactivada
- **THEN** el sistema responde `404 Not Found`

### Requirement: Consulta del catálogo de carreras por universidad

El sistema SHALL permitir a los estudiantes autenticados consultar las carreras profesionales activas asociadas a una universidad específica y consultar una carrera individual.

#### Scenario: Listado de carreras de una universidad existente
- **WHEN** un usuario autenticado solicita `GET /api/universidades/:universidadId/carreras` para una universidad activa
- **THEN** el sistema responde `200 OK` con la lista de carreras activas de dicha universidad ordenadas alfabéticamente

#### Scenario: Listado de carreras de una universidad inexistente
- **WHEN** un usuario solicita carreras para una universidad no registrada o inactiva
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Consulta de carrera por id
- **WHEN** un usuario autenticado solicita `GET /api/carreras/:id` para una carrera activa
- **THEN** el sistema responde `200 OK` con los datos de la carrera y su universidad asociada
