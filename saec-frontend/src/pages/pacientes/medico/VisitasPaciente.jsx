import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import pacientesService from '../../../services/pacientesService';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination }    from '../../../components/ui/Pagination';
import styles from './VisitasPaciente.module.css';

const BADGE = {
  'Programada':  { bg: '#dbeafe', color: '#1e40af' },
  'Realizada':   { bg: '#dcfce7', color: '#166534' },
  'Cancelada':   { bg: '#fee2e2', color: '#991b1b' },
  'Reprogramada':{ bg: '#fef9c3', color: '#854d0e' },
};

export function VisitasPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rol            = user?.rol ?? '';
  const esMedico       = rol.includes('Médico') || rol.includes('Medico');
  const esCoordinador  = rol === 'Coordinador de Reclutamiento';

  const [visitas, setVisitas]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    pacientesService.listarVisitas(Number(id))
      .then(setVisitas)
      .catch(e => setError(e.response?.data?.message ?? 'Error al cargar visitas'))
      .finally(() => setLoading(false));
  }, [id]);

  const {
    page, pageItems, totalPages, totalItems, pageSize, goToPage,
  } = usePagination(visitas, 20);

  const formatFecha = (d) => {
    if (!d) return '—';
    return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  /* Coordinador no tiene acceso a visitas */
  if (esCoordinador) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate('/pacientes')}>
          <ChevronIcon /> Volver a pacientes
        </button>
        <div className={styles.errorBox}>
          <AlertIcon /> No tienes permiso para ver las visitas de los pacientes.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <button className={styles.backBtn} onClick={() => navigate(`/pacientes/${id}`)}>
        <ChevronIcon /> Volver a ficha
      </button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Visitas del Paciente</h1>
          {!loading && (
            <p className={styles.subtitle}>
              {totalItems} visita{totalItems !== 1 ? 's' : ''} programadas
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.center}><SpinIcon /><p>Cargando visitas…</p></div>
      ) : error ? (
        <div className={styles.errorBox}><AlertIcon /> {error}</div>
      ) : visitas.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarEmptyIcon />
          <p>No hay visitas programadas para este paciente</p>
        </div>
      ) : (
        <>
          <div className={styles.visitasList}>
            {pageItems.map(v => {
              const badge = BADGE[v.estadoVisita] ?? { bg: '#f3f4f6', color: '#374151' };
              return (
                <div key={v.idVisita} className={styles.visitaCard}>
                  <div className={styles.visitaLeft}>
                    <div className={styles.visitaNum}>
                      <span className={styles.semanaLabel}>Sem {v.semana}</span>
                      {v.dia > 0 && <span className={styles.diaLabel}>Día {v.dia}</span>}
                    </div>
                  </div>
                  <div className={styles.visitaInfo}>
                    <div className={styles.visitaNombre}>{v.nombreVisita || `Visita semana ${v.semana}`}</div>
                    <div className={styles.visitaMeta}>
                      <span>Programada: {formatFecha(v.fechaProgramada)}</span>
                      {v.fechaRealizada && <span>· Realizada: {formatFecha(v.fechaRealizada)}</span>}
                    </div>
                  </div>
                  <div className={styles.visitaRight}>
                    <span
                      className={styles.badgeEstado}
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {v.estadoVisita}
                    </span>
                    {esMedico ? (
                      <button
                        className={styles.btnDetalle}
                        onClick={() => navigate(`/pacientes/${id}/visitas/${v.idVisita}`)}
                      >
                        <FileIcon /> Ver detalle
                      </button>
                    ) : (
                      <button
                        className={styles.btnDetalleOutline}
                        onClick={() => navigate(`/pacientes/${id}/visitas/${v.idVisita}`)}
                      >
                        <EyeIcon /> Ver
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className={styles.paginationWrap}>
              <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalItems}
                size={pageSize}
                onPageChange={goToPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChevronIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function SpinIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}
function FileIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function EyeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function CalendarEmptyIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
