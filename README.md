# Sistema Web de Preparación y Simulacros para Exámenes de Admisión Preuniversitaria

Plataforma educativa para postulantes a universidades públicas (UNMSM, UNI, UNSA, UNT, etc.) con simulacros cronometrados, motor de evaluación en backend, retroalimentación con IA generativa y analítica histórica de progreso.

---

## 🛠️ Stack Tecnológico

- **Frontend:** HTML5 Semántico, CSS3 Vanilla (tokens en `:root`, Flexbox, Grid), JavaScript Vanilla (ES6+ Modules, Fetch API, sin frameworks).
- **Backend:** Node.js con Express Framework, autenticación con JWT y encriptación con bcrypt.
- **Base de Datos:** SQLite 3 (con claves foráneas activadas `PRAGMA foreign_keys = ON;` y consultas preparadas).
- **Inteligencia Artificial:** Microservicio / Integración API para explicación pedagógica de reactivos.

---

## 📐 Metodología: Spec-Driven Development (SSD / OpenSpec)

El desarrollo de este sistema está regido al 100% por **Spec-Driven Development (SSD / SDD)** utilizando **OpenSpec**. Ninguna línea de código se escribe sin antes contar con especificaciones formales y criterios de verificación aprobados.

### Estructura de OpenSpec en el Proyecto

```text
├── openspec/
│   ├── config.yaml               # Configuración global, reglas del proyecto y stack
│   ├── specs/                    # Especificaciones vivas del sistema (fuente de verdad)
│   │   ├── autenticacion/        # RF-01, RF-02 (Registro, Login JWT, Roles)
│   │   ├── perfil-academico/     # RF-03 (Meta académica, Universidad y Carrera)
│   │   ├── banco-preguntas/      # RF-04, RF-05, RF-06 (Jerarquía, LaTeX, CRUD)
│   │   ├── simulacros/           # RF-07, RF-08, RF-09, RF-10 (Rendición, Timer, Calificación)
│   │   └── analitica-ia/         # RF-11, RF-12, RF-13 (Reporte, IA Tutora, Histórico)
│   └── changes/                  # Propuestas y cambios activos / archivados
├── .agents/                      # Integración y skills de OpenSpec para Antigravity IDE
└── .opencode/                    # Integración y comandos para OpenCode
```

### Ciclo de Desarrollo con OpenSpec

1. **Proponer un cambio (`/opsx-propose`)**:
   Genera una propuesta formal en `openspec/changes/<nombre-cambio>/`:
   - `proposal.md`: Justificación, motivación e impacto.
   - `specs/`: Requerimientos normativos (`SHALL`/`MUST`) y escenarios (`WHEN`/`THEN`).
   - `design.md`: Decisiones arquitectónicas, modelos y alternativas consideradas.
   - `tasks.md`: Lista de tareas verificables con checkboxes.

2. **Validar especificaciones**:
   ```bash
   npm run spec:validate
   # o directamente:
   openspec validate --all
   ```

3. **Implementar las tareas (`/opsx-apply`)**:
   El agente o desarrollador implementa cada paso técnico especificado en `tasks.md`, validando los criterios definidos.

4. **Archivar y sincronizar (`/opsx-archive`)**:
   Una vez completadas y verificadas todas las tareas, se archiva el cambio y se actualizan las especificaciones vivas en `openspec/specs/`.

---

## 🚀 Comandos y Atajos

| Comando / Script | Descripción |
| :--- | :--- |
| `/opsx-propose <nombre>` | Crea o refina una propuesta de cambio con OpenSpec |
| `/opsx-apply <nombre>` | Aplica e implementa las tareas de un cambio activo |
| `/opsx-archive <nombre>` | Archiva un cambio completado y promueve sus specs |
| `/opsx-sync` | Sincroniza cambios pendientes con las especificaciones |
| `npm run spec:validate` | Valida que todas las especificaciones y cambios cumplan el esquema |
| `npm run spec:doctor` | Diagnostica la integridad y dependencias del árbol OpenSpec |
| `npm run spec:view` | Abre el dashboard visual interactivo de OpenSpec |

---

## 📚 Documentación de Referencia

La documentación canónica del proyecto se encuentra en la carpeta [`doucumentos/`](file:///c:/Users/PC31-LAB4/Documents/GitHub/sistema-de-estudios-/doucumentos/):

1. **[Documento de Requerimientos de Software (SRS)](file:///c:/Users/PC31-LAB4/Documents/GitHub/sistema-de-estudios-/doucumentos/documento_de_requerimientos_de_software_srs.md):** Requerimientos Funcionales (RF-01 a RF-13), No Funcionales (RNF-01 a RNF-09) y matriz MoSCoW.
2. **[Documento de Arquitectura de Software (SAD)](file:///c:/Users/PC31-LAB4/Documents/GitHub/sistema-de-estudios-/doucumentos/documento_de_arquitectura_del_sistema.md):** Arquitectura de 3 capas, flujo seguro de calificación y contratos de API.
3. **[Estándar de Desarrollo y Buenas Prácticas](file:///c:/Users/PC31-LAB4/Documents/GitHub/sistema-de-estudios-/doucumentos/est_ndar_de_desarrollo_y_buenas_pr_cticas.md):** Convenciones de código, nombres, branching y Git commits.
4. **[Guía de Diseño UI/UX y Sistema de Estilos](file:///c:/Users/PC31-LAB4/Documents/GitHub/sistema-de-estudios-/doucumentos/gu_a_de_dise_o_ui_ux_y_sistema_de_estilos.md):** Tokens de diseño, paleta cromática, fuentes tipográficas y estados interactivos.
