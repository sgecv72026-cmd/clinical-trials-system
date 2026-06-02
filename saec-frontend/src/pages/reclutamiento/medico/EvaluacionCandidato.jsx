import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import reclutamientoService from '../../../services/reclutamientoService';
import { useAuth } from '../../../hooks/useAuth';
import styles from './EvaluacionCandidato.module.css';

const PASOS = [
  'Datos del Candidato',
  'Antecedentes Médicos',
  'Consentimiento',
  'Decisión Final',
];

export function EvaluacionCandidato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const esMedico       = user?.rol?.includes('Médico') || user?.rol?.includes('Medico');
  const esCoordinador  = user?.rol?.includes('Coordinador');
  const esInvestigador = user?.rol?.includes('Investigador');

  const [paso, setPaso]       = useState(0);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [guardando, setGuardando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  /* ── Edición datos candidato (Coordinador) ─── */
  const [editandoDatos, setEditandoDatos] = useState(false);
  const [datosEdit, setDatosEdit]         = useState({ nombre: '', apellido: '', fechaNacimiento: '', contacto: '', observacion: '' });

  /* ── Criterios (Coordinador) ─── */
  const [criterios, setCriterios]               = useState({});
  const [criteriosGuardadosOk, setCriteriosGuardadosOk] = useState(false);
  const [editandoCriterios, setEditandoCriterios] = useState(false);

  /* ── Paso 1: Antecedentes ─── */
  const [antecedentes, setAntecedentes] = useState([]);
  const [nuevaDesc, setNuevaDesc]       = useState('');
  const [nuevaFecha, setNuevaFecha]     = useState('');

  /* ── Paso 2: Consentimiento ── */
  const [consent, setConsent] = useState({
    fechaFirma: '', versionDocumento: '', rutaArchivoPdf: '', observaciones: '',
  });
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfNombre, setPdfNombre]       = useState('');

  /* ── Paso 3: Decisión ──────── */
  const [decision, setDecision]         = useState('');
  const [motivoNoApto, setMotivoNoApto] = useState('');

  /* ── Carga inicial ──────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    setError('');

    const cargarDatos = async () => {
      try {
        // Si es médico: iniciar evaluación primero (idempotente)
        if (esMedico) {
          await reclutamientoService.iniciarEvaluacion(id);
        }

        const det = await reclutamientoService.getDetalleCandidato(id);
        setDetalle(det);

        if (det.antecedentes) setAntecedentes(det.antecedentes);

        if (det.criteriosEvaluados?.length) {
          const mapa = {};
          det.criteriosEvaluados.forEach(c => { mapa[c.idCriterio] = c.cumple; });
          setCriterios(mapa);
        }

        if (det.consentimiento) {
          setConsent({
            fechaFirma:       det.consentimiento.fechaFirma?.split('T')[0] ?? '',
            versionDocumento: det.consentimiento.versionDocumento ?? '',
            rutaArchivoPdf:   det.consentimiento.rutaArchivoPdf ?? '',
            observaciones:    det.consentimiento.observaciones ?? '',
          });
          if (det.consentimiento.rutaArchivoPdf) {
            const partes = det.consentimiento.rutaArchivoPdf.split('/');
            setPdfNombre(partes[partes.length - 1]);
          }
        }
      } catch (e) {
        setError(e.response?.data?.message ?? 'Error al cargar datos del candidato');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, esMedico]);

  /* ── Helpers ─────────────────────────────────────────────── */
  const avanzar   = () => { setError(''); setPaso(p => Math.min(p + 1, PASOS.length - 1)); };
  const retroceder = () => { setError(''); setPaso(p => Math.max(p - 1, 0)); };

  const calcularElegib = () => {
    const criteriosProto = detalle?.criteriosProtocolo ?? [];
    if (!criteriosProto.length) return null;
    for (const c of criteriosProto) {
      const evaluado = criterios[c.idCriterio];
      if (evaluado === undefined) return null;
      if (c.tipo === 'inclusion' && !evaluado)  return false;
      if (c.tipo === 'exclusion' &&  evaluado)  return false;
    }
    return true;
  };

  /* ── Guardar datos candidato (Coordinador) ──────────────────── */
  const abrirEdicionDatos = () => {
    setDatosEdit({
      nombre:          detalle.nombre ?? '',
      apellido:        detalle.apellido ?? '',
      fechaNacimiento: detalle.fechaNacimiento ?? '',
      contacto:        detalle.contacto ?? '',
      observacion:     detalle.observacionGeneral ?? '',
    });
    setError('');
    setEditandoDatos(true);
  };

  const guardarDatosCandidato = async () => {
    if (!datosEdit.nombre.trim() || !datosEdit.apellido.trim()) {
      setError('El nombre y el apellido son requeridos');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      await reclutamientoService.actualizarCandidato(id, {
        nombre:          datosEdit.nombre.trim(),
        apellido:        datosEdit.apellido.trim(),
        fechaNacimiento: datosEdit.fechaNacimiento || null,
        contacto:        datosEdit.contacto.trim() || null,
        observacion:     datosEdit.observacion.trim() || null,
      });
      const det = await reclutamientoService.getDetalleCandidato(id);
      setDetalle(det);
      setEditandoDatos(false);
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al actualizar datos del candidato');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Guardar criterios (Coordinador) ─────────────────────── */
  const guardarCriteriosCoordinador = async () => {
    const idPostulacion  = detalle?.idPostulacion;
    const criteriosProto = detalle?.criteriosProtocolo ?? [];
    if (!idPostulacion || criteriosProto.length === 0) return;

    const sinEvaluar = criteriosProto.filter(
      c => criterios[c.idCriterio] === undefined || criterios[c.idCriterio] === null
    );
    if (sinEvaluar.length > 0) {
      setError(`Debe evaluar todos los criterios antes de guardar (${sinEvaluar.length} pendiente${sinEvaluar.length > 1 ? 's' : ''})`);
      return;
    }

    setError('');
    const payload = criteriosProto.map(c => ({
      idCriterio:  c.idCriterio,
      cumple:      criterios[c.idCriterio],
      observacion: null,
    }));

    setGuardando(true);
    try {
      await reclutamientoService.guardarCriterios(idPostulacion, payload);
      setCriteriosGuardadosOk(true);
      setEditandoCriterios(false);
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al guardar criterios');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Subir PDF consentimiento ────────────────────────────── */
  const handlePdfChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Solo se permiten archivos PDF. Por favor selecciona un archivo con extensión .pdf');
      e.target.value = '';
      return;
    }
    setPdfUploading(true);
    setError('');
    try {
      const result = await reclutamientoService.subirPdfConsentimiento(id, file);
      setConsent(c => ({ ...c, rutaArchivoPdf: result.rutaArchivoPdf }));
      setPdfNombre(file.name);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al subir el PDF');
    } finally {
      setPdfUploading(false);
    }
  };

  /* ── Guardar consentimiento (paso 2 → 3) ─────────────────── */
  const guardarConsentimiento = async () => {
    if (!consent.fechaFirma || !consent.versionDocumento) {
      setError('La fecha de firma y la versión del documento son requeridas');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      await reclutamientoService.registrarConsentimiento(id, {
        fechaFirma:       consent.fechaFirma,
        versionDocumento: consent.versionDocumento,
        rutaArchivoPdf:   consent.rutaArchivoPdf || null,
        observaciones:    consent.observaciones || null,
      });
      avanzar();
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al registrar consentimiento');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Agregar antecedente ──────────────────────────────────── */
  const agregarAntecedente = async () => {
    if (!nuevaDesc.trim()) return;
    setGuardando(true);
    try {
      const nuevo = await reclutamientoService.agregarAntecedente(id, {
        descripcion:      nuevaDesc.trim(),
        fechaDiagnostico: nuevaFecha || null,
      });
      setAntecedentes(prev => [...prev, nuevo]);
      setNuevaDesc('');
      setNuevaFecha('');
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al agregar antecedente');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Desactivar antecedente ───────────────────────────────── */
  const desactivarAntecedente = async (idAntecedente) => {
    setGuardando(true);
    try {
      await reclutamientoService.desactivarAntecedente(idAntecedente);
      setAntecedentes(prev => prev.filter(a => a.idAntecedente !== idAntecedente));
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al eliminar antecedente');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Decisión final ───────────────────────────────────────── */
  const ejecutarDecision = async () => {
    if (!decision) { setError('Seleccione una decisión'); return; }
    if (decision === 'noApto' && !motivoNoApto.trim()) {
      setError('Ingrese el motivo para marcar como no apto');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      if (decision === 'inscribir') {
        await reclutamientoService.inscribirPaciente(id);
      } else {
        const idPostulacion = detalle?.idPostulacion;
        await reclutamientoService.marcarNoApto(idPostulacion, motivoNoApto.trim());
      }
      setFinalizado(true);
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al ejecutar decisión');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Render ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.page}>
        <p style={{ color: 'var(--color-gray-500)', padding: '2rem' }}>Cargando datos del candidato…</p>
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>{error || 'No se pudo cargar el candidato.'}</div>
      </div>
    );
  }

  const criteriosProto = detalle.criteriosProtocolo ?? [];
  const elegib = calcularElegib();
  const iniciales = `${detalle.nombre?.[0] ?? '?'}${detalle.apellido?.[0] ?? ''}`.toUpperCase();

  return (
    <div className={styles.page}>

      {/* Volver */}
      <button className={styles.backBtn} onClick={() => navigate('/reclutamiento')}>
        <ChevronLeftIcon /> Volver a candidatos
      </button>

      {/* Cabecera candidato */}
      <div className={styles.candidatoHeader}>
        <div className={styles.candidatoAvatar}>{iniciales}</div>
        <div className={styles.candidatoInfo}>
          <p className={styles.candidatoNombre}>{detalle.nombre} {detalle.apellido}</p>
          <div className={styles.candidatoMeta}>
            <span>{detalle.codigoProtocolo} — {detalle.protocolo}</span>
            <span>·</span>
            <span>{detalle.centro}</span>
          </div>
        </div>
      </div>

      {/* Stepper — solo visible para el médico */}
      {esMedico && (
        <div className={styles.stepper}>
          {PASOS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < PASOS.length - 1 ? 1 : 'none' }}>
              <div className={`${styles.step} ${i === paso ? styles.active : ''} ${i < paso ? styles.done : ''}`}>
                <div className={styles.stepNumber}>
                  {i < paso ? <CheckSmallIcon /> : i + 1}
                </div>
                <span className={styles.stepLabel}>{label}</span>
              </div>
              {i < PASOS.length - 1 && <div className={styles.stepSep} />}
            </div>
          ))}
        </div>
      )}

      {/* ── PASO 0: Datos del candidato ─────────────────────── */}
      {(paso === 0 || !esMedico) && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Datos del Candidato</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {!esMedico && (
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: detalle.estadoPostulacion === 'Aceptado' ? 'var(--color-success-light, #d1fae5)'
                            : detalle.estadoPostulacion === 'Rechazado' ? 'var(--color-danger-light, #fee2e2)'
                            : 'var(--color-gray-100)',
                  color: detalle.estadoPostulacion === 'Aceptado' ? 'var(--color-success, #065f46)'
                       : detalle.estadoPostulacion === 'Rechazado' ? 'var(--color-danger, #b91c1c)'
                       : 'var(--color-gray-600)',
                }}>
                  {detalle.estadoPostulacion ?? 'En Espera'}
                </span>
              )}
              {esCoordinador && !editandoDatos && (
                <button className={styles.btnEditar} onClick={abrirEdicionDatos}>
                  <PencilIcon /> Editar
                </button>
              )}
            </div>
          </div>
          <div className={styles.panelBody}>

            {/* ── Modo lectura ── */}
            {!editandoDatos && (
              <>
                <div className={styles.infoGrid}>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Nombre completo</span>
                    <span className={styles.infoValue}>{detalle.nombre} {detalle.apellido}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Fecha de nacimiento</span>
                    <span className={styles.infoValue}>
                      {detalle.fechaNacimiento
                        ? new Date(detalle.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-CL')
                        : '—'}
                    </span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Género</span>
                    <span className={styles.infoValue}>{detalle.genero ?? '—'}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Contacto</span>
                    <span className={styles.infoValue}>{detalle.contacto ?? '—'}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Centro</span>
                    <span className={styles.infoValue}>{detalle.centro ?? '—'}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Protocolo</span>
                    <span className={styles.infoValue}>{detalle.codigoProtocolo} — {detalle.protocolo}</span>
                  </div>
                  {detalle.fechaDecision && (
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Fecha de decisión</span>
                      <span className={styles.infoValue}>{new Date(detalle.fechaDecision).toLocaleDateString('es-CL')}</span>
                    </div>
                  )}
                </div>

                {detalle.observacionGeneral && (
                  <div className={styles.protocoloBox}>
                    <h4>Observación del coordinador</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>
                      {detalle.observacionGeneral}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── Modo edición (solo coordinador) ── */}
            {editandoDatos && (
              <>
                <div className={styles.consentGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nombre <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input
                      className={styles.input}
                      value={datosEdit.nombre}
                      onChange={e => setDatosEdit(d => ({ ...d, nombre: e.target.value }))}
                      placeholder="Nombre del candidato"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Apellido <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input
                      className={styles.input}
                      value={datosEdit.apellido}
                      onChange={e => setDatosEdit(d => ({ ...d, apellido: e.target.value }))}
                      placeholder="Apellido del candidato"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Fecha de nacimiento</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={datosEdit.fechaNacimiento ?? ''}
                      onChange={e => setDatosEdit(d => ({ ...d, fechaNacimiento: e.target.value }))}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Contacto</label>
                    <input
                      className={styles.input}
                      value={datosEdit.contacto}
                      onChange={e => setDatosEdit(d => ({ ...d, contacto: e.target.value }))}
                      placeholder="7 a 10 dígitos numéricos"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Observación</label>
                  <textarea
                    className={styles.textarea}
                    value={datosEdit.observacion}
                    onChange={e => setDatosEdit(d => ({ ...d, observacion: e.target.value }))}
                    placeholder="Información adicional relevante sobre el candidato…"
                  />
                </div>
              </>
            )}

            {/* Criterios en modo lectura — visible para médico e investigador */}
            {(esMedico || esInvestigador) && criteriosProto.length > 0 && (
              <div className={styles.criteriosReadonlyBox}>
                <p className={styles.criteriosReadonlyTitle}>Criterios de Elegibilidad</p>
                {criteriosProto.map(c => {
                  const evaluado = detalle.criteriosEvaluados?.find(ev => ev.idCriterio === c.idCriterio);
                  return (
                    <div key={c.idCriterio} className={styles.criterioRow} style={{ opacity: 0.85 }}>
                      <span className={`${styles.tipoBadge} ${c.tipo === 'inclusion' ? styles.inclusion : styles.exclusion}`}>
                        {c.tipo === 'inclusion' ? 'INC' : 'EXC'}
                      </span>
                      <span className={styles.criterioDesc}>{c.descripcion}</span>
                      {evaluado
                        ? <span className={`${styles.criterioResultado} ${evaluado.cumple ? styles.cumpleTexto : styles.noCumpleTexto}`}>
                            {evaluado.cumple ? '✓ Sí' : '✗ No'}
                          </span>
                        : <span className={styles.criterioResultado} style={{ color: 'var(--color-gray-400)' }}>—</span>
                      }
                    </div>
                  );
                })}
              </div>
            )}

            {/* Historial — visible para no-médicos */}
            {!esMedico && detalle.historial?.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)', marginBottom: '0.5rem' }}>Historial</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {detalle.historial.map((h, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span>{new Date(h.fechaModificacion).toLocaleDateString('es-CL')}</span>
                      <span>·</span>
                      <span>{h.estadoAnterior ?? '—'} → {h.estadoNuevo}</span>
                      <span>·</span>
                      <span>{h.nombreUsuario}</span>
                      {h.motivo && <><span>·</span><span style={{ fontStyle: 'italic' }}>{h.motivo}</span></>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && editandoDatos && (
            <div className={styles.errorBox} style={{ margin: '0 1.5rem' }}>{error}</div>
          )}
          <div className={styles.panelFooter}>
            {editandoDatos ? (
              <>
                <button className={styles.btnBack} onClick={() => { setEditandoDatos(false); setError(''); }} disabled={guardando}>
                  Cancelar
                </button>
                <button className={styles.btnNext} onClick={guardarDatosCandidato} disabled={guardando}>
                  {guardando ? 'Guardando…' : <><CheckCircleIcon /> Guardar datos</>}
                </button>
              </>
            ) : (
              <>
                <div />
                {esMedico && (
                  <button className={styles.btnNext} onClick={avanzar}>
                    Siguiente <ChevronRightIcon />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PANEL CRITERIOS — solo coordinador ────── */}
      {esCoordinador && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Criterios de Elegibilidad</h2>
            {criteriosProto.length > 0 && !editandoCriterios && (
              <button
                className={styles.btnEditar}
                onClick={() => { setEditandoCriterios(true); setCriteriosGuardadosOk(false); }}
              >
                <PencilIcon /> Editar
              </button>
            )}
          </div>
          <div className={styles.panelBody}>

            {criteriosProto.length === 0 ? (
              <div className={styles.warningBox}>
                <WarningIcon />
                <span>Este protocolo no tiene criterios definidos.</span>
              </div>
            ) : (
              <>
                {criteriosGuardadosOk && (
                  <div className={styles.successBanner}>
                    <CheckCircleIcon /> Criterios guardados exitosamente
                  </div>
                )}

                {/* Modo lectura */}
                {!editandoCriterios && (
                  <div className={styles.criteriosList}>
                    {criteriosProto.map(c => {
                      const val = criterios[c.idCriterio];
                      return (
                        <div key={c.idCriterio} className={styles.criterioRow} style={{ opacity: 0.85 }}>
                          <span className={`${styles.tipoBadge} ${c.tipo === 'inclusion' ? styles.inclusion : styles.exclusion}`}>
                            {c.tipo === 'inclusion' ? 'INC' : 'EXC'}
                          </span>
                          <span className={styles.criterioDesc}>{c.descripcion}</span>
                          {val !== undefined && val !== null
                            ? <span className={`${styles.criterioResultado} ${val ? styles.cumpleTexto : styles.noCumpleTexto}`}>
                                {val ? '✓ Sí' : '✗ No'}
                              </span>
                            : <span className={styles.criterioResultado} style={{ color: 'var(--color-gray-400)' }}>—</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Modo edición */}
                {editandoCriterios && (
                  <div className={styles.criteriosList}>
                    {criteriosProto.map(c => (
                      <div
                        key={c.idCriterio}
                        className={`${styles.criterioRow}
                          ${criterios[c.idCriterio] === true  ? styles.cumple   : ''}
                          ${criterios[c.idCriterio] === false ? styles.noCumple : ''}`}
                      >
                        <span className={`${styles.tipoBadge} ${c.tipo === 'inclusion' ? styles.inclusion : styles.exclusion}`}>
                          {c.tipo === 'inclusion' ? 'INC' : 'EXC'}
                        </span>
                        <span className={styles.criterioDesc}>{c.descripcion}</span>
                        <div className={styles.criterioControls}>
                          <button
                            className={`${styles.btnSi} ${criterios[c.idCriterio] === true ? styles.selected : ''}`}
                            onClick={() => { setCriterios(prev => ({ ...prev, [c.idCriterio]: true })); }}
                          >
                            Sí
                          </button>
                          <button
                            className={`${styles.btnNo} ${criterios[c.idCriterio] === false ? styles.selected : ''}`}
                            onClick={() => { setCriterios(prev => ({ ...prev, [c.idCriterio]: false })); }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`${styles.resumenElegib}
                  ${elegib === true  ? styles.resumenApto      : ''}
                  ${elegib === false ? styles.resumenNoApto    : ''}
                  ${elegib === null  ? styles.resumenPendiente : ''}`}
                >
                  {elegib === true  && <><CheckCircleIcon /> Candidato APTO según criterios</>}
                  {elegib === false && <><XCircleIcon />     Candidato NO APTO según criterios</>}
                  {elegib === null  && <><InfoIcon />        Evalúe todos los criterios para ver el resultado</>}
                </div>
              </>
            )}

          </div>
          {error && <div className={styles.errorBox} style={{ margin: '0 1.5rem' }}>{error}</div>}
          {criteriosProto.length > 0 && editandoCriterios && (
            <div className={styles.panelFooter}>
              <div />
              <button className={styles.btnNext} onClick={guardarCriteriosCoordinador} disabled={guardando}>
                {guardando ? 'Guardando…' : <><CheckCircleIcon /> Guardar criterios</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PASO 1: Antecedentes (solo médico) ──────────────── */}
      {paso === 1 && esMedico && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h2>Antecedentes Médicos</h2></div>
          <div className={styles.panelBody}>

            <div className={styles.addForm}>
              <h4>Agregar antecedente</h4>
              <div className={styles.field}>
                <label className={styles.label}>Descripción</label>
                <textarea
                  className={styles.textarea}
                  value={nuevaDesc}
                  onChange={e => setNuevaDesc(e.target.value)}
                  placeholder="Descripción del antecedente médico…"
                />
              </div>
              <div className={styles.addRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Fecha de diagnóstico (opcional)</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={nuevaFecha}
                    onChange={e => setNuevaFecha(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button
                  className={styles.btnAgregar}
                  onClick={agregarAntecedente}
                  disabled={guardando || !nuevaDesc.trim()}
                >
                  <PlusIcon /> Agregar
                </button>
              </div>
            </div>

            {antecedentes.length === 0 ? (
              <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                Sin antecedentes registrados. Puede continuar sin antecedentes.
              </p>
            ) : (
              <div className={styles.antecedentesList}>
                {antecedentes.map(a => (
                  <div key={a.idAntecedente} className={styles.antecedenteItem}>
                    <div style={{ flex: 1 }}>
                      <p className={styles.antecedenteDesc}>{a.descripcion}</p>
                      {a.fechaDiagnostico && (
                        <p className={styles.antecedenteFecha}>
                          Diagnóstico: {new Date(a.fechaDiagnostico + 'T12:00:00').toLocaleDateString('es-CL')}
                        </p>
                      )}
                    </div>
                    <button
                      className={styles.btnEliminar}
                      onClick={() => desactivarAntecedente(a.idAntecedente)}
                      disabled={guardando}
                      title="Eliminar antecedente"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
          {error && <div className={styles.errorBox} style={{ margin: '0 1.5rem' }}>{error}</div>}
          <div className={styles.panelFooter}>
            <button className={styles.btnBack} onClick={retroceder}>
              <ChevronLeftIcon /> Anterior
            </button>
            <button className={styles.btnNext} onClick={avanzar}>
              Siguiente <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* ── PASO 2: Consentimiento (solo médico) ────────────── */}
      {paso === 2 && esMedico && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h2>Consentimiento Informado</h2></div>
          <div className={styles.panelBody}>

            <div className={styles.infoBox}>
              <InfoIcon />
              <span>Registre los datos del consentimiento informado firmado por el candidato antes de continuar.</span>
            </div>

            <div className={styles.consentGrid}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Fecha de firma <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="date"
                  className={styles.input}
                  value={consent.fechaFirma}
                  onChange={e => setConsent(c => ({ ...c, fechaFirma: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Versión del documento <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  className={styles.input}
                  value={consent.versionDocumento}
                  onChange={e => setConsent(c => ({ ...c, versionDocumento: e.target.value }))}
                  placeholder="Ej: v2.1"
                />
              </div>
            </div>

            {/* Subida de PDF */}
            <div className={styles.field}>
              <label className={styles.label}>Archivo PDF del consentimiento (opcional)</label>
              <label className={`${styles.fileLabel} ${pdfUploading ? styles.fileLabelUploading : ''}`}>
                <input
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handlePdfChange}
                  disabled={pdfUploading}
                />
                <UploadIcon />
                {pdfUploading ? 'Subiendo…' : 'Seleccionar PDF'}
              </label>
              {pdfNombre && (
                <div className={styles.pdfBadge}>
                  <PdfIcon />
                  <span className={styles.pdfName}>{pdfNombre}</span>
                  <button
                    className={styles.pdfRemove}
                    onClick={() => { setConsent(c => ({ ...c, rutaArchivoPdf: '' })); setPdfNombre(''); }}
                    title="Quitar archivo"
                  >
                    <XSmallIcon />
                  </button>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Observaciones</label>
              <textarea
                className={styles.textarea}
                value={consent.observaciones}
                onChange={e => setConsent(c => ({ ...c, observaciones: e.target.value }))}
                placeholder="Notas adicionales sobre el proceso de consentimiento…"
              />
            </div>

          </div>
          {error && <div className={styles.errorBox} style={{ margin: '0 1.5rem' }}>{error}</div>}
          <div className={styles.panelFooter}>
            <button className={styles.btnBack} onClick={retroceder}>
              <ChevronLeftIcon /> Anterior
            </button>
            <button className={styles.btnNext} onClick={guardarConsentimiento} disabled={guardando || pdfUploading}>
              {guardando ? 'Guardando…' : <> Guardar y continuar <ChevronRightIcon /></>}
            </button>
          </div>
        </div>
      )}

      {/* ── PASO 3: Decisión final (solo médico) ────────────── */}
      {paso === 3 && esMedico && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h2>Decisión Final</h2></div>
          <div className={styles.panelBody}>

            {finalizado ? (
              <div className={styles.successPanel}>
                <div className={styles.successIcon}>
                  {decision === 'inscribir' ? '🎉' : '📋'}
                </div>
                <p className={styles.successTitle}>
                  {decision === 'inscribir' ? '¡Paciente inscrito exitosamente!' : 'Candidato marcado como no apto'}
                </p>
                <p className={styles.successMsg}>
                  {decision === 'inscribir'
                    ? 'El candidato ha sido inscrito como paciente activo en el protocolo. Se han generado las visitas programadas.'
                    : 'Se ha registrado la decisión. El candidato no será inscrito en este protocolo.'}
                </p>
                <button
                  className={styles.btnNext}
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => navigate('/reclutamiento')}
                >
                  Volver a candidatos
                </button>
              </div>
            ) : (
              <>
                {elegib === false && (
                  <div className={styles.warningBox}>
                    <WarningIcon />
                    <span>Este candidato <strong>no cumple</strong> los criterios de elegibilidad según la evaluación. Considere esto antes de inscribirlo.</span>
                  </div>
                )}

                <div className={styles.decisionBtns}>
                  <div
                    className={`${styles.decisionCard} ${decision === 'inscribir' ? styles.selectedInscribir : ''}`}
                    onClick={() => setDecision('inscribir')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setDecision('inscribir')}
                  >
                    <div className={styles.decisionIcon}>✅</div>
                    <p className={styles.decisionTitle}>Inscribir Paciente</p>
                    <p className={styles.decisionDesc}>
                      El candidato cumple los requisitos y se inscribirá en el protocolo. Se generarán las visitas programadas.
                    </p>
                  </div>
                  <div
                    className={`${styles.decisionCard} ${decision === 'noApto' ? styles.selectedNoApto : ''}`}
                    onClick={() => setDecision('noApto')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setDecision('noApto')}
                  >
                    <div className={styles.decisionIcon}>❌</div>
                    <p className={styles.decisionTitle}>Marcar como No Apto</p>
                    <p className={styles.decisionDesc}>
                      El candidato no cumple los requisitos médicos para participar en el protocolo.
                    </p>
                  </div>
                </div>

                {decision === 'noApto' && (
                  <div className={styles.motivoBox}>
                    <label className={styles.motivoLabel}>
                      Motivo del rechazo médico <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <textarea
                      className={styles.textarea}
                      value={motivoNoApto}
                      onChange={e => setMotivoNoApto(e.target.value)}
                      placeholder="Indique el motivo médico por el cual el candidato no es apto…"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                  {decision === 'inscribir' && (
                    <button className={styles.btnInscribir} onClick={ejecutarDecision} disabled={guardando}>
                      <CheckCircleIcon /> {guardando ? 'Inscribiendo…' : 'Confirmar Inscripción'}
                    </button>
                  )}
                  {decision === 'noApto' && (
                    <button className={styles.btnNoApto} onClick={ejecutarDecision} disabled={guardando}>
                      <XCircleIcon /> {guardando ? 'Procesando…' : 'Confirmar: No Apto'}
                    </button>
                  )}
                </div>
              </>
            )}

          </div>
          {!finalizado && error && (
            <div className={styles.errorBox} style={{ margin: '0 1.5rem' }}>{error}</div>
          )}
          {!finalizado && (
            <div className={styles.panelFooter}>
              <button className={styles.btnBack} onClick={retroceder}>
                <ChevronLeftIcon /> Anterior
              </button>
              <div />
            </div>
          )}
        </div>
      )}

    </div>
  );
}

/* ── Iconos SVG ──────────────────────────────────────────────────── */
function ChevronLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function CheckSmallIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function CheckCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function XCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
}
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}
function WarningIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function UploadIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
}
function PdfIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
function XSmallIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function PencilIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
