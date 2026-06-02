import styles from './StatCard.module.css';

export function StatCard({ label, value, icon, color = 'blue', sub, trend }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>{icon}</div>
        {trend != null && (
          <span className={`${styles.trend} ${trend >= 0 ? styles.up : styles.down}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className={styles.value}>{value ?? <span className={styles.skeleton} />}</div>
      <div className={styles.label}>{label}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
