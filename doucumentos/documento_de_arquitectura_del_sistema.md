# Documento de Arquitectura de Software (SAD)

**Proyecto:** Sistema Web de Preparación y Simulacros para Exámenes de Admisión Preuniversitaria

**Equipo de Desarrollo:** Palomino Barboza Arnold Jerson / Zabaleta Saez Ruben Abdiel

**Stack Tecnológico:** HTML5, CSS3, JavaScript Vanilla (ES6+), Node.js (Express), SQLite 3

---

## 1. Visión General y Estilo Arquitectónico

El sistema utiliza una arquitectura de **3 Capas (Cliente - Servidor - Base de Datos)** desacopladas, basada en el patrón REST (Representational State Transfer) para la comunicación HTTP/HTTPS y el patrón Controller-Service-Model para la organización del Backend.

```
+-----------------------------------------------------------------------+
|                         CAPA DE PRESENTACIÓN                          |
|             Frontend Web (HTML5 / CSS3 Vanilla / JS ES6+)             |
|   - SPA / Modular JS            - State Local (LocalStorage)         |
|   - Manejo de DOM Dinámico       - Cliente HTTP (Fetch API)           |
+-----------------------------------------------------------------------+
                                   |
                         Peticiones HTTP / JSON
                        Authorization: Bearer JWT
                                   v
+-----------------------------------------------------------------------+
|                           CAPA DE NEGOCIO                             |
|                       Backend Node.js (Express)                       |
|   +---------------------------------------------------------------+   |
|   | Middleware (JWT Auth, CORS, Error Handler, Input Sanitizer)   |   |
|   +---------------------------------------------------------------+   |
|   | Controllers (Manejo de HTTP Req / Res)                         |   |
|   +---------------------------------------------------------------+   |
|   | Services (Motor de Evaluación, Algoritmo de Calificación)     |   |
|   +---------------------------------------------------------------+   |
|   | Microservicio Integrador de IA (OpenAI / Gemini API Client)   |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
                    |                               |
        Consultas SQL Preparadas            Peticiones HTTPS / JSON
                    v                               v
+-----------------------+               +-----------------------+
|  CAPA DE PERSISTENCIA |               |   SERVICIO EXTERNO    |
|   Base de Datos SQL   |               |   API IA Generativa   |
|       (SQLite 3)      |               | (Explicación Fallos)  |
+-----------------------+               +-----------------------+
```

---

## 2. Descripción de Componentes por Capas

### 2.1 Capa de Presentación (Frontend)
* **HTML5 Semántico:** Páginas livianas y accesibles estructuradas para el registro, panel principal, interfaz de simulacro y reporte de resultados.
* **Estilos CSS Vanilla (`styles.css`):** Arquitectura CSS declarativa apoyada en variables nativas (`:root`), Flexbox y CSS Grid. Garantiza cumplimiento estricto del sistema de diseño (colores `#36BCFF`, `#FFF836`, `#FF6B8B`, tipografías `Varsity` / `College Slab`).
* **JavaScript ES6+ (Sin Frameworks):**
  * **Módulo de Autenticación (`auth.js`):** Gestiona el Token JWT en `localStorage` o `sessionStorage`.
  * **Módulo de Examen & Cronómetro (`examen.js`):** Controla la cuenta regresiva, el marcado local de respuestas y el envío diferido/automático al servidor.
  * **Módulo de Peticiones (`api.js`):** Wrapper centralizado utilizando `fetch()` para abstraer encabezados HTTP y manejo global de errores de red.

### 2.2 Capa de Negocio y Servicios (Backend Node.js)
* **Servidor Express (`app.js` / `server.js`):** Maneja el enrutamiento HTTP, la inicialización de SQLite y los middlewares globales.
* **Capa de Controladores (`controllers/`):** Valida datos entrantes, delega trabajo a los servicios y retorna estructuras JSON estandarizadas.
* **Capa de Servicios (`services/`):**
  * **Motor de Evaluación (`evaluacionService.js`):** Compara las opciones enviadas por el alumno contra las respuestas correctas persistidas en SQLite, aplicando el algoritmo de ponderación oficial.
  * **Módulo de Integración con IA (`aiService.js`):** Construye el *prompt* pedagógico con el enunciado y la alternativa errónea marcada, enviándolo a la API de Inteligencia Artificial para obtener el paso a paso detallado.
* **Middlewares (`middlewares/`):**
  * `authMiddleware.js`: Intercepta peticiones protegidas y valida la firma y expiración del token JWT.
  * `errorHandler.js`: Captura excepciones no controladas y previene caídas del servidor.

### 2.3 Capa de Persistencia (SQLite 3)
* **Base de Datos Embebida (SQLite):** Archivo relacional `.db` ultraligero y de alta velocidad de lectura.
* **Integridad Referencial:** Activada en la conexión inicial mediante `PRAGMA foreign_keys = ON;`.
* **Seguridad de Datos:** Consultas preparadas con parámetros vinculados (`?`) que eliminan riesgos de Inyección SQL.

---

## 3. Diagramas de Flujo de Datos y Secuencia

### 3.1 Flujo de Finalización y Calificación Segura de Simulacro (RF-08, RF-10)

```
[ Estudiante / Frontend ]     [ Router / Controller ]        [ Evaluacion Service ]         [ SQLite DB ]
          |                              |                             |                      |
          | --- 1. POST /examenes/finalizar (examen_id, respuestas) -> |                      |
          |                              | --- 2. Solicitar respuestas correctas ------------> |
          |                              | <--- 3. Retornar clave de respuestas -------------- |
          |                              |                             |                      |
          |                              | --- 4. Comparar y calcular puntaje final --------> |
          |                              |                             |                      |
          |                              | --- 5. INSERT INTO resultados --------------------> |
          |                              | <--- 6. Confirmación de guardado ------------------ |
          | <--- 7. JSON (puntaje, aciertos, desaciertos, desglose) -|                      |
```

### 3.2 Flujo de Tutoría y Explicación con IA (RF-12)

```
[ Estudiante / Frontend ]     [ AI Controller ]            [ AI Service ]             [ API IA Externa ]
          |                          |                           |                             |
          | -- 1. POST /ai/explicar ->|                           |                             |
          |    (pregunta_id, opc_marcada)                        |                             |
          |                          | --- 2. Obtener datos de   |                             |
          |                          |      pregunta de DB ----> |                             |
          |                          |                           | --- 3. Construir Prompt ->  |
          |                          |                           | --- 4. Request HTTPS -----> |
          |                          |                           | <--- 5. Response Explicación|
          | <-- 6. JSON (explicación paso a paso) ---------------|                             |
```

---

## 4. Estrategia de Seguridad y Atributos de Calidad

1. **Seguridad en Autenticación:**
   * Almacenamiento de contraseñas con hash `bcrypt` (salting = 10 rondas mínimo).
   * Generación de Tokens JWT firmados con clave secreta aleatoria definida en variable de entorno (`JWT_SECRET`).
2. **Resiliencia en Cliente:**
   * El cronómetro en JS Vanilla guarda el progreso de la prueba en `localStorage` cada 10 segundos. Si la página se recarga por accidente, el simulacro recupera las marcaciones previas y el tiempo restante exacto.
3. **Aislamiento de Lógica Crítica:**
   * Ningún cálculo matemático de puntaje ocurre en el cliente web. El servidor es la única fuente de verdad para la evaluación.
4. **Escalabilidad y Mantenibilidad:**
   * Estructura modular de archivos Node.js que independiza las rutas, la lógica de negocio y las consultas SQL.