# Backend API - Sistema de Estudios y Simulacros

Backend API basado en Node.js, Express, SQLite 3 (better-sqlite3), JWT y bcrypt, estructurado bajo el patrón **Controller → Service → Model** y una arquitectura de 3 capas para el Sistema Web de Preparación y Simulacros Preuniversitarios.

---

## 1. Estructura de Directorios

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Conexión SQLite 3 (better-sqlite3), PRAGMA foreign_keys y esquema
│   │   └── seed.js              # Semillero idempotente de universidades, carreras, áreas, materias, temas y preguntas
│   ├── controllers/
│   │   ├── area_controller.js   # CRUD y consulta de áreas académicas
│   │   ├── auth_controller.js   # Registro y login de usuarios
│   │   ├── carrera_controller.js# Consulta de carreras y filtrado por universidad
│   │   ├── health_controller.js # Solicitud GET /api/health
│   │   ├── materia_controller.js# CRUD y consulta de materias académicas
│   │   ├── perfil_academico_controller.js # Consulta y configuración de meta académica
│   │   ├── pregunta_controller.js# CRUD atómico y consulta de preguntas y alternativas
│   │   ├── tema_controller.js   # CRUD y consulta de temas académicos
│   │   └── universidad_controller.js      # Catálogo de universidades activas
│   ├── middlewares/
│   │   ├── auth_middleware.js   # Validación de JWT en cabecera Authorization: Bearer
│   │   ├── role_middleware.js   # Control de acceso basado en roles (RBAC)
│   │   ├── error_handler.js     # Middleware centralizado de excepciones (500)
│   │   └── not_found_handler.js # Middleware para rutas no encontradas (404)
│   ├── models/
│   │   ├── alternativa_model.js # Persistencia de alternativas con consultas preparadas
│   │   ├── area_model.js        # Persistencia de áreas académicas
│   │   ├── carrera_model.js     # Persistencia de carreras con consultas preparadas
│   │   ├── estudiante_model.js  # Persistencia de estudiantes y perfiles con prepared statements
│   │   ├── materia_model.js     # Persistencia de materias académicas
│   │   ├── pregunta_model.js    # Persistencia de preguntas con consultas preparadas
│   │   ├── tema_model.js        # Persistencia de temas académicos
│   │   └── universidad_model.js # Persistencia de universidades con consultas preparadas
│   ├── routes/
│   │   ├── area_routes.js       # Rutas de áreas (/api/areas)
│   │   ├── auth_routes.js       # Rutas de autenticación (/api/auth)
│   │   ├── carrera_routes.js    # Rutas de carreras (/api/carreras)
│   │   ├── health_routes.js     # Rutas de verificación de salud (/api/health)
│   │   ├── materia_routes.js    # Rutas de materias (/api/materias)
│   │   ├── perfil_academico_routes.js # Rutas de perfil académico (/api/perfil-academico)
│   │   ├── pregunta_routes.js   # Rutas de preguntas (/api/preguntas)
│   │   ├── tema_routes.js       # Rutas de temas (/api/temas)
│   │   └── universidad_routes.js      # Rutas de universidades (/api/universidades)
│   ├── services/
│   │   ├── area_service.js      # Lógica de negocio y validación de áreas
│   │   ├── auth_service.js      # Hashing bcrypt (10 rondas), validación y tokens JWT
│   │   ├── carrera_service.js   # Lógica de negocio y validación de carreras activas
│   │   ├── materia_service.js   # Lógica de negocio y validación de materias
│   │   ├── perfil_academico_service.js # Reglas de pertenencia, validación y perfil de estudiante
│   │   ├── pregunta_service.js  # Transaccionalidad atómica y validación de preguntas y alternativas
│   │   ├── tema_service.js      # Lógica de negocio y validación de temas
│   │   └── universidad_service.js      # Lógica de negocio de universidades activas
│   ├── app.js                   # Configuración y middlewares de Express
│   └── server.js                # Arranque y escucha del servidor HTTP
├── database/
│   ├── .gitkeep                 # Directorio del archivo SQLite
│   └── sistema_estudios.sqlite  # Base de datos local (ignorada por Git)
├── tests/
│   ├── auth_integration.test.js # Suite de integración de autenticación (Fase 2)
│   ├── perfil_academico_integration.test.js # Suite de integración de perfil académico (Fase 3)
│   └── banco_preguntas_integration.test.js  # Suite de integración de banco de preguntas (Fase 4)
├── .env.example                 # Plantilla de variables de entorno
├── .gitignore                   # Exclusión de .env, node_modules y *.sqlite
├── package.json                 # Configuración de dependencias ESM y scripts
└── README.md                    # Documentación del backend
```

---

## 2. Dependencias Instaladas

- **`express` (^5.3.0):** Framework HTTP minimalista para enrutamiento, middlewares y parsing de JSON.
- **`better-sqlite3` (^13.2.0):** Driver de base de datos SQLite síncrono de alto rendimiento con soporte nativo para consultas preparadas e integridad referencial (`PRAGMA foreign_keys = ON;`).
- **`bcrypt` (^6.0.0):** Hashing y verificación unidireccional de contraseñas con factor de costo de 10 rondas (RNF-01).
- **`jsonwebtoken` (^9.0.3):** Generación y validación de tokens JWT firmados con expiración de 24 horas (RF-02).
- **`dotenv` (^18.0.10):** Carga segura de variables de entorno desde `.env`.

---

## 3. Configuración del Entorno

1. Copiar el archivo de plantilla `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configurar las variables en `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_PATH=database/sistema_estudios.sqlite
   JWT_SECRET=tu_clave_secreta_jwt_larga_y_segura
   JWT_EXPIRES_IN=24h
   ```

