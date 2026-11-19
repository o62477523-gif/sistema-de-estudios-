# Guía de Diseño UI/UX y Sistema de Estilos (Frontend)

**Proyecto:** Sistema Web de Preparación y Simulacros para Exámenes de Admisión Preuniversitaria  
**Autores:** Palomino Barboza Arnold Jerson / Zabaleta Saez Ruben Abdiel  
**Tecnología Base:** HTML5, CSS3 Vanilla (Variables CSS, Flexbox, CSS Grid) y JavaScript ES6+

---

## 1. Misión Visual y Filosofía de Diseño

La interfaz debe proyectar un ambiente **académico, dinámico, moderno y motivador**. Para evitar una experiencia monótona o aburrida durante las largas jornadas de estudio, se hace uso de tipografías estilo universitario (*Varsity / College*) en encabezados clave, combinadas con una paleta de colores de alto contraste que facilita la legibilidad de preguntas, cronómetros y analíticas de rendimiento.

---

## 2. Paleta de Colores y Tokens CSS

La paleta de colores utiliza variables nativas de CSS (`:root`) para garantizar coherencia, facilidad de mantenimiento y un soporte nativo para modos claros/oscuros en la plataforma.

### 2.1 Definición de Variables CSS (`styles.css`)

```css
:root {
  /* Colors - Identidad Principal */
  --color-primary: #36BCFF;       /* Azul Brillante - Botones principales, acentos y navegación */
  --color-secondary: #FFF836;     /* Amarillo Vibrante - Resaltados, alertas y notificaciones */
  --color-tertiary: #FF6B8B;      /* Rosa/Coral Acceso - Acciones secundarias y badges */
  --color-neutral-dark: #1E1E1E;  /* Fondo oscuro para contraste y tarjetas nocturnas */
  --color-neutral-muted: #8C8C7A; /* Gris Neutro/Oliva - Bordes, contenedores deshabilitados */
  --color-background: #0F172A;   /* Fondo general de la plataforma (Dark Mode elegante) */
  --color-card-bg: #1E293B;     /* Fondo de contenedores y preguntas */
  --color-text-main: #F8FAFC;    /* Texto principal de alta legibilidad */
  --color-text-muted: #94A3B8;   /* Texto secundario y subtítulos descripciones */

  /* Estados de Evaluación */
  --color-success: #22C55E;      /* Respuesta Correcta / Puntaje Alto */
  --color-error: #EF4444;        /* Respuesta Incorrecta / Errores */
  --color-warning: #F59E0B;      /* Pregunta en revisión / Advertencia de tiempo */

  /* Tipografías */
  --font-title: 'Varsity', 'Impact', sans-serif;
  --font-subtitle: 'College Slab', 'Georgia', serif;
  --font-menu: 'Golden Varsity', 'Trebuchet MS', sans-serif;
  --font-body: 'Inter', 'Segoe UI', system-ui, sans-serif;

  /* Bordes y Sombra */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --shadow-card: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 15px rgba(54, 188, 255, 0.4);
}
```

### 2.2 Guía de Uso de Colores

| Color | Hex | Componente / Caso de Uso |
| :--- | :--- | :--- |
| **Primario** | `#36BCFF` | Botones de acción principal (ej. "Iniciar Simulacro", "Enviar Examen"), bordes activos, enlaces y barra de progreso. |
| **Secundario** | `#FFF836` | Indicadores de preguntas marcadas, tarjetas de aviso, elementos que requieren atención visual inmediata sin ser errores. |
| **Terciario** | `#FF6B8B` | Botón de "Explicar con IA", badges de materia crítica o llamada a la acción secundaria. |
| **Neutral** | `#8C8C7A` | Contenedores inactivos, divisores visuales y elementos deshabilitados. |

---

## 3. Tipografía y Jerarquía Visual

Para lograr el aspecto deportivo/universitario deseado sin sacrificar la comodidad de lectura en textos largos (como enunciados o lecturas de comprensión), se separan los roles tipográficos estrictamente:

