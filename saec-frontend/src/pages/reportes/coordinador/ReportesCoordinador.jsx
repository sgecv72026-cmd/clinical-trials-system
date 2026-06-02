import { useEffect, useState } from 'react';
import reportesService from '../../../services/reportesService';
import styles from './ReportesCoordinador.module.css';

export function ReportesCoordinador() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    reportesService.getResumenCoordinador()
      .then(setData)
      .catch(() => setError('No se pudo cargar el reporte.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Cargando reporte…</div>;
  if (error)   return <div className={styles.error}>{error}</div>;
  if (!data)   return null;

  return (
    <div className={styles.page}>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <KpiCard label="Total candidatos" value={data.totalCandidatos} color="blue"   icon={<UsersIcon />} />
        <KpiCard label="En espera"         value={data.enEspera}        color="yellow" icon={<ClockIcon />} />
        <KpiCard label="Aprobados"         value={data.aprobados}       color="green"  icon={<CheckIcon />} />
        <KpiCard label="Rechazados"        value={data.rechazados}      color="red"    icon={<XIcon />} />
      </div>

      {/* ── Tasa de aprobación ─────────────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Tasa de aprobación global</h2>
        <div className={styles.rateRow}>
          <span className={styles.rateValue}>{data.tasaAprobacion ?? 0}%</span>
          <div className={styles.rateBar}>
            <div
              className={styles.rateBarFill}
              style={{ width: `${data.tasaAprobacion ?? 0}%` }}
            />
          </div>
        </div>
        <div className={styles.funnelBar}>
          {data.totalCandidatos > 0 && (
            <>
              {data.aprobados > 0 && (
                <div
                  className={`${styles.funnelSegment} ${styles.funnelGreen}`}
                  style={{ flex: data.aprobados }}
                  title={`Aprobados: ${data.aprobados}`}
                />
              )}
              {data.enEspera > 0 && (
                <div
                  className={`${styles.funnelSegment} ${styles.funnelYellow}`}
                  style={{ flex: data.enEspera }}
                  title={`En espera: ${data.enEspera}`}
                />
              )}
              {data.rechazados > 0 && (
                <div
                  className={`${styles.funnelSegment} ${styles.funnelRed}`}
                  style={{ flex: data.rechazados }}
                  title={`Rechazados: ${data.rechazados}`}
                />
              )}
            </>
          )}
        </div>
        <div className={styles.funnelLegend}>
          <span className={styles.legendGreen}>● Aprobados</span>
          <span className={styles.legendYellow}>● En espera</span>
          <span className={styles.legendRed}>● Rechazados</span>
        </div>
      </section>

      {/* ── Reclutamiento por protocolo ────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Reclutamiento por protocolo</h2>
        {!data.porProtocolo?.length ? (
          <p className={styles.empty}>Sin postulaciones registradas.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Total</th>
                  <th>Aprobados</th>
                  <th>En espera</th>
                  <th>Rechazados</th>
                  <th>Meta</th>
                  <th>% Llenado</th>
                </tr>
              </thead>
              <tbody>
                {data.porProtocolo.map((p, i) => (
                  <tr key={i}>
                    <td><code className={styles.codigo}>{p.codigo}</code></td>
                    <td className={styles.titulo}>{p.titulo}</td>
                    <td className={styles.numCell}>{p.total}</td>
                    <td className={styles.numCell}><span className={styles.numGreen}>{p.aprobados}</span></td>
                    <td className={styles.numCell}><span className={styles.numYellow}>{p.enEspera}</span></td>
                    <td className={styles.numCell}><span className={styles.numRed}>{p.rechazados}</span></td>
                    <td className={styles.numCell}>{p.meta > 0 ? p.meta : '—'}</td>
                    <td>
                      <div className={styles.progCell}>
                        <div className={styles.progTrack}>
                          <div
                            className={styles.progFill}
                            style={{ width: `${p.porcentajeLlenado ?? 0}%` }}
                          />
                        </div>
                        <span className={styles.progLabel}>{p.porcentajeLlenado ?? 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Reclutamiento por centro ────────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Reclutamiento por centro</h2>
        {!data.porCentro?.length ? (
          <p className={styles.empty}>Sin datos de centros.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Centro</th>
                  <th>Total postulantes</th>
                  <th>Aprobados</th>
                  <th>Meta</th>
                  <th>% Llenado</th>
                </tr>
              </thead>
              <tbody>
                {data.porCentro.map((c, i) => (
                  <tr key={i}>
                    <td className={styles.centroNombre}>{c.centro}</td>
                    <td className={styles.numCell}>{c.total}</td>
                    <td className={styles.numCell}><span className={styles.numGreen}>{c.aprobados}</span></td>
                    <td className={styles.numCell}>{c.meta > 0 ? c.meta : '—'}</td>
                    <td>
                      <div className={styles.progCell}>
                        <div className={styles.progTrack}>
                          <div
                            className={styles.progFill}
                            style={{ width: `${Math.min(c.porcentajeLlenado ?? 0, 100)}%` }}
                          />
                        </div>
                        <span className={styles.progLabel}>{c.porcentajeLlenado ?? 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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

/* ── Iconos ──────────────────────────────────────────────────────── */

function UsersIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ClockIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function CheckIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function XIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
