import { useCallback, useEffect, useState } from 'react';
import reportesService from '../../../services/reportesService';
import styles from './ReportesComite.module.css';

export function ReportesComite() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  /* ── Filtros ─────────────────────────────────────────────────── */
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [idCentro,   setIdCentro]   = useState('');

  const cargar = useCallback(() => {
    setLoading(true);
    setError(null);
    reportesService.getResumenComite({
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      idCentro:   idCentro ? Number(idCentro) : undefined,
    })
      .then(setData)
      .catch(() => setError('No se pudo cargar el reporte.'))
      .finally(() => setLoading(false));
  }, [fechaDesde, fechaHasta, idCentro]);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return <div className={styles.loading}>Cargando reporte…</div>;
  if (error)   return <div className={styles.error}>{error}</div>;
  if (!data)   return null;

  const maxSev  = Math.max(...(data.eventosPorSeveridad?.map(s => Number(s.total))  ?? [1]), 1);
  const maxProt = Math.max(...(data.pacientesPorProtocolo?.map(p => Number(p.total)) ?? [1]), 1);
  const maxEv   = Math.max(...(data.eventosPorProtocolo?.map(p => Number(p.total))  ?? [1]), 1);

  const dem     = data.demografico;
  const maxEdad = dem ? Math.max(...(dem.distribucionEdad?.map(r  => Number(r.total))  ?? [1]), 1) : 1;
  const maxGen  = dem ? Math.max(...(dem.distribucionGenero?.map(g => Number(g.total)) ?? [1]), 1) : 1;
  const maxCom  = dem ? Math.max(...(dem.topComorbilidades?.map(c  => Number(c.total)) ?? [1]), 1) : 1;

  const hayFiltro = idCentro || fechaDesde || fechaHasta;

  return (
    <div className={styles.page}>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <KpiCard label="Pacientes activos"      value={data.totalPacientesActivos} color="blue"  icon={<UsersIcon />} />
        <KpiCard label="Eventos adversos"        value={data.totalEventosAdversos}  color="red"   icon={<AlertIcon />} />
        <KpiCard label="Consentimientos activos" value={data.totalConsentimientos}  color="green" icon={<ClipboardIcon />} />
      </div>

      {/* ── Filtros ────────────────────────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Filtros</h2>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Desde</label>
            <input
              type="date"
              className={styles.filterInput}
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Hasta</label>
            <input
              type="date"
              className={styles.filterInput}
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Centro</label>
            <select
              className={styles.filterSelect}
              value={idCentro}
              onChange={e => setIdCentro(e.target.value)}
            >
              <option value="">Todos los centros</option>
              {data.centrosDisponibles?.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <button className={styles.filterBtn} onClick={cargar}>
            <RefreshIcon /> Actualizar
          </button>
          {hayFiltro && (
            <button
              className={styles.filterBtnClear}
              onClick={() => { setFechaDesde(''); setFechaHasta(''); setIdCentro(''); }}
            >
              Limpiar
            </button>
          )}
        </div>
      </section>

      {/* ── Gráficos: severidad + pacientes por protocolo ──────── */}
      <div className={styles.grid2}>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Eventos adversos por severidad</h2>
          {!data.eventosPorSeveridad?.length ? (
            <p className={styles.empty}>Sin eventos registrados.</p>
          ) : (
            <div className={styles.barChart}>
              {data.eventosPorSeveridad.map(item => (
                <div key={item.nivel} className={styles.barRow}>
                  <span className={styles.barLabel}>{item.nivel}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${severidadClass(item.nivel, styles)}`}
                      style={{ width: `${(Number(item.total) / maxSev) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barValue}>{item.total}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Pacientes por protocolo</h2>
          {!data.pacientesPorProtocolo?.length ? (
            <p className={styles.empty}>Sin pacientes registrados.</p>
          ) : (
            <div className={styles.barChart}>
              {data.pacientesPorProtocolo.map(item => (
                <div key={item.codigo} className={styles.barRow}>
                  <span className={styles.barLabel} title={item.titulo}>{item.codigo}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${styles.barBlue}`}
                      style={{ width: `${(Number(item.total) / maxProt) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barValue}>{item.total}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Eventos adversos por protocolo ─────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Eventos adversos por protocolo</h2>
        {!data.eventosPorProtocolo?.length ? (
          <p className={styles.empty}>Sin eventos por protocolo.</p>
        ) : (
          <div className={styles.barChart}>
            {data.eventosPorProtocolo.map(item => (
              <div key={item.codigo} className={styles.barRow}>
                <span className={styles.barLabel} title={item.titulo}>{item.codigo}</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barOrange}`}
                    style={{ width: `${(Number(item.total) / maxEv) * 100}%` }}
                  />
                </div>
                <span className={styles.barValue}>{item.total}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Progreso de reclutamiento por centro ───────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Progreso de reclutamiento por centro</h2>
        {!data.progresoPorCentro?.length ? (
          <p className={styles.empty}>Sin datos de centros.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Centro</th>
                  <th>Protocolo</th>
                  <th>Activos</th>
                  <th>Meta</th>
                  <th>% Completado</th>
                </tr>
              </thead>
              <tbody>
                {data.progresoPorCentro.map((row, i) => (
                  <tr key={i}>
                    <td>{row.centro}</td>
                    <td>
                      <code className={styles.codigoSmall}>{row.codigoProtocolo}</code>
                      {row.tituloProtocolo && (
                        <span className={styles.tituloSmall}> — {row.tituloProtocolo}</span>
                      )}
                    </td>
                    <td className={styles.numCell}>{row.activos}</td>
                    <td className={styles.numCell}>{row.meta > 0 ? row.meta : '—'}</td>
                    <td>
                      <div className={styles.progCell}>
                        <div className={styles.progTrack}>
                          <div
                            className={styles.progFill}
                            style={{ width: `${Math.min(row.porcentaje ?? 0, 100)}%` }}
                          />
                        </div>
                        <span className={styles.progLabel}>{row.porcentaje ?? 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Tabla completa de eventos adversos ─────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          Eventos adversos{hayFiltro ? ' (filtrados)' : ''}
          <span className={styles.cardCount}>{data.eventos?.length ?? 0}</span>
        </h2>
        {!data.eventos?.length ? (
          <p className={styles.empty}>Sin eventos en el período seleccionado.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Protocolo</th>
                  <th>Severidad</th>
                  <th>Fecha reporte</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {data.eventos.map((ev, i) => (
                  <tr key={i}>
                    <td><span className={styles.pseudonimo}>{ev.pseudonimo}</span></td>
                    <td><code className={styles.codigoSmall}>{ev.protocolo}</code></td>
                    <td>
                      <span className={`${styles.badge} ${severidadClass(ev.severidad, styles)}`}>
                        {ev.severidad}
                      </span>
                    </td>
                    <td className={styles.fechaCell}>{formatFecha(ev.fechaReporte)}</td>
                    <td className={styles.descripcion}>{ev.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Análisis demográfico ────────────────────────────────── */}
      {dem && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Análisis demográfico
            <span className={styles.cardCount}>{dem.totalPacientes} pacientes</span>
          </h2>
          <div className={styles.grid3}>

            {/* Distribución por edad */}
            <div>
              <h3 className={styles.subTitle}>Distribución por edad</h3>
              {!dem.distribucionEdad?.length ? (
                <p className={styles.empty}>Sin datos.</p>
              ) : (
                <div className={styles.barChart}>
                  {dem.distribucionEdad.map(r => (
                    <div key={r.rango} className={styles.barRow}>
                      <span className={styles.barLabel}>{r.rango}</span>
                      <div className={styles.barTrack}>
                        <div
                          className={`${styles.barFill} ${styles.barBlue}`}
                          style={{ width: `${(Number(r.total) / maxEdad) * 100}%` }}
                        />
                      </div>
                      <span className={styles.barValue}>{r.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Distribución por género */}
            <div>
              <h3 className={styles.subTitle}>Distribución por género</h3>
              {!dem.distribucionGenero?.length ? (
                <p className={styles.empty}>Sin datos.</p>
              ) : (
                <div className={styles.barChart}>
                  {dem.distribucionGenero.map(g => (
                    <div key={g.genero} className={styles.barRow}>
                      <span className={styles.barLabel}>{g.genero}</span>
                      <div className={styles.barTrack}>
                        <div
                          className={`${styles.barFill} ${styles.barGreen}`}
                          style={{ width: `${(Number(g.total) / maxGen) * 100}%` }}
                        />
                      </div>
                      <span className={styles.barValue}>{g.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top comorbilidades */}
            <div>
              <h3 className={styles.subTitle}>Top comorbilidades</h3>
              {!dem.topComorbilidades?.length ? (
                <p className={styles.empty}>Sin datos.</p>
              ) : (
                <div className={styles.barChart}>
                  {dem.topComorbilidades.map((c, i) => (
                    <div key={i} className={styles.barRow}>
                      <span className={styles.barLabel} title={c.descripcion}>{c.descripcion}</span>
                      <div className={styles.barTrack}>
                        <div
                          className={`${styles.barFill} ${styles.barYellow}`}
                          style={{ width: `${(Number(c.total) / maxCom) * 100}%` }}
                        />
                      </div>
                      <span className={styles.barValue}>{c.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>
      )}

    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────── */

function KpiCard({ label, value, color, icon }) {
  return (
    <div className={`${styles.kpi} ${styles[`kpi_${color}`]}`}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div>
        <div className={styles.kpiValue}>{value ?? '—'}</div>
        <div className={styles.kpiLabel}>{label}</div>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function severidadClass(nivel, styles) {
  if (!nivel) return styles.barGray;
  const n = nivel.toLowerCase();
  if (n.includes('leve'))                               return styles.barGreen;
  if (n.includes('modera'))                             return styles.barYellow;
  if (n.includes('grave') || n.includes('sever'))       return styles.barOrange;
  if (n.includes('fatal') || n.includes('crít') || n.includes('crit')) return styles.barRed;
  return styles.barGray;
}

function formatFecha(fecha) {
  if (!fecha) return '—';
  const [y, m, d] = String(fecha).split('-');
  return `${d}/${m}/${y}`;
}

/* ── Iconos ──────────────────────────────────────────────────────── */

function UsersIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function AlertIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function ClipboardIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function RefreshIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}
