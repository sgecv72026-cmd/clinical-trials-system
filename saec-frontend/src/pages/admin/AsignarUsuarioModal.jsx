import { useEffect, useRef, useState } from 'react';
import adminService from '../../services/adminService';
import styles from './AdminModal.module.css';

export function AsignarUsuarioModal({ idCentro, idsYaAsignados, onClose, onAsignado }) {
  const [query,        setQuery]        = useState('');
  const [results,      setResults]      = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching,    setSearching]    = useState(false);
  const [error,        setError]        = useState('');
  const [saving,       setSaving]       = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const delay = query.trim() ? 300 : 0;
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      adminService.getUsuarios({ search: query.trim(), activo: true, size: 15 })
        .then(data => {
          const disponibles = data.content.filter(u => !idsYaAsignados.includes(u.idUsuario));
          setResults(disponibles);
        })
        .catch(() => setError('No se pudieron cargar los usuarios'))
        .finally(() => setSearching(false));
    }, delay);
    return () => clearTimeout(debounceRef.current);
  }, [query, idsYaAsignados]);

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      await adminService.asignarUsuarioCentro(idCentro, selectedUser.idUsuario);
      onAsignado();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al asignar el usuario');
    } finally {
      setSaving(false);
    }
  }

  function selectUser(u) {
    setSelectedUser(u);
    setError('');
  }

  function stopProp(e) { e.stopPropagation(); }

  const initials = u => `${u.nombre[0]}${u.apellido[0]}`.toUpperCase();

  return (
    <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.dialog} style={{ maxWidth: 440 }} onMouseDown={stopProp}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Asignar usuario al centro</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label}>
                Buscar usuario <span className={styles.req}>*</span>
              </label>

              <div className={styles.searchWrap}>
                <SearchIcon />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Nombre, apellido o email…"
                  value={query}
                  autoFocus
                  onChange={e => { setQuery(e.target.value); setSelectedUser(null); setError(''); }}
                />
                {searching && <span className={styles.searchSpinner} />}
              </div>

              <div className={styles.resultsList}>
                {!searching && results.length === 0 ? (
                  <div className={styles.noResults}>
                    {query.trim()
                      ? 'Sin resultados para esa búsqueda'
                      : 'Todos los usuarios activos ya están asignados a este centro'}
                  </div>
                ) : results.map(u => (
                  <button
                    key={u.idUsuario}
                    type="button"
                    className={`${styles.resultRow} ${selectedUser?.idUsuario === u.idUsuario ? styles.resultRowSelected : ''}`}
                    onClick={() => selectUser(u)}
                  >
                    <span className={styles.resultAvatar}>{initials(u)}</span>
                    <span className={styles.resultInfo}>
                      <span className={styles.resultName}>{u.nombre} {u.apellido}</span>
                      <span className={styles.resultEmail}>{u.email}</span>
                    </span>
                    <span className={styles.resultRol}>{u.rol}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={saving || !selectedUser}
            >
              {saving && <span className={styles.spinner} />}
              {saving ? 'Asignando…' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
