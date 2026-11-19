/**
 * Suite de Pruebas de Integración para el Banco de Preguntas y Jerarquía Académica (Fase 4)
 * 
 * Verifica Áreas, Materias, Temas, Preguntas, Alternativas, RBAC y Transaccionalidad Atómica.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { db } from '../src/config/database.js';
import { seedDatabase } from '../src/config/seed.js';

const JWT_SECRET = process.env.JWT_SECRET || 'desarrollo_secreto_jwt_para_pruebas_locales_12345';

let server;
let baseUrl = '';

describe('Pruebas de Integración: Banco de Preguntas y Catálogo Académico (Fase 4)', () => {
  let tokenEstudiante = '';
  let tokenAdmin = '';
  let areaActivaId;
  let materiaActivaId;
  let temaActivoId;

  before(async () => {
    // Asegurar semillero básico
    seedDatabase();

    // Iniciar servidor en puerto libre dinámico
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });

    // Limpiar usuarios de prueba anteriores
    db.exec("DELETE FROM estudiantes WHERE correo LIKE '%@bancotest.com'");

    // Registrar estudiante
    const resRegEst = await fetch(`${baseUrl}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: 'Estudiante Banco Test',
        correo: 'estudiante@bancotest.com',
        contrasena: 'Password123'
      })
    });
    assert.equal(resRegEst.status, 201);

    // Login estudiante
    const resLogEst = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'estudiante@bancotest.com',
        contrasena: 'Password123'
      })
    });
    const dataLogEst = await resLogEst.json();
    tokenEstudiante = dataLogEst.data.token;

    // Crear token de Administrador con JWT
    tokenAdmin = jwt.sign(
      { estudianteId: 9999, rol: 'administrador' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Obtener IDs de prueba del semillero
    const area = db.prepare("SELECT id FROM areas WHERE estado = 1 LIMIT 1").get();
    areaActivaId = area.id;

    const materia = db.prepare("SELECT id FROM materias WHERE area_id = ? AND estado = 1 LIMIT 1").get(areaActivaId);
    materiaActivaId = materia.id;

    const tema = db.prepare("SELECT id FROM temas WHERE materia_id = ? AND estado = 1 LIMIT 1").get(materiaActivaId);
    temaActivoId = tema.id;
  });

  after(async () => {
    // Limpieza de datos de prueba
    db.exec("DELETE FROM estudiantes WHERE correo LIKE '%@bancotest.com'");
    db.exec("DELETE FROM preguntas WHERE enunciado LIKE '%[TEST]%'");
    db.exec("DELETE FROM temas WHERE nombre LIKE '%[TEST]%'");
    db.exec("DELETE FROM materias WHERE nombre LIKE '%[TEST]%'");
    db.exec("DELETE FROM areas WHERE nombre LIKE '%[TEST]%'");
    await new Promise((resolve) => server.close(resolve));
  });

  // ==========================================
  // 1. Control de Acceso y RBAC
  // ==========================================

  test('1.1 GET /api/areas sin token responde 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/areas`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.status, 'error');
  });

  test('1.2 POST /api/areas con rol estudiante responde 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante}`
      },
      body: JSON.stringify({ nombre: 'Área Prohibida' })
    });
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.status, 'error');
  });

  test('1.3 POST /api/materias con rol estudiante responde 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/materias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante}`
      },
      body: JSON.stringify({ area_id: areaActivaId, nombre: 'Materia Prohibida' })
    });
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.status, 'error');
  });

  test('1.4 POST /api/temas con rol estudiante responde 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/temas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante}`
      },
      body: JSON.stringify({ materia_id: materiaActivaId, nombre: 'Tema Prohibido' })
    });
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.status, 'error');
  });

  test('1.5 POST /api/preguntas con rol estudiante responde 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenEstudiante}`
      },
      body: JSON.stringify({
        tema_id: temaActivoId,
        enunciado: '¿Pregunta Prohibida?',
        alternativas: [
          { texto: 'A', es_correcta: true },
          { texto: 'B', es_correcta: false }
        ]
      })
    });
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.status, 'error');
  });

  // ==========================================
  // 2. Módulo de Áreas Académicas
  // ==========================================

  let nuevaAreaId;

  test('2.1 GET /api/areas con token de estudiante retorna listado de áreas activas', async () => {
    const res = await fetch(`${baseUrl}/areas`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.ok(Array.isArray(body.data.areas));
    assert.ok(body.data.areas.length >= 2);
    body.data.areas.forEach(a => assert.equal(a.estado, 1));
  });

  test('2.2 POST /api/areas con rol admin crea nueva área correctamente', async () => {
    const res = await fetch(`${baseUrl}/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        nombre: '[TEST] Ciencias Médicas',
        descripcion: 'Área experimental para pruebas de integración'
      })
    });
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.status, 'success');
    assert.equal(body.data.area.nombre, '[TEST] Ciencias Médicas');
    nuevaAreaId = body.data.area.id;
  });

  test('2.3 POST /api/areas con nombre duplicado retorna 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        nombre: '[TEST] Ciencias Médicas'
      })
    });
    const body = await res.json();

    assert.equal(res.status, 409);
    assert.equal(body.status, 'error');
  });

  test('2.4 POST /api/areas sin nombre obligatorio retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ nombre: '   ' })
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('2.5 PUT /api/areas/:id con admin actualiza nombre y descripción', async () => {
    const res = await fetch(`${baseUrl}/areas/${nuevaAreaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        nombre: '[TEST] Ciencias Médicas Modificadas',
        descripcion: 'Nueva descripción'
      })
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.area.nombre, '[TEST] Ciencias Médicas Modificadas');
  });

  test('2.6 DELETE /api/areas/:id realiza borrado lógico (soft delete)', async () => {
    const res = await fetch(`${baseUrl}/areas/${nuevaAreaId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenAdmin}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');

    // Verificar que en base de datos estado sea 0
    const row = db.prepare('SELECT estado FROM areas WHERE id = ?').get(nuevaAreaId);
    assert.equal(row.estado, 0);

    // Consulta de estudiante no debe encontrarla
    const resGet = await fetch(`${baseUrl}/areas/${nuevaAreaId}`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante}` }
    });
    assert.equal(resGet.status, 404);
  });

  // ==========================================
  // 3. Módulo de Materias Académicas
  // ==========================================

  let nuevaMateriaId;

  test('3.1 GET /api/materias retorna todas las materias activas con su área', async () => {
    const res = await fetch(`${baseUrl}/materias`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.ok(Array.isArray(body.data.materias));
    assert.ok(body.data.materias.length >= 3);
    body.data.materias.forEach(m => {
      assert.equal(m.estado, 1);
      assert.ok(m.area_nombre);
    });
  });

  test('3.2 GET /api/areas/:areaId/materias retorna solo las materias del área', async () => {
    const res = await fetch(`${baseUrl}/areas/${areaActivaId}/materias`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    body.data.materias.forEach(m => assert.equal(m.area_id, areaActivaId));
  });

  test('3.3 POST /api/materias en área inactiva retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/materias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        area_id: nuevaAreaId, // Área desactivada en 2.6
        nombre: '[TEST] Materia Invalida'
      })
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('3.4 POST /api/materias en área activa crea la materia correctamente', async () => {
    const res = await fetch(`${baseUrl}/materias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        area_id: areaActivaId,
        nombre: '[TEST] Geometría Analítica',
        descripcion: 'Estudio de cónicas y rectas'
      })
    });
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.status, 'success');
    assert.equal(body.data.materia.nombre, '[TEST] Geometría Analítica');
    nuevaMateriaId = body.data.materia.id;
  });

  test('3.5 POST /api/materias duplicada en la misma área retorna 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/materias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        area_id: areaActivaId,
        nombre: '[TEST] Geometría Analítica'
      })
    });
    const body = await res.json();

    assert.equal(res.status, 409);
    assert.equal(body.status, 'error');
  });

  // ==========================================
  // 4. Módulo de Temas Académicos
  // ==========================================

  let nuevoTemaId;

  test('4.1 POST /api/temas crea tema en materia activa correctamente', async () => {
    const res = await fetch(`${baseUrl}/temas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        materia_id: nuevaMateriaId,
        nombre: '[TEST] La Parábola y sus Elementos',
        descripcion: 'Foco, directriz y vértice'
      })
    });
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.status, 'success');
    assert.equal(body.data.tema.nombre, '[TEST] La Parábola y sus Elementos');
    nuevoTemaId = body.data.tema.id;
  });

  test('4.2 GET /api/materias/:materiaId/temas retorna temas de la materia', async () => {
    const res = await fetch(`${baseUrl}/materias/${nuevaMateriaId}/temas`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.temas.length, 1);
    assert.equal(body.data.temas[0].id, nuevoTemaId);
  });

  // ==========================================
  // 5. Banco de Preguntas y Alternativas (Transacciones y Validaciones)
  // ==========================================

  let nuevaPreguntaId;

  test('5.1 POST /api/preguntas sin enunciado retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        tema_id: nuevoTemaId,
        enunciado: '   ',
        alternativas: [
          { texto: 'A', es_correcta: true },
          { texto: 'B', es_correcta: false }
        ]
      })
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
  });

  test('5.2 POST /api/preguntas con menos de 2 alternativas retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        tema_id: nuevoTemaId,
        enunciado: '[TEST] ¿Pregunta con 1 opción?',
        alternativas: [
          { texto: 'Única alternativa', es_correcta: true }
        ]
      })
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
    assert.match(body.message, /dos alternativas/i);
  });

  test('5.3 POST /api/preguntas con cero alternativas correctas retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        tema_id: nuevoTemaId,
        enunciado: '[TEST] ¿Pregunta sin respuesta correcta?',
        alternativas: [
          { texto: 'Opción 1', es_correcta: false },
          { texto: 'Opción 2', es_correcta: false },
          { texto: 'Opción 3', es_correcta: false }
        ]
      })
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
    assert.match(body.message, /exactamente una alternativa correcta/i);
  });

  test('5.4 POST /api/preguntas con múltiples alternativas correctas retorna 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        tema_id: nuevoTemaId,
        enunciado: '[TEST] ¿Pregunta con dos respuestas correctas?',
        alternativas: [
          { texto: 'Opción 1', es_correcta: true },
          { texto: 'Opción 2', es_correcta: true },
          { texto: 'Opción 3', es_correcta: false }
        ]
      })
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.status, 'error');
    assert.match(body.message, /exactamente una alternativa correcta/i);
  });

  test('5.5 POST /api/preguntas con tema inexistente retorna 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        tema_id: 999999,
        enunciado: '[TEST] Pregunta huérfana',
        alternativas: [
          { texto: 'A', es_correcta: true },
          { texto: 'B', es_correcta: false }
        ]
      })
    });
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.equal(body.status, 'error');
  });

  test('5.6 POST /api/preguntas válida con alternativas y LaTeX persiste atómicamente', async () => {
    const payload = {
      tema_id: nuevoTemaId,
      enunciado: '[TEST] Dada la parábola $y^2 = 8x$, determine la distancia focal $p$.',
      dificultad: 'intermedia',
      tipo: 'opcion_multiple',
      explicacion: 'La ecuación canónica es $y^2 = 4px$, por tanto $4p = 8 \\Rightarrow p = 2$.',
      alternativas: [
        { texto: '$p = 1$', es_correcta: false },
        { texto: '$p = 2$', es_correcta: true },
        { texto: '$p = 4$', es_correcta: false },
        { texto: '$p = 8$', es_correcta: false }
      ]
    };

    const res = await fetch(`${baseUrl}/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify(payload)
    });
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.status, 'success');
    assert.ok(body.data.pregunta.id);
    assert.equal(body.data.pregunta.alternativas.length, 4);

    nuevaPreguntaId = body.data.pregunta.id;

    // Verificar en SQLite integridad atómica directa
    const countAlt = db.prepare('SELECT COUNT(*) AS total FROM alternativas WHERE pregunta_id = ?').get(nuevaPreguntaId);
    assert.equal(countAlt.total, 4);

    const altCorrecta = db.prepare('SELECT texto FROM alternativas WHERE pregunta_id = ? AND es_correcta = 1').get(nuevaPreguntaId);
    assert.equal(altCorrecta.texto, '$p = 2$');
  });

  test('5.7 GET /api/preguntas/:id para estudiante retorna pregunta y alternativas', async () => {
    const res = await fetch(`${baseUrl}/preguntas/${nuevaPreguntaId}`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.pregunta.id, nuevaPreguntaId);
    assert.equal(body.data.pregunta.alternativas.length, 4);
  });

  test('5.8 GET /api/temas/:temaId/preguntas retorna preguntas del tema', async () => {
    const res = await fetch(`${baseUrl}/temas/${nuevoTemaId}/preguntas`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.preguntas.length, 1);
    assert.equal(body.data.preguntas[0].id, nuevaPreguntaId);
  });

  test('5.9 PUT /api/preguntas/:id actualiza pregunta y reemplaza alternativas atómicamente', async () => {
    const res = await fetch(`${baseUrl}/preguntas/${nuevaPreguntaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        enunciado: '[TEST] [ACTUALIZADO] Dada la parábola $y^2 = 12x$, halle $p$.',
        dificultad: 'dificil',
        alternativas: [
          { texto: '$p = 2$', es_correcta: false },
          { texto: '$p = 3$', es_correcta: true },
          { texto: '$p = 6$', es_correcta: false }
        ]
      })
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.data.pregunta.dificultad, 'dificil');
    assert.equal(body.data.pregunta.alternativas.length, 3);

    // Verificar en SQLite que no quedaron alternativas huérfanas
    const countAlt = db.prepare('SELECT COUNT(*) AS total FROM alternativas WHERE pregunta_id = ?').get(nuevaPreguntaId);
    assert.equal(countAlt.total, 3);
  });

  test('5.10 DELETE /api/preguntas/:id desactiva la pregunta (soft delete)', async () => {
    const res = await fetch(`${baseUrl}/preguntas/${nuevaPreguntaId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenAdmin}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');

    // Verificar en SQLite estado 0
    const row = db.prepare('SELECT estado FROM preguntas WHERE id = ?').get(nuevaPreguntaId);
    assert.equal(row.estado, 0);

    // Estudiante recibe 404 al intentar consultar pregunta inactiva
    const resEst = await fetch(`${baseUrl}/preguntas/${nuevaPreguntaId}`, {
      headers: { 'Authorization': `Bearer ${tokenEstudiante}` }
    });
    assert.equal(resEst.status, 404);

    // Admin puede consultar la pregunta inactiva para administración
    const resAdm = await fetch(`${baseUrl}/preguntas/${nuevaPreguntaId}`, {
      headers: { 'Authorization': `Bearer ${tokenAdmin}` }
    });
    assert.equal(resAdm.status, 200);
  });
});
