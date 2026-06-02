import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar }  from '../AdminLayout/Navbar';
import styles from './ReportesLayout.module.css';

const PAGE_TITLES = {
  '/reportes':        'Reportes',
  '/reportes/perfil': 'Mi Perfil',
};

export function ReportesLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  const pageTitle = Object.entries(PAGE_TITLES).reduce((acc, [path, title]) => {
    if (pathname === path || (path !== '/reportes' && pathname.startsWith(path))) return title;
    return acc;
  }, 'Reportes');

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className={styles.main}>
        <Navbar pageTitle={pageTitle} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
