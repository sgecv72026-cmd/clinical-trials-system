import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './SinAcceso.module.css';

export function SinAcceso() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleBack() {
    navigate(-1);
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <ShieldIcon />
        </div>

        <div className={styles.code}>403</div>
        <h1 className={styles.title}>Acceso no autorizado</h1>
        <p className={styles.description}>
          Tu cuenta{user?.nombre ? ` (${user.nombre} ${user.apellido ?? ''})` : ''} no tiene
          los permisos necesarios para acceder a esta sección.
          {user?.rol && (
            <span className={styles.rolNote}> Rol actual: <strong>{user.rol}</strong>.</span>
          )}
        </p>

        <div className={styles.actions}>
          <button className={styles.btnBack} onClick={handleBack}>
            <ArrowIcon /> Volver
          </button>
          <button className={styles.btnLogout} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>

        <p className={styles.hint}>
          Si crees que esto es un error, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
