# Design

## Context

El proyecto requiere una base backend robusta basada en Node.js y Express respetando el patrón Controller-Service-Model y la arquitectura de 3 capas definida en el SAD. Actualmente, no existe código backend implementado. Se debe crear la estructura inicial sin anticipar funcionalidades de fases posteriores (autenticación, modelos de datos definitivos o lógica de exámenes), garantizando una transición fluida hacia la persistencia en SQLite y la seguridad con JWT.

## Goals / Non-Goals

**Goals:**
- Configurar el proyecto `backend/` con soporte nativo de ES Modules (`"type": "module"`).
- Separar la configuración de la aplicación Express (`src/app.js`) del punto de arranque HTTP (`src/server.js`).
- Implementar middlewares globales para parsing de JSON (`express.json()`), manejo de rutas inexistentes (404) y manejo centralizado de excepciones (500).
- Establecer el formato estándar de respuestas JSON: `{"status":"success","data":...}` y `{"status":"error","message":"..."}`.
- Exponer el endpoint `GET /api/health` para verificación inmediata del servidor.
- Preparar la estructura modular `src/config/database.js` para la futura conexión con SQLite 3 y activación de `PRAGMA foreign_keys = ON;`.
- Configurar variables de entorno con `dotenv` y proveer `.env.example`.

**Non-Goals:**
- No implementar tablas ni esquemas de base de datos definitivos en SQLite (reservado para fases posteriores).
- No implementar endpoints de autenticación, generación de JWT ni hashing con bcrypt.
- No implementar modelos de dominio ni CRUD de preguntas, simulacros o integración con IA.

## Decisions

### 1. Desacoplamiento de `app.js` y `server.js`
- **Decisión:** `src/app.js` se encargará exclusivamente de inicializar Express, registrar middlewares y enrutar endpoints. `src/server.js` importará `app` y se encargará de vincular el socket HTTP al puerto.
- **Justificación:** Facilita la ejecución de pruebas automatizadas futuras (ej. con `supertest` o el runner de Node) sin necesidad de levantar el puerto de red ni causar colisiones de puertos.
- **Alternativas consideradas:** Un único archivo `server.js` o `index.js`. Descartado por acoplamiento de responsabilidades y dificultad para testing.

### 2. Uso de ECMAScript Modules (ESM)
- **Decisión:** Configurar `"type": "module"` en `backend/package.json` utilizando la sintaxis estándar `import` / `export`.
- **Justificación:** Alineación directa con el estándar moderno de JavaScript ES6+ definido en los lineamientos del proyecto y compatibilidad homogénea con Node.js 20+.
- **Alternativas consideradas:** CommonJS (`require` / `module.exports`). Descartado por ser el formato legado de Node.

### 3. Middleware Centralizado de Errores con Formato Homogéneo
- **Decisión:** Todo error HTTP no capturado o lanzado deliberadamente será procesado por `src/middlewares/error_handler.js`, retornando `{"status":"error","message": "..."}`.
- **Justificación:** Garantiza un contrato predecible para el frontend y previene la fuga de información sensible (como trazas de la base de datos o stack traces del servidor) hacia el cliente.
- **Alternativas consideradas:** Respuestas de error dispersas en cada controlador. Descartado por riesgo de inconsistencia y vulnerabilidades de información.

### 4. Estructura de Preparación para SQLite (`src/config/database.js`)
- **Decisión:** Crear el archivo de configuración definiendo la ruta del archivo SQLite a partir de `process.env.DATABASE_PATH` (con fallback a `database/sistema_estudios.sqlite`) y previendo la configuración de `PRAGMA foreign_keys = ON;` (RNF-08).
- **Justificación:** Deja el punto de conexión listo para ser consumido por la capa `models/` en la Fase 2 sin requerir reestructuración.
- **Alternativas consideradas:** Configurar la conexión directamente en los controladores o modelos. Descartado por violar el patrón de 3 capas.

## Risks / Trade-offs

- **[Riesgo: Olvido de creación del archivo `.env`]** → *Mitigación:* Se provee `.env.example` y valores por defecto controlados en el código (`PORT || 3000`, `NODE_ENV || 'development'`).
- **[Riesgo: Filtrado de datos sensibles en errores de producción]** → *Mitigación:* El middleware `error_handler.js` evalúa `NODE_ENV`: en producción envía mensajes amigables y solo registra el stack trace en los logs de consola del servidor.
- **[Riesgo: Instalación accidental de dependencias innecesarias]** → *Mitigación:* Se limitan estrictamente las dependencias de producción a `express` y `dotenv`. La recarga en desarrollo se apoya en `node --watch` nativo sin necesidad de `nodemon`.
