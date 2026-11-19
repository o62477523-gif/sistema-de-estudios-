/**
 * Script de Semillero de Datos (Seed) Idempotente
 * 
 * Carga universidades y carreras de referencia sin duplicar registros en múltiples ejecuciones.
 */

import { db } from './database.js';

export const seedData = [
  {
    nombre: 'Universidad Nacional Mayor de San Marcos',
    siglas: 'UNMSM',
    descripcion: 'Universidad decana de América, Lima.',
    carreras: [
      { nombre: 'Ingeniería de Sistemas', descripcion: 'Facultad de Ingeniería de Sistemas e Informática' },
      { nombre: 'Medicina', descripcion: 'Facultad de Medicina San Fernando' },
      { nombre: 'Derecho', descripcion: 'Facultad de Derecho y Ciencia Política' }
    ]
  },
  {
    nombre: 'Universidad Nacional de Ingeniería',
    siglas: 'UNI',
    descripcion: 'Institución líder en ciencias e ingeniería, Lima.',
    carreras: [
      { nombre: 'Ingeniería de Sistemas', descripcion: 'Facultad de Ingeniería Industrial y de Sistemas' },
      { nombre: 'Ingeniería Civil', descripcion: 'Facultad de Ingeniería Civil' },
      { nombre: 'Ingeniería Mecánica', descripcion: 'Facultad de Ingeniería Mecánica' }
    ]
  },
  {
    nombre: 'Universidad Nacional de San Agustín de Arequipa',
    siglas: 'UNSA',
    descripcion: 'Universidad pública de la región sur, Arequipa.',
    carreras: [
      { nombre: 'Medicina', descripcion: 'Facultad de Medicina' },
      { nombre: 'Ingeniería de Sistemas', descripcion: 'Facultad de Ingeniería de Producción y Servicios' },
      { nombre: 'Derecho', descripcion: 'Facultad de Derecho' }
    ]
  },
  {
    nombre: 'Universidad Nacional de Trujillo',
    siglas: 'UNT',
    descripcion: 'Universidad pública de la región norte, La Libertad.',
    carreras: [
      { nombre: 'Medicina', descripcion: 'Facultad de Medicina' },
      { nombre: 'Derecho', descripcion: 'Facultad de Derecho y Ciencias Políticas' },
      { nombre: 'Ingeniería Industrial', descripcion: 'Facultad de Ingeniería' }
    ]
  }
];

