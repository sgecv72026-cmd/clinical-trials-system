import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import reclutamientoService from '../../../services/reclutamientoService';
import { FormularioNuevoCandidato } from './FormularioNuevoCandidato';
import { BadgeEstado } from '../shared/BadgeEstado';
import styles from './ReclutamientoCoordinador.module.css';

export function ReclutamientoCoordinador() {
  const navigate = useNavigate();
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showForm, setShowForm]     = useState(false);

  const cargar = () => {
    setLoading(true);
    reclutamientoService.getMisCandidatos()
      .then(setCandidatos)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  /* Filtrado local */
  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return candidatos.filter(c => {
      const coincideTexto =
        !q ||
        c.nombre?.toLowerCase().includes(q) ||
        c.apellido?.toLowerCase().includes(q) ||
        c.nombreProtocolo?.toLowerCase().includes(q);
      const coincideEstado =
        !filtroEstado || String(c.idEstado) === filtroEstado;
      return coincideTexto && coincideEstado;
    });
  }, [candidatos, search, filtroEstado]);

  /* Estados únicos para el selector */
  const estados = useMemo(() => {
    const mapa = {};
    candidatos.forEach(c => { if (c.idEstado) mapa[c.idEstado] = c.nombreEstado; });
    return Object.entries(mapa);
  }, [candidatos]);

  const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <div className={styles.page}>

      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Candidatos</h1>
          <p className={styles.subtitle}>
            {candidatos.length} candidato{candidatos.length !== 1 ? 's' : ''} registrado{candidatos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className={styles.actions}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <SearchIcon />
              <input
                className={styles.searchInput}
                placeholder="Buscar por nombre, código o protocolo…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className={styles.select}
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {estados.map(([id, nombre]) => (
                <option key={id} value={id}>{nombre}</option>
              ))}
            </select>
          </div>
          <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
            <PlusIcon /> Nuevo Candidato
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Protocolo</th>
                <th>Centro</th>
                <th>Estado</th>
                <th>Elegib. Auto</th>
                <th>Registro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className={styles.loadingRow}>
                  <td colSpan={7}>Cargando candidatos…</td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.empty}>
                      <div className={styles.emptyIcon}>🔍</div>
                      <p>
                        {candidatos.length === 0
                          ? 'Aún no has registrado candidatos.'
                          : 'No se encontraron candidatos con los filtros aplicados.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map(c => (
                  <tr key={c.idCandidato}>
                    <td>{c.nombre} {c.apellido}</td>
                    <td>
                      {c.codigoProtocolo
                        ? <><span className={styles.codigo}>{c.codigoProtocolo}</span><br /><small style={{ color: 'var(--color-gray-500)' }}>{c.nombreProtocolo}</small></>
                        : '—'}
                    </td>
                    <td>{c.nombreCentro ?? '—'}</td>
                    <td>
                      <BadgeEstado idEstado={c.idEstado} nombre={c.nombreEstado} />
                    </td>
                    <td>
                      {c.elegibilidadAuto === true  && <span style={{ color: '#166534', fontWeight: 600 }}>✓ Cumple</span>}
                      {c.elegibilidadAuto === false && <span style={{ color: '#991b1b', fontWeight: 600 }}>✗ No cumple</span>}
                      {c.elegibilidadAuto === null  && <span style={{ color: 'var(--color-gray-400)' }}>Pendiente</span>}
                    </td>
                    <td>{formatFecha(c.fechaPostulacion)}</td>
                    <td>
                      <button
                        className={styles.btnVer}
                        onClick={() => navigate(`/reclutamiento/evaluacion/${c.idCandidato}`)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nuevo candidato */}
      {showForm && (
        <div className={styles.overlay}>
          <FormularioNuevoCandidato
            onClose={() => setShowForm(false)}
            onCreado={() => { setShowForm(false); cargar(); }}
          />
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
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