*(Nota: `.env` contiene secretos del sistema y está excluido del control de versiones mediante `.gitignore`).*

---

## 4. Instrucciones de Ejecución

Dentro del directorio `backend/`:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Poblar catálogo inicial de universidades y carreras (Semillero Idempotente):**
   ```bash
   npm run seed
   ```
3. **Ejecutar en producción:**
   ```bash
   npm start
   ```
4. **Ejecutar en desarrollo (con recarga automática mediante `node --watch`):**
   ```bash
   npm run dev
   ```
5. **Ejecutar suite automatizada de pruebas de integración:**
   ```bash
   npm test
   ```

---

## 5. Endpoints de la API

### 5.1 Verificación de Salud
- **Ruta:** `GET /api/health`
- **Código:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "message": "API funcionando correctamente"
    }
  }
  ```

### 5.2 Registro de Estudiantes
- **Ruta:** `POST /api/auth/registro`
- **Cuerpo (JSON):**
  ```json
  {
    "nombre_completo": "Juan Pérez",
    "correo": "juan.perez@ejemplo.com",
    "contrasena": "Password123"
  }
  ```
- **Código de éxito:** `201 Created`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "message": "Estudiante registrado correctamente",
      "estudiante": {
        "id": 1,
        "nombre_completo": "Juan Pérez",
        "correo": "juan.perez@ejemplo.com",
        "rol": "estudiante"
      }
    }
  }
  ```
- **Errores:**
  - `400 Bad Request`: Datos ausentes o contraseña débil (menos de 8 caracteres, sin mayúscula o sin número).
  - `409 Conflict`: Correo electrónico ya registrado.

### 5.3 Inicio de Sesión
- **Ruta:** `POST /api/auth/login`
- **Cuerpo (JSON):**
  ```json
  {
    "correo": "juan.perez@ejemplo.com",
    "contrasena": "Password123"
  }
  ```
- **Código de éxito:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "token": "eyJhbGciOi...",
      "usuario": {
        "id": 1,
        "nombre_completo": "Juan Pérez",
        "correo": "juan.perez@ejemplo.com",
        "rol": "estudiante"
      }
    }
  }
  ```
- **Errores:**
  - `401 Unauthorized`: `"Credenciales inválidas"` (mensaje genérico que previene enumeración de usuarios).

### 5.4 Consulta de Perfil de Autenticación (Ruta Protegida)
- **Ruta:** `GET /api/auth/perfil`
- **Cabecera requerida:** `Authorization: Bearer <token>`
- **Código de éxito:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "usuario": {
        "id": 1,
        "nombre_completo": "Juan Pérez",
        "correo": "juan.perez@ejemplo.com",
        "rol": "estudiante",
        "created_at": "2026-11-17 10:00:00"
      }
    }
  }
  ```
