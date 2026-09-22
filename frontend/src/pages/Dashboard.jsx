import { useEffect, useState } from 'react';
import api from '../api/api';

const roleLabels = {
  admin: 'Administrador',
  operator: 'Operador',
  client: 'Cliente'
};

export default function Dashboard({ onLogout }) {
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [me, setMe] = useState(savedUser);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = me.role === 'admin';
  const isOperator = me.role === 'operator';
  const isClient = me.role === 'client';

  useEffect(() => {
    loadMe();
    if (isAdmin || isOperator) {
      loadUsers();
    }
  }, []);

  async function loadMe() {
    try {
      const { data } = await api.get('/users/me');
      setMe(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      setError('Não foi possível carregar seu perfil.');
    }
  }

  async function loadUsers() {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('Deseja realmente excluir este usuário?')) return;

    try {
      await api.delete(`/users/${id}`);
      setMessage('Usuário excluído com sucesso.');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir usuário.');
    }
  }

  function logout() {
    onLogout();
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <span className="eyebrow">SISTEMA WEB</span>
          <h1>Gerenciamento de usuários</h1>
        </div>
        <div className="user-area">
          <div>
            <strong>{me.name}</strong>
            <span className={`role role-${me.role}`}>{roleLabels[me.role]}</span>
          </div>
          <button className="secondary" onClick={logout}>Sair</button>
        </div>
      </header>

      <div className="content">
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <section className="profile-card">
          <div>
            <span className="eyebrow">SEU PERFIL</span>
            <h2>{me.name}</h2>
            <p>{me.email}</p>
          </div>
          <button
            className="secondary"
            onClick={() => setEditing(me)}
          >
            Editar meus dados
          </button>
        </section>

        {isClient && (
          <section className="info-card">
            <h2>Área do cliente</h2>
            <p>
              Seu perfil possui acesso restrito. Você pode visualizar e
              atualizar somente seus próprios dados.
            </p>
          </section>
        )}

        {(isAdmin || isOperator) && (
          <section className="users-card">
            <div className="section-header">
              <div>
                <span className="eyebrow">CONTROLE DE ACESSO</span>
                <h2>Usuários cadastrados</h2>
              </div>
              {isAdmin && (
                <button
                  className="primary"
                  onClick={() => setShowCreate(true)}
                >
                  + Novo usuário
                </button>
              )}
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Perfil</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role role-${user.role}`}>
                            {roleLabels[user.role]}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            className="small"
                            onClick={() => setEditing(user)}
                            disabled={isOperator && user.role === 'admin'}
                          >
                            Editar
                          </button>
                          {isAdmin && (
                            <button
                              className="small danger"
                              onClick={() => deleteUser(user.id)}
                            >
                              Excluir
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {showCreate && (
          <UserModal
            title="Cadastrar usuário"
            isAdmin={true}
            onClose={() => setShowCreate(false)}
            onSaved={() => {
              setShowCreate(false);
              setMessage('Usuário cadastrado com sucesso.');
              loadUsers();
            }}
          />
        )}

        {editing && (
          <UserModal
            title="Editar usuário"
            user={editing}
            isAdmin={isAdmin}
            canEditRole={isAdmin}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              setMessage('Usuário atualizado com sucesso.');
              loadMe();
              if (isAdmin || isOperator) loadUsers();
            }}
          />
        )}
      </div>
    </main>
  );
}

function UserModal({
  title,
  user,
  isAdmin,
  canEditRole = false,
  onClose,
  onSaved
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (user) {
        const payload = { name, email };
        if (password) payload.password = password;
        if (canEditRole) payload.role = role;

        await api.put(`/users/${user.id}`, payload);
      } else {
        await api.post('/users', {
          name,
          email,
          password,
          role
        });
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={submit}>
          <label>Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} required />

          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>{user ? 'Nova senha (opcional)' : 'Senha'}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength="6"
            required={!user}
          />

          {(isAdmin && canEditRole) && (
            <>
              <label>Perfil</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="admin">Administrador</option>
                <option value="operator">Operador</option>
                <option value="client">Cliente</option>
              </select>
            </>
          )}

          {error && <div className="alert error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
