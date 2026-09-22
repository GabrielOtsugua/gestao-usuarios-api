const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  }

  const token = jwt.sign(
    {
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || '30m'
    }
  );

  return res.json({
    message: 'Login realizado com sucesso.',
    token,
    user: publicUser(user)
  });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ message: 'E-mail já cadastrado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = db.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, 'client')
  `).run(name, email, passwordHash);

  const user = db.prepare(`
    SELECT id, name, email, role, created_at, updated_at
    FROM users WHERE id = ?
  `).get(result.lastInsertRowid);

  return res.status(201).json({
    message: 'Cliente cadastrado com sucesso.',
    user
  });
}

module.exports = { login, register };
