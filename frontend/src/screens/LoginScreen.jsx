import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { loginWithFacebook } from '../utils/facebook';

const GOOGLE_CONFIGURED  = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_CONFIGURED = !!import.meta.env.VITE_FACEBOOK_APP_ID;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.253h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

export default function LoginScreen() {
  const { login, oauthLogin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // State for new-OAuth-user zip code prompt
  const [pendingOAuth, setPendingOAuth]   = useState(null); // { provider, token }
  const [zipCode, setZipCode]             = useState('');
  const [zipLoading, setZipLoading]       = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/home');
    } catch (err) {
      setError(err.status === 401 ? 'Invalid credentials.' : (err.message || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider, token) => {
    setError('');
    setLoading(true);
    try {
      const res = await oauthLogin({ provider, token });
      if (res.isNewUser) {
        setPendingOAuth({ provider, token });
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitZip = async (e) => {
    e.preventDefault();
    if (!zipCode.trim()) return;
    setZipLoading(true);
    try {
      await oauthLogin({ ...pendingOAuth, zipCode: zipCode.trim() });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Could not save zip code.');
    } finally {
      setZipLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (res) => handleOAuth('google', res.access_token),
    onError:   ()    => setError('Google sign-in failed.'),
  });

  const handleFacebook = async () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    setError('');
    setLoading(true);
    try {
      const token = await loginWithFacebook(appId);
      await handleOAuth('facebook', token);
    } catch (err) {
      setError(err.message || 'Facebook sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Zip code completion step for new OAuth users
  if (pendingOAuth) {
    return (
      <div className="auth-wrap">
        <div className="auth-box">
          <div className="auth-brand">
            <div className="auth-brand-mark">One last thing</div>
            <div className="auth-tagline">What's your zip code? We use it to find meatups near you.</div>
          </div>
          <form onSubmit={submitZip}>
            <div className="field-group">
              <label className="field-label">Zip Code</label>
              <input
                className="field-input"
                type="text"
                inputMode="numeric"
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
                placeholder="e.g. 33602"
                disabled={zipLoading}
                required
                autoFocus
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="submit-btn" type="submit" disabled={zipLoading}>
              {zipLoading ? 'Saving...' : 'Finish Setup'}
            </button>
          </form>
          <button className="auth-link" onClick={() => { setPendingOAuth(null); navigate('/home'); }}>
            Skip for now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-brand">
          <img className="auth-logo" src="/icons/icon-512.png" alt="Steakholders Meatup" />
          <div className="auth-brand-mark">Steakholders · Meatup</div>
          <div className="auth-tagline">Every cut. Every verdict.</div>
        </div>

        {/* Social login */}
        <div className="social-btns">
          {GOOGLE_CONFIGURED && (
            <button
              type="button"
              className="social-btn"
              onClick={() => googleLogin()}
              disabled={loading}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          )}
          {FACEBOOK_CONFIGURED && (
            <button
              type="button"
              className="social-btn"
              onClick={handleFacebook}
              disabled={loading}
            >
              <FacebookIcon />
              Continue with Facebook
            </button>
          )}
        </div>

        {(GOOGLE_CONFIGURED || FACEBOOK_CONFIGURED) && (
          <div className="auth-divider">or</div>
        )}

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
