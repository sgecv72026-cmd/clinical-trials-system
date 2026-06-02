import styles from './BadgeEstado.module.css';

const CONFIG = {
  1: { label: 'En Espera',  cls: 'espera'   },
  2: { label: 'Aceptado',   cls: 'aceptado'  },
  3: { label: 'Rechazado',  cls: 'rechazado' },
};

export function BadgeEstado({ idEstado, nombre }) {
  const cfg = CONFIG[idEstado] ?? { label: nombre ?? 'Desconocido', cls: 'espera' };
  return (
    <span className={`${styles.badge} ${styles[cfg.cls]}`}>
      {cfg.label}
    </span>
  );
}
