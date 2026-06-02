import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { ActivoBadge, RolBadge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/PageLoader';
import { CrearCentroModal } from './CrearCentroModal';
import { AsignarUsuarioModal } from './AsignarUsuarioModal';
import styles from './CentrosPage.module.css';

export function CentrosPage() {
  const [centros,          setCentros]          = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [selected,         setSelected]         = useState(null);
  const [detalle,          setDetalle]          = useState(null);
  const [loadDet,          setLoadDet]          = useState(false);
  const [showCrearCentro,  setShowCrearCentro]  = useState(false);
  const [showAsignar,      setShowAsignar]      = useState(false);

  useEffect(() => {
    adminService.getCentros()
      .then(setCentros)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(centro) {
    if (selected?.idCentro === centro.idCentro) {
      setSelected(null); setDetalle(null); return;
    }
    setSelected(centro);
    setDetalle(null);
    setLoadDet(true);
    try {
      const d = await adminService.getCentroDetalle(centro.idCentro);
      setDetalle(d);
    } finally {
      setLoadDet(false);
    }
  }

  async function recargarDetalle() {
    if (!selected) return;
    setLoadDet(true);
    try {
      const d = await adminService.getCentroDetalle(selected.idCentro);
      setDetalle(d);
      setCentros(prev => prev.map(c =>
        c.idCentro === selected.idCentro
          ? { ...c, totalUsuarios: d.usuarios.length }
          : c
      ));
    } finally {
      setLoadDet(false);
    }
  }

  function handleCentroCreado(nuevo) {
    setCentros(prev => [...prev, nuevo]);
    setShowCrearCentro(false);
  }

  function handleAsignado() {
    setShowAsignar(false);
    recargarDetalle();
  }

  if (loading) return <PageLoader message="Cargando centros de investigación…" />;

  const activos   = centros.filter(c => c.activo).length;
  const inactivos = centros.length - activos;

  return (
    <div className={styles.page}>
      {/* Cabecera con botón */}
      <div className={styles.pageTopBar}>
        <button className={styles.newBtn} onClick={() => setShowCrearCentro(true)}>
          <PlusIcon /> Nuevo centro
        </button>
      </div>

      {/* Resumen */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal}>{centros.length}</span>
          <span className={styles.summaryLabel}>Total centros</span>
        </div>
        <div className={`${styles.summaryCard} ${styles.green}`}>
          <span className={styles.summaryVal}>{activos}</span>
          <span className={styles.summaryLabel}>Operativos</span>
        </div>
        <div className={`${styles.summaryCard} ${styles.gray}`}>
          <span className={styles.summaryVal}>{inactivos}</span>
          <span className={styles.summaryLabel}>Inactivos</span>
        </div>
        <div className={`${styles.summaryCard} ${styles.blue}`}>
          <span className={styles.summaryVal}>
            {centros.reduce((s, c) => s + c.totalUsuarios, 0)}
          </span>
          <span className={styles.summaryLabel}>Usuarios asignados</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Lista de centros */}
        <div className={styles.centrosList}>
          {centros.length === 0 ? (
            <div className={styles.empty}>No hay centros registrados</div>
          ) : centros.map(c => (
            <button
              key={c.idCentro}
              className={`${styles.centroCard} ${selected?.idCentro === c.idCentro ? styles.selected : ''} ${!c.activo ? styles.inactive : ''}`}
              onClick={() => handleSelect(c)}
            >
              <div className={styles.centroCardTop}>
                <div className={styles.centroIconWrap}><BuildingIcon /></div>
                <div className={styles.centroInfo}>
                  <span className={styles.centroNombre}>{c.nombre}</span>
                  <span className={styles.centroCiudad}>
                    <PinIcon /> {c.ciudad}
                  </span>
                </div>
                <ActivoBadge activo={c.activo} />
              </div>
              <div className={styles.centroFooter}>
                <span className={styles.usuarioCount}>
                  <UsersIcon /> {c.totalUsuarios} usuario{c.totalUsuarios !== 1 ? 's' : ''}
                </span>
                {c.telefono && <span className={styles.centroTel}>{c.telefono}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Panel de detalle */}
        {selected && (
          <div className={styles.detallePanel}>
            <div className={styles.detallePanelHeader}>
              <div>
                <h3 className={styles.detalleTitle}>{selected.nombre}</h3>
                <p className={styles.detalleSub}>
                  {selected.ciudad}{selected.direccion ? ` · ${selected.direccion}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  className={styles.asignarBtn}
                  onClick={() => setShowAsignar(true)}
                  title="Asignar usuario a este centro"
                >
                  <PlusIcon /> Asignar usuario
                </button>
                <button className={styles.closeBtn} onClick={() => { setSelected(null); setDetalle(null); }}>✕</button>
              </div>
            </div>

            {loadDet ? (
              <div className={styles.detLoading}><span className={styles.spinner} /> Cargando usuarios…</div>
            ) : detalle?.usuarios?.length === 0 ? (
              <div className={styles.empty}>No hay usuarios asignados a este centro</div>
            ) : (
              <div className={styles.usersList}>
                <span className={styles.usersTitle}>
                  Usuarios asignados ({detalle?.usuarios?.length ?? 0})
                </span>
                {detalle?.usuarios?.map(u => (
                  <div key={u.idUsuario} className={styles.userRow}>
                    <span className={styles.avatar}>{u.nombre[0]}{u.apellido[0]}</span>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{u.nombre} {u.apellido}</span>
                      <span className={styles.userEmail}>{u.email}</span>
                    </div>
                    <div className={styles.userMeta}>
                      <RolBadge rol={u.rol} />
                      <ActivoBadge activo={u.activo} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCrearCentro && (
        <CrearCentroModal
          onClose={() => setShowCrearCentro(false)}
          onCreado={handleCentroCreado}
        />
      )}

      {showAsignar && selected && (
        <AsignarUsuarioModal
          idCentro={selected.idCentro}
          idsYaAsignados={(detalle?.usuarios ?? []).map(u => u.idUsuario)}
          onClose={() => setShowAsignar(false)}
          onAsignado={handleAsignado}
        />
      )}
    </div>
  );
}

function BuildingIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function UsersIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function PinIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function PlusIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
