import { useState } from 'react';
import investigadorService from '../../../../../services/investigadorService';
import styles from './Steps.module.css';
import s from './Step4Medicamentos.module.css';

const EMPTY_MED = { idMedicamento: '', dosis: '', idUnidadDosis: '', frecuencia: '' };
const EMPTY_NEW = { nombre: '', descripcion: '' };

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function Step4Medicamentos({ data, onChange, catalogos, onCatalogoUpdate }) {
  /* ── Panel "Aplicar a todas" ────────────────────────────── */
  const [globalOpen, setGlobalOpen] = useState(false);
  const [globalMed,  setGlobalMed]  = useState(EMPTY_MED);
  const [applyOk,    setApplyOk]    = useState(false);

  /* ── Formulario inline "Crear medicamento"
       ctx: null | 'global' | { visitaIdx, medIdx }          */
  const [createCtx, setCreateCtx] = useState(null);
  const [newMed,    setNewMed]    = useState(EMPTY_NEW);
  const [creating,  setCreating]  = useState(false);
  const [createErr, setCreateErr] = useState('');

  /* ── Aplicar config global a todas las visitas ─────────── */
  function handleApplyAll() {
    if (!globalMed.idMedicamento || !globalMed.dosis || !globalMed.idUnidadDosis) return;
    onChange(prev => ({
      ...prev,
      visitas: prev.visitas.map(v => ({
        ...v,
        medicamentos: [...v.medicamentos, { ...globalMed }],
      })),
    }));
    setApplyOk(true);
    setGlobalMed(EMPTY_MED);
    setTimeout(() => setApplyOk(false), 2800);
  }

  /* ── CRUD medicamentos por visita ───────────────────────── */
  function addMed(visitaIdx) {
    onChange(prev => ({
      ...prev,
      visitas: prev.visitas.map((v, i) =>
        i === visitaIdx ? { ...v, medicamentos: [...v.medicamentos, { ...EMPTY_MED }] } : v
      ),
    }));
  }

  function removeMed(visitaIdx, medIdx) {
    // Si el form de creación estaba abierto en esa fila, cerrarlo
    if (
      createCtx !== null && createCtx !== 'global' &&
      createCtx.visitaIdx === visitaIdx && createCtx.medIdx === medIdx
    ) {
      setCreateCtx(null);
    }
    onChange(prev => ({
      ...prev,
      visitas: prev.visitas.map((v, i) =>
        i === visitaIdx
          ? { ...v, medicamentos: v.medicamentos.filter((_, j) => j !== medIdx) }
          : v
      ),
    }));
  }

  function updateMed(visitaIdx, medIdx, field, value) {
    onChange(prev => ({
      ...prev,
      visitas: prev.visitas.map((v, i) =>
        i === visitaIdx
          ? { ...v, medicamentos: v.medicamentos.map((m, j) => j === medIdx ? { ...m, [field]: value } : m) }
          : v
      ),
    }));
  }

  /* ── Crear medicamento inline ───────────────────────────── */
  function openCreate(ctx) {
    setCreateCtx(ctx);
    setNewMed(EMPTY_NEW);
    setCreateErr('');
  }

  function cancelCreate() {
    setCreateCtx(null);
    setNewMed(EMPTY_NEW);
    setCreateErr('');
  }

  async function handleCrearMed() {
    if (!newMed.nombre.trim()) { setCreateErr('El nombre es obligatorio.'); return; }
    setCreating(true);
    setCreateErr('');
    try {
      const created = await investigadorService.crearMedicamento({
        nombre: newMed.nombre.trim(),
        descripcion: newMed.descripcion.trim() || null,
      });
      // Actualizar catálogo en el modal padre
      onCatalogoUpdate(prev => ({ ...prev, medicamentos: [...prev.medicamentos, created] }));
      // Auto-seleccionar el nuevo medicamento en la ranura correcta
      if (createCtx === 'global') {
        setGlobalMed(p => ({ ...p, idMedicamento: String(created.id) }));
      } else if (createCtx) {
        updateMed(createCtx.visitaIdx, createCtx.medIdx, 'idMedicamento', String(created.id));
      }
      setCreateCtx(null);
      setNewMed(EMPTY_NEW);
    } catch (err) {
      const msg = err?.response?.data?.mensaje
        ?? 'Error al crear el medicamento. Intenta de nuevo.';
      setCreateErr(msg);
    } finally {
      setCreating(false);
    }
  }

  /* ── Guard: sin visitas ─────────────────────────────────── */
  if (data.visitas.length === 0) {
    return (
      <div className={styles.stepContent}>
        <p className={styles.emptyHint}>
          No hay visitas programadas. Regresa al paso anterior para agregar visitas.
        </p>
      </div>
    );
  }

  const canApply = !!(globalMed.idMedicamento && globalMed.dosis && globalMed.idUnidadDosis);

  return (
    <div className={styles.stepContent}>
      <p className={styles.hint}>
        Asigna medicamentos a cada visita. Usa el panel verde para configurar un medicamento
        y aplicarlo a todas las visitas de un solo clic. Crea nuevos medicamentos con el botón&nbsp;
        <strong>[+]</strong> junto a cada selector.
      </p>

      {/* ── Panel "Aplicar a todas las visitas" ── */}
      <div className={s.globalCard}>
        <button
          type="button"
          className={s.globalToggle}
          onClick={() => setGlobalOpen(v => !v)}
        >
          <BroadcastIcon />
          Aplicar medicamento a todas las visitas
          <span className={s.chevron}>{globalOpen ? '▲' : '▼'}</span>
        </button>

        {globalOpen && (
          <div className={s.globalBody}>
            <p className={s.globalHint}>
              Configura el medicamento y presiona "Agregar a todas" para añadirlo a cada visita del protocolo.
              Usa <strong>[+]</strong> para crear un nuevo medicamento al vuelo.
            </p>

            <div className={styles.medRow}>
              {/* Select + crear */}
              <div className={s.selectWrapper}>
                <select
                  className={`${styles.select} ${s.selectInWrapper}`}
                  value={globalMed.idMedicamento}
                  onChange={e => setGlobalMed(p => ({ ...p, idMedicamento: e.target.value }))}
                >
                  <option value="">Medicamento…</option>
                  {catalogos.medicamentos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className={s.newMedBtn}
                  onClick={() => createCtx === 'global' ? cancelCreate() : openCreate('global')}
                  title={createCtx === 'global' ? 'Cancelar creación' : 'Crear nuevo medicamento'}
                >
                  {createCtx === 'global' ? '✕' : '+'}
                </button>
              </div>

              <input
                className={`${styles.input} ${styles.dosisInput}`}
                type="number"
                min="0.01"
                step="0.01"
                value={globalMed.dosis}
                onChange={e => setGlobalMed(p => ({ ...p, dosis: e.target.value }))}
                placeholder="Dosis"
              />

              <select
                className={`${styles.select} ${styles.unidadSelect}`}
                value={globalMed.idUnidadDosis}
                onChange={e => setGlobalMed(p => ({ ...p, idUnidadDosis: e.target.value }))}
              >
                <option value="">Unidad…</option>
                {catalogos.unidadesDosis.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>

              <input
                className={styles.input}
                value={globalMed.frecuencia}
                onChange={e => setGlobalMed(p => ({ ...p, frecuencia: e.target.value }))}
                placeholder="Frecuencia (Ej: Cada 8h)"
              />
            </div>

            {/* Formulario inline de creación en panel global */}
            {createCtx === 'global' && (
              <CreateMedForm
                newMed={newMed}
                setNewMed={setNewMed}
                creating={creating}
                createErr={createErr}
                onSave={handleCrearMed}
                onCancel={cancelCreate}
              />
            )}

            {applyOk && (
              <div className={s.applyBanner}>
                <CheckCircleIcon />
                Medicamento añadido a todas las visitas correctamente.
              </div>
            )}

            <div className={s.globalActions}>
              <button
                type="button"
                className={s.applyAllBtn}
                onClick={handleApplyAll}
                disabled={!canApply}
              >
                <BroadcastIcon />
                Agregar a todas las visitas ({data.visitas.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Medicamentos por visita ── */}
      {data.visitas.map((v, visitaIdx) => (
        <div key={visitaIdx} className={styles.visitaCard}>
          <div className={styles.visitaCardHeader}>
            <span className={styles.visitaNum}>
              {v.nombreVisita || `Visita ${visitaIdx + 1}`}
              <span className={styles.visitaMeta}>
                {' — '}Semana {v.semana || '?'}{v.dia ? `, ${DAY_NAMES[Number(v.dia)] || ''}` : ''}
              </span>
            </span>
            <button type="button" className={styles.addSmallBtn} onClick={() => addMed(visitaIdx)}>
              + Medicamento
            </button>
          </div>

          {v.medicamentos.length === 0 && (
            <p className={styles.emptyHint}>Sin medicamentos en esta visita.</p>
          )}

          {v.medicamentos.map((m, medIdx) => {
            const isMyCreate =
              createCtx !== null &&
              createCtx !== 'global' &&
              createCtx.visitaIdx === visitaIdx &&
              createCtx.medIdx === medIdx;

            return (
              <div key={medIdx} className={s.medBlock}>
                <div className={styles.medRow}>
                  {/* Select + crear nuevo */}
                  <div className={s.selectWrapper}>
                    <select
                      className={`${styles.select} ${s.selectInWrapper}`}
                      value={m.idMedicamento}
                      onChange={e => updateMed(visitaIdx, medIdx, 'idMedicamento', e.target.value)}
                    >
                      <option value="">Medicamento…</option>
                      {catalogos.medicamentos.map(med => (
                        <option key={med.id} value={med.id}>{med.nombre}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={s.newMedBtn}
                      onClick={() =>
                        isMyCreate
                          ? cancelCreate()
                          : openCreate({ visitaIdx, medIdx })
                      }
                      title={isMyCreate ? 'Cancelar creación' : 'Crear nuevo medicamento'}
                    >
                      {isMyCreate ? '✕' : '+'}
                    </button>
                  </div>

                  <input
                    className={`${styles.input} ${styles.dosisInput}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={m.dosis}
                    onChange={e => updateMed(visitaIdx, medIdx, 'dosis', e.target.value)}
                    placeholder="Dosis"
                  />

                  <select
                    className={`${styles.select} ${styles.unidadSelect}`}
                    value={m.idUnidadDosis}
                    onChange={e => updateMed(visitaIdx, medIdx, 'idUnidadDosis', e.target.value)}
                  >
                    <option value="">Unidad…</option>
                    {catalogos.unidadesDosis.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                  </select>

                  <input
                    className={styles.input}
                    value={m.frecuencia}
                    onChange={e => updateMed(visitaIdx, medIdx, 'frecuencia', e.target.value)}
                    placeholder="Frecuencia (Ej: Cada 8h)"
                  />

                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeMed(visitaIdx, medIdx)}
                    aria-label="Eliminar medicamento"
                  >
                    <TrashIcon />
                  </button>
                </div>

                {/* Formulario inline de creación para esta fila */}
                {isMyCreate && (
                  <CreateMedForm
                    newMed={newMed}
                    setNewMed={setNewMed}
                    creating={creating}
                    createErr={createErr}
                    onSave={handleCrearMed}
                    onCancel={cancelCreate}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Sub-componente: formulario inline de creación ─────────── */
function CreateMedForm({ newMed, setNewMed, creating, createErr, onSave, onCancel }) {
  return (
    <div className={s.createMedForm}>
      <p className={s.createMedTitle}>
        <PlusCircleIcon />
        Crear nuevo medicamento
      </p>
      <div className={s.createMedFields}>
        <div>
          <label className={s.createMedLabel}>Nombre <span className={s.req}>*</span></label>
          <input
            className={s.createMedInput}
            value={newMed.nombre}
            onChange={e => setNewMed(p => ({ ...p, nombre: e.target.value }))}
            placeholder="Nombre del medicamento"
            autoFocus
            disabled={creating}
          />
        </div>
        <div>
          <label className={s.createMedLabel}>Descripción</label>
          <textarea
            className={`${s.createMedInput} ${s.createMedTextarea}`}
            value={newMed.descripcion}
            onChange={e => {
              setNewMed(p => ({ ...p, descripcion: e.target.value }));
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder="Opcional"
            disabled={creating}
            rows={1}
          />
        </div>
      </div>
      {createErr && <p className={s.createErr}>{createErr}</p>}
      <div className={s.createMedActions}>
        <button
          type="button"
          className={s.cancelMedBtn}
          onClick={onCancel}
          disabled={creating}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={s.saveMedBtn}
          onClick={onSave}
          disabled={creating}
        >
          {creating ? 'Guardando…' : 'Guardar medicamento'}
        </button>
      </div>
    </div>
  );
}

/* ── Íconos ─────────────────────────────────────────────────── */
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function BroadcastIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M20.49 3.51a14 14 0 0 1 0 16.98M3.51 20.49a14 14 0 0 1 0-16.97"/></svg>;
}
function CheckCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function PlusCircleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
