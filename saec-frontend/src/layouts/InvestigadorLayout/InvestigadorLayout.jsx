import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar }  from '../AdminLayout/Navbar';
import styles from './InvestigadorLayout.module.css';

const PAGE_TITLES = {
  '/investigador/perfil':           'Mi Perfil',
  '/investigador/protocolos':       'Mis Protocolos',
  '/investigador/medicamentos':     'Mis Medicamentos',
};

export function InvestigadorLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] ?? 'SAEC';

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <Navbar pageTitle={pageTitle} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
