import { useCallback, useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { Badge }    from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/PageLoader';
import styles from './AuditoriaPage.module.css';

const ACCIONES  = ['INSERT', 'UPDATE', 'DELETE', 'LOGIN'];
const PAGE_SIZE = 20;

const ACCION_VARIANT = { INSERT: 'success', UPDATE: 'info', DELETE: 'error', LOGIN: 'cyan' };

export function AuditoriaPage() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(0);
  const [filters,   setFilters]   = useState({ accion: '', tabla: '', usuario: '', desde: '', hasta: '' });
  const [detalleReg, setDetalleReg] = useState(null);

  const fetchData = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getAuditoria({
        accion:        filters.accion   || undefined,
        tabla:         filters.tabla    || undefined,
        nombreUsuario: filters.usuario  || undefined,
        desde:         filters.desde    || undefined,
        hasta:         filters.hasta    || undefined,
        page: p, size: PAGE_SIZE,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(0); setPage(0); }, [fetchData]);

  function handleFilter(e) {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  }

  function handlePage(p) { setPage(p); fetchData(p); }

  return (
    <div className={styles.page}>
      {/* Modal de detalle */}
      {detalleReg && (
        <DetalleBitacoraModal reg={detalleReg} onClose={() => setDetalleReg(null)} />
      )}

      {/* Aviso de solo lectura */}
      <div className={styles.readonlyBanner}>
        <LockIcon />
        La bitácora de auditoría es de <strong>solo lectura</strong>.
        Registra automáticamente todas las operaciones sensibles del sistema clínico y no puede ser modificada.
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <select name="accion" value={filters.accion} onChange={handleFilter} className={styles.select}>
          <option value="">Todas las acciones</option>
          {ACCIONES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          className={styles.filterInput}
          type="text" name="tabla"
          value={filters.tabla} onChange={handleFilter}
          placeholder="Tabla afectada…"
        />
        <input
          className={styles.filterInput}
          type="text" name="usuario"
          value={filters.usuario} onChange={handleFilter}
          placeholder="Buscar usuario…"
        />
        <div className={styles.dateRange}>
          <input type="date" name="desde" value={filters.desde} onChange={handleFilter} className={styles.filterInput} />
          <span className={styles.dateSep}>—</span>
          <input type="date" name="hasta" value={filters.hasta} onChange={handleFilter} className={styles.filterInput} />
        </div>
        <button
          className={styles.clearBtn}
          onClick={() => setFilters({ accion: '', tabla: '', usuario: '', desde: '', hasta: '' })}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>
            {data ? `${data.totalElements.toLocaleString()} registro${data.totalElements !== 1 ? 's' : ''}` : '…'}
          </span>
          <span className={styles.tableSub}>Ordenado por fecha descendente</span>
        </div>

        {loading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : data?.content?.length === 0 ? (
          <div className={styles.empty}>
            <EmptyIcon />
            <p>No se encontraron registros con los filtros aplicados</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha / Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Tabla afectada</th>
                  <th>ID Registro</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {data?.content?.map(reg => (
                  <tr key={reg.idAuditoria}>
                    <td className={styles.idCell}>{reg.idAuditoria}</td>
                    <td className={styles.dateCell}>
                      <div className={styles.dateMain}>{formatDate(reg.fechaHora)}</div>
                      <div className={styles.dateTime}>{formatTime(reg.fechaHora)}</div>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userAvatar}>
                          {(reg.nombreUsuario ?? 'S')[0]}
                        </span>
                        <div>
                          <div className={styles.userName}>{reg.nombreUsuario}</div>
                          <div className={styles.userEmail}>{reg.emailUsuario}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={ACCION_VARIANT[reg.accion] ?? 'gray'}>
                        {reg.accion}
                      </Badge>
                    </td>
                    <td className={styles.tablaCell}>{reg.tablaAfectada}</td>
                    <td className={styles.idCell}>{reg.idRegistro ?? '—'}</td>
                    <td>
                      {reg.detalle ? (
                        <button
                          className={styles.detalleBtn}
                          onClick={() => setDetalleReg(reg)}
                          title="Ver detalle"
                        >
                          <JsonIcon />
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && !loading && (
          <div className={styles.paginationWrap}>
            <Pagination
              page={page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              size={PAGE_SIZE}
              onPageChange={handlePage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Modal de detalle de bitácora ───────────────────────────────── */
function DetalleBitacoraModal({ reg, onClose }) {
  if (!reg) return null;

  let parsed = null;
  let antes   = null;
  let despues = null;
  try {
    parsed  = JSON.parse(reg.detalle);
    antes   = parsed.antes   ?? parsed.before ?? null;
    despues = parsed.despues ?? parsed.after  ?? null;
  } catch (_) {
    // detalle no es JSON válido
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <Badge variant={ACCION_VARIANT[reg.accion] ?? 'gray'}>{reg.accion}</Badge>
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--color-gray-600)' }}>
              {reg.tablaAfectada}{reg.idRegistro != null ? ` #${reg.idRegistro}` : ''}
            </span>
          </div>
          <button className={styles.modalClose} onClick={onClose} title="Cerrar">
            <XIcon />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalMeta}>
            <span className={styles.modalMetaDot}>{formatDate(reg.fechaHora)} {formatTime(reg.fechaHora)}</span>
            <span>·</span>
            <span className={styles.modalMetaDot}>{reg.nombreUsuario ?? 'Sistema'}</span>
            {reg.emailUsuario && (
              <span className={styles.modalMetaEmail}>&lt;{reg.emailUsuario}&gt;</span>
            )}
          </div>

          {/* Tabla de resumen */}
          <table className={styles.modalTabla}>
            <tbody>
              <tr><td>Acción</td><td><Badge variant={ACCION_VARIANT[reg.accion] ?? 'gray'}>{reg.accion}</Badge></td></tr>
              <tr><td>Tabla</td><td style={{ fontFamily: 'monospace' }}>{reg.tablaAfectada}</td></tr>
              {reg.idRegistro != null && <tr><td>ID registro</td><td>{reg.idRegistro}</td></tr>}
            </tbody>
          </table>

          {/* JSON antes / después */}
          {antes && (
            <div className={styles.jsonSection}>
              <span className={`${styles.jsonLabel} ${styles.jsonLabelAntes}`}>Antes</span>
              <pre className={`${styles.jsonPre} ${styles.jsonPreAntes}`}>
                {JSON.stringify(antes, null, 2)}
              </pre>
            </div>
          )}
          {despues && (
            <div className={styles.jsonSection}>
              <span className={`${styles.jsonLabel} ${styles.jsonLabelDespues}`}>Después</span>
              <pre className={`${styles.jsonPre} ${styles.jsonPreDespues}`}>
                {JSON.stringify(despues, null, 2)}
              </pre>
            </div>
          )}

          {/* Si no hay antes/después pero hay detalle, mostrar el JSON completo */}
          {!antes && !despues && reg.detalle && (
            <div className={styles.jsonSection}>
              <span className={styles.jsonLabel}>Detalle</span>
              <pre className={styles.jsonPre}>
                {parsed ? JSON.stringify(parsed, null, 2) : reg.detalle}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Utilidades ─────────────────────────────────────────────────── */
function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── Iconos SVG ──────────────────────────────────────────────────── */
function LockIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function EmptyIcon() { return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function JsonIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>; }
function XIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
