import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import investigadorService from '../../../services/investigadorService';
import { Badge }         from '../../../components/ui/Badge';
import { Pagination }    from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import s from './ProtocoloDetailPage.module.css';

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const ESTADO_BADGE = {
  borrador: 'gray',
  activo:   'success',
  pausado:  'warning',
  cerrado:  'error',
  analisis: 'info',
};

export function ProtocoloDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [protocolo, setProtocolo] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [pageErr,   setPageErr]   = useState('');

  /* ── Modo edición ── */
  const [editMode,  setEditMode]  = useState(false);
  const [editForm,  setEditForm]  = useState(null);
  const [estados,   setEstados]   = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [saveErr,   setSaveErr]   = useState('');

  useEffect(() => {
    Promise.all([
      investigadorService.getProtocolo(Number(id)),
      investigadorService.getCatEstados(),
    ])
      .then(([p, e]) => { setProtocolo(p); setEstados(e); })
      .catch(() => setPageErr('No se pudo cargar el protocolo. Vuelve a intentarlo.'))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Activar edición ── */
  function handleEdit() {
    setEditForm({
      titulo:             protocolo.titulo,
      objetivos:          protocolo.objetivos ?? '',
      idEstadoProtocolo:  String(protocolo.idEstadoProtocolo),
      fechaFinEstimada:   protocolo.fechaFinEstimada ?? '',
      metaPacientes:      protocolo.metaPacientes != null ? String(protocolo.metaPacientes) : '',
    });
    setSaveErr('');
    setEditMode(true);
  }

  function handleCancel() {
    setEditMode(false);
    setEditForm(null);
    setSaveErr('');
  }

  function updateField(field, value) {
    setEditForm(p => ({ ...p, [field]: value }));
  }

  async function handleSave() {
    if (!editForm.titulo.trim()) { setSaveErr('El título es obligatorio.'); return; }
    if (!editForm.idEstadoProtocolo) { setSaveErr('El estado es obligatorio.'); return; }
    setSaving(true);
    setSaveErr('');
    try {
      const updated = await investigadorService.actualizarProtocolo(Number(id), {
        titulo:            editForm.titulo.trim(),
        objetivos:         editForm.objetivos.trim() || null,
        idEstadoProtocolo: Number(editForm.idEstadoProtocolo),
        fechaFinEstimada:  editForm.fechaFinEstimada || null,
        metaPacientes:     editForm.metaPacientes ? Number(editForm.metaPacientes) : null,
      });
      setProtocolo(updated);
      setEditMode(false);
      setEditForm(null);
    } catch (err) {
      setSaveErr(err?.response?.data?.mensaje ?? 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  /* ── Paginación de visitas (cliente) ── */
  const visitas = protocolo?.visitas ?? [];
  const {
    page:       visitasPage,
    pageItems:  visitasPaged,
    totalPages: visitasTotalPages,
    totalItems: visitasTotalItems,
    pageSize:   VISITAS_PAGE_SIZE,
    goToPage:   goToVisitasPage,
  } = usePagination(visitas, 20);

  /* ── Render states ── */
  if (loading) {
    return (
      <div className={s.loadingWrap}>
        <span className={s.spinner} />
        <span>Cargando protocolo…</span>
      </div>
    );
  }

  if (pageErr) {
    return (
      <div className={s.errorWrap}>
        <p>{pageErr}</p>
        <button className={s.backBtn} onClick={() => navigate('/investigador/protocolos')}>
          ← Volver a protocolos
        </button>
      </div>
    );
  }

  const inclusion = protocolo.criterios?.filter(c => c.tipo === 'inclusion') ?? [];
  const exclusion = protocolo.criterios?.filter(c => c.tipo === 'exclusion') ?? [];

  return (
    <div className={s.page}>

      {/* ── Barra superior ── */}
      <div className={s.topBar}>
        <button className={s.backBtn} onClick={() => navigate('/investigador/protocolos')}>
          <ArrowLeftIcon /> Volver a protocolos
        </button>

        {!editMode ? (
          <button className={s.editBtn} onClick={handleEdit}>
            <EditIcon /> Editar campos
          </button>
        ) : (
          <div className={s.editActions}>
            <button className={s.cancelBtn} onClick={handleCancel} disabled={saving}>
              Cancelar
            </button>
            <button className={s.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? <span className={s.spinner} /> : <SaveIcon />}
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      {saveErr && <p className={s.saveErr}>{saveErr}</p>}

      {/* ── Encabezado del protocolo ── */}
      <div className={s.header}>
        <div className={s.headerMeta}>
          <span className={s.codigoBadge}>{protocolo.codigo}</span>
          <span className={s.faseBadge}>{protocolo.fase}</span>
        </div>
        {editMode ? (
          <input
            className={s.tituloInput}
            value={editForm.titulo}
            onChange={e => updateField('titulo', e.target.value)}
            placeholder="Título del protocolo"
          />
        ) : (
          <h1 className={s.titulo}>{protocolo.titulo}</h1>
        )}
      </div>

      {/* ── Grid de datos clave ── */}
      <div className={s.infoGrid}>

        <div className={s.infoCard}>
          <span className={s.infoLabel}>Estado</span>
          {editMode ? (
            <select
              className={s.infoSelect}
              value={editForm.idEstadoProtocolo}
              onChange={e => updateField('idEstadoProtocolo', e.target.value)}
            >
              {estados.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          ) : (
            <Badge variant={ESTADO_BADGE[protocolo.estado] ?? 'gray'} dot>
              {protocolo.estado}
            </Badge>
          )}
        </div>

        <div className={s.infoCard}>
          <span className={s.infoLabel}>Meta pacientes</span>
          {editMode ? (
            <input
              className={s.infoInput}
              type="number"
              min="1"
              value={editForm.metaPacientes}
              onChange={e => updateField('metaPacientes', e.target.value)}
              placeholder="—"
            />
          ) : (
            <span className={s.infoValue}>
              {protocolo.metaPacientes != null ? protocolo.metaPacientes : '—'}
            </span>
          )}
        </div>

        <div className={s.infoCard}>
          <span className={s.infoLabel}>Fecha inicio</span>
          <span className={s.infoValue}>{protocolo.fechaInicio ?? '—'}</span>
          {editMode && <span className={s.lockedNote}><LockIcon /> No editable</span>}
        </div>

        <div className={s.infoCard}>
          <span className={s.infoLabel}>Fin estimado</span>
          {editMode ? (
            <input
              className={s.infoInput}
              type="date"
              value={editForm.fechaFinEstimada}
              onChange={e => updateField('fechaFinEstimada', e.target.value)}
            />
          ) : (
            <span className={s.infoValue}>{protocolo.fechaFinEstimada ?? '—'}</span>
          )}
        </div>

      </div>

      {/* ── Objetivos ── */}
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Objetivos</h3>
        {editMode ? (
          <textarea
            className={s.objetivosTextarea}
            value={editForm.objetivos}
            onChange={e => updateField('objetivos', e.target.value)}
            placeholder="Describe los objetivos del protocolo…"
            rows={3}
          />
        ) : (
          <p className={s.objetivosText}>
            {protocolo.objetivos ?? <em className={s.empty}>Sin objetivos definidos.</em>}
          </p>
        )}
      </div>

      {/* ── Criterios (siempre solo lectura) ── */}
      {(inclusion.length > 0 || exclusion.length > 0) && (
        <div className={s.section}>
          <h3 className={s.sectionTitle}>
            Criterios de participación
            {editMode && <span className={s.lockedChip}><LockIcon /> Solo lectura</span>}
          </h3>
          <div className={s.criteriosGrid}>
            {inclusion.length > 0 && (
              <div className={s.criterioGroup}>
                <span className={`${s.tipoBadge} ${s.inclusion}`}>Inclusión</span>
                <ul className={s.criterioList}>
                  {inclusion.map(c => <li key={c.idCriterio}>{c.descripcion}</li>)}
                </ul>
              </div>
            )}
            {exclusion.length > 0 && (
              <div className={s.criterioGroup}>
                <span className={`${s.tipoBadge} ${s.exclusion}`}>Exclusión</span>
                <ul className={s.criterioList}>
                  {exclusion.map(c => <li key={c.idCriterio}>{c.descripcion}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Visitas (siempre solo lectura) ── */}
      {visitas.length > 0 && (
        <div className={s.section}>
          <h3 className={s.sectionTitle}>
            Visitas
            <span className={s.visitasCount}>{visitas.length}</span>
            {editMode && <span className={s.lockedChip}><LockIcon /> Solo lectura</span>}
          </h3>

          <div className={s.visitasList}>
            {visitasPaged.map(v => (
              <div key={v.idVisitaProtocolo} className={s.visitaCard}>
                <div className={s.visitaHeader}>
                  <span className={s.visitaNombre}>
                    {v.nombreVisita || `Semana ${v.semana}, ${DAY_NAMES[v.dia] ?? v.dia}`}
                  </span>
                  <span className={s.visitaMeta}>
                    Sem. {v.semana} · {DAY_NAMES[v.dia] ?? v.dia}
                  </span>
                </div>

                {v.descripcion && (
                  <p className={s.visitaDesc}>{v.descripcion}</p>
                )}

                {v.medicamentos?.length > 0 ? (
                  <ul className={s.medList}>
                    {v.medicamentos.map(m => (
                      <li key={m.idMedProtocolo} className={s.medItem}>
                        <span className={s.medNombre}>{m.nombreMedicamento}</span>
                        <span className={s.medDosis}>{m.dosis} {m.unidadDosis}</span>
                        {m.frecuencia && (
                          <span className={s.medFreq}>{m.frecuencia}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={s.noMeds}>Sin medicamentos asignados</p>
                )}
              </div>
            ))}
          </div>

          {visitasTotalPages > 1 && (
            <div className={s.paginationWrap}>
              <Pagination
                page={visitasPage}
                totalPages={visitasTotalPages}
                totalElements={visitasTotalItems}
                size={VISITAS_PAGE_SIZE}
                onPageChange={goToVisitasPage}
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
}

/* ── Íconos ─────────────────────────────────────────────────── */
function ArrowLeftIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function SaveIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
}
function LockIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
