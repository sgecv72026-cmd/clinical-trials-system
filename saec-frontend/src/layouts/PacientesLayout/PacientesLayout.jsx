import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar }  from '../AdminLayout/Navbar';
import styles from './PacientesLayout.module.css';

const PAGE_TITLES = {
  '/pacientes':        'Pacientes',
  '/pacientes/ficha':  'Ficha del Paciente',
  '/pacientes/visitas':'Visitas',
  '/pacientes/perfil': 'Mi Perfil',
};

export function PacientesLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  const pageTitle = Object.entries(PAGE_TITLES).reduce((acc, [path, title]) => {
    if (pathname === path || (path !== '/pacientes' && pathname.startsWith(path))) return title;
    return acc;
  }, 'Pacientes');

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
