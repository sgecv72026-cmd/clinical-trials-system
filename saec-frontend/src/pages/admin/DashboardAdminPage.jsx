import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService  from '../../services/adminService';
import { StatCard }  from '../../components/ui/StatCard';
import { RolBadge, ActivoBadge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/PageLoader';
import styles from './DashboardAdminPage.module.css';

export function DashboardAdminPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Cargando métricas del sistema…" />;

  const pctActivos = stats.totalUsuarios > 0
    ? Math.round((stats.usuariosActivos / stats.totalUsuarios) * 100)
    : 0;

  return (
    <div className={styles.page}>
      {/* Saludo */}
      <div className={styles.welcomeBanner}>
        <div>
          <h2 className={styles.welcomeTitle}>Panel de Administración</h2>
          <p className={styles.welcomeSub}>
            Resumen general del sistema clínico · {new Date().toLocaleDateString('es-CL', { dateStyle: 'long' })}
          </p>
        </div>
        <div className={styles.systemStatus}>
          <span className={styles.statusDot} />
          Sistema operativo
        </div>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Usuarios registrados"
          value={stats.totalUsuarios}
          sub={`${stats.usuariosActivos} activos (${pctActivos}%)`}
          color="blue"
          icon={<UsersIcon />}
        />
        <StatCard
          label="Protocolos clínicos"
          value={stats.totalProtocolos}
          color="purple"
          icon={<FlaskIcon />}
        />
        <StatCard
          label="Pacientes activos"
          value={stats.pacientesActivos}
          color="cyan"
          icon={<HeartIcon />}
        />
        <StatCard
          label="Postulaciones pendientes"
          value={stats.postulacionesPendientes}
          color="amber"
          icon={<FileIcon />}
        />
        <StatCard
          label="Eventos adversos"
          value={stats.eventosAdversos}
          color="rose"
          icon={<AlertIcon />}
        />
        <StatCard
          label="Centros operativos"
          value={`${stats.centrosOperativos} / ${stats.totalCentros}`}
          color="green"
          icon={<BuildingIcon />}
        />
      </div>

      {/* Accesos rápidos */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Accesos rápidos</h3>
        <div className={styles.quickAccess}>
          {[
            { label: 'Gestionar usuarios',      path: '/admin/usuarios',  icon: <UsersIcon />,   color: 'blue'  },
            { label: 'Centros de investigación', path: '/admin/centros',   icon: <BuildingIcon />,color: 'green' },
            { label: 'Roles del sistema',        path: '/admin/roles',     icon: <ShieldIcon />,  color: 'purple'},
            { label: 'Bitácora de auditoría',    path: '/admin/auditoria', icon: <LockIcon />,    color: 'amber' },
            { label: 'Reportes globales',        path: '/admin/reportes',  icon: <ChartIcon />,   color: 'cyan'  },
          ].map(item => (
            <button
              key={item.path}
              className={`${styles.quickCard} ${styles[item.color]}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.quickIcon}>{item.icon}</span>
              <span>{item.label}</span>
              <ChevronRightIcon />
            </button>
          ))}
        </div>
      </div>

      {/* Distribución de usuarios por rol (visual) */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Distribución de usuarios por rol</h3>
        <div className={styles.rolDistCard}>
          <p className={styles.rolDistNote}>
            Consulta el detalle completo en{' '}
            <button className={styles.inlineLink} onClick={() => navigate('/admin/roles')}>
              Roles del sistema
            </button>
          </p>
          <div className={styles.rolBars}>
            {ROLES_INFO.map(r => (
              <div key={r.nombre} className={styles.rolRow}>
                <RolBadge rol={r.nombre} />
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles[r.color]}`} style={{ width: r.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ROLES_INFO = [
  { nombre: 'Administrador',                color: 'purple', pct: '15%' },
  { nombre: 'Investigador Principal',       color: 'blue',   pct: '25%' },
  { nombre: 'Médico Tratante',              color: 'cyan',   pct: '30%' },
  { nombre: 'Coordinador de Reclutamiento', color: 'amber',  pct: '20%' },
  { nombre: 'Comité de Ética',              color: 'green',  pct: '10%' },
];

function UsersIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function FlaskIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H6l-3 9h18L18 3h-3"/><path d="M3 12l9 9 9-9"/></svg>; }
function HeartIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function FileIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function AlertIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function BuildingIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function ShieldIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function LockIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function ChartIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
