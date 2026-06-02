import { useCallback, useEffect, useState } from 'react';
import investigadorService from '../../../services/investigadorService';
import { ProtocoloStatsCards } from './components/ProtocoloStatsCards';
import { ProtocoloTable }      from './components/ProtocoloTable';
import { CrearProtocoloModal } from './components/CrearProtocoloModal/CrearProtocoloModal';
import styles from './ProtocolosListPage.module.css';

const PAGE_SIZE = 10;

export function ProtocolosListPage() {
  const [stats,      setStats]      = useState(null);
  const [statsLoad,  setStatsLoad]  = useState(true);
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [estados,    setEstados]    = useState([]);
  const [filters,    setFilters]    = useState({ search: '', idEstado: '' });
  const [page,       setPage]       = useState(0);
  const [showModal,  setShowModal]  = useState(false);

  const fetchStats = useCallback(() => {
    setStatsLoad(true);
    investigadorService.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoad(false));
  }, []);

  const fetchProtocolos = useCallback(async (currentPage = 0) => {
    setLoading(true);
    try {
      const idEstado = filters.idEstado !== '' ? Number(filters.idEstado) : undefined;
      const res = await investigadorService.getProtocolos({
        idEstado,
        search: filters.search,
        page: currentPage,
        size: PAGE_SIZE,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
    investigadorService.getCatEstados().then(setEstados).catch(() => {});
  }, [fetchStats]);

  useEffect(() => {
    fetchProtocolos(0);
    setPage(0);
  }, [fetchProtocolos]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function handlePageChange(p) {
    setPage(p);
    fetchProtocolos(p);
  }

  function handleCreated() {
    setShowModal(false);
    fetchStats();
    fetchProtocolos(0);
    setPage(0);
  }

  return (
    <div className={styles.page}>

      {/* Tarjetas de estadísticas */}
      <ProtocoloStatsCards stats={stats} loading={statsLoad} />

      {/* Barra de acciones */}
      <div className={styles.actions}>
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <SearchIcon />
            <input
              className={styles.searchInput}
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Buscar por código o título…"
            />
          </div>
          <select
            name="idEstado"
            value={filters.idEstado}
            onChange={handleFilterChange}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            {estados.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>

        <button className={styles.createBtn} onClick={() => setShowModal(true)}>
          <PlusIcon />
          Crear Protocolo
        </button>
      </div>

      {/* Tabla de protocolos */}
      <ProtocoloTable
        data={data}
        loading={loading}
        page={page}
        onPageChange={handlePageChange}
        pageSize={PAGE_SIZE}
      />

      {/* Wizard de creación */}
      {showModal && (
        <CrearProtocoloModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
