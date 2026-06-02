import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../../components/ui/Badge';
import { Pagination } from '../../../../components/ui/Pagination';
import { TableSkeleton } from '../../../../components/ui/PageLoader';
import styles from './ProtocoloTable.module.css';

const ESTADO_BADGE = {
  borrador:  'gray',
  activo:    'success',
  pausado:   'warning',
  cerrado:   'error',
  analisis:  'info',
};

export function ProtocoloTable({ data, loading, page, onPageChange, pageSize }) {
  const navigate = useNavigate();
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <span className={styles.tableTitle}>
          {data ? `${data.totalElements} protocolo${data.totalElements !== 1 ? 's' : ''}` : '…'}
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={pageSize} cols={6} />
      ) : data?.content?.length === 0 ? (
        <div className={styles.empty}>
          <EmptyIcon />
          <p>No hay protocolos que coincidan con los filtros</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Fase</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Fin estimado</th>
                <th>Pacientes</th>
              </tr>
            </thead>
            <tbody>
              {data?.content?.map(p => (
                <tr
                  key={p.idProtocolo}
                  className={styles.clickableRow}
                  onClick={() => navigate(`/investigador/protocolos/${p.idProtocolo}`)}
                  title="Ver detalle del protocolo"
                >
                  <td className={styles.codigo}>{p.codigo}</td>
                  <td className={styles.titulo}>{p.titulo}</td>
                  <td>{p.fase}</td>
                  <td>
                    <Badge variant={ESTADO_BADGE[p.estado] ?? 'gray'} dot>
                      {p.estado}
                    </Badge>
                  </td>
                  <td className={styles.date}>{p.fechaInicio ?? '—'}</td>
                  <td className={styles.date}>{p.fechaFinEstimada ?? '—'}</td>
                  <td className={styles.meta}>{p.metaPacientes ?? '—'}</td>
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
            size={pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

function EmptyIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H6l-3 9h18L18 3h-3"/><path d="M3 12l9 9 9-9"/></svg>;
}
