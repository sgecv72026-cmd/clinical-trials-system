import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from '../ReclutamientoLayout/Sidebar.module.css';

export function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const rol = user?.rol ?? '';

  const esMedico      = rol.includes('Médico') || rol.includes('Medico');
  const esCoordinador = rol === 'Coordinador de Reclutamiento';

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>

      {/* Logo */}
      <div className={styles.brand}>
        <button
          className={`${styles.brandLogo} ${collapsed ? styles.brandLogoClickable : ''}`}
          onClick={collapsed ? onToggle : undefined}
          type="button"
          aria-label={collapsed ? 'Expandir sidebar' : undefined}
        >
          <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
            <circle cx="20" cy="20" r="20" fill="#1a56db" />
            <path d="M13 20C13 16 16 13 20 13C24 13 27 16 27 20C27 24 24 27 20 27C16 27 13 24 13 20Z"
              fill="none" stroke="white" strokeWidth="2" />
            <path d="M16 20H24M20 16V24" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="20" r="2" fill="white" />
          </svg>
        </button>
        {!collapsed && <span className={styles.brandName}>SGEC</span>}
        {!collapsed && (
          <button className={styles.collapseBtn} onClick={onToggle} type="button" aria-label="Minimizar sidebar">
            <ChevronIcon collapsed={collapsed} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>

        {/* Mi Cuenta */}
        <span className={styles.navSection}>{!collapsed && 'MI CUENTA'}</span>
        <NavLink
          to="/reportes/perfil"
          end
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          title={collapsed ? 'Mi Perfil' : undefined}
        >
          <span className={styles.navIcon}><UserCircleIcon /></span>
          {!collapsed && <span className={styles.navLabel}>Mi Perfil</span>}
        </NavLink>

        {/* Módulo */}
        <span className={styles.navSection} style={{ marginTop: '1.25rem' }}>
          {!collapsed && 'REPORTES'}
        </span>

        <NavLink
          to="/reportes"
          end
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          title={collapsed ? 'Dashboard' : undefined}
        >
          <span className={styles.navIcon}><ChartIcon /></span>
          {!collapsed && <span className={styles.navLabel}>Dashboard</span>}
        </NavLink>

        {/* Pacientes — Médico y Coordinador */}
        {(esMedico || esCoordinador) && (
          <>
            <span className={styles.navSection} style={{ marginTop: '1.25rem' }}>
              {!collapsed && 'PACIENTES'}
            </span>
            <NavLink
              to="/pacientes"
              end
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              title={collapsed ? 'Pacientes' : undefined}
            >
              <span className={styles.navIcon}><UsersIcon /></span>
              {!collapsed && (
                <span className={styles.navLabel}>
                  {esMedico ? 'Mis Pacientes' : 'Lista de Pacientes'}
                </span>
              )}
            </NavLink>
          </>
        )}

        {/* Reclutamiento — Médico y Coordinador */}
        {(esMedico || esCoordinador) && (
          <>
            <span className={styles.navSection} style={{ marginTop: '1.25rem' }}>
              {!collapsed && 'RECLUTAMIENTO'}
            </span>
            <NavLink
              to="/reclutamiento"
              end
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              title={collapsed ? 'Reclutamiento' : undefined}
            >
              <span className={styles.navIcon}><ClipboardIcon /></span>
              {!collapsed && <span className={styles.navLabel}>Reclutamiento</span>}
            </NavLink>
          </>
        )}

      </nav>

      {!collapsed && (
        <div className={styles.sidebarFooter}>
          <span>SGEC v1.0</span>
          <span>{rol}</span>
        </div>
      )}
    </aside>
  );
}

/* ── Iconos SVG ─────────────────────────────────────────────────── */
function UserCircleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ClipboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function ChartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}
function ChevronIcon({ collapsed }) {
  return collapsed
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
