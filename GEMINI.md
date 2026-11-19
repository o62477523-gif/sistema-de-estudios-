# Guía de Reglas y Convenciones del Agente (Spec-Driven Development)

Este proyecto sigue estrictamente la metodología **Spec-Driven Development (SSD / SDD)** mediante la herramienta **OpenSpec**. Consulta [AGENTS.md](file:///c:/Users/PC31-LAB4/Documents/GitHub/sistema-de-estudios-/AGENTS.md) para el detalle completo.

## Reglas Clave:
1. **Flujo OpenSpec Obligatorio:** Antes de modificar o crear código, propone un cambio con `/opsx-propose <nombre>` o verifica las especificaciones vivas en `openspec/specs/`. Valida con `openspec validate --all`.
2. **Stack Estricto:**
   - Frontend: HTML5 semántico + CSS3 Vanilla (tokens en `:root`) + JS ES6+ Vanilla (ES Modules, fetch). Sin frameworks.
   - Backend: Node.js + Express (3 capas: controllers, services, models).
   - Base de datos: SQLite 3 con `PRAGMA foreign_keys = ON;` y consultas preparadas obligatorias.
3. **Seguridad:**
   - Contraseñas con `bcrypt` (mínimo 10 rondas).
   - Secretos únicamente en `.env`.
   - Autenticación con JWT de 24h de expiración.
4. **Trazabilidad:**
   - Citar siempre los códigos de requerimiento RF-XX y RNF-XX de `doucumentos/documento_de_requerimientos_de_software_srs.md`.
