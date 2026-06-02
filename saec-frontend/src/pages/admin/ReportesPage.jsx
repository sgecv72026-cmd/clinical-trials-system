import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { PageLoader } from '../../components/ui/PageLoader';
import styles from './ReportesPage.module.css';

export function ReportesPage() {
  const [stats,   setStats]   = useState(null);
  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getDashboardStats(), adminService.getRoles()])
      .then(([s, r]) => { setStats(s); setRoles(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Generando reportes…" />;

  const maxUsuarios = Math.max(...roles.map(r => r.totalUsuarios), 1);

  return (
    <div className={styles.page}>
      <div className={styles.notice}>
        <EyeIcon />
        Los reportes muestran información <strong>anonimizada o agregada</strong> para cumplir con los requisitos de privacidad y normativa clínica aplicable.
      </div>

      {/* Resumen global */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Resumen institucional</h3>
        <div className={styles.metricsGrid}>
          <MetricBox label="Usuarios totales"        value={stats.totalUsuarios}            color="blue"  />
          <MetricBox label="Usuarios activos"        value={stats.usuariosActivos}           color="green" />
          <MetricBox label="Protocolos registrados"  value={stats.totalProtocolos}           color="purple"/>
          <MetricBox label="Pacientes en protocolo"  value={stats.pacientesActivos}          color="cyan"  />
          <MetricBox label="Postulaciones pendientes"value={stats.postulacionesPendientes}   color="amber" />
          <MetricBox label="Eventos adversos activos"value={stats.eventosAdversos}           color="rose"  />
          <MetricBox label="Centros de investigación"value={stats.totalCentros}              color="indigo"/>
          <MetricBox label="Centros operativos"      value={stats.centrosOperativos}         color="green" />
        </div>
      </div>

      {/* Gráfico: Usuarios por rol */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Distribución de usuarios por rol</h3>
        <div className={styles.chartCard}>
          <div className={styles.barChart}>
            {roles.map(rol => {
              const pct = (rol.totalUsuarios / maxUsuarios) * 100;
              return (
                <div key={rol.idRol} className={styles.barGroup}>
                  <div className={styles.barLabel}>{rol.nombre}</div>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${ROL_COLOR_CLASS[rol.nombre] ?? styles.barBlue}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className={styles.barValue}>{rol.totalUsuarios}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI de salud del sistema */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Indicadores de salud del sistema</h3>
        <div className={styles.kpiGrid}>
          <KpiCard
            label="Tasa de activación de usuarios"
            value={stats.totalUsuarios > 0 ? `${Math.round((stats.usuariosActivos / stats.totalUsuarios) * 100)}%` : '—'}
            detail={`${stats.usuariosActivos} de ${stats.totalUsuarios} usuarios activos`}
            status={stats.usuariosActivos / stats.totalUsuarios > 0.8 ? 'good' : 'warn'}
          />
          <KpiCard
            label="Centros operativos"
            value={stats.totalCentros > 0 ? `${Math.round((stats.centrosOperativos / stats.totalCentros) * 100)}%` : '—'}
            detail={`${stats.centrosOperativos} de ${stats.totalCentros} centros activos`}
            status={stats.centrosOperativos / stats.totalCentros > 0.8 ? 'good' : 'warn'}
          />
          <KpiCard
            label="Eventos adversos reportados"
            value={stats.eventosAdversos}
            detail="Total registrado en el sistema"
            status={stats.eventosAdversos === 0 ? 'good' : stats.eventosAdversos < 10 ? 'warn' : 'bad'}
          />
          <KpiCard
            label="Postulaciones en revisión"
            value={stats.postulacionesPendientes}
            detail="Pendientes de resolución"
            status={stats.postulacionesPendientes < 5 ? 'good' : 'warn'}
          />
        </div>
      </div>

      <div className={styles.disclaimer}>
        * Los datos mostrados corresponden al estado actual del sistema y se actualizan en tiempo real.
        Los datos clínicos individuales están sujetos a protección de privacidad y no se exponen en este reporte.
      </div>
    </div>
  );
}

function MetricBox({ label, value, color }) {
  return (
    <div className={`${styles.metricBox} ${styles[color]}`}>
      <span className={styles.metricVal}>{value ?? '—'}</span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  );
}

function KpiCard({ label, value, detail, status }) {
  const statusClass = { good: styles.kpiGood, warn: styles.kpiWarn, bad: styles.kpiBad }[status];
  return (
    <div className={`${styles.kpiCard} ${statusClass}`}>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiDetail}>{detail}</div>
    </div>
  );
}

const ROL_COLOR_CLASS = {
  'Administrador':                styles?.barPurple,
  'Investigador Principal':       styles?.barBlue,
  'Médico Tratante':              styles?.barCyan,
  'Coordinador de Reclutamiento': styles?.barAmber,
  'Comité de Ética':              styles?.barGreen,
};

function EyeIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
