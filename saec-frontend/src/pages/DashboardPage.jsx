import { useAuth } from '../hooks/useAuth';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="var(--color-primary)"/>
            <path d="M13 20C13 16 16 13 20 13C24 13 27 16 27 20C27 24 24 27 20 27C16 27 13 24 13 20Z"
              fill="none" stroke="white" strokeWidth="2"/>
            <path d="M16 20H24M20 16V24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="20" cy="20" r="2" fill="white"/>
          </svg>
          <span className={styles.logoText}>SAEC</span>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.nombre} {user?.apellido}</span>
          <span className={styles.userRole}>{user?.rol}</span>
          <button className={styles.logoutBtn} onClick={logout}>Cerrar sesión</button>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.welcomeCard}>
          <h1>Bienvenido al sistema</h1>
          <p>
            Ha iniciado sesión correctamente como <strong>{user?.nombre} {user?.apellido}</strong>.
            <br />
            Rol: <strong>{user?.rol}</strong>
          </p>
          <p className={styles.note}>
            El módulo de dashboard está pendiente de implementación.
          </p>
        </div>
      </main>
    </div>
  );
}
