const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const databaseFile = process.env.DATABASE_FILE || './data/database.sqlite';
const absolutePath = path.resolve(__dirname, '../../', databaseFile);
fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

const db = new Database(absolutePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'operator', 'client')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function seedUsers() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);

  const seed = db.transaction(() => {
    insert.run(
      'Administrador',
      'admin@exemplo.com',
      bcrypt.hashSync('Admin@123', 10),
      'admin'
    );

    insert.run(
      'Operador',
      'operador@exemplo.com',
      bcrypt.hashSync('Operador@123', 10),
      'operator'
    );

    insert.run(
      'Cliente',
      'cliente@exemplo.com',
      bcrypt.hashSync('Cliente@123', 10),
      'client'
    );
  });

  seed();
}

seedUsers();

module.exports = db;
