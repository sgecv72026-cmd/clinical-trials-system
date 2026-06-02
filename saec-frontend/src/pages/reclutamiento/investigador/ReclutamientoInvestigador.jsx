import { useState, useEffect, useMemo } from 'react';
import reclutamientoService from '../../../services/reclutamientoService';
import { BadgeEstado } from '../shared/BadgeEstado';
import styles from './ReclutamientoInvestigador.module.css';

/* ── Vista del Investigador Principal ──────────────────────── */
export function ReclutamientoInvestigador({ vistaInicial = 'pendientes' }) {
  const [tab, setTab]               = useState(vistaInicial);
  const [pendientes, setPendientes] = useState([]);
  const [historial, setHistorial]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');

  /* Modal de detalle + decisión */
  const [modalPost,      setModalPost]      = useState(null);   // postulacion card seleccionada
  const [detalle,        setDetalle]        = useState(null);   // CandidatoDetalleDto
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [vistaModal,     setVistaModal]     = useState('detalle'); // 'detalle' | 'rechazar'

  /* Acciones */
  const [motivo,    setMotivo]    = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      reclutamientoService.getPostulacionesPendientes(),
      reclutamientoService.getPostulacionesHistorial(),
    ])
      .then(([p, h]) => { setPendientes(p); setHistorial(h); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  /* ── Abrir modal con detalle ─────────────────────────────── */
  const abrirDetalle = (postulacion) => {
    setModalPost(postulacion);
    setDetalle(null);
    setVistaModal('detalle');
    setMotivo('');
    setDetalleLoading(true);
    reclutamientoService.getDetalleCandidato(postulacion.idCandidato)
      .then(setDetalle)
      .catch(console.error)
      .finally(() => setDetalleLoading(false));
  };

  const cerrarModal = () => {
    setModalPost(null);
    setDetalle(null);
    setVistaModal('detalle');
    setMotivo('');
  };

  /* ── Aprobar (desde modal) ───────────────────────────────── */
  const aprobar = async () => {
    if (!modalPost) return;
    setGuardando(true);
    try {
      await reclutamientoService.aprobarPostulacion(modalPost.idPostulacion);
      cerrarModal();
      cargar();
    } catch (e) {
      alert(e.response?.data?.message ?? 'Error al aprobar');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Rechazar (desde modal) ──────────────────────────────── */
  const confirmarRechazo = async () => {
    if (!modalPost) return;
    setGuardando(true);
    try {
      await reclutamientoService.rechazarPostulacion(modalPost.idPostulacion, motivo.trim() || null);
      cerrarModal();
      cargar();
    } catch (e) {
      alert(e.response?.data?.message ?? 'Error al rechazar');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Filtrado ─────────────────────────────────────────────── */
  const pendientesFiltrados = useMemo(() => {
    const q = search.toLowerCase();
    return pendientes.filter(p =>
      !q ||
      p.nombreCandidato?.toLowerCase().includes(q) ||
      p.nombre?.toLowerCase().includes(q) ||
      p.apellido?.toLowerCase().includes(q) ||
      p.codigoProtocolo?.toLowerCase().includes(q),
    );
  }, [pendientes, search]);

  const historialFiltrado = useMemo(() => {
    const q = search.toLowerCase();
    return historial.filter(p =>
      !q ||
      p.nombreCandidato?.toLowerCase().includes(q) ||
      p.nombre?.toLowerCase().includes(q) ||
      p.apellido?.toLowerCase().includes(q) ||
      p.codigoProtocolo?.toLowerCase().includes(q),
    );
  }, [historial, search]);

  const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className={styles.page}>

      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Postulaciones</h1>
          <p className={styles.subtitle}>
            Revisa los detalles y criterios de cada candidato antes de tomar una decisión
          </p>
        </div>
      </div>

      {/* Pestañas */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'pendientes' ? styles.tabActive : ''}`}
          onClick={() => setTab('pendientes')}
        >
          Pendientes
          {pendientes.length > 0 && (
            <span className={styles.tabBadge}>{pendientes.length}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${tab === 'historial' ? styles.tabActive : ''}`}
          onClick={() => setTab('historial')}
        >
          Historial
        </button>
      </div>

      {/* Búsqueda */}
      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.searchInput}
          placeholder="Buscar por nombre, código o protocolo…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── TAB: Pendientes ─────────────────────────────────── */}
      {tab === 'pendientes' && (
        loading ? (
          <div className={styles.empty}><div className={styles.emptyIcon}>⏳</div><p>Cargando…</p></div>
        ) : pendientesFiltrados.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✅</div>
            <p>{pendientes.length === 0 ? 'No hay postulaciones pendientes.' : 'Sin resultados para la búsqueda.'}</p>
          </div>
        ) : (
          <div className={styles.lista}>
            {pendientesFiltrados.map(p => (
              <div key={p.idPostulacion} className={styles.card}>
                <div className={styles.cardInfo}>
                  <p className={styles.cardTitulo}>
                    {p.nombre} {p.apellido}
                  </p>
                  <div className={styles.cardMeta}>
                    <span>{p.codigoProtocolo} — {p.nombreProtocolo}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{p.nombreCentro}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{formatFecha(p.fechaPostulacion)}</span>
                  </div>
                  {/* Elegibilidad automática si ya fue evaluada */}
                  {p.elegibilidadAuto !== null && p.elegibilidadAuto !== undefined && (
                    <span className={p.elegibilidadAuto ? styles.elegibSi : styles.elegibNo}>
                      {p.elegibilidadAuto ? '✓ Elegible según criterios' : '✗ No elegible según criterios'}
                    </span>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.btnVerDetalle}
                    onClick={() => abrirDetalle(p)}
                  >
                    <EyeIcon /> Ver criterios y decidir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── TAB: Historial ──────────────────────────────────── */}
      {tab === 'historial' && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Protocolo</th>
                  <th>Centro</th>
                  <th>Estado</th>
                  <th>Elegib.</th>
                  <th>Decisión</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-500)' }}>Cargando…</td></tr>
                ) : historialFiltrado.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className={styles.empty}>
                      <div className={styles.emptyIcon}>📋</div>
                      <p>No hay historial registrado.</p>
                    </div>
                  </td></tr>
                ) : historialFiltrado.map(p => (
                  <tr key={p.idPostulacion}>
                    <td>{p.nombre} {p.apellido}</td>
                    <td>
                      <span className={styles.codigo}>{p.codigoProtocolo}</span>
                      <br />
                      <small style={{ color: 'var(--color-gray-500)' }}>{p.nombreProtocolo}</small>
                    </td>
                    <td>{p.nombreCentro ?? '—'}</td>
                    <td><BadgeEstado idEstado={p.idEstado} nombre={p.nombreEstado} /></td>
                    <td>
                      {p.elegibilidadAuto === true  && <span style={{ color: '#166534', fontWeight: 600 }}>✓</span>}
                      {p.elegibilidadAuto === false && <span style={{ color: '#991b1b', fontWeight: 600 }}>✗</span>}
                      {p.elegibilidadAuto === null  && <span style={{ color: 'var(--color-gray-400)' }}>—</span>}
                    </td>
                    <td>{formatFecha(p.fechaDecision)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal: detalle + decisión ──────────────────────── */}
      {modalPost && (
        <DetalleDecisionModal
          postulacion={modalPost}
          detalle={detalle}
          loading={detalleLoading}
          vistaModal={vistaModal}
          motivo={motivo}
          guardando={guardando}
          onCerrar={cerrarModal}
          onAprobar={aprobar}
          onIniciarRechazo={() => setVistaModal('rechazar')}
          onMotivoChange={e => setMotivo(e.target.value)}
          onConfirmarRechazo={confirmarRechazo}
          onVolverDetalle={() => setVistaModal('detalle')}
          formatFecha={formatFecha}
        />
      )}

    </div>
  );
}

/* ── Modal de detalle y decisión ──────────────────────────────── */
function DetalleDecisionModal({
  postulacion, detalle, loading, vistaModal, motivo, guardando,
  onCerrar, onAprobar, onIniciarRechazo, onMotivoChange,
  onConfirmarRechazo, onVolverDetalle, formatFecha,
}) {
  const criteriosEval = detalle?.criteriosEvaluados ?? [];
  const criteriosProt = detalle?.criteriosProtocolo ?? [];

  /* Unir protocolo + evaluaciones para mostrar resultado por criterio */
  const criteriosMerged = criteriosProt.map(cp => {
    const ev = criteriosEval.find(e => e.idCriterio === cp.idCriterio);
    return { ...cp, cumple: ev?.cumple ?? null };
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modalDetalle}>

        {/* Cabecera */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <span className={styles.modalNombrePaciente}>
              {postulacion.nombre} {postulacion.apellido}
            </span>
            <span className={styles.modalCodigoProto}>{postulacion.codigoProtocolo}</span>
          </div>
          <button className={styles.closeBtn} onClick={onCerrar} type="button">
            <XIcon />
          </button>
        </div>

        {/* Cuerpo */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalCargando}>
              <SpinIcon /> Cargando datos del candidato…
            </div>
          ) : detalle ? (
            <>
              {/* Info básica */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Protocolo</span>
                  <span className={styles.infoValue}>{detalle.protocolo}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Centro</span>
                  <span className={styles.infoValue}>{detalle.centro ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha Nac.</span>
                  <span className={styles.infoValue}>{formatFecha(detalle.fechaNacimiento)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Postulación</span>
                  <span className={styles.infoValue}>{formatFecha(detalle.fechaPostulacion)}</span>
                </div>
                {detalle.contacto && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Contacto</span>
                    <span className={styles.infoValue}>{detalle.contacto}</span>
                  </div>
                )}
              </div>

              {/* Observaciones del coordinador */}
              {detalle.observacionGeneral && (
                <div className={styles.observacionSection}>
                  <div className={styles.observacionLabel}>
                    <MessageIcon /> Observaciones del Coordinador
                  </div>
                  <p className={styles.observacionText}>{detalle.observacionGeneral}</p>
                </div>
              )}

              {/* Elegibilidad automática */}
              {detalle.elegibilidadAuto !== null && detalle.elegibilidadAuto !== undefined && (
                <div className={detalle.elegibilidadAuto ? styles.elegibBannerSi : styles.elegibBannerNo}>
                  {detalle.elegibilidadAuto
                    ? <><CheckCircleIcon /> El candidato <strong>cumple</strong> todos los criterios evaluados</>
                    : <><XCircleIcon /> El candidato <strong>no cumple</strong> uno o más criterios evaluados</>
                  }
                </div>
              )}

              {/* Sección de criterios */}
              <div className={styles.criteriosSection}>
                <h4 className={styles.criteriosSectionTitle}>
                  <ClipboardIcon /> Evaluación de Criterios del Protocolo
                  <span className={styles.criteriosSub}>
                    {criteriosEval.length === 0 ? '(pendiente evaluación del coordinador)' : `(${criteriosEval.length} evaluados)`}
                  </span>
                </h4>

                {criteriosMerged.length === 0 ? (
                  <div className={styles.sinCriterios}>
                    Este protocolo no tiene criterios de inclusión/exclusión registrados.
                  </div>
                ) : criteriosEval.length === 0 ? (
                  <div className={styles.sinEvaluacion}>
                    <InfoIcon />
                    El coordinador aún no ha evaluado los criterios para este candidato.
                    Los criterios del protocolo son los siguientes:
                  </div>
                ) : null}

                {criteriosMerged.length > 0 && (
                  <div className={styles.criteriosList}>
                    {criteriosMerged.map(c => (
                      <div key={c.idCriterio} className={styles.criterioRow}>
                        <span className={`${styles.tipoBadge} ${c.tipo === 'inclusion' ? styles.tipoBadgeInc : styles.tipoBadgeExc}`}>
                          {c.tipo === 'inclusion' ? 'INC' : 'EXC'}
                        </span>
                        <span className={styles.criterioDesc}>{c.descripcion}</span>
                        <span className={
                          c.cumple === true  ? styles.cumpleSi :
                          c.cumple === false ? styles.cumpleNo :
                          styles.cumplePend
                        }>
                          {c.cumple === true  ? '✓ Sí' :
                           c.cumple === false ? '✗ No' :
                           '— Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vista de rechazo */}
              {vistaModal === 'rechazar' && (
                <div className={styles.rechazarSection}>
                  <label className={styles.rechazarLabel}>Motivo del rechazo (opcional)</label>
                  <textarea
                    className={styles.motivoTextarea}
                    value={motivo}
                    onChange={onMotivoChange}
                    placeholder="Indique el motivo por el cual se rechaza esta postulación…"
                    autoFocus
                  />
                </div>
              )}
            </>
          ) : (
            <div className={styles.sinEvaluacion}>Error al cargar los datos del candidato.</div>
          )}
        </div>

        {/* Pie */}
        <div className={styles.modalFooter}>
          {vistaModal === 'detalle' ? (
            <>
              <button className={styles.btnCancel} onClick={onCerrar} disabled={guardando || loading}>
                Cerrar
              </button>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  className={styles.btnRechazar}
                  onClick={onIniciarRechazo}
                  disabled={guardando || loading || !detalle}
                >
                  <XIcon /> Rechazar
                </button>
                <button
                  className={styles.btnAprobar}
                  onClick={onAprobar}
                  disabled={guardando || loading || !detalle}
                >
                  {guardando ? <SpinIcon /> : <CheckIcon />}
                  {guardando ? 'Aprobando…' : 'Aprobar'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button className={styles.btnCancel} onClick={onVolverDetalle} disabled={guardando}>
                Volver
              </button>
              <button className={styles.btnConfirmarRechazo} onClick={onConfirmarRechazo} disabled={guardando}>
                {guardando ? 'Rechazando…' : 'Confirmar Rechazo'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Iconos ─────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function XCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function MessageIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
