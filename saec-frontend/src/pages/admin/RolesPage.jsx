import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { Badge }    from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/PageLoader';
import styles from './RolesPage.module.css';

const ROL_COLORS = {
  'Administrador':                'purple',
  'Investigador Principal':       'blue',
  'Médico Tratante':              'cyan',
  'Coordinador de Reclutamiento': 'amber',
  'Comité de Ética':              'green',
};

export function RolesPage() {
  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getRoles()
      .then(setRoles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Cargando roles…" />;

  const total = roles.reduce((s, r) => s + r.totalUsuarios, 0);

  return (
    <div className={styles.page}>
      <div className={styles.notice}>
        <LockIcon />
        Los roles del sistema están definidos a nivel institucional y se gestionan mediante control de acceso estricto.
        El Administrador puede visualizar y monitorear su uso, pero no puede modificar permisos.
      </div>

      <div className={styles.grid}>
        {roles.map(rol => {
          const pct = total > 0 ? (rol.totalUsuarios / total) * 100 : 0;
          const color = ROL_COLORS[rol.nombre] ?? 'gray';

          return (
            <div key={rol.idRol} className={`${styles.card} ${!rol.activo ? styles.inactivo : ''}`}>
              <div className={styles.cardTop}>
                <div className={`${styles.rolIcon} ${styles[color]}`}>
                  <RolIcon nombre={rol.nombre} />
                </div>
                <Badge variant={rol.activo ? 'success' : 'gray'}>
                  {rol.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <h3 className={styles.rolNombre}>{rol.nombre}</h3>
              <p className={styles.rolDesc}>{rol.descripcion ?? 'Sin descripción disponible.'}</p>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{rol.totalUsuarios}</span>
                  <span className={styles.statLabel}>usuarios</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{pct.toFixed(0)}%</span>
                  <span className={styles.statLabel}>del total</span>
                </div>
              </div>

              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles[color]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.permisos}>
        <h3 className={styles.permisosTitle}>Matriz de permisos por rol</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Permiso</th>
                {roles.map(r => <th key={r.idRol}>{r.nombre}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMISOS.map(p => (
                <tr key={p.accion}>
                  <td>{p.accion}</td>
                  {roles.map(r => (
                    <td key={r.idRol}>
                      {p.roles.includes(r.nombre)
                        ? <span className={styles.check}>✓</span>
                        : <span className={styles.cross}>–</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const TODOS = ['Administrador','Investigador Principal','Médico Tratante','Coordinador de Reclutamiento','Comité de Ética'];
const PERMISOS = [
  { accion: 'Gestión de usuarios',         roles: ['Administrador'] },
  { accion: 'Visualizar auditoría',         roles: ['Administrador'] },
  { accion: 'Gestionar protocolos',         roles: ['Investigador Principal'] },
  { accion: 'Evaluar postulaciones',        roles: ['Coordinador de Reclutamiento','Investigador Principal'] },
  { accion: 'Atender pacientes',            roles: ['Médico Tratante'] },
  { accion: 'Registrar eventos adversos',   roles: ['Médico Tratante','Investigador Principal'] },
  { accion: 'Revisar protocolos (Comité)',  roles: ['Comité de Ética'] },
  { accion: 'Ver reportes globales',        roles: TODOS },
];

function RolIcon({ nombre }) {
  const icons = {
    'Administrador':                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    'Investigador Principal':       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H6l-3 9h18L18 3h-3"/><path d="M3 12l9 9 9-9"/></svg>,
    'Médico Tratante':              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    'Coordinador de Reclutamiento': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    'Comité de Ética':              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  };
  return icons[nombre] ?? null;
}
function LockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