- **Errores:**
  - `401 Unauthorized`: Token ausente, alterado o expirado.

### 5.5 Catálogo de Universidades (Rutas Protegidas)
- **Cabecera requerida:** `Authorization: Bearer <token>`

#### Listar universidades activas
- **Ruta:** `GET /api/universidades`
- **Código de éxito:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "universidades": [
        {
          "id": 1,
          "nombre": "Universidad Nacional Mayor de San Marcos",
          "siglas": "UNMSM",
          "descripcion": "Decana de América",
          "estado": 1
        }
      ]
    }
  }
  ```

#### Obtener universidad por ID
- **Ruta:** `GET /api/universidades/:id`
- **Código de éxito:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "universidad": {
        "id": 1,
        "nombre": "Universidad Nacional Mayor de San Marcos",
        "siglas": "UNMSM",
        "descripcion": "Decana de América",
        "estado": 1
      }
    }
  }
  ```
- **Errores:**
  - `400 Bad Request`: Identificador inválido (no numérico o no entero positivo).
  - `404 Not Found`: Universidad inexistente o inactiva.

### 5.6 Catálogo de Carreras Profesionales (Rutas Protegidas)
- **Cabecera requerida:** `Authorization: Bearer <token>`

#### Listar carreras activas de una universidad
- **Ruta:** `GET /api/universidades/:universidadId/carreras`
- **Código de éxito:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "carreras": [
        {
          "id": 1,
          "universidad_id": 1,
          "nombre": "Medicina Humana",
          "area": "Ciencias de la Salud",
          "descripcion": "Facultad de Medicina de San Fernando",
          "estado": 1
        }
      ]
    }
  }
  ```
- **Errores:**
  - `400 Bad Request`: `universidadId` inválido.
  - `404 Not Found`: Universidad inexistente o inactiva.

#### Obtener detalle de carrera por ID
- **Ruta:** `GET /api/carreras/:id`
- **Código de éxito:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "carrera": {
        "id": 1,
        "universidad_id": 1,
        "nombre": "Medicina Humana",
        "area": "Ciencias de la Salud",
        "descripcion": "Facultad de Medicina de San Fernando",
        "estado": 1
      }
    }
  }
  ```
- **Errores:**
  - `400 Bad Request`: `id` inválido.
  - `404 Not Found`: Carrera inexistente o inactiva.

### 5.7 Gestión del Perfil Académico (Rutas Protegidas)
- **Cabecera requerida:** `Authorization: Bearer <token>`
- Todas las operaciones extraen la identidad del estudiante de forma segura desde `req.user.estudianteId` (impidiendo accesos IDOR).

#### Consultar perfil académico del estudiante
- **Ruta:** `GET /api/perfil-academico`
- **Código de éxito:** `200 OK`
- **Respuesta (perfil aún no configurado):**
  ```json
  {
    "status": "success",
    "data": {
      "perfil_academico": {
        "estudiante_id": 1,
        "nombre_completo": "Juan Pérez",
        "correo": "juan.perez@ejemplo.com",
        "configurado": false,
        "universidad": null,
        "carrera": null
      }
    }
  }
  ```
- **Respuesta (perfil configurado):**
  ```json
  {
    "status": "success",
    "data": {
      "perfil_academico": {
        "estudiante_id": 1,
        "nombre_completo": "Juan Pérez",
        "correo": "juan.perez@ejemplo.com",
        "configurado": true,
        "universidad": {
          "id": 1,
          "nombre": "Universidad Nacional Mayor de San Marcos",
          "siglas": "UNMSM"
        },
        "carrera": {
          "id": 1,
          "nombre": "Medicina Humana",
          "area": "Ciencias de la Salud"
        }
      }
    }
  }
  ```

