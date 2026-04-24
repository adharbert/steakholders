import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      setError(err.status === 401 ? 'Invalid credentials.' : (err.message || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-brand">
          <img className="auth-logo" src="/icons/icon-512.png" alt="Steakholders Meatup" />
          <div className="auth-brand-mark">Steakholders · Meatup</div>
          <div className="auth-tagline">Every cut. Every verdict.</div>
        </div>

        <form onSubmit={submit}>
          <div className="field-group">
            <label className="field-label">Username</label>
            <input
              className="field-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_handle"
              disabled={loading}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="divider-ornament" style={{ marginTop: 24 }}>· · ·</div>

        <button className="auth-link" onClick={() => navigate('/register')}>
          New? Claim your seat →
        </button>
      </div>
    </div>
  );
}
