# Proposal

## Why

Para implementar los requerimientos funcionales del sistema (RF-01 a RF-13) descritos en el SRS, es indispensable establecer primero una arquitectura backend limpia, modular y desacoplada basada en el patrón Controller-Service-Model con Express y Node.js. 

Esta Fase 1 sienta las bases de infraestructura técnica, configuración de variables de entorno, middleware global de errores y verificación de operatividad (`GET /api/health`), garantizando la preparación para la conexión con SQLite (RNF-08) y evitando dependencias innecesarias o deuda técnica antes de abordar la autenticación y la lógica de negocio.

## What Changes

- Creación de la estructura modular de directorios en `backend/` (`src/config/`, `src/controllers/`, `src/middlewares/`, `src/models/`, `src/routes/`, `src/services/`, `database/`).
- Inicialización del proyecto Node.js con `package.json` configurado para ES Modules (`"type": "module"`) y scripts de ejecución (`npm start`, `npm run dev`).
- Instalación y configuración de dependencias esenciales de infraestructura: `express` y `dotenv`.
- Configuración desacoplada del servidor: `src/app.js` (configuración de middlewares y rutas Express) y `src/server.js` (arranque del servidor HTTP y escucha de puerto).
- Implementación del endpoint de monitoreo de salud `GET /api/health` con respuesta JSON estandarizada (`status: "success"`).
- Creación de middlewares globales para rutas no encontradas (404 Not Found) y captura centralizada de errores (500 Internal Server Error) garantizando que no se filtren detalles sensibles al cliente.
- Creación del módulo base de configuración de base de datos (`src/config/database.js`) preparado para SQLite 3 y activación de `PRAGMA foreign_keys = ON;` (RNF-08).
- Plantilla de variables de entorno `.env.example` y exclusión obligatoria de `.env` en `.gitignore`.
- Documentación técnica en `backend/README.md` con instrucciones de configuración, ejecución y pruebas.

## Capabilities

### New Capabilities
- `infraestructura-backend`: Gestión del ciclo de vida del servidor Express, enrutamiento base, respuestas JSON estandarizadas, verificación de salud operativa (`GET /api/health`), configuración por entorno y manejo centralizado de excepciones y rutas 404 (RNF-02, RNF-04, RNF-08).

### Modified Capabilities
<!-- Ninguna capacidad funcional existente requiere modificación en esta fase de infraestructura -->

## Impact

- **Código:** Se crea el nuevo directorio `backend/` con su propio árbol modular `src/`.
- **APIs:** Se publica el nuevo endpoint público `GET /api/health`.
- **Dependencias:** Incorporación de `express` y `dotenv` (producción) y soporte de desarrollo con Node.js nativo (`--watch`). Sin frameworks adicionales.
- **Sistemas:** Base lista para enlazar los módulos posteriores de Autenticación (RF-01, RF-02), Perfil Académico (RF-03), Banco de Preguntas (RF-04 a RF-06), Simulacros (RF-07 a RF-10) y Analítica con IA (RF-11 a RF-13).
