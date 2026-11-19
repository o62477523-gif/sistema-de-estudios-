# Proposal: Fase 4 - Desarrollo del Banco de Preguntas

## Why

Para que los estudiantes de la plataforma puedan prepararse eficazmente y rendir futuros simulacros de admisión personalizados (Fase 5), el sistema requiere un repositorio centralizado, jerarquizado y seguro de reactivos académicos. Esta fase establece la estructura jerárquica de tres niveles (Áreas → Materias → Temas) y el almacenamiento de preguntas de opción múltiple con alternativas asociadas, garantizando integridad referencial, transaccionalidad atómica y control de acceso basado en roles (RF-04, RF-05, RF-06, RNF-02, RNF-03).

## What Changes

- **Esquema de Base de Datos Relacional:** Creación de tablas normalizadas en SQLite (`areas`, `materias`, `temas`, `preguntas` y `alternativas`) con claves foráneas (`PRAGMA foreign_keys = ON;`), borrado lógico (`estado = 1 / 0`) y marcas temporales.
- **Gestión Jerárquica del Catálogo Académico:**
  - CRUD administrativo completo para áreas (`/api/areas`), materias (`/api/materias`) y temas (`/api/temas`).
  - Consulta pública autenticada de áreas, materias (globales o por área) y temas (globales o por materia) para estudiantes.
- **Gestión de Preguntas y Alternativas:**
  - Registro atómico de preguntas con sus alternativas mediante transacciones SQLite (`db.transaction()`), asegurando que cada pregunta de opción múltiple contenga al menos dos alternativas (típicamente 4 o 5) y exactamente una alternativa correcta (RF-05).
  - Consulta de preguntas activas por identificador y por tema para estudiantes autenticados.
  - Actualización atómica de preguntas y alternativas para administradores.
  - Desactivación lógica (*soft delete*) de preguntas sin pérdida de histórico.
- **Seguridad y Control de Acceso (RBAC):**
  - Protección estricta con `authMiddleware` en todos los endpoints privados (RNF-02).
  - Restricción de operaciones de escritura (`POST`, `PUT`, `DELETE`) exclusivamente para el rol `administrador` mediante `roleMiddleware('administrador')`.
- **Semillero de Preguntas de Prueba:** Script para poblar áreas, materias, temas y preguntas de muestra con alternativas para verificar el funcionamiento integral.

## Capabilities

### New Capabilities
*(Ninguna nueva capacidad raíz; se amplía y formaliza la capacidad existente `banco-preguntas`).*

### Modified Capabilities
- `banco-preguntas`: Formaliza y detalla la gestión jerárquica de contenidos (áreas, materias, temas), la transaccionalidad en la creación de reactivos y alternativas, y los permisos diferenciados entre estudiantes y administradores (RF-04, RF-05, RF-06).

## Impact

- **Código Backend:**
  - Nuevos modelos: `area_model.js`, `materia_model.js`, `tema_model.js`, `pregunta_model.js`, `alternativa_model.js`.
  - Nuevos servicios: `area_service.js`, `materia_service.js`, `tema_service.js`, `pregunta_service.js`.
  - Nuevos controladores: `area_controller.js`, `materia_controller.js`, `tema_controller.js`, `pregunta_controller.js`.
  - Nuevas rutas: `area_routes.js`, `materia_routes.js`, `tema_routes.js`, `pregunta_routes.js`.
  - Integración en `src/app.js` registrando `/api/areas`, `/api/materias`, `/api/temas`, `/api/preguntas`.
  - Actualización de `src/config/database.js` para migrar las nuevas tablas con DDL seguro.
- **APIs:** Endpoints RESTful con formato estándar JSON `{ status: "success", data: ... }` y `{ status: "error", message: ... }`.
- **Dependencias:** Sin librerías externas adicionales; se aprovechan `better-sqlite3`, `express`, `jsonwebtoken` y `dotenv`.
