import styles from './Pagination.module.css';

export function Pagination({ page, totalPages, totalElements, size, onPageChange }) {
  if (totalPages <= 1) return null;

  const start = page * size + 1;
  const end   = Math.min((page + 1) * size, totalElements);

  const pages = buildPageRange(page, totalPages);

  return (
    <div className={styles.wrapper}>
      <span className={styles.info}>
        Mostrando <strong>{start}–{end}</strong> de <strong>{totalElements}</strong>
      </span>
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          aria-label="Primera página"
        >«</button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Anterior"
        >‹</button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
          ) : (
            <button
              key={p}
              className={`${styles.btn} ${p === page ? styles.active : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p + 1}
            </button>
          )
        )}

        <button
          className={styles.btn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Siguiente"
        >›</button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          aria-label="Última página"
        >»</button>
      </div>
    </div>
  );
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  if (current < 4) return [0,1,2,3,4,'…',total-1];
  if (current > total - 5) return [0,'…',total-5,total-4,total-3,total-2,total-1];
  return [0,'…',current-1,current,current+1,'…',total-1];
}
