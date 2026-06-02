import { useState, useEffect, useMemo } from 'react';
import pacientesService from '../../../services/pacientesService';
import { BadgeEstadoPaciente } from '../shared/BadgeEstadoPaciente';
import styles from './PacientesCoordinador.module.css';

export function PacientesCoordinador() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroProtocolo, setFiltroProtocolo] = useState('');

  useEffect(() => {
    pacientesService.listarPacientes()
      .then(setPacientes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const protocolos = useMemo(() => {
    const mapa = {};
    pacientes.forEach(p => { if (p.codigoProtocolo) mapa[p.codigoProtocolo] = p.protocolo; });
    return Object.entries(mapa);
  }, [pacientes]);

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return pacientes.filter(p => {
      const texto = !q ||
        p.pseudonimo?.toLowerCase().includes(q) ||
        p.protocolo?.toLowerCase().includes(q) ||
        p.nombreMedico?.toLowerCase().includes(q);
      const estado = !filtroEstado ||
        (filtroEstado === 'activo' ? p.activo : !p.activo);
      const protocolo = !filtroProtocolo || p.codigoProtocolo === filtroProtocolo;
      return texto && estado && protocolo;
    });
  }, [pacientes, search, filtroEstado, filtroProtocolo]);

  const formatFecha = (d) => {
    if (!d) return '—';
    return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <div className={styles.page}>

      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Lista de Pacientes</h1>
          <p className={styles.subtitle}>
            {loading ? 'Cargando…' : `${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} registrado${pacientes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            placeholder="Buscar por pseudónimo, protocolo o médico…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.select} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select className={styles.select} value={filtroProtocolo} onChange={e => setFiltroProtocolo(e.target.value)}>
          <option value="">Todos los protocolos</option>
          {protocolos.map(([cod, titulo]) => (
            <option key={cod} value={cod}>{cod} — {titulo}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Pseudónimo</th>
                <th>Protocolo</th>
                <th>Médico asignado</th>
                <th>Centro</th>
                <th>Fecha admisión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className={styles.loadingRow}>
                  <td colSpan={6}>Cargando pacientes…</td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className={styles.empty}>
                    <div className={styles.emptyIcon}>{pacientes.length === 0 ? '🏥' : '🔍'}</div>
                    <p>{pacientes.length === 0 ? 'No hay pacientes registrados.' : 'Sin resultados para los filtros aplicados.'}</p>
                  </div>
                </td></tr>
              ) : filtrados.map(p => (
                <tr key={p.idPaciente}>
                  <td><span className={styles.pseudonimo}>{p.pseudonimo}</span></td>
                  <td>
                    <span className={styles.codigo}>{p.codigoProtocolo}</span>
                    <br />
                    <small style={{ color: 'var(--color-gray-500)' }}>{p.protocolo}</small>
                  </td>
                  <td>{p.nombreMedico ?? '—'}</td>
                  <td>{p.nombreCentro ?? '—'}</td>
                  <td>{formatFecha(p.fechaIngreso)}</td>
                  <td><BadgeEstadoPaciente activo={p.activo} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
