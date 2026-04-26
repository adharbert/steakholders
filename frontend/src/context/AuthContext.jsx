import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login as apiLogin, register as apiRegister, oauthLogin as apiOauthLogin } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    return res.user;
  };

  const oauthLogin = async (data) => {
    const res = await apiOauthLogin(data);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    return res; // { token, user, isNewUser }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, oauthLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
