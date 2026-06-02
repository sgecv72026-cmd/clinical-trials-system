import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

export function Sidebar({ collapsed, onToggle }) {
  const [protocolosExpanded, setProtocolosExpanded] = useState(true);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Logo */}
      <div className={styles.brand}>
        <button
          className={`${styles.brandLogo} ${collapsed ? styles.brandLogoClickable : ""}`}
          onClick={collapsed ? onToggle : undefined}
          aria-label={collapsed ? "Expandir sidebar" : undefined}
          type="button"
        >
          <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
            <circle cx="20" cy="20" r="20" fill="#1a56db" />
            <path
              d="M13 20C13 16 16 13 20 13C24 13 27 16 27 20C27 24 24 27 20 27C16 27 13 24 13 20Z"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M16 20H24M20 16V24"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="2" fill="white" />
          </svg>
        </button>
        {!collapsed && <span className={styles.brandName}>SGEC</span>}
        {!collapsed && (
          <button
            className={styles.collapseBtn}
            onClick={onToggle}
            aria-label="Minimizar sidebar"
          >
            <ChevronIcon collapsed={collapsed} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {/* ── Mi Cuenta ─────────────────────────────────────────── */}
        <span className={styles.navSection}>{!collapsed && "MI CUENTA"}</span>
        <NavLink
          to="/investigador/perfil"
          end
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title={collapsed ? "Mi Perfil" : undefined}
        >
          <span className={styles.navIcon}>
            <UserCircleIcon />
          </span>
          {!collapsed && <span className={styles.navLabel}>Mi Perfil</span>}
        </NavLink>

        {/* ── Mis Módulos ───────────────────────────────────────── */}
        <span className={styles.navSection} style={{ marginTop: "1.25rem" }}>
          {!collapsed && "MIS MÓDULOS"}
        </span>

        {/* Protocolos — grupo expandible */}
        <button
          className={`${styles.navItem} ${styles.navGroupBtn}`}
          onClick={() => !collapsed && setProtocolosExpanded((v) => !v)}
          title={collapsed ? "Protocolos" : undefined}
          type="button"
        >
          <span className={styles.navIcon}>
            <FlaskIcon />
          </span>
          {!collapsed && (
            <>
              <span className={styles.navLabel}>Protocolos</span>
              <span className={styles.groupChevron}>
                <ChevronGroupIcon expanded={protocolosExpanded} />
              </span>
            </>
          )}
        </button>

        {/* Sub-ítems de Protocolos */}
        {(protocolosExpanded || collapsed) && (
          <div className={styles.subItemsGroup}>
            <NavLink
              to="/investigador/protocolos"
              end
              className={({ isActive }) =>
                `${styles.navItem} ${styles.navSubItem} ${isActive ? styles.active : ""}`
              }
              title={collapsed ? "Lista de Protocolos" : undefined}
            >
              <span className={styles.navIcon}>
                <ListIcon />
              </span>
              {!collapsed && (
                <span className={styles.navLabel}>Lista de Protocolos</span>
              )}
            </NavLink>

            <NavLink
              to="/investigador/medicamentos"
              end
              className={({ isActive }) =>
                `${styles.navItem} ${styles.navSubItem} ${isActive ? styles.active : ""}`
              }
              title={collapsed ? "Medicamentos" : undefined}
            >
              <span className={styles.navIcon}>
                <PillIcon />
              </span>
              {!collapsed && (
                <span className={styles.navLabel}>Medicamentos</span>
              )}
            </NavLink>
          </div>
        )}
        {/* Reclutamiento */}
        <NavLink
          to="/reclutamiento"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title={collapsed ? "Reclutamiento" : undefined}
        >
          <span className={styles.navIcon}>
            <UsersIcon />
          </span>
          {!collapsed && <span className={styles.navLabel}>Reclutamiento</span>}
        </NavLink>

      </nav>

      {!collapsed && (
        <div className={styles.sidebarFooter}>
          <span>SGEC v1.0</span>
          <span>Sistema Clínico</span>
        </div>
      )}
    </aside>
  );
}

/* ── Iconos SVG ──────────────────────────────────────────────── */
function UserCircleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function FlaskIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3H6l-3 9h18L18 3h-3" />
      <path d="M3 12l9 9 9-9" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function PillIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7Z" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function ChevronIcon({ collapsed }) {
  return collapsed ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronGroupIcon({ expanded }) {
  return expanded ? (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
