import styles from './Badge.module.css';

const VARIANTS = {
  success: styles.success,
  error:   styles.error,
  warning: styles.warning,
  info:    styles.info,
  purple:  styles.purple,
  gray:    styles.gray,
  cyan:    styles.cyan,
};

export function Badge({ children, variant = 'gray', dot = false }) {
  return (
    <span className={`${styles.badge} ${VARIANTS[variant] ?? styles.gray}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}

export function RolBadge({ rol }) {
  const MAP = {
    'Administrador':               { variant: 'purple',  label: 'Administrador' },
    'Investigador Principal':      { variant: 'info',    label: 'Investigador' },
    'Médico Tratante':             { variant: 'cyan',    label: 'Médico' },
    'Coordinador de Reclutamiento':{ variant: 'warning', label: 'Coordinador' },
    'Comité de Ética':             { variant: 'success', label: 'Comité de Ética' },
  };
  const config = MAP[rol] ?? { variant: 'gray', label: rol };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ActivoBadge({ activo }) {
  return activo
    ? <Badge variant="success" dot>Activo</Badge>
    : <Badge variant="error"   dot>Inactivo</Badge>;
}
