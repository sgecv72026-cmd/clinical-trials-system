import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

/* ── Ítems compartidos (todos los roles) ─────────────────────── */
const SHARED_ITEMS = [
  {
    label: 'Mi Perfil',
    path:  '/perfil',
    icon:  <UserCircleIcon />,
  },
];

/* ── Ítems exclusivos del Administrador ──────────────────────── */
const ADMIN_ITEMS = [
  { label: 'Dashboard',               path: '/admin',           icon: <GridIcon /> },
  { label: 'Usuarios',                path: '/admin/usuarios',  icon: <UsersIcon /> },
  { label: 'Roles',                   path: '/admin/roles',     icon: <ShieldIcon /> },
  { label: 'Centros de Investigación',path: '/admin/centros',   icon: <BuildingIcon /> },
  { label: 'Auditoría',               path: '/admin/auditoria', icon: <ClipboardIcon /> },
  { label: 'Reportes',                path: '/admin/reportes',  icon: <ChartIcon /> },
];


export function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'Administrador';

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
            <circle cx="20" cy="20" r="20" fill="#1a56db"/>
            <path d="M13 20C13 16 16 13 20 13C24 13 27 16 27 20C27 24 24 27 20 27C16 27 13 24 13 20Z"
              fill="none" stroke="white" strokeWidth="2"/>
            <path d="M16 20H24M20 16V24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="20" cy="20" r="2" fill="white"/>
          </svg>
        </button>
        {!collapsed && <span className={styles.brandName}>SAEC</span>}
        {!collapsed && (
          <button className={styles.collapseBtn} onClick={onToggle} type="button" aria-label="Minimizar sidebar">
            <ChevronIcon collapsed={collapsed} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>

        {/* ── Sección: Cuenta (todos los roles) ────────────── */}
        <span className={styles.navSection}>{!collapsed && 'MI CUENTA'}</span>
        {SHARED_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}

        {/* ── Sección: Administración (solo admin) ──────────── */}
        {isAdmin && (
          <>
            <span className={styles.navSection} style={{ marginTop: '1.25rem' }}>
              {!collapsed && 'ADMINISTRACIÓN'}
            </span>
            {ADMIN_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </NavLink>
            ))}

          </>
        )}

      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className={styles.sidebarFooter}>
          <span>SAEC v1.0</span>
          <span>Sistema Clínico</span>
        </div>
      )}
    </aside>
  );
}

/* ── Iconos SVG ──────────────────────────────────────────────── */
function UserCircleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function BuildingIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
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
