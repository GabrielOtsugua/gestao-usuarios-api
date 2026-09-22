const bcrypt = require("bcrypt");
const db = require("../database/db");

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function listUsers(req, res) {
  const users = db
    .prepare(
      `
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    ORDER BY id
  `,
    )
    .all();

  return res.json(users);
}

function getUser(req, res) {
  const id = Number(req.params.id);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  if (req.user.role === "client" && req.user.id !== id) {
    return res.status(403).json({ message: "Acesso negado." });
  }

  return res.json(publicUser(user));
}

function getMe(req, res) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  return res.json(publicUser(user));
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);
  if (existing) {
    return res.status(409).json({ message: "E-mail já cadastrado." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = db
    .prepare(
      `
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `,
    )
    .run(name, email, passwordHash, role);

  const user = db
    .prepare(
      `
    SELECT id, name, email, role, created_at, updated_at
    FROM users WHERE id = ?
  `,
    )
    .get(result.lastInsertRowid);

  return res.status(201).json({
    message: "Usuário criado com sucesso.",
    user,
  });
}

async function updateUser(req, res) {
  const id = Number(req.params.id);
  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (!target) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  const { name, email, password, role } = req.body;

  if (req.user.role === "admin" && req.user.id === Number(id)) {
    return res.status(403).json({
      message: "O administrador não pode alterar a própria conta.",
    });
  }

  if (req.user.role === "client" && req.user.id !== id) {
    return res.status(403).json({ message: "Acesso negado." });
  }

  if (req.user.role === "operator" && target.role === "admin") {
    return res
      .status(403)
      .json({ message: "Operador não pode alterar administrador." });
  }

  if (role !== undefined && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Somente administrador pode alterar perfil." });
  }

  if (email !== undefined) {
    const other = db
      .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
      .get(email, id);

    if (other) {
      return res
        .status(409)
        .json({ message: "E-mail já cadastrado por outro usuário." });
    }
  }

  const newName = name ?? target.name;
  const newEmail = email ?? target.email;
  const newRole = role ?? target.role;
  const newPasswordHash = password
    ? await bcrypt.hash(password, 10)
    : target.password_hash;

  db.prepare(
    `
    UPDATE users
    SET name = ?, email = ?, password_hash = ?, role = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(newName, newEmail, newPasswordHash, newRole, id);

  const updated = db
    .prepare(
      `
    SELECT id, name, email, role, created_at, updated_at
    FROM users WHERE id = ?
  `,
    )
    .get(id);

  return res.json({
    message: "Usuário atualizado com sucesso.",
    user: updated,
  });
}

function deleteUser(req, res) {
  const id = Number(req.params.id);

  if (req.user.id === id) {
    return res
      .status(400)
      .json({ message: "O administrador não pode excluir o próprio usuário." });
  }

  const target = db.prepare("SELECT id FROM users WHERE id = ?").get(id);

  if (!target) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(id);

  return res.status(204).send();
}

module.exports = {
  listUsers,
  getUser,
  getMe,
  createUser,
  updateUser,
  deleteUser,
};
