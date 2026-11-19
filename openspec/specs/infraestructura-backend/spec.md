# infraestructura-backend Specification

## Purpose
Proporciona la infraestructura base del servidor Express, ciclo de vida del proceso Node.js, enrutamiento base, estandarización de respuestas HTTP y manejo centralizado de excepciones y rutas inexistentes.

## Requirements

### Requirement: Verificación del estado de salud del backend (RNF-02, RNF-04)

El sistema SHALL proveer un endpoint HTTP público `GET /api/health` que confirme la operatividad del servidor devolviendo código `200 OK` y una carga JSON estandarizada.

#### Scenario: Consulta de salud exitosa

- **WHEN** un cliente realiza una petición `GET` a `/api/health`
- **THEN** el servidor responde con código `200 OK` y el payload `{"status":"success","data":{"message":"API funcionando correctamente"}}`

### Requirement: Manejo de rutas no encontradas

El sistema SHALL interceptar cualquier solicitud HTTP hacia rutas no definidas y responder con código `404 Not Found` bajo la estructura uniforme de error.

#### Scenario: Petición a ruta no registrada

- **WHEN** un cliente realiza una petición a una ruta no existente en la API
- **THEN** el servidor responde con código `404 Not Found` y el payload `{"status":"error","message":"Ruta no encontrada"}`

### Requirement: Manejo centralizado de excepciones del servidor

El sistema SHALL capturar cualquier excepción no controlada mediante un middleware global de errores, respondiendo con código `500 Internal Server Error` y protegiendo la información sensible o detalles internos del servidor.

#### Scenario: Excepción no controlada durante el procesamiento

- **WHEN** ocurre una excepción o fallo interno durante la atención de una petición
- **THEN** el servidor responde con código `500 Internal Server Error` y el payload `{"status":"error","message":"Error interno del servidor"}` sin exponer trazas de depuración al cliente

### Requirement: Inicialización y configuración desacoplada del servidor

El sistema SHALL separar la configuración de Express de la inicialización de escucha HTTP, configurando el puerto a través de la variable de entorno `PORT` o el puerto `3000` por defecto.

#### Scenario: Arranque en puerto configurado

- **WHEN** se inicia el servidor con la variable de entorno `PORT` establecida
- **THEN** el proceso escucha peticiones entrantes en dicho puerto y confirma su operatividad en consola
