import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import pacientesService from '../../../services/pacientesService';
import { BadgeEstadoPaciente } from '../shared/BadgeEstadoPaciente';
import styles from './PacientesMedico.module.css';

export function PacientesMedico() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activo');

  useEffect(() => {
    pacientesService.listarPacientes()
      .then(setPacientes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return pacientes.filter(p => {
      const texto = !q ||
        p.pseudonimo?.toLowerCase().includes(q) ||
        p.protocolo?.toLowerCase().includes(q);
      const estado = !filtroEstado ||
        (filtroEstado === 'activo' ? p.activo : !p.activo);
      return texto && estado;
    });
  }, [pacientes, search, filtroEstado]);

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
          <h1 className={styles.title}>Mis Pacientes</h1>
          <p className={styles.subtitle}>
            {loading ? 'Cargando…' : `${pacientes.filter(p => p.activo).length} activo${pacientes.filter(p => p.activo).length !== 1 ? 's' : ''} · ${pacientes.length} total`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            placeholder="Buscar por pseudónimo o protocolo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.select} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
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
                <th>Centro</th>
                <th>Fecha admisión</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className={styles.loadingRow}><td colSpan={6}>Cargando pacientes…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className={styles.empty}>
                    <div className={styles.emptyIcon}>{pacientes.length === 0 ? '🏥' : '🔍'}</div>
                    <p>{pacientes.length === 0 ? 'No tienes pacientes asignados.' : 'Sin resultados.'}</p>
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
                  <td>{p.nombreCentro ?? '—'}</td>
                  <td>{formatFecha(p.fechaIngreso)}</td>
                  <td><BadgeEstadoPaciente activo={p.activo} /></td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.btnFicha}
                        onClick={() => navigate(`/pacientes/${p.idPaciente}`)}
                      >
                        <FileIcon /> Ficha
                      </button>
                      <button
                        className={styles.btnVisitas}
                        onClick={() => navigate(`/pacientes/${p.idPaciente}/visitas`)}
                      >
                        <CalendarIcon /> Visitas
                      </button>
                    </div>
                  </td>
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
function FileIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
