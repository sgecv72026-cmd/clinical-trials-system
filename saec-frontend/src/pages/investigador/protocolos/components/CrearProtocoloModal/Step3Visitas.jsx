import { useState, useEffect } from 'react';
import styles from './Steps.module.css';
import genStyles from './Step3Visitas.module.css';

const DIAS = [
  { value: 1, label: 'Lunes'     },
  { value: 2, label: 'Martes'    },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves'    },
  { value: 5, label: 'Viernes'   },
  { value: 6, label: 'Sábado'    },
  { value: 7, label: 'Domingo'   },
];

/** Calcula cuántas semanas hay entre fechaInicio y fechaFin (ambas 'YYYY-MM-DD'). */
function calcSemanasProtocolo(fechaInicio, fechaFin) {
  if (!fechaFin) return null;
  const start = fechaInicio ? new Date(fechaInicio) : new Date();
  const end   = new Date(fechaFin);
  const diffMs = end - start;
  if (diffMs <= 0) return null;
  return Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
}

const GEN_INITIAL = {
  semanaDesde: '1',
  semanaHasta: '',
  diasSeleccionados: [],
  prefijo: 'Visita',
  saltarSemanas: '0',
};

export function Step3Visitas({ data, onChange }) {
  const [genOpen, setGenOpen]   = useState(false);
  const [gen,     setGen]       = useState(GEN_INITIAL);
  const [genErr,  setGenErr]    = useState('');

  /* Calcula el límite de semanas y lo auto-rellena cuando se abre el generador */
  const maxSemanas = calcSemanasProtocolo(data.fechaInicio, data.fechaFinEstimada);

  useEffect(() => {
    if (genOpen && maxSemanas !== null) {
      setGen(p => ({ ...p, semanaHasta: String(maxSemanas) }));
    }
  }, [genOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ──── Generador automático ──────────────────────────────── */
  function toggleDia(dia) {
    setGen(prev => ({
      ...prev,
      diasSeleccionados: prev.diasSeleccionados.includes(dia)
        ? prev.diasSeleccionados.filter(d => d !== dia)
        : [...prev.diasSeleccionados, dia].sort((a, b) => a - b),
    }));
  }

  function calcPreview() {
    const desde  = parseInt(gen.semanaDesde) || 0;
    const hasta  = parseInt(gen.semanaHasta) || 0;
    const saltar = parseInt(gen.saltarSemanas) || 0;
    const dias   = gen.diasSeleccionados.length;
    if (desde < 1 || hasta < desde || dias === 0) return null;
    let count = 0;
    for (let s = desde; s <= hasta; s += (saltar + 1)) count++;
    return count * dias;
  }

  function handleGenerar() {
    const desde  = parseInt(gen.semanaDesde);
    const hasta  = parseInt(gen.semanaHasta);
    const saltar = parseInt(gen.saltarSemanas) || 0;

    if (!desde || desde < 1)          { setGenErr('La semana de inicio debe ser ≥ 1.'); return; }
    if (!hasta || hasta < desde)      { setGenErr('La semana de fin debe ser mayor o igual a la de inicio.'); return; }
    if (gen.diasSeleccionados.length === 0) { setGenErr('Selecciona al menos un día de la semana.'); return; }
    setGenErr('');

    const nuevasVisitas = [];
    let visitaNum = data.visitas.length + 1;
    for (let s = desde; s <= hasta; s += (saltar + 1)) {
      for (const dia of gen.diasSeleccionados) {
        // Evitar duplicados (misma semana + mismo día ya existente)
        const existe = data.visitas.some(v => Number(v.semana) === s && Number(v.dia) === dia);
        if (!existe) {
          const nombreDia = DIAS.find(d => d.value === dia)?.label ?? dia;
          nuevasVisitas.push({
            semana:       String(s),
            dia:          String(dia),
            nombreVisita: gen.prefijo ? `${gen.prefijo} S${s}-${nombreDia}` : '',
            descripcion:  '',
            medicamentos: [],
          });
          visitaNum++;
        }
      }
    }

    if (nuevasVisitas.length === 0) {
      setGenErr('Todas las visitas generadas ya existen. Modifica el rango o los días.');
      return;
    }

    onChange(prev => ({ ...prev, visitas: [...prev.visitas, ...nuevasVisitas] }));
    setGenOpen(false);
    setGen(GEN_INITIAL);
  }

  /* ──── Edición manual ────────────────────────────────────── */
  function addVisita() {
    onChange(prev => ({
      ...prev,
      visitas: [
        ...prev.visitas,
        { semana: '', dia: '', nombreVisita: '', descripcion: '', medicamentos: [] },
      ],
    }));
  }

  function removeVisita(idx) {
    onChange(prev => ({ ...prev, visitas: prev.visitas.filter((_, i) => i !== idx) }));
  }

  function updateVisita(idx, field, value) {
    onChange(prev => ({
      ...prev,
      visitas: prev.visitas.map((v, i) => i === idx ? { ...v, [field]: value } : v),
    }));
  }

  const preview = calcPreview();

  return (
    <div className={styles.stepContent}>
      <p className={styles.hint}>
        Programa las visitas del protocolo. Usa el generador para crear visitas en lote rápidamente,
        o agrégalas una a una de forma manual.
      </p>

      {/* ── Generador en lote ── */}
      <div className={genStyles.generatorCard}>
        <button
          type="button"
          className={genStyles.generatorToggle}
          onClick={() => { setGenOpen(v => !v); setGenErr(''); }}
        >
          <BoltIcon />
          Generador de visitas en lote
          <span className={genStyles.chevron}>{genOpen ? '▲' : '▼'}</span>
        </button>

        {genOpen && (
          <div className={genStyles.generatorBody}>
            <p className={genStyles.genHint}>
              Define el rango de semanas y los días de la semana en que se realizarán las visitas.
              El sistema generará una entrada por cada combinación semana-día.
            </p>

            <div className={genStyles.genRow3}>
              <div className={styles.field}>
                <label className={styles.label}>Semana inicio</label>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  value={gen.semanaDesde}
                  onChange={e => setGen(p => ({ ...p, semanaDesde: e.target.value }))}
                  placeholder="Ej. 1"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Semana fin</label>
                {maxSemanas === null ? (
                  <>
                    <p className={genStyles.noFechaWarn}>
                      ⚠ Sin fecha de fin — define la fecha de fin estimada en el Paso 1 para calcular automáticamente.
                    </p>
                    <input
                      className={styles.input}
                      type="number"
                      min="1"
                      value={gen.semanaHasta}
                      onChange={e => setGen(p => ({ ...p, semanaHasta: e.target.value }))}
                      placeholder="Ej. 52"
                    />
                  </>
                ) : (
                  <>
                    <input
                      className={`${styles.input} ${genStyles.inputCalc}`}
                      type="number"
                      value={gen.semanaHasta}
                      readOnly
                    />
                    <span className={genStyles.fieldNote}>
                      Calculado automáticamente · máx.&nbsp;<strong>{maxSemanas}</strong> semana{maxSemanas !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Saltar semanas</label>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  value={gen.saltarSemanas}
                  onChange={e => setGen(p => ({ ...p, saltarSemanas: e.target.value }))}
                  placeholder="0 = todas"
                  title="0 = todas las semanas, 1 = semanas alternas, 3 = cada mes"
                />
                <span className={genStyles.fieldNote}>0 = todas · 1 = alternas · 3 = cada mes</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Días de la semana</label>
              <div className={genStyles.daysGrid}>
                {DIAS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    className={`${genStyles.dayBtn} ${gen.diasSeleccionados.includes(d.value) ? genStyles.dayBtnActive : ''}`}
                    onClick={() => toggleDia(d.value)}
                  >
                    {d.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Prefijo de nombre</label>
              <input
                className={styles.input}
                value={gen.prefijo}
                onChange={e => setGen(p => ({ ...p, prefijo: e.target.value }))}
                placeholder="Ej. Visita"
              />
              <span className={genStyles.fieldNote}>
                Nombre resultante: "{gen.prefijo || 'Visita'} S1-Lunes", "{gen.prefijo || 'Visita'} S1-Martes"…
              </span>
            </div>

            {preview !== null && (
              <div className={genStyles.previewBanner}>
                <InfoIcon />
                Se generarán <strong>{preview}</strong> visita{preview !== 1 ? 's' : ''} (las que ya existen se omiten).
              </div>
            )}

            {genErr && <p className={genStyles.genError}>{genErr}</p>}

            <div className={genStyles.genActions}>
              <button type="button" className={genStyles.genCancelBtn} onClick={() => { setGenOpen(false); setGenErr(''); setGen(GEN_INITIAL); }}>
                Cancelar
              </button>
              <button type="button" className={genStyles.genSubmitBtn} onClick={handleGenerar}>
                <BoltIcon />
                Generar visitas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Lista de visitas ── */}
      {data.visitas.length === 0 ? (
        <p className={styles.emptyHint}>No hay visitas programadas aún. Usa el generador o agrega una manualmente.</p>
      ) : (
        <div className={genStyles.visitasList}>
          <div className={genStyles.visitasHeader}>
            <span className={genStyles.visitasCount}>{data.visitas.length} visita{data.visitas.length !== 1 ? 's' : ''}</span>
            <button type="button" className={genStyles.clearAllBtn} onClick={() => onChange(p => ({ ...p, visitas: [] }))}>
              Limpiar todo
            </button>
          </div>

          {data.visitas.map((v, idx) => (
            <div key={idx} className={styles.visitaCard}>
              <div className={styles.visitaCardHeader}>
                <span className={styles.visitaNum}>Visita {idx + 1}</span>
                <button type="button" className={styles.removeBtn} onClick={() => removeVisita(idx)} aria-label="Eliminar visita">
                  <TrashIcon />
                </button>
              </div>

              <div className={styles.row3}>
                <div className={styles.field}>
                  <label className={styles.label}>Semana <span className={styles.req}>*</span></label>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={v.semana}
                    onChange={e => updateVisita(idx, 'semana', e.target.value)}
                    placeholder="Ej. 1"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Día <span className={styles.req}>*</span></label>
                  <select
                    className={styles.select}
                    value={v.dia}
                    onChange={e => updateVisita(idx, 'dia', e.target.value)}
                  >
                    <option value="">Día…</option>
                    {DIAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Nombre</label>
                  <input
                    className={styles.input}
                    value={v.nombreVisita}
                    onChange={e => updateVisita(idx, 'nombreVisita', e.target.value)}
                    placeholder="Ej. Visita Basal"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Descripción</label>
                <input
                  className={styles.input}
                  value={v.descripcion}
                  onChange={e => updateVisita(idx, 'descripcion', e.target.value)}
                  placeholder="Descripción breve (opcional)"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className={styles.addBtn} onClick={addVisita}>
        + Agregar visita manual
      </button>
    </div>
  );
}

function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function BoltIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function InfoIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
