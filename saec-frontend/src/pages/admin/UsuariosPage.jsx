import { useCallback, useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { RolBadge, ActivoBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/PageLoader';
import { CrearUsuarioModal } from './CrearUsuarioModal';
import styles from './UsuariosPage.module.css';

const PAGE_SIZE = 10;

export function UsuariosPage() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState(null);
  const [roles,      setRoles]      = useState([]);
  const [filters,    setFilters]    = useState({ search: '', idRol: '', activo: '' });
  const [page,       setPage]       = useState(0);
  const [showCrear,  setShowCrear]  = useState(false);

  const fetchUsuarios = useCallback(async (currentPage = 0) => {
    setLoading(true);
    try {
      const idRol  = filters.idRol  !== '' ? Number(filters.idRol)  : undefined;
      const activo = filters.activo !== '' ? filters.activo === 'true' : undefined;
      const res = await adminService.getUsuarios({
        search: filters.search, idRol, activo, page: currentPage, size: PAGE_SIZE,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { adminService.getRoles().then(setRoles).catch(() => {}); }, []);
  useEffect(() => { fetchUsuarios(0); setPage(0); }, [fetchUsuarios]);

  async function handleToggle(usuario) {
    setToggling(usuario.idUsuario);
    try {
      await adminService.toggleActivo(usuario.idUsuario, !usuario.activo);
      setData(prev => ({
        ...prev,
        content: prev.content.map(u =>
          u.idUsuario === usuario.idUsuario ? { ...u, activo: !u.activo } : u
        ),
      }));
    } finally {
      setToggling(null);
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function handlePageChange(p) {
    setPage(p);
    fetchUsuarios(p);
  }

  function handleUsuarioCreado() {
    setShowCrear(false);
    fetchUsuarios(0);
    setPage(0);
  }

  return (
    <div className={styles.page}>
      {/* Filtros + acción */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Buscar por nombre, apellido o email…"
          />
        </div>
        <select name="idRol" value={filters.idRol} onChange={handleFilterChange} className={styles.select}>
          <option value="">Todos los roles</option>
          {roles.map(r => <option key={r.idRol} value={r.idRol}>{r.nombre}</option>)}
        </select>
        <select name="activo" value={filters.activo} onChange={handleFilterChange} className={styles.select}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button className={styles.newBtn} onClick={() => setShowCrear(true)}>
          <PlusIcon /> Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>
            {data ? `${data.totalElements} usuario${data.totalElements !== 1 ? 's' : ''}` : '…'}
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={PAGE_SIZE} cols={6} />
        ) : data?.content?.length === 0 ? (
          <div className={styles.empty}>
            <EmptyIcon />
            <p>No se encontraron usuarios con los filtros aplicados</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Centros</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {data?.content?.map(u => (
                  <tr key={u.idUsuario}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userAvatar}>
                          {u.nombre[0]}{u.apellido[0]}
                        </span>
                        <div>
                          <div className={styles.userName}>{u.nombre} {u.apellido}</div>
                          <div className={styles.userId}>ID #{u.idUsuario}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.email}>{u.email}</td>
                    <td><RolBadge rol={u.rol} /></td>
                    <td>
                      {u.centros?.length > 0
                        ? <span className={styles.centros}>{u.centros.join(', ')}</span>
                        : <span className={styles.noCentro}>Sin centro</span>
                      }
                    </td>
                    <td><ActivoBadge activo={u.activo} /></td>
                    <td>
                      <button
                        className={`${styles.toggleBtn} ${u.activo ? styles.deactivate : styles.activate}`}
                        onClick={() => handleToggle(u)}
                        disabled={toggling === u.idUsuario}
                      >
                        {toggling === u.idUsuario
                          ? <span className={styles.spinner} />
                          : u.activo ? 'Desactivar' : 'Activar'
                        }
                      </button>
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

      {showCrear && (
        <CrearUsuarioModal
          roles={roles}
          onClose={() => setShowCrear(false)}
          onCreado={handleUsuarioCreado}
        />
      )}
    </div>
  );
}

function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function EmptyIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
