import styles from './HistorialPostulacion.module.css';

export function HistorialPostulacion({ historial = [] }) {
  if (!historial.length) {
    return <p className={styles.empty}>Sin cambios de estado registrados.</p>;
  }

  return (
    <div className={styles.timeline}>
      {historial.map((mod, i) => (
        <div key={mod.idModificacion ?? i} className={styles.item}>
          <div className={styles.dot} />
          <div className={styles.content}>
            <div className={styles.header}>
              <span className={styles.actor}>{mod.nombreUsuario}</span>
              <span className={styles.fecha}>{formatFecha(mod.fechaModificacion)}</span>
            </div>
            <p className={styles.cambio}>
              {mod.estadoAnterior
                ? <><strong>{mod.estadoAnterior}</strong> → <strong>{mod.estadoNuevo}</strong></>
                : <>Registrado con estado <strong>{mod.estadoNuevo}</strong></>
              }
            </p>
            {mod.motivo && (
              <p className={styles.motivo}>
                <span className={styles.motivoLabel}>Motivo:</span> {mod.motivo}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
