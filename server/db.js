import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from './migrate.js';

const root = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.join(root, '..', 'data'), { recursive: true });
export const db = new Database(path.join(root, '..', 'data', 'rentride.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('renter','owner')), phone TEXT DEFAULT '', avatar TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS owner_access (user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, enabled_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS vehicles (id INTEGER PRIMARY KEY, owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, category TEXT NOT NULL, brand TEXT NOT NULL, model_year INTEGER NOT NULL, price REAL NOT NULL, location TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL, description TEXT DEFAULT '', image TEXT NOT NULL, images TEXT DEFAULT '[]', seats INTEGER DEFAULT 2, transmission TEXT DEFAULT 'Automatic', fuel TEXT DEFAULT 'Petrol', available INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE, renter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, start_at TEXT NOT NULL, hours INTEGER NOT NULL, total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE, sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, body TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, read_at TEXT);
CREATE TABLE IF NOT EXISTS availability (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE, date TEXT NOT NULL, available INTEGER NOT NULL DEFAULT 1, UNIQUE(vehicle_id,date));
`);
migrate(db);
