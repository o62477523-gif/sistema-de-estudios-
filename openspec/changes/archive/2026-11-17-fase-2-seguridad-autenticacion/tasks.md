# Tasks

## 1. Dependencias y Configuración de Entorno y Base de Datos

- [x] 1.1 Instalar dependencias de producción `bcrypt`, `jsonwebtoken` y `better-sqlite3` en `backend/` y verificar que figuren en `backend/package.json`.
- [x] 1.2 Actualizar `backend/.env.example` con las variables `JWT_SECRET` y `JWT_EXPIRES_IN=24h`, verificando que no existan secretos hardcodeados.
- [x] 1.3 Actualizar `backend/src/config/database.js` para instanciar la conexión SQLite 3 con `better-sqlite3`, activar `PRAGMA foreign_keys = ON;`, `PRAGMA journal_mode = WAL;` y crear la tabla `estudiantes` si no existe.

## 2. Modelo de Persistencia (Model)

- [x] 2.1 Crear `backend/src/models/estudiante_model.js` implementando operaciones preparadas (`crear`, `buscarPorCorreo`, `buscarPorId`) sin concatenación SQL, verificando que excluyan `contrasena_hash` en consultas seguras.

## 3. Lógica de Negocio y Criptografía (Service)

- [x] 3.1 Crear `backend/src/services/auth_service.js` implementando encriptación con `bcrypt` (mínimo 10 rondas), validación de credenciales con mensaje genérico y generación de JWT con expiración de 24 horas.

## 4. Controladores y Validaciones de Entrada (Controller)

- [x] 4.1 Crear `backend/src/controllers/auth_controller.js` implementando `registro` y `login`, con validaciones estrictas (nombre obligatorio, email válido, contraseña $\ge 8$ caracteres con 1 mayúscula y 1 número) y respuestas JSON estandarizadas.

## 5. Middlewares de Autenticación y Autorización

- [x] 5.1 Crear `backend/src/middlewares/auth_middleware.js` para extraer el token de la cabecera `Authorization: Bearer <token>`, verificar firma y vigencia con `JWT_SECRET`, e inyectar `req.user`.
- [x] 5.2 Crear `backend/src/middlewares/role_middleware.js` con la función de orden superior `autorizarRoles(...roles)` que retorne `403 Forbidden` ante permisos insuficientes.

## 6. Rutas e Integración en Express

- [x] 6.1 Crear `backend/src/routes/auth_routes.js` con las rutas `POST /registro`, `POST /login` y una ruta protegida de prueba `GET /perfil` con validación de token y roles.
- [x] 6.2 Registrar `auth_routes.js` en `backend/src/app.js` bajo el prefijo `/api/auth`.

## 7. Documentación y Verificación Integral

- [x] 7.1 Actualizar `backend/README.md` documentando las nuevas variables de entorno, endpoints de autenticación y ejemplos de consumo con JWT.
- [x] 7.2 Ejecutar suite de pruebas verificando registro exitoso (201), correo duplicado (409), contraseña inválida (400), login exitoso (200), login fallido genérico (401), acceso con token (200) y rechazo por rol (403).

## Workflow follow-up

- Validar conformidad con `openspec validate --all`.
- Iniciar la implementación con `/opsx-apply fase-2-seguridad-autenticacion`.
