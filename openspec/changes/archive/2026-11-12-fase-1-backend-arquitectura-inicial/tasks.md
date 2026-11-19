# Tasks

## 1. Estructura y Configuración del Proyecto Backend

- [x] 1.1 Crear la estructura modular de directorios en `backend/` (`src/config/`, `src/controllers/`, `src/middlewares/`, `src/models/`, `src/routes/`, `src/services/`, `database/`) y verificar con un listado de directorios.
- [x] 1.2 Crear el archivo `backend/package.json` configurado como ES Module (`"type": "module"`) con scripts `start` y `dev`, e instalar `express` y `dotenv` verificando que la instalación en `backend/node_modules/` sea exitosa.
- [x] 1.3 Crear la plantilla de entorno `backend/.env.example` con `PORT` y `NODE_ENV`, y verificar que `.env` esté ignorado en el `.gitignore` del proyecto.

## 2. Configuración de Datos y Middlewares Centralizados

- [x] 2.1 Crear el módulo `backend/src/config/database.js` con la configuración base para SQLite 3 y preparación de `PRAGMA foreign_keys = ON;`, verificando que exporte la configuración esperada.
- [x] 2.2 Crear el middleware de captura de errores `backend/src/middlewares/error_handler.js` que formatee las respuestas como `{"status":"error","message":"..."}` sin filtrar datos sensibles.
- [x] 2.3 Implementar el middleware para rutas inexistentes (404 Not Found) retornando respuesta JSON uniforme.

## 3. Endpoints de Verificación y Aplicación Express

- [x] 3.1 Crear el enrutador `backend/src/routes/health_routes.js` con el endpoint `GET /api/health` que responda `200 OK` y el payload `{"status":"success","data":{"message":"API funcionando correctamente"}}`.
- [x] 3.2 Crear `backend/src/app.js` configurando la instancia de Express, parsing de JSON (`express.json()`), registro de rutas bajo `/api` y middlewares globales de 404 y errores.
- [x] 3.3 Crear `backend/src/server.js` importando `app` y escuchando en el puerto provisto por `process.env.PORT` o `3000` por defecto, verificando que arranque limpiamente.

## 4. Documentación y Verificación Integral

- [x] 4.1 Crear el archivo `backend/README.md` detallando las dependencias, configuración de `.env`, comandos de ejecución y prueba del endpoint `GET /api/health`.
- [x] 4.2 Iniciar el servidor temporalmente y verificar mediante una petición HTTP a `GET /api/health` la respuesta `200 OK`, y a una ruta desconocida la respuesta `404 Not Found`.

## Workflow follow-up

- Validar conformidad general con `openspec validate --all`.
- Proceder con la implementación mediante `/opsx-apply fase-1-backend-arquitectura-inicial`.