export const seedBancoPreguntas = [
  {
    nombre: 'Ciencias Básicas',
    descripcion: 'Área de ciencias exactas, matemáticas y física',
    materias: [
      {
        nombre: 'Álgebra',
        descripcion: 'Estructuras algebraicas, polinomios y ecuaciones',
        temas: [
          {
            nombre: 'Ecuaciones de Segundo Grado',
            descripcion: 'Propiedades de las raíces y discriminante de una ecuación cuadrática',
            preguntas: [
              {
                enunciado: 'Dada la ecuación cuadrática $x^2 - 5x + 6 = 0$, ¿cuál es el conjunto solución?',
                dificultad: 'facil',
                tipo: 'opcion_multiple',
                explicacion: 'Factorizando: $(x - 2)(x - 3) = 0$, por lo tanto las raíces son $x_1 = 2$ y $x_2 = 3$.',
                alternativas: [
                  { texto: '{1, 6}', es_correcta: false },
                  { texto: '{2, 3}', es_correcta: true },
                  { texto: '{-2, -3}', es_correcta: false },
                  { texto: '{5, 6}', es_correcta: false },
                  { texto: '{-1, 6}', es_correcta: false }
                ]
              },
              {
                enunciado: 'Para que la ecuación $x^2 + kx + 9 = 0$ tenga raíces reales e iguales, el discriminante debe ser cero. Halle el valor positivo de $k$.',
                dificultad: 'intermedia',
                tipo: 'opcion_multiple',
                explicacion: 'El discriminante es $\\Delta = k^2 - 4(1)(9) = k^2 - 36 = 0$, luego $k = 6$.',
                alternativas: [
                  { texto: '3', es_correcta: false },
                  { texto: '6', es_correcta: true },
                  { texto: '9', es_correcta: false },
                  { texto: '12', es_correcta: false }
                ]
              }
            ]
          }
        ]
      },
      {
        nombre: 'Física',
        descripcion: 'Mecánica clásica, cinemática y termodinámica',
        temas: [
          {
            nombre: 'Cinemática (MRU y MRUV)',
            descripcion: 'Movimiento rectilíneo uniforme y uniformemente variado',
            preguntas: [
              {
                enunciado: 'Un móvil se desplaza con velocidad constante de $20\\text{ m/s}$. ¿Qué distancia recorre en 5 segundos?',
                dificultad: 'facil',
                tipo: 'opcion_multiple',
                explicacion: 'Aplicando la fórmula del MRU: $d = v \\cdot t = 20 \\cdot 5 = 100\\text{ m}$.',
                alternativas: [
                  { texto: '50 m', es_correcta: false },
                  { texto: '80 m', es_correcta: false },
                  { texto: '100 m', es_correcta: true },
                  { texto: '120 m', es_correcta: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    nombre: 'Humanidades',
    descripcion: 'Lenguaje, literatura, historia y ciencias sociales',
    materias: [
      {
        nombre: 'Lenguaje',
        descripcion: 'Normativa, gramática y ortografía',
        temas: [
          {
            nombre: 'Acentuación y Tildación',
            descripcion: 'Reglas generales y especiales de tildación diacrítica y enfática',
            preguntas: [
              {
                enunciado: 'Identifique la palabra que requiere tilde según las reglas ortográficas generales.',
                dificultad: 'facil',
                tipo: 'opcion_multiple',
                explicacion: 'La palabra "canción" es aguda terminada en consonante "n", por lo que lleva tilde ortográfica.',
                alternativas: [
                  { texto: 'cancion', es_correcta: true },
                  { texto: 'papel', es_correcta: false },
                  { texto: 'reloj', es_correcta: false },
                  { texto: 'cantar', es_correcta: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export function seedDatabase() {
  const insertUniversidad = db.prepare(`
    INSERT INTO universidades (nombre, siglas, descripcion, estado)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(siglas) DO UPDATE SET
      nombre = excluded.nombre,
      descripcion = excluded.descripcion
  `);

  const getUniversidadId = db.prepare(`
    SELECT id FROM universidades WHERE siglas = ?
  `);

  const insertCarrera = db.prepare(`
    INSERT OR IGNORE INTO carreras (universidad_id, nombre, descripcion, estado)
    VALUES (?, ?, ?, 1)
  `);

  // Prepared statements para Banco de Preguntas (Fase 4)
  const insertArea = db.prepare(`
    INSERT INTO areas (nombre, descripcion, estado)
    VALUES (?, ?, 1)
    ON CONFLICT(nombre) DO UPDATE SET
      descripcion = excluded.descripcion
  `);

  const getAreaId = db.prepare(`
    SELECT id FROM areas WHERE nombre = ?
  `);

  const insertMateria = db.prepare(`
    INSERT OR IGNORE INTO materias (area_id, nombre, descripcion, estado)
    VALUES (?, ?, ?, 1)
  `);

  const getMateriaId = db.prepare(`
    SELECT id FROM materias WHERE area_id = ? AND nombre = ?
  `);

  const insertTema = db.prepare(`
    INSERT OR IGNORE INTO temas (materia_id, nombre, descripcion, estado)
    VALUES (?, ?, ?, 1)
  `);

  const getTemaId = db.prepare(`
    SELECT id FROM temas WHERE materia_id = ? AND nombre = ?
  `);

  const getPreguntaId = db.prepare(`
    SELECT id FROM preguntas WHERE tema_id = ? AND enunciado = ?
  `);

  const insertPregunta = db.prepare(`
    INSERT INTO preguntas (tema_id, enunciado, dificultad, tipo, explicacion, estado)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  const insertAlternativa = db.prepare(`
    INSERT INTO alternativas (pregunta_id, texto, es_correcta)
    VALUES (?, ?, ?)
  `);

  const runSeed = db.transaction(() => {
    let universidadesCount = 0;
    let carrerasCount = 0;
    let areasCount = 0;
    let materiasCount = 0;
    let temasCount = 0;
    let preguntasCount = 0;
    let alternativasCount = 0;

    // Poblar universidades y carreras
    for (const uni of seedData) {
      insertUniversidad.run(uni.nombre, uni.siglas, uni.descripcion);
      universidadesCount++;

      const uniRow = getUniversidadId.get(uni.siglas);
      const universidadId = uniRow.id;

      for (const car of uni.carreras) {
        insertCarrera.run(universidadId, car.nombre, car.descripcion);
        carrerasCount++;
      }
    }

    // Poblar áreas, materias, temas y preguntas
    for (const area of seedBancoPreguntas) {
      insertArea.run(area.nombre, area.descripcion);
      areasCount++;

      const areaRow = getAreaId.get(area.nombre);
      const areaId = areaRow.id;

      for (const mat of area.materias) {
        insertMateria.run(areaId, mat.nombre, mat.descripcion);
        materiasCount++;

        const matRow = getMateriaId.get(areaId, mat.nombre);
        const materiaId = matRow.id;

        for (const tem of mat.temas) {
          insertTema.run(materiaId, tem.nombre, tem.descripcion);
          temasCount++;

          const temRow = getTemaId.get(materiaId, tem.nombre);
          const temaId = temRow.id;

          for (const preg of tem.preguntas) {
            let pregRow = getPreguntaId.get(temaId, preg.enunciado);
            let preguntaId;

            if (!pregRow) {
              const resPreg = insertPregunta.run(
                temaId,
                preg.enunciado,
                preg.dificultad,
                preg.tipo,
                preg.explicacion
              );
              preguntaId = resPreg.lastInsertRowid;
              preguntasCount++;

              for (const alt of preg.alternativas) {
                insertAlternativa.run(preguntaId, alt.texto, alt.es_correcta ? 1 : 0);
                alternativasCount++;
              }
            }
          }
        }
      }
    }

    return {
      universidadesCount,
      carrerasCount,
      areasCount,
      materiasCount,
      temasCount,
      preguntasCount,
      alternativasCount
    };
  });

  const resultado = runSeed();
  return resultado;
}

// Ejecución directa si se invoca desde CLI: node src/config/seed.js
const isDirectExecution = process.argv[1] && process.argv[1].endsWith('seed.js');
if (isDirectExecution) {
  try {
    const res = seedDatabase();
    console.log(`[Seed] Base de datos sembrada correctamente: ${res.universidadesCount} universidades, ${res.carrerasCount} carreras, ${res.areasCount} áreas, ${res.materiasCount} materias, ${res.temasCount} temas y ${res.preguntasCount} preguntas con ${res.alternativasCount} alternativas procesadas.`);
  } catch (error) {
    console.error('[Seed] Error al sembrar base de datos:', error);
    process.exit(1);
  }
}

export default seedDatabase;
