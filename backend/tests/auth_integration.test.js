/**
 * Suite de Pruebas de Integración para Autenticación y Autorización
 * 
 * Ejecuta validaciones completas sobre los endpoints de registro, login y rutas protegidas.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { db } from '../src/config/database.js';

const PORT = 3099;
let server;
const BASE_URL = `http://localhost:${PORT}/api/auth`;

describe('Pruebas de Autenticación y Autorización (Fase 2)', () => {
  before(() => {
    return new Promise((resolve) => {
      server = app.listen(PORT, () => {
        // Limpiar base de datos para pruebas limpias
        db.exec("DELETE FROM estudiantes WHERE correo LIKE '%@test.com'");
        resolve();
      });
    });
  });

  after(() => {
    return new Promise((resolve) => {
      // Limpieza posterior
      db.exec("DELETE FROM estudiantes WHERE correo LIKE '%@test.com'");
      server.close(() => resolve());
    });
  });

  const usuarioPrueba = {
    nombre_completo: 'Estudiante Test',
    correo: 'estudiante1@test.com',
    contrasena: 'Segura123'
  };

  let tokenEstudiante = '';

  test('1. Registro exitoso con datos válidos debe responder 201 Created', async () => {
    const res = await fetch(`${BASE_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioPrueba)
    });

    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.status, 'success');
    assert.equal(body.data.message, 'Estudiante registrado correctamente');
    assert.equal(body.data.estudiante.correo, usuarioPrueba.correo);
    assert.equal(body.data.estudiante.rol, 'estudiante');
    assert.equal(body.data.estudiante.contrasena_hash, undefined, 'No debe filtrar contrasena_hash');

    // Verificar en SQLite que se guardó como hash bcrypt
    const row = db.prepare('SELECT contrasena_hash FROM estudiantes WHERE correo = ?').get(usuarioPrueba.correo);
    assert.ok(row.contrasena_hash.startsWith('$2b$10$') || row.contrasena_hash.startsWith('$2a$10$'));
  });

  test('2. Registro con correo duplicado debe responder 409 Conflict', async () => {
    const res = await fetch(`${BASE_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioPrueba)
    });

    const body = await res.json();

    assert.equal(res.status, 409);
    assert.equal(body.status, 'error');
    assert.match(body.message, /correo/i);
  });

  test('3. Registro con contraseña débil (<8 chars) debe responder 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: 'Alumno Corto',
        correo: 'corto@test.com',
        contrasena: 'Ab1'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('4. Registro con contraseña sin mayúscula debe responder 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: 'Alumno SinMayus',
        correo: 'sinmayus@test.com',
        contrasena: 'password123'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('5. Registro con contraseña sin número debe responder 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: 'Alumno SinNumero',
        correo: 'sinnum@test.com',
        contrasena: 'PasswordSinNum'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('6. Inicio de sesión exitoso debe responder 200 OK y devolver JWT', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: usuarioPrueba.correo,
        contrasena: usuarioPrueba.contrasena
      })
    });

    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.ok(body.data.token);
    assert.equal(body.data.usuario.correo, usuarioPrueba.correo);
    assert.equal(body.data.usuario.rol, 'estudiante');

    tokenEstudiante = body.data.token;
  });

  test('7. Login con contraseña incorrecta debe responder 401 genérico', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: usuarioPrueba.correo,
        contrasena: 'ContrasenaIncorrecta1'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
    assert.equal(body.message, 'Credenciales inválidas');
  });

  test('8. Login con correo inexistente debe responder 401 genérico', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'noexiste@test.com',
        contrasena: 'Cualquier123'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
    assert.equal(body.message, 'Credenciales inválidas');
  });

  test('9. Acceso a ruta protegida con token válido debe responder 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/perfil`, {
      headers: {
        Authorization: `Bearer ${tokenEstudiante}`
      }
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.usuario.correo, usuarioPrueba.correo);
  });

  test('10. Acceso a ruta protegida sin token debe responder 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/perfil`);
    const body = await res.json();

    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
  });

  test('11. Acceso a ruta protegida con token manipulado debe responder 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/perfil`, {
      headers: {
        Authorization: 'Bearer token_invalido_xyz'
      }
    });

    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
  });

  test('12. Estudiante intenta acceder a endpoint de administrador debe responder 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/admin-test`, {
      headers: {
        Authorization: `Bearer ${tokenEstudiante}`
      }
    });

    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.status, 'error');
    assert.match(body.message, /permisos/i);
  });
});
