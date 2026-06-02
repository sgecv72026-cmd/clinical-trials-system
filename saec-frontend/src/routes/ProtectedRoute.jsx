import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Ruta protegida con verificación de autenticación y roles.
 * @param {string[]} [allowedRoles] - Roles permitidos. Si se omite, sólo verifica autenticación.
 */
export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const tieneRol = allowedRoles.includes(user?.rol);
    if (!tieneRol) {
      return <Navigate to="/sin-acceso" replace />;
    }
  }

  return <Outlet />;
}
