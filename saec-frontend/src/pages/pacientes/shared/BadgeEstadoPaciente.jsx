import styles from './BadgeEstadoPaciente.module.css';

export function BadgeEstadoPaciente({ activo }) {
  return (
    <span className={`${styles.badge} ${activo ? styles.activo : styles.inactivo}`}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}
