import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => authService.getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
    };
    window.addEventListener('saec:session-expired', onExpired);
    return () => window.removeEventListener('saec:session-expired', onExpired);
  }, []);

  // Auto-logout cuando el token expira
  useEffect(() => {
    if (!user) return;
    const token = authService.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const msUntilExpiry = payload.exp * 1000 - Date.now();
      if (msUntilExpiry <= 0) {
        handleLogout();
        return;
      }
      const timer = setTimeout(handleLogout, msUntilExpiry);
      return () => clearTimeout(timer);
    } catch {
      handleLogout();
    }
  }, [user]);

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser({
        idUsuario: data.idUsuario,
        nombre:    data.nombre,
        apellido:  data.apellido,
        email:     data.email,
        rol:       data.rol,
        telefono:  data.telefono,
      });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login:  handleLogin,
    logout: handleLogout,
  }), [user, loading, handleLogin, handleLogout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
