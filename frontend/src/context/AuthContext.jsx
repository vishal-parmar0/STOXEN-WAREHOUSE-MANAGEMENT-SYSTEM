import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('stoxen_token');
    const savedUser = localStorage.getItem('stoxen_user');
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        api.get('/auth/me')
          .then(res => {
            setUser(res.data.user);
            localStorage.setItem('stoxen_user', JSON.stringify(res.data.user));
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    const { token, user: userData } = res.data;
    localStorage.setItem('stoxen_token', token);
    localStorage.setItem('stoxen_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role = 'staff') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token, user: userData } = res.data;
    localStorage.setItem('stoxen_token', token);
    localStorage.setItem('stoxen_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('stoxen_token');
    localStorage.removeItem('stoxen_user');
    setUser(null);
  };

  const hasRole = (...roles) => user && roles.includes(user.role);
  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('admin', 'manager');

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, hasRole, isAdmin, isManager
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
