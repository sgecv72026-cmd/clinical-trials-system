import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import pacientesService from '../../../services/pacientesService';
import reclutamientoService from '../../../services/reclutamientoService';
import { BadgeEstadoPaciente } from '../shared/BadgeEstadoPaciente';
import styles from './FichaPaciente.module.css';

export function FichaPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rol          = user?.rol ?? '';
  const esMedico     = rol.includes('Médico') || rol.includes('Medico');
  const esInvestigador = rol === 'Investigador Principal';

  const [detalle, setDetalle]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  /* Formulario antecedente */
  const [showFormAnt, setShowFormAnt]   = useState(false);
  const [formAnt, setFormAnt]           = useState({ descripcion: '', fechaDiagnostico: '' });
  const [erroresAnt, setErroresAnt]     = useState({});
  const [guardandoAnt, setGuardandoAnt] = useState(false);

  /* Formulario medicación habitual */
  const [showFormMed, setShowFormMed]   = useState(false);
  const [formMed, setFormMed]           = useState({ nombreMedicamento: '', dosis: '', frecuencia: '' });
  const [erroresMed, setErroresMed]     = useState({});
  const [guardandoMed, setGuardandoMed] = useState(false);

  const cargar = useCallback(() => {
    setLoading(true);
    setError(null);
    pacientesService.obtenerDetalle(Number(id))
      .then(setDetalle)
      .catch(e => setError(e.response?.data?.message ?? 'Error al cargar el paciente'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const agregarAntecedente = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formAnt.descripcion.trim()) errs.descripcion = 'La descripción es requerida';
    if (Object.keys(errs).length) { setErroresAnt(errs); return; }

    setGuardandoAnt(true);
    try {
      await pacientesService.agregarAntecedente(Number(id), {
        descripcion: formAnt.descripcion.trim(),
        fechaDiagnostico: formAnt.fechaDiagnostico || null,
      });
      setFormAnt({ descripcion: '', fechaDiagnostico: '' });
      setShowFormAnt(false);
      cargar();
    } catch (e) {
      setErroresAnt({ submit: e.response?.data?.message ?? 'Error al guardar' });
    } finally {
      setGuardandoAnt(false);
    }
  };

  const desactivarAntecedente = async (idAnt) => {
    if (!window.confirm('¿Desactivar este antecedente?')) return;
    try {
      await pacientesService.desactivarAntecedente(idAnt);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message ?? 'Error al desactivar');
    }
  };

  const agregarMedicacion = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formMed.nombreMedicamento.trim()) errs.nombreMedicamento = 'El nombre es requerido';
    if (Object.keys(errs).length) { setErroresMed(errs); return; }
    setGuardandoMed(true);
    try {
      await pacientesService.agregarMedicacion(Number(id), {
        nombreMedicamento: formMed.nombreMedicamento.trim(),
        dosis: formMed.dosis || null,
        frecuencia: formMed.frecuencia || null,
      });
      setFormMed({ nombreMedicamento: '', dosis: '', frecuencia: '' });
      setShowFormMed(false);
      cargar();
    } catch (e) {
      setErroresMed({ submit: e.response?.data?.message ?? 'Error al guardar' });
    } finally { setGuardandoMed(false); }
  };

  const desactivarMedicacion = async (idMed) => {
    if (!window.confirm('¿Eliminar este medicamento habitual?')) return;
    try {
      await pacientesService.desactivarMedicacion(idMed);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message ?? 'Error al desactivar');
    }
  };

  const formatFecha = (d) => {
    if (!d) return '—';
    return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  if (loading) return (
    <div className={styles.center}>
      <SpinIcon />
      <p>Cargando ficha del paciente…</p>
    </div>
  );

  if (error) return (
    <div className={styles.center}>
      <div className={styles.errorBox}><AlertIcon /> {error}</div>
      <button className={styles.btnBack} onClick={() => navigate('/pacientes')}>
        <ChevronIcon /> Volver
      </button>
    </div>
  );

  if (!detalle) return null;

  return (
    <div className={styles.page}>

      {/* Volver */}
      <button className={styles.backBtn} onClick={() => navigate('/pacientes')}>
        <ChevronIcon /> Volver a pacientes
      </button>

      {/* Cabecera del paciente */}
      <div className={styles.pacienteHeader}>
        <div className={styles.avatarWrap}>
          <span className={styles.avatar}>
            {detalle.nombre?.charAt(0)}{detalle.apellido?.charAt(0)}
          </span>
        </div>
        <div className={styles.pacienteInfo}>
          <div className={styles.pacienteNombre}>
            {esMedico
              ? `${detalle.nombre} ${detalle.apellido}`
              : detalle.pseudonimo}
          </div>
          <div className={styles.pacienteMeta}>
            <span className={styles.pseudonimoTag}>{detalle.pseudonimo}</span>
            <span>·</span>
            <span>{detalle.codigoProtocolo} — {detalle.protocolo}</span>
            <span>·</span>
            <span>{detalle.nombreCentro}</span>
          </div>
        </div>
        <BadgeEstadoPaciente activo={detalle.activo} />
      </div>

      {/* Acciones rápidas (médico e investigador) */}
      {(esMedico || esInvestigador) && (
        <div className={styles.quickActions}>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate(`/pacientes/${id}/visitas`)}
          >
            <CalendarIcon /> Ver Visitas
          </button>
        </div>
      )}

      <div className={styles.panelsGrid}>

        {/* Panel: Datos demográficos */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Datos del Paciente</h2>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.infoGrid}>
              {esMedico && (
                <>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Nombre completo</span>
                    <span className={styles.infoValue}>{detalle.nombre} {detalle.apellido}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Fecha de nacimiento</span>
                    <span className={styles.infoValue}>{formatFecha(detalle.fechaNacimiento)}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Género</span>
                    <span className={styles.infoValue}>{detalle.genero ?? '—'}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Contacto</span>
                    <span className={styles.infoValue}>{detalle.contacto ?? '—'}</span>
                  </div>
                </>
              )}
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Pseudónimo</span>
                <span className={`${styles.infoValue} ${styles.monospace}`}>{detalle.pseudonimo}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Protocolo</span>
                <span className={styles.infoValue}>{detalle.codigoProtocolo} — {detalle.protocolo}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Médico asignado</span>
                <span className={styles.infoValue}>{detalle.nombreMedico}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Centro</span>
                <span className={styles.infoValue}>{detalle.nombreCentro}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Fecha de admisión</span>
                <span className={styles.infoValue}>{formatFecha(detalle.fechaIngreso)}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Estado</span>
                <span className={styles.infoValue}><BadgeEstadoPaciente activo={detalle.activo} /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel: Consentimiento informado */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Consentimiento Informado</h2>
          </div>
          <div className={styles.panelBody}>
            {detalle.consentimiento ? (
              <div className={styles.infoGrid}>
                <div className={styles.infoField}>
                  <span className={styles.infoLabel}>Versión documento</span>
                  <span className={`${styles.infoValue} ${styles.monospace}`}>{detalle.consentimiento.versionDocumento}</span>
                </div>
                <div className={styles.infoField}>
                  <span className={styles.infoLabel}>Fecha de firma</span>
                  <span className={styles.infoValue}>{formatFecha(detalle.consentimiento.fechaFirma)}</span>
                </div>
                {detalle.consentimiento.observaciones && (
                  <div className={`${styles.infoField} ${styles.fullWidth}`}>
                    <span className={styles.infoLabel}>Observaciones</span>
                    <span className={styles.infoValue}>{detalle.consentimiento.observaciones}</span>
                  </div>
                )}
                {detalle.consentimiento.rutaArchivoPdf && (
                  <div className={`${styles.infoField} ${styles.fullWidth}`}>
                    <span className={styles.infoLabel}>Archivo PDF</span>
                    <button
                      className={styles.btnVerPdf}
                      onClick={() => reclutamientoService.abrirPdfConsentimiento(detalle.consentimiento.rutaArchivoPdf)}
                    >
                      <PdfIcon /> Ver consentimiento firmado
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyPanel}>
                <DocumentIcon />
                <p>Sin consentimiento registrado</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Panel: Antecedentes médicos */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Antecedentes Médicos</h2>
          {esMedico && (
            <button
              className={styles.btnPrimary}
              onClick={() => setShowFormAnt(v => !v)}
            >
              <PlusIcon /> {showFormAnt ? 'Cancelar' : 'Agregar antecedente'}
            </button>
          )}
        </div>

        {/* Formulario para nuevo antecedente */}
        {showFormAnt && (
          <div className={styles.formAntWrap}>
            <form onSubmit={agregarAntecedente} className={styles.formAnt}>
              {erroresAnt.submit && (
                <div className={styles.warningBox}><AlertIcon /> {erroresAnt.submit}</div>
              )}
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Descripción <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={`${styles.textarea} ${erroresAnt.descripcion ? styles.inputError : ''}`}
                    value={formAnt.descripcion}
                    onChange={e => setFormAnt(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Ej: Diabetes tipo 2, Hipertensión arterial…"
                    rows={3}
                  />
                  {erroresAnt.descripcion && (
                    <span className={styles.fieldError}><AlertIcon /> {erroresAnt.descripcion}</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Fecha diagnóstico</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={formAnt.fechaDiagnostico}
                    onChange={e => setFormAnt(f => ({ ...f, fechaDiagnostico: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowFormAnt(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={guardandoAnt}>
                  {guardandoAnt ? <SpinIcon /> : <PlusIcon />}
                  {guardandoAnt ? 'Guardando…' : 'Guardar antecedente'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.panelBody}>
          {(detalle.antecedentes ?? []).length > 0 ? (
            <div className={styles.antecedentesList}>
              {detalle.antecedentes.map(a => (
                <div key={a.idAntecedente} className={styles.antecedenteItem}>
                  <div className={styles.antInfo}>
                    <p className={styles.antDescripcion}>{a.descripcion}</p>
                    <p className={styles.antMeta}>
                      {a.fechaDiagnostico && <span>Diagnosticado: {formatFecha(a.fechaDiagnostico)} · </span>}
                      Registrado por {a.registradoPorNombre}
                    </p>
                  </div>
                  {esMedico && (
                    <button
                      className={styles.btnDesactivar}
                      onClick={() => desactivarAntecedente(a.idAntecedente)}
                      title="Desactivar antecedente"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyPanel}>
              <ClipboardIcon />
              <p>No hay antecedentes médicos registrados</p>
            </div>
          )}
        </div>
      </div>
      {/* Panel: Medicación Habitual */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Medicación Habitual</h2>
          {esMedico && (
            <button className={styles.btnPrimary} onClick={() => setShowFormMed(v => !v)}>
              <PlusIcon /> {showFormMed ? 'Cancelar' : 'Agregar medicamento'}
            </button>
          )}
        </div>

        {showFormMed && (
          <div className={styles.formAntWrap}>
            <form onSubmit={agregarMedicacion} className={styles.formAnt}>
              {erroresMed.submit && (
                <div className={styles.warningBox}><AlertIcon /> {erroresMed.submit}</div>
              )}
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Nombre del medicamento <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${erroresMed.nombreMedicamento ? styles.inputError : ''}`}
                    value={formMed.nombreMedicamento}
                    onChange={e => setFormMed(f => ({ ...f, nombreMedicamento: e.target.value }))}
                    placeholder="Ej: Metformina, Atorvastatina…"
                  />
                  {erroresMed.nombreMedicamento && (
                    <span className={styles.fieldError}><AlertIcon /> {erroresMed.nombreMedicamento}</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Dosis</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formMed.dosis}
                    onChange={e => setFormMed(f => ({ ...f, dosis: e.target.value }))}
                    placeholder="Ej: 500 mg"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Frecuencia</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formMed.frecuencia}
                    onChange={e => setFormMed(f => ({ ...f, frecuencia: e.target.value }))}
                    placeholder="Ej: 1 vez al día, cada 8 horas…"
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowFormMed(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={guardandoMed}>
                  {guardandoMed ? <SpinIcon /> : <PlusIcon />}
                  {guardandoMed ? 'Guardando…' : 'Guardar medicamento'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.panelBody}>
          {(detalle.medicacionHabitual ?? []).length > 0 ? (
            <div className={styles.antecedentesList}>
              {(detalle.medicacionHabitual ?? []).map(m => (
                <div key={m.idMedicacion} className={styles.antecedenteItem}>
                  <div className={styles.antInfo}>
                    <p className={styles.antDescripcion}>
                      <strong>{m.nombreMedicamento}</strong>
                      {m.dosis && <span style={{ marginLeft: '8px', color: '#6b7280' }}>{m.dosis}</span>}
                      {m.frecuencia && <span style={{ marginLeft: '8px', color: '#6b7280' }}>· {m.frecuencia}</span>}
                    </p>
                    <p className={styles.antMeta}>
                      Registrado por {m.registradoPorNombre}
                    </p>
                  </div>
                  {esMedico && (
                    <button
                      className={styles.btnDesactivar}
                      onClick={() => desactivarMedicacion(m.idMedicacion)}
                      title="Eliminar medicamento"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyPanel}>
              <PillEmptyIcon />
              <p>No hay medicación habitual registrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Iconos SVG ──────────────────────────────────────────────────── */
function ChevronIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function SpinIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function CalendarIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function DocumentIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function ClipboardIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function PillEmptyIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
}
function PdfIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
}
