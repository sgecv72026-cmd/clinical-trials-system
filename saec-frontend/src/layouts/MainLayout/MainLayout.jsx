import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar }  from '../AdminLayout/Navbar';
import styles from './MainLayout.module.css';

function getPageTitle(pathname) {
  if (pathname.startsWith('/investigador/medicamentos'))       return 'Medicamentos';
  if (pathname.startsWith('/investigador/protocolos/'))        return 'Detalle de Protocolo';
  if (pathname.startsWith('/investigador/protocolos'))         return 'Protocolos';
  if (pathname.startsWith('/reclutamiento/evaluacion'))        return 'Evaluación de Candidato';
  if (pathname.startsWith('/reclutamiento/historial'))         return 'Historial de Candidatos';
  if (pathname.startsWith('/reclutamiento'))                   return 'Reclutamiento';
  if (/\/pacientes\/\d+\/visitas\/\d+/.test(pathname))        return 'Detalle de Visita';
  if (/\/pacientes\/\d+\/visitas/.test(pathname))             return 'Visitas del Paciente';
  if (/\/pacientes\/\d+/.test(pathname))                      return 'Ficha del Paciente';
  if (pathname.startsWith('/pacientes'))                       return 'Pacientes';
  if (pathname.startsWith('/reportes'))                        return 'Reportes';
  if (pathname.includes('/perfil'))                            return 'Mi Perfil';
  return 'SGEC';
}

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className={styles.main}>
        <Navbar pageTitle={getPageTitle(pathname)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