#### Configurar o modificar objetivo académico
- **Ruta:** `PUT /api/perfil-academico`
- **Cuerpo (JSON):**
  ```json
  {
    "universidad_id": 1,
    "carrera_id": 1
  }
  ```
- **Código de éxito:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "message": "Perfil académico configurado correctamente",
      "perfil_academico": {
        "estudiante_id": 1,
        "nombre_completo": "Juan Pérez",
        "correo": "juan.perez@ejemplo.com",
        "configurado": true,
        "universidad": {
          "id": 1,
          "nombre": "Universidad Nacional Mayor de San Marcos",
          "siglas": "UNMSM"
        },
        "carrera": {
          "id": 1,
          "nombre": "Medicina Humana",
          "area": "Ciencias de la Salud"
        }
      }
    }
  }
  ```
- **Errores:**
  - `400 Bad Request`:
    - Campos obligatorios ausentes (`universidad_id` o `carrera_id`).
    - Identificadores no numéricos o no enteros positivos.
    - La carrera seleccionada no pertenece a la universidad indicada.
    - Universidad o carrera inactivas (`estado !== 1`).
  - `401 Unauthorized`: Token ausente o inválido.
  - `404 Not Found`: Universidad o carrera no existen.

### 5.8 Áreas Académicas (`/api/areas`)
- **Cabecera requerida:** `Authorization: Bearer <token>`
- **Lectura:** Estudiantes y Administradores.
- **Escritura:** Solo Administradores (`roleMiddleware('administrador')`).

#### Listar áreas activas
- **Ruta:** `GET /api/areas`
- **Código:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "areas": [
        {
          "id": 1,
          "nombre": "Ciencias Básicas",
          "descripcion": "Área de ciencias exactas, matemáticas y física",
          "estado": 1,
          "created_at": "2026-11-18 10:00:00"
        }
      ]
    }
  }
  ```

#### Obtener área por ID
- **Ruta:** `GET /api/areas/:id`
- **Código:** `200 OK`

#### Registrar nueva área (Solo Admin)
- **Ruta:** `POST /api/areas`
- **Cuerpo (JSON):**
  ```json
  {
    "nombre": "Biomédicas",
    "descripcion": "Medicina, enfermería y ciencias biológicas"
  }
  ```
- **Código:** `201 Created`

#### Actualizar área (Solo Admin)
- **Ruta:** `PUT /api/areas/:id`
- **Cuerpo (JSON):**
  ```json
  {
    "nombre": "Ciencias Biomédicas",
    "descripcion": "Descripción actualizada"
  }
  ```
- **Código:** `200 OK`

#### Desactivar área (Solo Admin - Soft Delete)
- **Ruta:** `DELETE /api/areas/:id`
- **Código:** `200 OK`

---

### 5.9 Materias Académicas (`/api/materias`)
- **Cabecera requerida:** `Authorization: Bearer <token>`
- **Lectura:** Estudiantes y Administradores.
- **Escritura:** Solo Administradores.

#### Listar materias activas
- **Ruta:** `GET /api/materias`
- **Código:** `200 OK`

#### Listar materias de un área
- **Ruta:** `GET /api/areas/:areaId/materias`
- **Código:** `200 OK`

#### Registrar materia (Solo Admin)
- **Ruta:** `POST /api/materias`
- **Cuerpo (JSON):**
  ```json
  {
    "area_id": 1,
    "nombre": "Álgebra",
    "descripcion": "Estructuras algebraicas y polinomios"
  }
  ```
- **Código:** `201 Created`

#### Actualizar materia (Solo Admin)
- **Ruta:** `PUT /api/materias/:id`
- **Código:** `200 OK`

#### Desactivar materia (Solo Admin)
- **Ruta:** `DELETE /api/materias/:id`
- **Código:** `200 OK`

---

### 5.10 Temas Académicos (`/api/temas`)
- **Cabecera requerida:** `Authorization: Bearer <token>`
- **Lectura:** Estudiantes y Administradores.
- **Escritura:** Solo Administradores.

