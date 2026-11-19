/**
 * Suite de Pruebas de Integración para el Módulo de Perfil Académico (Fase 3)
 * 
 * Verifica el catálogo de universidades, catálogo de carreras y la gestión del perfil académico.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { db } from '../src/config/database.js';
import { seedDatabase } from '../src/config/seed.js';

let server;
let baseUrl = '';

describe('Pruebas de Catálogo y Perfil Académico (Fase 3)', () => {
  let tokenEstudiante1 = '';
  let tokenEstudiante2 = '';
  let unmsmId;
  let uniId;
  let unmsmCarreraId;
  let uniCarreraId;

  before(async () => {
    // Asegurar semillero
    seedDatabase();

    // Iniciar servidor en puerto libre
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });

    // Limpiar estudiantes de prueba previos
    db.exec("DELETE FROM estudiantes WHERE correo LIKE '%@perfiltest.com'");

    // Registrar estudiante 1
    const resReg1 = await fetch(`${baseUrl}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: 'Estudiante Perfil Uno',
        correo: 'estudiante1@perfiltest.com',
        contrasena: 'Password123'
      })
    });
    assert.equal(resReg1.status, 201);

    // Login estudiante 1
    const resLog1 = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'estudiante1@perfiltest.com',
        contrasena: 'Password123'
      })
    });
    const dataLog1 = await resLog1.json();
    tokenEstudiante1 = dataLog1.data.token;

    // Registrar estudiante 2 (para probar aislamiento de perfil)
    const resReg2 = await fetch(`${baseUrl}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: 'Estudiante Perfil Dos',
        correo: 'estudiante2@perfiltest.com',
        contrasena: 'Password123'
      })
    });
    assert.equal(resReg2.status, 201);

    // Login estudiante 2
    const resLog2 = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'estudiante2@perfiltest.com',
        contrasena: 'Password123'
      })
    });
    const dataLog2 = await resLog2.json();
    tokenEstudiante2 = dataLog2.data.token;

    // Obtener IDs de prueba de la base de datos
    const unmsm = db.prepare("SELECT id FROM universidades WHERE siglas = 'UNMSM'").get();
    const uni = db.prepare("SELECT id FROM universidades WHERE siglas = 'UNI'").get();
    unmsmId = unmsm.id;
    uniId = uni.id;

    const carUnmsm = db.prepare("SELECT id FROM carreras WHERE universidad_id = ? LIMIT 1").get(unmsmId);
    const carUni = db.prepare("SELECT id FROM carreras WHERE universidad_id = ? LIMIT 1").get(uniId);
    unmsmCarreraId = carUnmsm.id;
    uniCarreraId = carUni.id;
  });

  after(async () => {
    // Limpieza de datos de prueba
    db.exec("DELETE FROM estudiantes WHERE correo LIKE '%@perfiltest.com'");
    await new Promise((resolve) => server.close(resolve));
  });

  // ==========================================
  // 1. Control de Acceso y Protección con JWT
  // ==========================================

  test('1.1 GET /api/universidades sin token responde 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/universidades`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
  });

  test('1.2 GET /api/carreras/:id sin token responde 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/carreras/${unmsmCarreraId}`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
  });

  test('1.3 GET /api/perfil-academico sin token responde 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
  });

  test('1.4 PUT /api/perfil-academico sin token responde 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universidad_id: unmsmId, carrera_id: unmsmCarreraId })
    });
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
  });

  // ==========================================
  // 2. Módulo A: Catálogo de Universidades
  // ==========================================

  test('2.1 GET /api/universidades con token retorna 200 y listado de universidades activas', async () => {
    const res = await fetch(`${baseUrl}/universidades`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.ok(Array.isArray(body.data.universidades));
    assert.ok(body.data.universidades.length >= 4);

    const siglasList = body.data.universidades.map(u => u.siglas);
    assert.ok(siglasList.includes('UNMSM'));
    assert.ok(siglasList.includes('UNI'));
    assert.ok(siglasList.includes('UNSA'));
    assert.ok(siglasList.includes('UNT'));

    // Verificar que todas tengan estado 1
    body.data.universidades.forEach(u => assert.equal(u.estado, 1));
  });

  test('2.2 GET /api/universidades/:id con ID existente retorna 200 y datos de la universidad', async () => {
    const res = await fetch(`${baseUrl}/universidades/${unmsmId}`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.universidad.id, unmsmId);
    assert.equal(body.data.universidad.siglas, 'UNMSM');
    assert.equal(body.data.universidad.estado, 1);
  });

  test('2.3 GET /api/universidades/:id con ID inexistente retorna 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/universidades/999999`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.equal(body.status, 'error');
  });

  test('2.4 GET /api/universidades/:id con ID inválido no numérico retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/universidades/abc`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  // ==========================================
  // 3. Módulo B: Catálogo de Carreras
  // ==========================================

  test('3.1 GET /api/universidades/:universidadId/carreras retorna 200 y carreras de la universidad', async () => {
    const res = await fetch(`${baseUrl}/universidades/${unmsmId}/carreras`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.ok(Array.isArray(body.data.carreras));
    assert.ok(body.data.carreras.length > 0);

    body.data.carreras.forEach(c => {
      assert.equal(c.universidad_id, unmsmId);
      assert.equal(c.estado, 1);
    });
  });

  test('3.2 GET /api/universidades/:universidadId/carreras con universidad inexistente retorna 404', async () => {
    const res = await fetch(`${baseUrl}/universidades/999999/carreras`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.equal(body.status, 'error');
  });

  test('3.3 GET /api/universidades/:universidadId/carreras con ID inválido retorna 400', async () => {
    const res = await fetch(`${baseUrl}/universidades/invalido/carreras`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('3.4 GET /api/carreras/:id con ID existente retorna 200 y detalle de la carrera', async () => {
    const res = await fetch(`${baseUrl}/carreras/${unmsmCarreraId}`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.carrera.id, unmsmCarreraId);
    assert.equal(body.data.carrera.universidad_id, unmsmId);
  });

  test('3.5 GET /api/carreras/:id con ID inexistente retorna 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/carreras/999999`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.equal(body.status, 'error');
  });

  test('3.6 GET /api/carreras/:id con ID inválido retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/carreras/xyz`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  // ==========================================
  // 4. Módulo C: Perfil Académico del Estudiante
  // ==========================================

  test('4.1 GET /api/perfil-academico para estudiante nuevo retorna configurado: false', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.perfil_academico.correo, 'estudiante1@perfiltest.com');
    assert.equal(body.data.perfil_academico.configurado, false);
    assert.equal(body.data.perfil_academico.universidad, null);
    assert.equal(body.data.perfil_academico.carrera, null);
  });

  test('4.2 PUT /api/perfil-academico sin datos obligatorios retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante1}`
      },
      body: JSON.stringify({})
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('4.3 PUT /api/perfil-academico con universidad no numérica retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante1}`
      },
      body: JSON.stringify({
        universidad_id: 'invalido',
        carrera_id: unmsmCarreraId
      })
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('4.4 PUT /api/perfil-academico con universidad inexistente retorna 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante1}`
      },
      body: JSON.stringify({
        universidad_id: 999999,
        carrera_id: unmsmCarreraId
      })
    });
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.equal(body.status, 'error');
  });

  test('4.5 PUT /api/perfil-academico con carrera inexistente retorna 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante1}`
      },
      body: JSON.stringify({
        universidad_id: unmsmId,
        carrera_id: 999999
      })
    });
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.equal(body.status, 'error');
  });

  test('4.6 PUT /api/perfil-academico con carrera no perteneciente a la universidad retorna 400 Bad Request', async () => {
    // Intentar asociar carrera de UNI a universidad UNMSM
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante1}`
      },
      body: JSON.stringify({
        universidad_id: unmsmId,
        carrera_id: uniCarreraId
      })
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
    assert.match(body.message, /pertenece/i);
  });

  test('4.7 PUT /api/perfil-academico con universidad y carrera válidas retorna 200 y perfil configurado', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante1}`
      },
      body: JSON.stringify({
        universidad_id: unmsmId,
        carrera_id: unmsmCarreraId
      })
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.perfil_academico.configurado, true);
    assert.equal(body.data.perfil_academico.universidad.id, unmsmId);
    assert.equal(body.data.perfil_academico.carrera.id, unmsmCarreraId);
  });

  test('4.8 GET /api/perfil-academico después de actualizar retorna datos completos enriquecidos', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante1}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.perfil_academico.configurado, true);
    assert.equal(body.data.perfil_academico.universidad.id, unmsmId);
    assert.equal(body.data.perfil_academico.universidad.siglas, 'UNMSM');
    assert.equal(body.data.perfil_academico.carrera.id, unmsmCarreraId);
  });

  test('4.9 Modificación posterior del perfil académico permite cambiar a otra universidad y carrera válida', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante1}`
      },
      body: JSON.stringify({
        universidad_id: uniId,
        carrera_id: uniCarreraId
      })
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.perfil_academico.configurado, true);
    assert.equal(body.data.perfil_academico.universidad.id, uniId);
    assert.equal(body.data.perfil_academico.universidad.siglas, 'UNI');
    assert.equal(body.data.perfil_academico.carrera.id, uniCarreraId);
  });

  test('4.10 Garantía de no colisión/IDOR: Estudiante 2 mantiene su perfil independiente', async () => {
    const res = await fetch(`${baseUrl}/perfil-academico`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante2}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.perfil_academico.correo, 'estudiante2@perfiltest.com');
    // El estudiante 2 nunca configuró su perfil
    assert.equal(body.data.perfil_academico.configurado, false);
    assert.equal(body.data.perfil_academico.universidad, null);
    assert.equal(body.data.perfil_academico.carrera, null);
  });
});