### 3.1 Declaración `@font-face`

```css
@font-face {
  font-family: 'Varsity';
  src: url('../assets/fonts/varsity.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'College Slab';
  src: url('../assets/fonts/college-slab.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'Golden Varsity';
  src: url('../assets/fonts/golden-varsity.woff2') format('woff2');
  font-display: swap;
}
```

### 3.2 Jerarquía y Estilos

1. **Títulos Principales (`<h1>`, `<h2>` - Puntuación y Secciones):**
   * **Fuente:** `Varsity` (`var(--font-title)`)
   * **Uso:** Encabezados del Dashboard, título de bienvenida, puntaje final obtenido.
   * **Objetivo:** Hacer los encabezados vistosos, llamativos y deportivos.

2. **Subtítulos e Información Importante (`<h3>`, `<h4>`):**
   * **Fuente:** `College Slab` (`var(--font-subtitle)`)
   * **Uso:** Nombre de las áreas (Matemática, Ciencias), títulos de tarjetas de examen, llamados de atención.

3. **Menús y Navegación Superior (`<nav>`, Tabs):**
   * **Fuente:** `Golden Varsity` (`var(--font-menu)`)
   * **Uso:** Opciones de la barra superior (Barra de menú), botones de filtrado de navegación.

4. **Cuerpo de Texto y Preguntas (`<p>`, `<span>`, `<label>`):**
   * **Fuente:** `Inter` o `System Sans-Serif` (`var(--font-body)`)
   * **Uso:** Enunciados de las preguntas, alternativas de respuesta (A, B, C, D, E), explicaciones de la IA.
   * **Nota:** *Jamás se usará tipografía estilizada (Varsity/College) en los enunciados de las preguntas para no dificultar la lectura.*

---

## 4. Estilos de Componentes UI en HTML/CSS Vanilla

### 4.1 Botones de Acción (`.btn`)

```css
.btn {
  font-family: var(--font-menu);
  font-size: 1rem;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #000;
  font-weight: bold;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.btn-ai {
  background: linear-gradient(135deg, var(--color-tertiary), #D946EF);
  color: #FFF;
  font-weight: bold;
}
```

### 4.2 Tarjeta de Pregunta (`.question-card`)

```css
.question-card {
  background-color: var(--color-card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-card);
}

.option-item {
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  margin: 10px 0;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  font-family: var(--font-body);
}

.option-item:hover {
  background-color: rgba(54, 188, 255, 0.1);
  border-color: var(--color-primary);
}

.option-item.selected {
  border-color: var(--color-secondary);
  background-color: rgba(255, 248, 54, 0.15);
}
```

### 4.3 Barra de Navegación Superior (`.navbar`)

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-neutral-dark);
  padding: 15px 30px;
  border-bottom: 3px solid var(--color-primary);
}

.navbar-brand {
  font-family: var(--font-title);
  font-size: 1.8rem;
  color: var(--color-primary);
  text-transform: uppercase;
}

.navbar-menu a {
  font-family: var(--font-menu);
  color: var(--color-text-main);
  text-decoration: none;
  margin-left: 20px;
  transition: color 0.2s;
}

.navbar-menu a:hover {
  color: var(--color-secondary);
}
```

---

## 5. Adaptabilidad y Responsive Design

El diseño se ajustará mediante **Media Queries** estándar para asegurar un rendimiento óptimo tanto en pantallas de escritorio durante simulacros largos, como en dispositivos móviles para repaso rápido:

* **Dispositivos Móviles (`< 768px`):**
  * La barra de menú superior se contrae en un menú desplegable.
  * Los botones de navegación de preguntas pasan a un mapa flotante o inferior.
  * Reducción proporcional del tamaño de fuente tipográfica `Varsity` de `2.5rem` a `1.8rem`.

* **Pantallas de Escritorio (`>= 768px`):**
  * Disposición de pantalla dividida (*Split Screen*): Izquierda para panel de tiempo y árbol de preguntas; Derecha para la pregunta activa y opciones.