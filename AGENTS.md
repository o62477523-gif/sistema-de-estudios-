# Guía de Reglas y Convenciones del Agente (Spec-Driven Development)

Este proyecto sigue estrictamente la metodología **Spec-Driven Development (SSD / SDD)** mediante la herramienta **OpenSpec**. Todos los agentes de IA y desarrolladores deben acatar estas pautas antes y durante cualquier intervención de código.

---

## 1. Metodología Obligatoria: Spec-Driven Development (OpenSpec)

1. **Cero Código sin Especificación:**
   - No se implementa código nuevo ni se refactoriza lógica existente sin un cambio propuesto y validado en OpenSpec.
2. **Ciclo de Vida de Cambios (OpenSpec):**
   - **Propuesta:** Usar `/opsx-propose <nombre-cambio>` para generar la estructura bajo `openspec/changes/<nombre-cambio>/` (`proposal.md`, `specs/`, `design.md`, `tasks.md`).
   - **Validación:** Ejecutar `openspec validate --all` para garantizar conformidad con los esquemas normativos (SHALL/MUST, escenarios WHEN/THEN).
   - **Aplicación:** Usar `/opsx-apply <nombre-cambio>` para implementar metódicamente cada tarea definida en `tasks.md`.
   - **Archivo y Sincronización:** Una vez completadas y verificadas todas las tareas, ejecutar `/opsx-archive <nombre-cambio>` para consolidar las especificaciones vivas en `openspec/specs/`.
3. **Comandos rápidos disponibles:**
   - `/opsx-propose [nombre]` - Crear o refinar una propuesta de cambio.
   - `/opsx-apply [nombre]` - Aplicar tareas de un cambio activo.
   - `/opsx-archive [nombre]` - Archivar un cambio y promover a specs vivas.
   - `/opsx-sync` - Sincronizar cambios o especificaciones.
   - `/opsx-explore` - Explorar el impacto y contexto de especificaciones.

---

## 2. Restricciones del Stack Tecnológico

- **Frontend:**
  - HTML5 semántico y accesible.
  - CSS3 Vanilla: variables nativas CSS (`:root`), Grid y Flexbox. No usar frameworks CSS externos ni estilos inline. Paleta oficial: Primario `#36BCFF`, Secundario `#FFF836`, Terciario `#FF6B8B`, Neutro `#8C8C7A`, Fondo `#0F172A`.
  - JavaScript Vanilla (ES6+): arquitectura modular nativa (`import`/`export`), API `fetch`, manipulación segura de DOM (`textContent` en lugar de `innerHTML` vulnerable). Sin frameworks SPA.
- **Backend:**
  - Node.js con Express Framework.
  - Patrón de 3 capas: `routes/` -> `controllers/` -> `services/` -> `models/`.
  - Autenticación con JSON Web Tokens (JWT) y cifrado de contraseñas con `bcrypt` (mínimo 10 rondas).
  - Manejo asíncrono obligatorio con `async/await` y bloques `try/catch` centralizados.
- **Base de Datos (SQLite 3):**
  - Conexión configurada con `PRAGMA foreign_keys = ON;`.
  - Prohibida la concatenación de texto en sentencias SQL. Uso exclusivo de consultas preparadas (*Prepared Statements* con parámetros `?`).

---

## 3. Fuentes de Verdad y Trazabilidad

- `openspec/specs/`: Especificaciones vivas del sistema por capacidad (`autenticacion`, `perfil-academico`, `banco-preguntas`, `simulacros`, `analitica-ia`).
- `doucumentos/documento_de_requerimientos_de_software_srs.md`: Requerimientos Funcionales (RF-01 a RF-13) y No Funcionales (RNF-01 a RNF-09). Cada especificación o cambio debe citar su código correspondiente.
- `doucumentos/documento_de_arquitectura_del_sistema.md`: Especificación del diseño en capas, diagramas de secuencia y flujos seguros de evaluación.
- `doucumentos/est_ndar_de_desarrollo_y_buenas_pr_cticas.md`: Convenciones de nombrado, commits (Conventional Commits) y control de versiones.
- `doucumentos/gu_a_de_dise_o_ui_ux_y_sistema_de_estilos.md`: Sistema de diseño visual, tipografías y tokens de color.
