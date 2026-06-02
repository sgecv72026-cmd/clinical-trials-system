import { useLocation } from 'react-router-dom';
import styles from './ModuloEnDesarrollo.module.css';

/**
 * Página placeholder para módulos que aún no han sido implementados.
 * Muestra un mensaje amigable con el nombre del módulo según la ruta actual.
 */
export function ModuloEnDesarrollo() {
  const location = useLocation();
  const moduleName = ROUTE_LABELS[location.pathname] ?? 'Módulo';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <WrenchIcon />
        </div>

        <div className={styles.badge}>Próximamente</div>

        <h2 className={styles.title}>{moduleName}</h2>
        <p className={styles.description}>
          Este módulo está actualmente en desarrollo. En una próxima versión
          del sistema estará disponible con todas sus funcionalidades.
        </p>

        <div className={styles.featureList}>
          {FEATURE_HINTS[location.pathname]?.map((hint, i) => (
            <div key={i} className={styles.featureItem}>
              <CheckIcon />
              <span>{hint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ROUTE_LABELS = {
  '/admin/protocolos':    'Protocolos de Investigación',
  '/admin/pacientes':     'Gestión de Pacientes',
  '/admin/postulaciones': 'Postulaciones',
  '/admin/visitas':       'Visitas Clínicas',
};

const FEATURE_HINTS = {
  '/admin/protocolos': [
    'Registro y seguimiento de protocolos clínicos',
    'Fases de investigación y cronogramas',
    'Documentación regulatoria y aprobaciones',
  ],
  '/admin/pacientes': [
    'Historial clínico y seguimiento individual',
    'Consentimientos informados digitales',
    'Asignación y seguimiento de tratamientos',
  ],
  '/admin/postulaciones': [
    'Flujo de elegibilidad de candidatos',
    'Revisión y aprobación por comité',
    'Notificaciones automáticas a investigadores',
  ],
  '/admin/visitas': [
    'Agenda de visitas programadas',
    'Registro de eventos en visita',
    'Alertas de visitas vencidas o próximas',
  ],
};

function WrenchIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
