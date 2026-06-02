import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import reclutamientoService from '../../../services/reclutamientoService';
import styles from './ReclutamientoMedico.module.css';

export function ReclutamientoMedico() {
  const navigate               = useNavigate();
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [search, setSearch]    = useState('');

  useEffect(() => {
    reclutamientoService.getPendientesMedico()
      .then(setCandidatos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return candidatos.filter(c =>
      !q ||
      c.nombre?.toLowerCase().includes(q) ||
      c.apellido?.toLowerCase().includes(q) ||
      c.nombreProtocolo?.toLowerCase().includes(q),
    );
  }, [candidatos, search]);

  const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const handleEvaluar = (idCandidato) => {
    navigate(`/reclutamiento/evaluacion/${idCandidato}`);
  };

  return (
    <div className={styles.page}>

      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Candidatos Pendientes de Evaluación</h1>
          <p className={styles.subtitle}>
            {loading ? 'Cargando…' : `${candidatos.length} candidato${candidatos.length !== 1 ? 's' : ''} aprobado${candidatos.length !== 1 ? 's' : ''} esperando evaluación médica`}
          </p>
        </div>
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

      {/* Contenido */}
      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <p className={styles.emptyText}>Cargando candidatos…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            {candidatos.length === 0 ? '🩺' : '🔍'}
          </div>
          <p className={styles.emptyText}>
            {candidatos.length === 0
              ? 'No hay candidatos aprobados pendientes de evaluación médica.'
              : 'No se encontraron candidatos con los filtros aplicados.'}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtrados.map(c => (
            <div key={c.idCandidato} className={styles.card}>

              {/* Cabecera tarjeta */}
              <div className={styles.cardTop}>
                <div>
                  <p className={styles.candidatoNombre}>{c.nombre} {c.apellido}</p>
                </div>
                {c.elegibilidadAuto === true  && <span className={`${styles.elegib} ${styles.elegibSi}`}>Apto</span>}
                {c.elegibilidadAuto === false && <span className={`${styles.elegib} ${styles.elegibNo}`}>No apto</span>}
                {c.elegibilidadAuto === null  && <span className={`${styles.elegib} ${styles.elegibPend}`}>Sin eval.</span>}
              </div>

              {/* Detalles */}
              <div className={styles.cardDetails}>
                <div className={styles.detRow}>
                  <span className={styles.detLabel}>Protocolo</span>
                  <span>{c.codigoProtocolo} — {c.nombreProtocolo}</span>
                </div>
                <div className={styles.detRow}>
                  <span className={styles.detLabel}>Centro</span>
                  <span>{c.nombreCentro ?? '—'}</span>
                </div>
                <div className={styles.detRow}>
                  <span className={styles.detLabel}>Aprobado</span>
                  <span>{formatFecha(c.fechaDecision)}</span>
                </div>
              </div>

              {/* Acción */}
              <button
                className={styles.btnEvaluar}
                onClick={() => handleEvaluar(c.idCandidato)}
              >
                <StethoscopeIcon /> Iniciar Evaluación
              </button>

            </div>
          ))}
        </div>
      )}

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
function StethoscopeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}
