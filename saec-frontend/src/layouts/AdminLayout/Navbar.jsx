import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

export function Navbar({ pageTitle }) {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : 'US';

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      </div>

      <div className={styles.right}>
        <div className={styles.roleBadge}>
          <ShieldSmall />
          {user?.rol ?? 'Usuario'}
        </div>

        <div className={styles.userMenu} ref={menuRef}>
          <button
            className={styles.avatarBtn}
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span className={styles.avatar}>{initials}</span>
            <span className={styles.userName}>
              {user?.nombre} {user?.apellido}
            </span>
            <ChevronDown />
          </button>

          {menuOpen && (
            <div className={styles.dropdown}>
              {/* Header del menú */}
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownName}>{user?.nombre} {user?.apellido}</span>
                <span className={styles.dropdownEmail}>{user?.email}</span>
              </div>
              <div className={styles.dropdownDivider} />

              {/* Mi Perfil */}
              <Link
                to="/perfil"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon />
                Mi Perfil
              </Link>

              <div className={styles.dropdownDivider} />

              {/* Cerrar sesión */}
              <button
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <LogoutIcon />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Iconos ──────────────────────────────────────────────────── */
function ShieldSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
