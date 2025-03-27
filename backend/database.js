import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'data', 'database.sqlite');

// Ensure the database directory exists
async function ensureDbDirectory() {
  const dbDir = dirname(DB_PATH);
  try {
    await fs.access(dbDir);
  } catch {
    await fs.mkdir(dbDir, { recursive: true });
  }
}

let db;

export async function getDatabase() {
  if (!db) {
    await ensureDbDirectory();
    db = createClient({
      url: `file:${DB_PATH}`,
    });

    // Initialize schema if needed
    await initializeSchema();
  }
  return db;
}

async function initializeSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS vision_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      section TEXT NOT NULL,
      text TEXT,
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      z_index INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS energy_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      level INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS manifestations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      category TEXT NOT NULL,
      notes TEXT,
      completed INTEGER DEFAULT 0,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      energy_level TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      link TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

export async function initializeDatabase() {
  return getDatabase();
}

// User operations
export async function createUser(id, email, password) {
  const db = await getDatabase();
  await db.execute({
    sql: 'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
    args: [id, email, password]
  });
  return { id, email };
}

export async function getUserByEmail(email) {
  const db = await getDatabase();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  return result.rows[0];
}

// Vision items operations
export async function getVisionItems(userId) {
  const db = await getDatabase();
  const result = await db.execute({
    sql: 'SELECT * FROM vision_items WHERE user_id = ?',
    args: [userId]
  });
  return result.rows;
}

export async function createVisionItem(item) {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO vision_items 
      (id, user_id, image_url, section, text, x, y, width, height, z_index) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      item.id,
      item.userId,
      item.imageUrl,
      item.section,
      item.text,
      item.x,
      item.y,
      item.width,
      item.height,
      item.zIndex
    ]
  });
  return item;
}

export async function updateVisionItem(id, userId, updates) {
  const db = await getDatabase();
  await db.execute({
    sql: `
      UPDATE vision_items 
      SET image_url = ?, section = ?, text = ?, x = ?, y = ?, width = ?, height = ?, z_index = ?
      WHERE id = ? AND user_id = ?
    `,
    args: [
      updates.imageUrl ?? null,
      updates.section ?? null,
      updates.text ?? null,
      updates.x ?? 0,
      updates.y ?? 0,
      updates.width ?? 150,
      updates.height ?? 150,
      updates.zIndex ?? 0,
      id,
      userId
    ]
  });
  return { id, ...updates };
}


export async function deleteVisionItem(id, userId) {
  const db = await getDatabase();
  await db.execute({
    sql: 'DELETE FROM vision_items WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });
  return true;
}

// Energy entries operations
export async function getEnergyEntries(userId) {
  const db = await getDatabase();
  const result = await db.execute({
    sql: 'SELECT * FROM energy_entries WHERE user_id = ? ORDER BY date DESC',
    args: [userId]
  });
  return result.rows;
}

export async function createEnergyEntry(entry) {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO energy_entries 
      (id, user_id, date, level, notes) 
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [entry.id, entry.userId, entry.date, entry.level, entry.notes]
  });
  return entry;
}

export async function deleteEnergyEntry(id, userId) {
  const db = await getDatabase();
  await db.execute({
    sql: 'DELETE FROM energy_entries WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });
  return true;
}

// Manifestations operations
export async function getManifestations(userId) {
  const db = await getDatabase();
  const result = await db.execute({
    sql: 'SELECT * FROM manifestations WHERE user_id = ? ORDER BY date DESC',
    args: [userId]
  });
  return result.rows;
}

export async function createManifestation(manifestation) {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO manifestations 
      (id, user_id, text, category, notes, completed, date) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      manifestation.id,
      manifestation.userId,
      manifestation.text,
      manifestation.category,
      manifestation.notes,
      manifestation.completed ? 1 : 0,
      manifestation.date
    ]
  });
  return manifestation;
}

export async function updateManifestation(id, userId, updates) {
  const db = await getDatabase();
  await db.execute({
    sql: `
      UPDATE manifestations 
      SET text = ?, category = ?, notes = ?, completed = ?, date = ?
      WHERE id = ? AND user_id = ?
    `,
    args: [
      updates.text,
      updates.category,
      updates.notes,
      updates.completed ? 1 : 0,
      updates.date,
      id,
      userId
    ]
  });
  return { id, ...updates };
}

export async function deleteManifestation(id, userId) {
  const db = await getDatabase();
  await db.execute({
    sql: 'DELETE FROM manifestations WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });
  return true;
}

