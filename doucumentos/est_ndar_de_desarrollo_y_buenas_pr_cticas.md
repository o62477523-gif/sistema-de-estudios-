# Estándar de Desarrollo de Software y Convenciones de Código

**Proyecto:** Sistema Web de Preparación y Simulacros para Exámenes de Admisión Preuniversitaria  
**Equipo:** Palomino Barboza Arnold Jerson / Zabaleta Saez Ruben Abdiel  
**Stack Tecnológico:** HTML5, CSS3, JavaScript Vanilla (ES6+), Node.js (Express), SQLite 3  

---

## 1. Control de Versiones y Git

### 1.1 Política de Ramas (Git Flow Simplificado)
* `main` / `master`: Código estable en producción o listo para entrega final.
* `develop`: Rama principal de integración.
* `feature/<nombre-feature>`: Para desarrollo de nuevas funcionalidades (ej. `feature/autenticacion-jwt`, `feature/cronometro-simulacro`).
* `fix/<nombre-bug>`: Para corrección de errores (ej. `fix/calculo-puntaje-negativo`).

### 1.2 Convención de Commits (Conventional Commits)
Los mensajes de commit deben estar en español o inglés neutro siguiendo el formato: `<tipo>: <descripción breve en presente>`

* `feat:` Nueva funcionalidad para el usuario.
* `fix:` Corrección de un error o bug.
* `docs:` Cambios en la documentación (SRS, API, Readme).
* `style:` Formato, espacios o ajustes visuales en CSS sin cambiar lógica.
* `refactor:` Reestructuración de código que no altera el funcionamiento.
* `test:` Adición o modificación de pruebas.

*Ejemplo:* `feat: agregar endpoint para finalizar simulacro en Node.js`

---

## 2. Convenciones de Nomenclatura (Naming Conventions)

| Elemento | Convención | Ejemplo |
| :--- | :--- | :--- |
| **Archivos Backend/JS** | `snake_case` o `kebab-case` | `auth_controller.js`, `exam-routes.js` |
| **Archivos HTML/CSS** | `kebab-case` | `login.html`, `examen-simulacro.css` |
| **Variables y Funciones (JS)** | `camelCase` | `estudianteId`, `calcularPuntajeFinal()` |
| **Clases y Componentes (JS)** | `PascalCase` | `ExamenTimer`, `ResultadoService` |
| **Constantes Globales** | `UPPER_SNAKE_CASE` | `MAX_EXPIRATION_TIME`, `DEFAULT_SCORE` |
| **Tablas y Columnas (SQLite)** | `snake_case` (plural para tablas) | `estudiantes`, `respuestas_correctas` |
| **Rutas de API REST** | `kebab-case` (plural para recursos) | `/api/examenes`, `/api/banco-preguntas` |
| **Clases CSS (BEM / Semántico)** | `kebab-case` | `.btn-primary`, `.question-card__option` |

---

## 3. Estándares para el Backend (Node.js & Express)

### 3.1 Estructura del Proyecto Node.js
```text
src/
├── config/         # Configuración de SQLite, JWT y variables de entorno
├── controllers/    # Lógica de procesamiento de peticiones y respuestas HTTP
├── middlewares/    # Validadores de JWT, roles y manejo de errores
├── models/         # Consultas SQL directas a la B.D. SQLite
├── routes/         # Definición de endpoints de la API REST
├── services/       # Lógica de negocio (ej. motor de calificación, llamadas a IA)
└── app.js          # Punto de entrada de la aplicación Express
```

### 3.2 Manejo Asíncrono y Errores
* Usar **Async/Await** en lugar de callbacks tradicionales o cadenas largas de `.then()`.
* Todo bloque asíncrono en controladores debe estar envuelto en un bloque `try/catch` o utilizar un middleware global de manejo de errores.

```javascript
// ✅ Correcto: Uso de async/await con bloque try/catch
exports.finalizarExamen = async (req, res, next) => {
  try {
    const { examenId, respuestas } = req.body;
    const resultado = await ExamenService.calcularYGuardarPuntaje(examenId, respuestas);
    return res.status(200).json({ status: 'success', data: resultado });
  } catch (error) {
    next(error); // Pasa el error al middleware global
  }
};
```

### 3.3 Reglas de Consultas SQL a SQLite
* **Prohibido la concatenación directa de cadenas en sentencias SQL** para evitar inyección SQL (*SQL Injection*).
* Utilizar siempre **consultas preparadas** (*Prepared Statements*) con parámetros vinculados (`?` o `$param`).

```javascript
// ❌ Incorrecto (Vulnerable a Inyección SQL)
const sql = `SELECT * FROM estudiantes WHERE correo = '${correo}'`;

// ✅ Correcto (Consulta Preparada)
const stmt = db.prepare('SELECT * FROM estudiantes WHERE correo = ?');
const estudiante = stmt.get(correo);
```

---

## 4. Estándares para el Frontend (HTML5 / CSS3 / JS Vanilla)

### 4.1 HTML y Semántica
* Utilizar etiquetas semánticas (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
* Todos los botones interactivos deben usar la etiqueta `<button>` con un atributo `type` explícito (`type="button"` o `type="submit"`).

### 4.2 CSS3 Vanilla
* Utilizar las variables nativas CSS declaradas en `:root` para colores y fuentes (`var(--color-primary)`).
* Mantener la especificidad CSS baja, priorizando clases reutilizables sobre selectores por ID.
* No colocar estilos inline (`style="..."`) dentro de las etiquetas HTML.

### 4.3 JavaScript Vanilla (DOM y Peticiones)
* Utilizar `const` por defecto, y `let` solo si la variable será reasignada. Queda prohibido el uso de `var`.
* Utilizar la API nativa `fetch()` para consumo de endpoints REST.
* Encapsular la lógica de manipulación del DOM en funciones puras o módulos JS aislados.

```javascript
// ✅ Correcto: Envío seguro de respuestas al Backend mediante Fetch API
async function enviarRespuestasExamen(examenId, respuestasSeleccionadas) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/examenes/finalizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        examen_id: examenId,
        respuestas: respuestasSeleccionadas
      })
    });

    if (!response.ok) throw new Error('Error al procesar la calificación');
    return await response.json();
  } catch (error) {
    console.error('Error de red o servidor:', error);
  }
}
```

---

## 5. Reglas de Seguridad Cero Tolerancia

1. **Sin Almacenamiento de Secretos en Código:** Llaves de API de IA, variables de entorno y la clave secreta del JWT deben vivir en un archivo `.env` (no subido a Git).
2. **Encriptación Obligatoria:** Las contraseñas se encriptan con `bcrypt` en el servidor antes de tocar SQLite.
3. **Calificación Exclusiva en Backend:** El frontend nunca calcula la nota ni envía puntajes calculados.
4. **Desinfectado de Entradas (XSS):** Todo texto proveniente de usuarios o de la base de datos introducido en el DOM debe usar `textContent` o utilidades de escape antes de renderizarse.

---

## 6. Respuestas y Códigos de Estado HTTP

Toda respuesta de la API Node.js debe mantener una estructura JSON estandarizada:

```json
// Respuesta Exitosa (200 OK, 201 Created)
{
  "status": "success",
  "data": { ... }
}

// Respuesta con Error (400, 401, 404, 500)
{
  "status": "error",
  "message": "Descripción clara del error para el cliente"
}
```