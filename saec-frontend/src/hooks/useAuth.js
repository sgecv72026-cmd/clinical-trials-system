import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook para acceder al contexto de autenticación de SAEC.
 * Debe usarse dentro de un componente envuelto por <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
