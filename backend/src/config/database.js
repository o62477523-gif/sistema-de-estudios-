/**
 * Conexión y Configuración de SQLite 3 con better-sqlite3
 * 
 * Cumple con RNF-08 (PRAGMA foreign_keys = ON) y activa WAL mode.
 * Crea y actualiza las tablas relacionales de forma incremental.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolución de la ruta del archivo SQLite
const defaultDbPath = path.resolve(__dirname, '../../database/sistema_estudios.sqlite');
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : defaultDbPath;

// Asegurar que el directorio de la base de datos exista
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Inicialización de la conexión a la base de datos
export const db = new Database(dbPath);

// Configuración de integridad referencial y rendimiento
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// 1. Tabla estudiantes (Fase 2)
db.exec(`
  CREATE TABLE IF NOT EXISTS estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    contrasena_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'estudiante',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. Tabla universidades (Fase 3)
db.exec(`
  CREATE TABLE IF NOT EXISTS universidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    siglas TEXT UNIQUE,
    descripcion TEXT,
    estado INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 3. Tabla carreras (Fase 3)
db.exec(`
  CREATE TABLE IF NOT EXISTS carreras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    universidad_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    estado INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (universidad_id) REFERENCES universidades (id) ON DELETE RESTRICT,
    UNIQUE(universidad_id, nombre)
  );
`);

// 4. Migración incremental para tabla estudiantes: agregar universidad_id y carrera_id si no existen
const studentColumns = db.prepare('PRAGMA table_info(estudiantes)').all();
const hasUniversidadId = studentColumns.some(col => col.name === 'universidad_id');
const hasCarreraId = studentColumns.some(col => col.name === 'carrera_id');

if (!hasUniversidadId) {
  db.exec('ALTER TABLE estudiantes ADD COLUMN universidad_id INTEGER REFERENCES universidades(id);');
}

if (!hasCarreraId) {
  db.exec('ALTER TABLE estudiantes ADD COLUMN carrera_id INTEGER REFERENCES carreras(id);');
}

// 5. Tablas para Banco de Preguntas y Jerarquía Académica (Fase 4)
db.exec(`
  CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    estado INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    estado INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT,
    UNIQUE(area_id, nombre)
  );

  CREATE TABLE IF NOT EXISTS temas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materia_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    estado INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias (id) ON DELETE RESTRICT,
    UNIQUE(materia_id, nombre)
  );

  CREATE TABLE IF NOT EXISTS preguntas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tema_id INTEGER NOT NULL,
    enunciado TEXT NOT NULL,
    dificultad TEXT NOT NULL CHECK(dificultad IN ('facil', 'intermedia', 'dificil')),
    tipo TEXT NOT NULL DEFAULT 'opcion_multiple',
    explicacion TEXT,
    estado INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tema_id) REFERENCES temas (id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS alternativas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pregunta_id INTEGER NOT NULL,
    texto TEXT NOT NULL,
    es_correcta INTEGER NOT NULL CHECK(es_correcta IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas (id) ON DELETE CASCADE
  );
`);

export const databaseConfig = {
  client: 'better-sqlite3',
  filename: dbPath,
  foreignKeys: true,
  journalMode: 'WAL'
};

export default db;
