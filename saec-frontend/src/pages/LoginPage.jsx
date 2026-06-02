import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.backgroundPanel} aria-hidden="true">
        <div className={styles.bgDecor1} />
        <div className={styles.bgDecor2} />
        <div className={styles.bgDecor3} />
        <div className={styles.brandInfo}>
          <SaecLogoLarge />
          <h1 className={styles.brandTitle}>SAEC</h1>
          <p className={styles.brandSubtitle}>
            Sistema de Administración de<br />Ensayos Clínicos
          </p>
          <ul className={styles.featureList}>
            <FeatureItem icon={<ShieldIcon />} text="Gestión segura de protocolos clínicos" />
            <FeatureItem icon={<UsersIcon />}  text="Control de acceso por rol profesional" />
            <FeatureItem icon={<ClipboardIcon />} text="Trazabilidad completa de datos clínicos" />
          </ul>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div className={styles.logoMobile}><SaecLogoSmall /></div>
            <h2 className={styles.cardTitle}>Iniciar sesión</h2>
            <p className={styles.cardSubtitle}>
              Ingrese sus credenciales institucionales para acceder al sistema
            </p>
          </div>

          <LoginForm />

          <p className={styles.securityNote}>
            <LockSmallIcon />
            Conexión cifrada · Sesión de 24 horas
          </p>
        </div>

        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} SAEC</span>
          <span>·</span>
          <span>Uso institucional exclusivo</span>
        </footer>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <li className={styles.featureItem}>
      <span className={styles.featureIcon}>{icon}</span>
      <span>{text}</span>
    </li>
  );
}

function SaecLogoLarge() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="36" fill="rgba(255,255,255,0.15)" />
      <circle cx="36" cy="36" r="28" fill="rgba(255,255,255,0.12)" />
      <path d="M24 36 C24 29 29 24 36 24 C43 24 48 29 48 36 C48 43 43 48 36 48 C29 48 24 43 24 36Z"
        fill="none" stroke="white" strokeWidth="2.5"/>
      <path d="M30 36 H42 M36 30 V42" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="36" cy="36" r="3" fill="white"/>
    </svg>
  );
}

function SaecLogoSmall() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="var(--color-primary)"/>
      <path d="M13 20 C13 16 16 13 20 13 C24 13 27 16 27 20 C27 24 24 27 20 27 C16 27 13 24 13 20Z"
        fill="none" stroke="white" strokeWidth="2"/>
      <path d="M16 20 H24 M20 16 V24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="2" fill="white"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  );
}

function LockSmallIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
