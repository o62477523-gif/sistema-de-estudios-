# Documento de Especificación de Requerimientos de Software (SRS)

**Proyecto:** Sistema Web de Preparación y Simulacros para Exámenes de Admisión Preuniversitaria

**Equipo de Desarrollo:** Palomino Barboza Arnold Jerson / Zabaleta Saez Ruben Abdiel

**Stack Tecnológico Seleccionado:**
* **Frontend:** HTML5, CSS3 (Variables CSS / Flexbox & Grid / Guía de Estilos), JavaScript Vanilla (ES6+)
* **Backend:** Node.js (Express Framework, JWT, Bcrypt)
* **Base de Datos:** SQLite 3 (con claves foráneas activadas)
* **Integración Externa:** API REST para Microservicio de Inteligencia Artificial Generativa

---

## 1. Introducción y Alcance del Sistema

### 1.1 Propósito
El presente documento establece la Especificación de Requerimientos de Software (SRS) detallada para la construcción de la plataforma integral de preparación preuniversitaria. Este documento sirve como contrato técnico para el diseño arquitectónico, la base de datos en SQLite, la API REST en Node.js y la interfaz de usuario en JS Vanilla.

### 1.2 Alcance del Sistema
La plataforma está enfocada en estudiantes que postulan a universidades públicas. Cubre el ciclo completo de preparación:
1. Gestión de identidad y perfil académico personalizado (Universidad y Carrera meta).
2. Repositorio dinámico de preguntas categorizadas por área, materia y tema específico.
3. Motor de simulacros cronometrados con servidor de evaluación en tiempo real y anti-fraude.
4. Módulo de retroalimentación analítica y recomendaciones guiadas por Inteligencia Artificial.
5. Módulo de administración para carga y mantenimiento de preguntas, materias y métricas generales.

---

## 2. Requerimientos Funcionales Detallados (RF)

### Módulo 1: Autenticación, Seguridad y Gestión de Perfil

* **RF-01: Registro de Estudiante**
  * **Descripción:** El sistema debe permitir el autoregistro de postulantes en la plataforma.
  * **Entradas:** Nombre completo, correo electrónico válido, contraseña (mínimo 8 caracteres, al menos un número y una mayúscula).
  * **Regla de Negocio:** El correo electrónico debe ser único en la tabla `estudiantes`. La contraseña debe ser encriptada en el backend usando `bcrypt` (factor de costo mínimo: 10) antes de persistir en SQLite.
  * **Respuesta:** `201 Created` con confirmación de cuenta, o `409 Conflict` si el correo ya existe.

* **RF-02: Inicio de Sesión y Control de Sesión (JWT)**
  * **Descripción:** Validación de credenciales para el acceso al sistema.
  * **Entradas:** Correo electrónico y contraseña.
  * **Salida:** Token JWT (JSON Web Token) firmado que contendrá el `estudiante_id`, `rol` (estudiante/administrador) y una expiración de 24 horas.
  * **Regla de Negocio:** Toda petición posterior a rutas protegidas deberá adjuntar el token en la cabecera `Authorization: Bearer <token>`.

* **RF-03: Perfil Académico Personalizado**
  * **Descripción:** Permite al estudiante seleccionar y modificar su meta académica.
  * **Campos:** `universidad_id` (ej. UNMSM, UNI, UNSA, UNT) y `carrera_id` (ej. Ingeniería de Sistemas, Medicina, Derecho).
  * **Efecto:** Los simulacros y estadísticas ponderarán o darán prioridad al temario oficial según la universidad seleccionada.

---

### Módulo 2: Banco de Preguntas, Contenidos y Mantenimiento

* **RF-04: Estructura Jerárquica del Banco de Preguntas**
  * **Descripción:** Las preguntas deben estar organizadas bajo una estructura jerárquica de 3 niveles:
    1. **Área General:** (Ej. Ciencias Básicas, Ingenierías, Humanidades, BIomédicas).
    2. **Materia:** (Ej. Álgebra, Física, Lenguaje, Biología, Razonamiento Matemático).
    3. **Tema:** (Ej. Ecuaciones de Segundo Grado, Leyes de Newton, Sintaxis).

