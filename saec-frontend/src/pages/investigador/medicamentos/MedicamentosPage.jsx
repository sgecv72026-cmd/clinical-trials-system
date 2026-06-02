import { useCallback, useEffect, useState } from 'react';
import investigadorService from '../../../services/investigadorService';
import { Pagination }    from '../../../components/ui/Pagination';
import { TableSkeleton } from '../../../components/ui/PageLoader';
import styles from './MedicamentosPage.module.css';

const PAGE_SIZE = 10;

export function MedicamentosPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(0);

  const fetchData = useCallback(async (currentPage = 0, currentSearch = search) => {
    setLoading(true);
    try {
      const res = await investigadorService.getMedicamentosInvestigador({
        search: currentSearch,
        page: currentPage,
        size: PAGE_SIZE,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData(0, search);
    setPage(0);
  }, [fetchData]);

  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  function handlePageChange(p) {
    setPage(p);
    fetchData(p, search);
  }

  return (
    <div className={styles.page}>

      {/* Filtro de búsqueda */}
      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.searchInput}
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar medicamentos…"
        />
      </div>

      {/* Tabla */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>
            {data
              ? `${data.totalElements} medicamento${data.totalElements !== 1 ? 's' : ''} en tus protocolos`
              : '…'}
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={PAGE_SIZE} cols={2} />
        ) : data?.content?.length === 0 ? (
          <div className={styles.empty}>
            <PillIcon />
            <p>No hay medicamentos asignados a visitas en tus protocolos</p>
            <small>Los medicamentos aparecen aquí cuando son asignados a visitas durante la creación de un protocolo.</small>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {data?.content?.map((m, idx) => (
                  <tr key={m.id}>
                    <td className={styles.num}>{page * PAGE_SIZE + idx + 1}</td>
                    <td className={styles.nombre}>{m.nombre}</td>
                    <td className={styles.descripcion}>
                      {m.descripcion || <span className={styles.sinDesc}>Sin descripción</span>}
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
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function PillIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
}
