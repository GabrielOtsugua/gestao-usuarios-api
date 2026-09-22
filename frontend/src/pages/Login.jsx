import { useState } from 'react';
import api from '../api/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@exemplo.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <span className="brand-icon">🔐</span>
          <div>
            <h1>Gestão de Usuários</h1>
            <p>API REST segura com JWT + RBAC</p>
          </div>
        </div>

        <form onSubmit={submit}>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <div className="alert error">{error}</div>}

          <button className="primary full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="demo-box">
          <strong>Contas de demonstração</strong>
          <span>Admin: admin@exemplo.com / Admin@123</span>
          <span>Operador: operador@exemplo.com / Operador@123</span>
          <span>Cliente: cliente@exemplo.com / Cliente@123</span>
        </div>
      </section>
    </main>
  );
}
