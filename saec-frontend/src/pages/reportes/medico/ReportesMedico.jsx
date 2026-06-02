import { useEffect, useState } from 'react';
import reportesService from '../../../services/reportesService';
import styles from './ReportesMedico.module.css';

export function ReportesMedico() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    reportesService.getResumenMedico()
      .then(setData)
      .catch(() => setError('No se pudo cargar el reporte.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Cargando reporte…</div>;
  if (error)   return <div className={styles.error}>{error}</div>;
  if (!data)   return null;

  const maxEstado = Math.max(...(data.visitasPorEstado?.map(e => Number(e.total)) ?? [1]), 1);

  return (
    <div className={styles.page}>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <KpiCard label="Total de pacientes"  value={data.totalPacientes}        color="blue"   icon={<UsersIcon />} />
        <KpiCard label="Pacientes activos"   value={data.pacientesActivos}       color="green"  icon={<UserCheckIcon />} />
        <KpiCard label="Visitas esta semana" value={data.visitasEstaSemana}      color="indigo" icon={<CalendarIcon />} />
        <KpiCard label="Visitas pendientes"  value={data.visitasPendientes}      color="yellow" icon={<ClockIcon />} />
        <KpiCard label="Visitas vencidas"    value={data.visitasVencidasCount}   color="red"    icon={<AlertIcon />} />
      </div>

      {/* ── Visitas por estado + Próximas visitas ──────────────── */}
      <div className={styles.grid2}>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Visitas por estado</h2>
          {!data.visitasPorEstado?.length ? (
            <p className={styles.empty}>Sin visitas registradas.</p>
          ) : (
            <div className={styles.barChart}>
              {data.visitasPorEstado.map(item => (
                <div key={item.estado} className={styles.barRow}>
                  <span className={styles.barLabel}>{item.estado}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${estadoBarClass(item.estado, styles)}`}
                      style={{ width: `${(Number(item.total) / maxEstado) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barValue}>{item.total}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Próximas visitas</h2>
          {!data.proximasVisitas?.length ? (
            <p className={styles.empty}>No hay visitas programadas próximamente.</p>
          ) : (
            <div className={styles.agendaList}>
              {data.proximasVisitas.map((v, i) => (
                <div key={i} className={styles.agendaItem}>
                  <div className={styles.agendaDate}>
                    <span className={styles.agendaDay}>{formatDay(v.fechaProgramada)}</span>
                    <span className={styles.agendaMon}>{formatMonth(v.fechaProgramada)}</span>
                  </div>
                  <div className={styles.agendaInfo}>
                    <span className={styles.agendaPseudo}>{v.pseudonimo}</span>
                    <span className={styles.agendaVisita}>{v.nombreVisita}</span>
                    {v.semana != null && (
                      <span className={styles.agendaSem}>Semana {v.semana}</span>
                    )}
                  </div>
                  <span className={`${styles.badge} ${estadoBadgeClass(v.estado, styles)}`}>
                    {v.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Visitas vencidas ────────────────────────────────────── */}
      <section className={styles.card}>
        <h2 className={`${styles.cardTitle} ${styles.cardTitleDanger}`}>
          <AlertIcon />
          Visitas vencidas
          {(data.visitasVencidasCount ?? 0) > 0 && (
            <span className={styles.dangCount}>{data.visitasVencidasCount}</span>
          )}
        </h2>
        {!data.visitasVencidas?.length ? (
          <p className={styles.empty}>No hay visitas vencidas. ✓</p>
        ) : (
          <div className={styles.vencidasList}>
            {data.visitasVencidas.map((v, i) => (
              <div key={i} className={styles.vencidaItem}>
                <div className={styles.vencidaDate}>
                  <span className={styles.vencidaDay}>{formatDay(v.fechaProgramada)}</span>
                  <span className={styles.vencidaMon}>{formatMonth(v.fechaProgramada)}</span>
                </div>
                <div className={styles.vencidaInfo}>
                  <span className={styles.vencidaPseudo}>{v.pseudonimo}</span>
                  <span className={styles.vencidaNombre}>{v.nombreVisita}</span>
                  {v.semana != null && (
                    <span className={styles.vencidaSem}>Semana {v.semana}</span>
                  )}
                </div>
                <span className={`${styles.badge} ${styles.badgeRed}`}>Vencida</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Adherencia al tratamiento ───────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Adherencia al tratamiento</h2>
        {!data.adherenciaPacientes?.length ? (
          <p className={styles.empty}>Sin datos de adherencia.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Adherencia</th>
                  <th>%</th>
                  <th>Administradas / Planificadas</th>
                </tr>
              </thead>
              <tbody>
                {data.adherenciaPacientes.map((a, i) => (
                  <tr key={i}>
                    <td><span className={styles.pseudonimo}>{a.pseudonimo}</span></td>
                    <td>
                      <div className={styles.progCell}>
                        <div className={styles.progTrack}>
                          <div
                            className={`${styles.progFill} ${adherenciaFillClass(a.porcentaje, styles)}`}
                            style={{ width: `${Math.min(a.porcentaje ?? 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={styles.numCell}>
                      <span className={adherenciaTextClass(a.porcentaje, styles)}>
                        {a.porcentaje ?? 0}%
                      </span>
                    </td>
                    <td className={styles.numCell}>
                      {a.administradas} / {a.planificadas}
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

/* ── Helpers ─────────────────────────────────────────────────────── */

function estadoBarClass(estado, styles) {
  const e = (estado ?? '').toLowerCase();
  if (e.includes('program')) return styles.barBlue;
  if (e.includes('realiz'))  return styles.barGreen;
  if (e.includes('cancel'))  return styles.barRed;
  if (e.includes('reprog'))  return styles.barYellow;
  return styles.barGray;
}

function estadoBadgeClass(estado, styles) {
  const e = (estado ?? '').toLowerCase();
  if (e.includes('program')) return styles.badgeBlue;
  if (e.includes('realiz'))  return styles.badgeGreen;
  if (e.includes('cancel'))  return styles.badgeRed;
  if (e.includes('reprog'))  return styles.badgeYellow;
  return styles.badgeGray;
}

function adherenciaFillClass(pct, styles) {
  if (pct == null) return styles.progFillGray;
  if (pct >= 80)   return styles.progFill;
  if (pct >= 50)   return styles.progFillWarn;
  return styles.progFillDanger;
}

function adherenciaTextClass(pct, styles) {
  if (pct == null) return '';
  if (pct >= 80)   return styles.numGreen;
  if (pct >= 50)   return styles.numYellow;
  return styles.numRed;
}

function formatDay(fecha) {
  if (!fecha) return '—';
  return String(fecha).split('-')[2];
}
function formatMonth(fecha) {
  if (!fecha) return '';
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const m = parseInt(String(fecha).split('-')[1], 10) - 1;
  return months[m] ?? '';
}

/* ── Iconos ──────────────────────────────────────────────────────── */

function UsersIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function UserCheckIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;
}
function CalendarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ClockIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function AlertIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
