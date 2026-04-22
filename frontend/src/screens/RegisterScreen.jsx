import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username may only contain letters, numbers, and underscores.'); return; }

    setLoading(true);
    try {
      await register({ username, password, displayName });
      navigate('/');
    } catch (err) {
      setError(err.status === 409 ? 'That username is already taken.' : (err.message || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-brand">
          <div className="auth-brand-mark">Steakholders · Meatup</div>
          <div className="auth-tagline">Claim your seat at the table.</div>
        </div>

        <form onSubmit={submit}>
          <div className="field-group">
            <label className="field-label">Display Name</label>
            <input
              className="field-input"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="How others see you, e.g. Katie"
              disabled={loading}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Username</label>
            <input
              className="field-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. katie_steaks"
              disabled={loading}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              disabled={loading}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Confirm Password</label>
            <input
              className="field-input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Claiming Seat...' : 'Claim Your Seat'}
          </button>
        </form>

        <div className="divider-ornament" style={{ marginTop: 24 }}>· · ·</div>

        <button className="auth-link" onClick={() => navigate('/login')}>
          Already a shareholder? Sign in →
        </button>
      </div>
    </div>
  );
}
