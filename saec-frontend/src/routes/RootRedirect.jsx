import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Redirige al usuario a su destino correcto según autenticación y rol.
 *
 * - No autenticado        → /login
 * - Administrador         → /admin (dashboard administrativo)
 * - Cualquier otro rol    → /perfil (módulo Mi Perfil)
 */
export function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const rol = user?.rol ?? '';

  switch (rol) {
    case 'Administrador':
      return <Navigate to="/admin" replace />;
    case 'Investigador Principal':
      return <Navigate to="/investigador" replace />;
    case 'Coordinador de Reclutamiento':
    case 'Médico Tratante':
      return <Navigate to="/reclutamiento" replace />;
    case 'Comité de Ética':
      return <Navigate to="/reportes" replace />;
    default:
      // Todos los demás roles autenticados ven su perfil por defecto
      return <Navigate to="/perfil" replace />;
  }
}
