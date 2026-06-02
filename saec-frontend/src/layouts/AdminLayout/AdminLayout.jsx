import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar }  from './Navbar';
import styles from './AdminLayout.module.css';

const PAGE_TITLES = {
  '/perfil':               'Mi Perfil',
  '/admin':                'Dashboard',
  '/admin/usuarios':       'Gestión de Usuarios',
  '/admin/roles':          'Roles del Sistema',
  '/admin/centros':        'Centros de Investigación',
  '/admin/auditoria':      'Bitácora de Auditoría',
  '/admin/reportes':       'Reportes Globales',
  '/admin/protocolos':     'Protocolos de Investigación',
  '/admin/pacientes':      'Gestión de Pacientes',
  '/admin/postulaciones':  'Postulaciones',
  '/admin/visitas':        'Visitas Clínicas',
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] ?? 'SAEC Admin';

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
