import styles from './PageLoader.module.css';

export function PageLoader({ message = 'Cargando…' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className={styles.tableWrap}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={styles.skeletonRow}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className={styles.skeletonCell}
              style={{ width: `${60 + Math.random() * 30}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
