import styles from './Steps.module.css';

export function Step2Criterios({ data, onChange }) {
  function addCriterio(tipo) {
    onChange(prev => ({
      ...prev,
      criterios: [...prev.criterios, { tipo, descripcion: '' }],
    }));
  }

  function removeCriterio(idx) {
    onChange(prev => ({
      ...prev,
      criterios: prev.criterios.filter((_, i) => i !== idx),
    }));
  }

  function updateCriterio(idx, descripcion) {
    onChange(prev => ({
      ...prev,
      criterios: prev.criterios.map((c, i) => i === idx ? { ...c, descripcion } : c),
    }));
  }

  const inclusion = data.criterios.filter(c => c.tipo === 'inclusion');
  const exclusion = data.criterios.filter(c => c.tipo === 'exclusion');
  const allCriterios = data.criterios;

  return (
    <div className={styles.stepContent}>
      <p className={styles.hint}>
        Define los criterios que determinarán qué pacientes pueden participar en el protocolo.
      </p>

      {/* Inclusión */}
      <div className={styles.criterioSection}>
        <div className={styles.criterioHeader}>
          <span className={`${styles.tipoBadge} ${styles.inclusion}`}>Inclusión</span>
          <button
            type="button"
            className={styles.addSmallBtn}
            onClick={() => addCriterio('inclusion')}
          >
            + Agregar
          </button>
        </div>
        {inclusion.length === 0 && (
          <p className={styles.emptyHint}>Sin criterios de inclusión aún.</p>
        )}
        {allCriterios.map((c, idx) => c.tipo === 'inclusion' && (
          <div key={idx} className={styles.criterioRow}>
            <input
              className={styles.input}
              value={c.descripcion}
              onChange={e => updateCriterio(idx, e.target.value)}
              placeholder="Describe el criterio…"
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeCriterio(idx)}
              aria-label="Eliminar criterio"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {/* Exclusión */}
      <div className={styles.criterioSection}>
        <div className={styles.criterioHeader}>
          <span className={`${styles.tipoBadge} ${styles.exclusion}`}>Exclusión</span>
          <button
            type="button"
            className={styles.addSmallBtn}
            onClick={() => addCriterio('exclusion')}
          >
            + Agregar
          </button>
        </div>
        {exclusion.length === 0 && (
          <p className={styles.emptyHint}>Sin criterios de exclusión aún.</p>
        )}
        {allCriterios.map((c, idx) => c.tipo === 'exclusion' && (
          <div key={idx} className={styles.criterioRow}>
            <input
              className={styles.input}
              value={c.descripcion}
              onChange={e => updateCriterio(idx, e.target.value)}
              placeholder="Describe el criterio…"
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeCriterio(idx)}
              aria-label="Eliminar criterio"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