#### Listar temas activos
- **Ruta:** `GET /api/temas`
- **Código:** `200 OK`

#### Listar temas de una materia
- **Ruta:** `GET /api/materias/:materiaId/temas`
- **Código:** `200 OK`

#### Registrar tema (Solo Admin)
- **Ruta:** `POST /api/temas`
- **Cuerpo (JSON):**
  ```json
  {
    "materia_id": 1,
    "nombre": "Ecuaciones de Segundo Grado",
    "descripcion": "Propiedades de las raíces y discriminante"
  }
  ```
- **Código:** `201 Created`

#### Actualizar tema (Solo Admin)
- **Ruta:** `PUT /api/temas/:id`
- **Código:** `200 OK`

#### Desactivar tema (Solo Admin)
- **Ruta:** `DELETE /api/temas/:id`
- **Código:** `200 OK`

---

### 5.11 Banco de Preguntas y Alternativas (`/api/preguntas`)
- **Cabecera requerida:** `Authorization: Bearer <token>`
- **Lectura:** Estudiantes y Administradores (estudiantes solo visualizan reactivos activos).
- **Escritura:** Solo Administradores mediante transacciones atómicas (`db.transaction()`).

#### Listar preguntas activas
- **Ruta:** `GET /api/preguntas`
- **Código:** `200 OK`

#### Listar preguntas por tema
- **Ruta:** `GET /api/temas/:temaId/preguntas`
- **Código:** `200 OK`

#### Obtener detalle de pregunta
- **Ruta:** `GET /api/preguntas/:id`
- **Código:** `200 OK`
- **Respuesta:**
  ```json
  {
    "status": "success",
    "data": {
      "pregunta": {
        "id": 1,
        "tema_id": 1,
        "enunciado": "Dada la ecuación cuadrática $x^2 - 5x + 6 = 0$, ¿cuál es el conjunto solución?",
        "dificultad": "facil",
        "tipo": "opcion_multiple",
        "explicacion": "Factorizando: $(x - 2)(x - 3) = 0$, por tanto $x_1 = 2$ y $x_2 = 3$.",
        "estado": 1,
        "alternativas": [
          { "id": 1, "texto": "{1, 6}", "es_correcta": false },
          { "id": 2, "texto": "{2, 3}", "es_correcta": true },
          { "id": 3, "texto": "{-2, -3}", "es_correcta": false },
          { "id": 4, "texto": "{5, 6}", "es_correcta": false }
        ]
      }
    }
  }
  ```

#### Registrar pregunta con alternativas (Solo Admin - Transacción Atómica)
- **Ruta:** `POST /api/preguntas`
- **Cuerpo (JSON):**
  ```json
  {
    "tema_id": 1,
    "enunciado": "¿Cuál es el resultado de 5 + 3?",
    "dificultad": "facil",
    "tipo": "opcion_multiple",
    "explicacion": "La suma de cinco más tres es ocho.",
    "alternativas": [
      { "texto": "6", "es_correcta": false },
      { "texto": "8", "es_correcta": true },
      { "texto": "10", "es_correcta": false },
      { "texto": "12", "es_correcta": false }
    ]
  }
  ```
- **Código:** `201 Created`
- **Errores:**
  - `400 Bad Request`:
    - Enunciado ausente o vacío.
    - Menos de dos alternativas enviadas.
    - Número de alternativas correctas distinto de uno (cero o múltiples).
    - Tema inactivo o dificultad inválida (`facil`, `intermedia`, `dificil`).
  - `403 Forbidden`: Usuario no administrador intentando escribir.
  - `404 Not Found`: Tema no existe.

#### Actualizar pregunta y alternativas (Solo Admin - Transacción Atómica)
- **Ruta:** `PUT /api/preguntas/:id`
- **Código:** `200 OK`

#### Desactivar pregunta (Solo Admin - Soft Delete)
- **Ruta:** `DELETE /api/preguntas/:id`
- **Código:** `200 OK`