* **RF-05: Estructura Multimedial y de Opciones de Pregunta**
  * **Descripción:** Cada pregunta almacenará un enunciado en texto (con soporte para notación científica en LaTeX `$ ... $`), una imagen opcional (URL/Path) y exactamente 4 o 5 alternativas de respuesta, indicando cuál es la correcta.

* **RF-06: Módulo Administrativo - Gestión de Preguntas (CRUD)**
  * **Descripción:** Un usuario con rol `administrador` debe poder crear, editar, listar, filtrar y desactivar preguntas del banco mediante un panel especial.

---

### Módulo 3: Motor de Simulacros y Evaluación Segura

* **RF-07: Configuración Dinámica de Simulacro**
  * **Descripción:** El estudiante podrá generar un examen de práctica bajo dos modalidades:
    1. **Simulacro General:** Genera automáticamente la estructura completa acorde a la universidad objetivo seleccionada.
    2. **Práctica Específica:** El alumno elige el área/materia y la cantidad de preguntas (ej. 10, 20 o 50 preguntas).

* **RF-08: Rendición de Simulacro y Cronómetro en Frontend**
  * **Descripción:** La interfaz de evaluación debe ofrecer:
    * Un temporizador descendente visible en la barra superior.
    * Navegación fluida entre preguntas (Anterior, Siguiente, Salto por mapa de preguntas).
    * Marcado de preguntas "Para revisión posterior".
    * Auto-guardado local (`localStorage`) en el navegador del progreso para evitar pérdida de datos por desconexión fortuita.

* **RF-09: Envío Automático por Finalización de Tiempo**
  * **Descripción:** Si el cronómetro llega a `00:00:00`, el script en JS Vanilla desactivará las opciones de respuesta y forzará el envío automático del formulario de respuestas al backend Node.js.

* **RF-10: Calificación Centralizada e Inviolable (Backend Engine)**
  * **Descripción (Crítico de Seguridad):** El cliente enviará únicamente el `examen_id` y el arreglo de marcaciones: `[{ pregunta_id: 101, opcion_seleccionada: "C" }]`.
  * **Procesamiento Backend:**
    1. Node.js recupera de SQLite las respuestas correctas originales de ese `examen_id`.
    2. Calcula `respuestas_correctas`, `respuestas_incorrectas` y `preguntas_en_blanco`.
    3. Aplica la fórmula de puntaje según la universidad (Ej. Correcta: +20 pts, Incorrecta: -1.125 pts, En blanco: 0 pts).
    4. Guarda en la tabla `resultados` el puntaje final y retorna la calificación oficial.

---

### Módulo 4: Analítica de Rendimiento e Integración con IA

* **RF-11: Reporte Detallado Post-Examen**
  * **Descripción:** Al finalizar la evaluación, el estudiante verá:
    * Puntaje total alcanzado vs. Puntaje mínimo histórico para su carrera.
    * Gráfico o desglose de efectividad (%) por materia.
    * Solucionario completo indicando respuesta dada vs. respuesta correcta.

* **RF-12: Asistencia Técnica y Explicación con IA Generativa**
  * **Descripción:** En la vista del solucionario, cada pregunta respondida de forma incorrecta o dejada en blanco incluirá el botón **"Explicar con IA"**.
  * **Efecto:** El backend solicitará al servicio externo de IA una explicación pedagógica, estructurada de la siguiente manera:
    * Concepto clave a repasar.
    * Resolución paso a paso del problema.
    * Por qué la opción marcada por el alumno era errónea.

* **RF-13: Panel de Evolución (Dashboard del Estudiante)**
  * **Descripción:** Vista histórica con la progresión del puntaje del estudiante a lo largo de sus últimos 10 simulacros, resaltando sus "Materias Fuertes" y "Materias Críticas a Reforzar".

---

## 3. Priorización de Requerimientos (Matriz MoSCoW)

