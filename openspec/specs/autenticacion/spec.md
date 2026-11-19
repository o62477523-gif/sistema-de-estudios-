# Autenticación Specification

## Purpose

Gestiona el registro de postulantes, el inicio de sesión y la protección de las rutas privadas mediante tokens JWT, garantizando que solo usuarios autenticados accedan a sus datos y que los administradores operen el panel de gestión.

## Requirements

### Requirement: Registro de estudiante

El sistema SHALL permitir el autoregistro de postulantes con nombre completo, correo electrónico válido y contraseña que cumpla la política mínima (al menos 8 caracteres, una mayúscula y un número), almacenando la contraseña cifrada con bcrypt con un factor de costo mínimo de 10 rondas.

#### Scenario: Registro exitoso
- **WHEN** un visitante envía datos válidos con un correo no registrado
- **THEN** el sistema crea la cuenta con rol `estudiante`, encripta la contraseña con bcrypt y responde `201 Created` con los datos del estudiante omitiendo el hash

#### Scenario: Correo duplicado
- **WHEN** un visitante intenta registrarse con un correo ya existente en la tabla `estudiantes`
- **THEN** el sistema no crea la cuenta y responde `409 Conflict` con un mensaje descriptivo

#### Scenario: Contraseña que no cumple la política
- **WHEN** la contraseña tiene menos de 8 caracteres o no incluye al menos una mayúscula y un número
- **THEN** el sistema rechaza el registro con `400 Bad Request` y un mensaje descriptivo

#### Scenario: Datos obligatorios ausentes
- **WHEN** la solicitud de registro omite el nombre, el correo o la contraseña, o incluye espacios en blanco como único valor
- **THEN** el sistema rechaza la solicitud con `400 Bad Request` sin persistir datos

### Requirement: Inicio de sesión con JWT

El sistema SHALL validar las credenciales y emitir un token JWT firmado que incluya el `estudiante_id`, el `rol` y una expiración de 24 horas (`JWT_EXPIRES_IN=24h`).

#### Scenario: Credenciales válidas
- **WHEN** un usuario registrado envía su correo y contraseña correctos
- **THEN** el sistema responde `200 OK` con un token JWT y los datos públicos del usuario

#### Scenario: Credenciales inválidas
- **WHEN** el correo no existe o la contraseña no coincide con el hash almacenado
- **THEN** el sistema responde `401 Unauthorized` con un mensaje genérico sin revelar si el correo existe o no

#### Scenario: Token usado en rutas protegidas
- **WHEN** una petición incluye `Authorization: Bearer <token>` con un token válido y vigente
- **THEN** el middleware de autenticación permite el acceso y adjunta la identidad del usuario en `req.user`

#### Scenario: Token expirado o manipulado
- **WHEN** una petición protegida envía un token expirado o con firma inválida
- **THEN** el sistema responde `401 Unauthorized` y no ejecuta la operación solicitada

### Requirement: Control de acceso por rol

El sistema SHALL restringir las operaciones administrativas a usuarios con rol `administrador` y las operaciones académicas a usuarios autenticados mediante el middleware de autorización.

#### Scenario: Estudiante intenta acceder al panel administrativo
- **WHEN** un usuario con rol `estudiante` invoca un endpoint exclusivo de administración
- **THEN** el sistema responde `403 Forbidden` con mensaje de permisos insuficientes

#### Scenario: Administrador accede a la gestión
- **WHEN** un usuario con rol `administrador` invoca un endpoint de gestión o administración
- **THEN** el sistema autoriza la operación y delega al controlador