| Código | Requerimiento | Clasificación | Justificación de Negocio |
| :--- | :--- | :--- | :--- |
| **RF-01** | Registro de Estudiante | **Must Have** | Fundamental para la persistencia del alumno. |
| **RF-02** | Login y Token JWT | **Must Have** | Seguridad obligatoria para autenticación de API. |
| **RF-03** | Selección Universidad/Carrera | **Must Have** | Asigna las reglas y puntajes de evaluación. |
| **RF-04** | Banco de Preguntas Jerárquico | **Must Have** | Base del repositorio de contenidos. |
| **RF-07** | Configuración de Simulacro | **Must Have** | Core funcional del sistema de evaluación. |
| **RF-08** | Rendición de Examen / Tiempo | **Must Have** | Interfaz cliente requerida para la práctica. |
| **RF-10** | Calificación Inviolable Backend | **Must Have** | Elimina manipulaciones de notas en cliente. |
| **RF-11** | Reporte Detallado Post-Examen | **Must Have** | Muestra el resultado inmediato al usuario. |
| **RF-06** | Módulo CRUD Administración | **Should Have** | Necesario para alimentar y corregir preguntas. |
| **RF-13** | Dashboard de Evolución Histórica | **Should Have** | Brinda alto valor analítico a largo plazo. |
| **RF-12** | Explicación de Fallos con IA | **Could Have** | Módulo externo de tutoría personalizada. |

---

## 4. Requerimientos No Funcionales (RNF)

### 4.1 Seguridad e Integridad de Datos
* **RNF-01 (Encriptación):** Las contraseñas de usuarios deben protegerse mediante algoritmo `bcrypt` con un mínimo de 10 rondas de salting.
* **RNF-02 (Protección API):** Todos los endpoints salvo `/login` y `/registro` deben ser privados y requerir la cabecera `Authorization: Bearer <token_jwt>`.
* **RNF-03 (Sanitización Entrada):** Prevenir ataques SQL Injection usando consultas preparadas (*prepared statements*) en la librería SQLite de Node.js.

### 4.2 Rendimiento y Eficiencia
* **RNF-04 (Tiempos de Respuesta):**
  * Solicitud de listado de preguntas: $< 300\text{ ms}$.
  * Procesamiento y calificación de simulacro: $< 800\text{ ms}$.
* **RNF-05 (Pesos de Recursos Frontend):** La carga inicial de la aplicación en JS Vanilla no debe superar los $1.5\text{ MB}$ de assets (excluyendo imágenes de preguntas).

### 4.3 Interfaz de Usuario y Estilo (UI/UX)
* **RNF-06 (Guía de Estilos de Marca):** La interfaz web debe adherirse estrictamente al diseño visual del proyecto:
  * **Color Primario:** `#36BCFF` (Azul principal de navegación y botones primarios).
  * **Color Secundario / Acento:** `#FFF836` (Amarillo para alertas, resaltados y estados activos).
  * **Color Terciario:** `#FF6B8B` (Rosa para botones de acción secundaria / cancelación).
  * **Color Neutral / Fondo:** `#8C8C7A` (Gris tenue / Tono neutro de soporte).
  * **Tipografías:** `Varsity` para Títulos, `College Slab` para Subtítulos e Información clave, y `Golden Varsity` para menús de navegación superior.
* **RNF-07 (Diseño Adaptativo):** Soporte *Responsive Design* completo con breakpoints para dispositivos móviles ($320\text{px}$ a $767\text{px}$), tablets ($768\text{px}$ a $1023\text{px}$) y escritorios ($\ge 1024\text{px}$).

### 4.4 Arquitectura y Base de Datos
* **RNF-08 (Pragma SQLite):** La base de datos SQLite debe ejecutar la instrucción `PRAGMA foreign_keys = ON;` al iniciar cada conexión en Node.js para garantizar la integridad referencial entre tablas.
* **RNF-09 (Modularidad Frontend):** Código JS Vanilla organizado bajo el patrón modular (ES Modules) separando controladores de vista, servicios de llamada a la API (`fetch`) y manejo del estado local.