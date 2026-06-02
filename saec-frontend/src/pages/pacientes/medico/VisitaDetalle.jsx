import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import pacientesService from '../../../services/pacientesService';
import styles from './VisitaDetalle.module.css';

const TABS = ['Evolución', 'Laboratorio', 'Medicamentos', 'Eventos Adversos', 'Historial'];

export function VisitaDetalle() {
  const { id, visitaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const esMedico = user?.rol?.includes('Médico') || user?.rol?.includes('Medico');

  const [tab, setTab] = useState(0);
  const [visita, setVisita] = useState(null);
  const [loadingVisita, setLoadingVisita] = useState(true);

  /* ── Evolución ── */
  const [evolucion, setEvolucion]         = useState(null);
  const [loadingEvo, setLoadingEvo]       = useState(false);
  const [editContent, setEditContent]     = useState('');
  const [guardandoEvo, setGuardandoEvo]   = useState(false);
  const [bloqueandoEvo, setBloqueandoEvo] = useState(false);
  const [liberandoEvo, setLiberandoEvo]   = useState(false);
  const [errorEvo, setErrorEvo]           = useState(null);

  /* ── Resultados ── */
  const [resultados, setResultados]         = useState([]);
  const [loadingRes, setLoadingRes]         = useState(false);
  const [showFormRes, setShowFormRes]       = useState(false);
  const [formRes, setFormRes]               = useState({ idTipoPrueba: '', fechaToma: '', idSeveridad: '' });
  const [erroresRes, setErroresRes]         = useState({});
  const [guardandoRes, setGuardandoRes]     = useState(false);
  const [eliminandoRes, setEliminandoRes]   = useState(null); // idResultado en proceso
  const [confirmEliminar, setConfirmEliminar] = useState(null); // { id, nombre } a confirmar
  const [tiposPrueba, setTiposPrueba]       = useState([]);
  const [severidades, setSeveridades]       = useState([]);
  const severidadRef                        = useRef(null);
  /* ── Crear tipo de prueba inline ── */
  const [showNuevoTipo, setShowNuevoTipo]   = useState(false);
  const [formNuevoTipo, setFormNuevoTipo]   = useState({ nombre: '', descripcion: '' });
  const [guardandoTipo, setGuardandoTipo]   = useState(false);
  const [errorNuevoTipo, setErrorNuevoTipo] = useState(null);

  /* ── Medicamentos ── */
  const [medicamentos, setMedicamentos]   = useState([]);
  const [loadingMed, setLoadingMed]       = useState(false);
  const [showFormMed, setShowFormMed]     = useState(false);
  const [formMed, setFormMed]             = useState({ idMedProtocolo: '', numeroLote: '', fechaHora: '', observacion: '' });
  const [erroresMed, setErroresMed]       = useState({});
  const [guardandoMed, setGuardandoMed]   = useState(false);
  const [medProtocolos, setMedProtocolos] = useState([]);

  /* ── Eventos adversos ── */
  const [eventos, setEventos]             = useState([]);
  const [loadingEv, setLoadingEv]         = useState(false);
  const [showFormEv, setShowFormEv]       = useState(false);
  const [formEv, setFormEv]               = useState({ idSeveridad: '', descripcion: '', fechaReporte: '' });
  const [erroresEv, setErroresEv]         = useState({});
  const [guardandoEv, setGuardandoEv]     = useState(false);

  /* ── Historial ── */
  const [historial, setHistorial]         = useState([]);
  const [loadingHist, setLoadingHist]     = useState(false);

  /* ── Estado visita ── */
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [estadosVisita, setEstadosVisita]     = useState([]);

  const visitaIdNum = Number(visitaId);

  const errMsg = (e, fallback) =>
    e.response?.data?.mensaje ?? e.response?.data?.message ?? fallback;

  /* ── Cargar la visita básica para mostrar la cabecera ── */
  useEffect(() => {
    pacientesService.listarVisitas(Number(id))
      .then(vs => {
        const v = vs.find(x => x.idVisita === visitaIdNum);
        setVisita(v ?? null);
      })
      .catch(console.error)
      .finally(() => setLoadingVisita(false));
    pacientesService.getEstadosVisita().then(setEstadosVisita).catch(console.error);
  }, [id, visitaIdNum]);

  /* ── Cargar datos por tab ── */
  const cargarEvolucion = useCallback(() => {
    setLoadingEvo(true);
    setErrorEvo(null);
    pacientesService.obtenerEvolucion(visitaIdNum)
      .then(e => { setEvolucion(e); setEditContent(e?.contenido ?? ''); })
      .catch(e => setErrorEvo(errMsg(e, 'Error')))
      .finally(() => setLoadingEvo(false));
  }, [visitaIdNum]); // eslint-disable-line

  const cargarResultados = useCallback(() => {
    setLoadingRes(true);
    pacientesService.listarResultados(visitaIdNum)
      .then(setResultados).catch(console.error).finally(() => setLoadingRes(false));
  }, [visitaIdNum]);

  const cargarMedicamentos = useCallback(() => {
    setLoadingMed(true);
    pacientesService.listarMedicamentos(visitaIdNum)
      .then(setMedicamentos).catch(console.error).finally(() => setLoadingMed(false));
  }, [visitaIdNum]);

  const cargarEventos = useCallback(() => {
    setLoadingEv(true);
    pacientesService.listarEventosAdversos(visitaIdNum)
      .then(setEventos).catch(console.error).finally(() => setLoadingEv(false));
  }, [visitaIdNum]);

  const cargarHistorial = useCallback(() => {
    setLoadingHist(true);
    pacientesService.listarHistorialVisita(visitaIdNum)
      .then(setHistorial).catch(console.error).finally(() => setLoadingHist(false));
  }, [visitaIdNum]);

  useEffect(() => {
    if (tab === 0) cargarEvolucion();
    if (tab === 1) {
      cargarResultados();
      if (tiposPrueba.length === 0) pacientesService.getTiposPrueba().then(setTiposPrueba).catch(console.error);
      if (severidades.length === 0) pacientesService.getSeveridades().then(setSeveridades).catch(console.error);
    }
    if (tab === 2) {
      cargarMedicamentos();
      if (visita && medProtocolos.length === 0) {
        pacientesService.obtenerDetalle(Number(id))
          .then(det => pacientesService.getMedicamentosProtocolo(det.idProtocolo ?? 0))
          .then(setMedProtocolos)
          .catch(console.error);
      }
    }
    if (tab === 3) {
      cargarEventos();
      if (severidades.length === 0) pacientesService.getSeveridades().then(setSeveridades).catch(console.error);
    }
    if (tab === 4) cargarHistorial();
  }, [tab]); // eslint-disable-line

  /* ── Handlers Evolución ── */
  const handleBloquear = async () => {
    setBloqueandoEvo(true); setErrorEvo(null);
    try {
      const e = await pacientesService.bloquearEvolucion(visitaIdNum);
      setEvolucion(e); setEditContent(e?.contenido ?? '');
    } catch (e) {
      setErrorEvo(errMsg(e, 'Error al bloquear'));
    } finally { setBloqueandoEvo(false); }
  };

  const handleLiberar = async () => {
    setLiberandoEvo(true); setErrorEvo(null);
    try {
      const e = await pacientesService.liberarEvolucion(visitaIdNum);
      setEvolucion(e); setEditContent(e?.contenido ?? '');
    } catch (e) {
      setErrorEvo(errMsg(e, 'Error al liberar'));
    } finally { setLiberandoEvo(false); }
  };

  const handleGuardarEvo = async () => {
    setGuardandoEvo(true); setErrorEvo(null);
    try {
      const e = await pacientesService.guardarEvolucion(visitaIdNum, { contenido: editContent });
      setEvolucion(e); setEditContent(e?.contenido ?? '');
    } catch (e) {
      setErrorEvo(errMsg(e, 'Error al guardar'));
    } finally { setGuardandoEvo(false); }
  };

  /* ── Handlers Resultados ── */
  const handleAgregarResultado = async (ev) => {
    ev.preventDefault();
    const errs = {};
    if (!formRes.idTipoPrueba) errs.idTipoPrueba = 'Requerido';
    if (!formRes.fechaToma)    errs.fechaToma    = 'Requerida';
    if (!formRes.idSeveridad)  errs.idSeveridad  = 'Requerida';
    if (Object.keys(errs).length) { setErroresRes(errs); return; }
    setGuardandoRes(true);
    try {
      await pacientesService.agregarResultado(visitaIdNum, {
        idTipoPrueba: Number(formRes.idTipoPrueba),
        fechaToma: formRes.fechaToma,
        idSeveridad: Number(formRes.idSeveridad),
      });
      setFormRes({ idTipoPrueba: '', fechaToma: '', idSeveridad: '' });
      setShowFormRes(false);
      cargarResultados();
    } catch (e) {
      setErroresRes({ submit: errMsg(e, 'Error al guardar') });
    } finally { setGuardandoRes(false); }
  };

  const handleEliminarResultado = async () => {
    if (!confirmEliminar) return;
    const { id } = confirmEliminar;
    setConfirmEliminar(null);
    setEliminandoRes(id);
    try {
      await pacientesService.eliminarResultado(id);
      cargarResultados();
    } catch (e) {
      alert(errMsg(e, 'Error al eliminar el resultado'));
    } finally { setEliminandoRes(null); }
  };

  /* ── Handler Crear tipo de prueba ── */
  const handleCrearTipoPrueba = async (ev) => {
    ev.preventDefault();
    if (!formNuevoTipo.nombre.trim()) { setErrorNuevoTipo('El nombre es obligatorio'); return; }
    setGuardandoTipo(true);
    setErrorNuevoTipo(null);
    try {
      const nuevo = await pacientesService.crearTipoPrueba({
        nombre: formNuevoTipo.nombre.trim(),
        descripcion: formNuevoTipo.descripcion.trim() || null,
      });
      setTiposPrueba(prev => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setFormRes(f => ({ ...f, idTipoPrueba: String(nuevo.id) }));
      setFormNuevoTipo({ nombre: '', descripcion: '' });
      setShowNuevoTipo(false);
    } catch (e) {
      setErrorNuevoTipo(errMsg(e, 'Error al crear el tipo de prueba'));
    } finally { setGuardandoTipo(false); }
  };

  /* ── Handlers Medicamentos ── */
  const handleRegistrarMed = async (ev) => {
    ev.preventDefault();
    const errs = {};
    if (!formMed.idMedProtocolo) errs.idMedProtocolo = 'Requerido';
    if (!formMed.numeroLote.trim()) errs.numeroLote = 'Requerido';
    if (!formMed.fechaHora) errs.fechaHora = 'Requerida';
    if (Object.keys(errs).length) { setErroresMed(errs); return; }
    setGuardandoMed(true);
    try {
      await pacientesService.registrarMedicamento(visitaIdNum, {
        idMedProtocolo: Number(formMed.idMedProtocolo),
        numeroLote: formMed.numeroLote,
        fechaHora: formMed.fechaHora,
        observacion: formMed.observacion || null,
      });
      setFormMed({ idMedProtocolo: '', numeroLote: '', fechaHora: '', observacion: '' });
      setShowFormMed(false);
      cargarMedicamentos();
    } catch (e) {
      setErroresMed({ submit: errMsg(e, 'Error al guardar') });
    } finally { setGuardandoMed(false); }
  };

  /* ── Handlers Eventos Adversos ── */
  const handleRegistrarEvento = async (ev) => {
    ev.preventDefault();
    const errs = {};
    if (!formEv.idSeveridad) errs.idSeveridad = 'Requerida';
    if (!formEv.descripcion.trim()) errs.descripcion = 'Requerida';
    if (!formEv.fechaReporte) errs.fechaReporte = 'Requerida';
    if (Object.keys(errs).length) { setErroresEv(errs); return; }
    setGuardandoEv(true);
    try {
      await pacientesService.registrarEventoAdverso(visitaIdNum, {
        idSeveridad: Number(formEv.idSeveridad),
        descripcion: formEv.descripcion,
        fechaReporte: formEv.fechaReporte,
      });
      setFormEv({ idSeveridad: '', descripcion: '', fechaReporte: '' });
      setShowFormEv(false);
      cargarEventos();
    } catch (e) {
      setErroresEv({ submit: errMsg(e, 'Error al guardar') });
    } finally { setGuardandoEv(false); }
  };

  /* ── Cambiar estado de visita ── */
  const handleCambiarEstado = async (idEstado) => {
    setCambiandoEstado(true);
    try {
      const v = await pacientesService.cambiarEstadoVisita(visitaIdNum, { idEstadoVisita: Number(idEstado) });
      setVisita(v);
      if (tab === 4) cargarHistorial();
    } catch (e) {
      console.error(errMsg(e, 'Error al cambiar estado'));
    } finally { setCambiandoEstado(false); }
  };

  const formatFecha = (d) => {
    if (!d) return '—';
    return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatDateTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loadingVisita) return <div className={styles.center}><SpinIcon /><p>Cargando…</p></div>;
  if (!visita) return <div className={styles.center}><p>Visita no encontrada</p></div>;

  const BADGE_STYLE = {
    'Programada':  { bg: '#dbeafe', color: '#1e40af' },
    'Realizada':   { bg: '#dcfce7', color: '#166534' },
    'Cancelada':   { bg: '#fee2e2', color: '#991b1b' },
    'Reprogramada':{ bg: '#fef9c3', color: '#854d0e' },
  };
  const badge = BADGE_STYLE[visita.estadoVisita] ?? { bg: '#f3f4f6', color: '#374151' };

  return (
    <div className={styles.page}>

      {/* Volver */}
      <button className={styles.backBtn} onClick={() => navigate(`/pacientes/${id}/visitas`)}>
        <ChevronIcon /> Volver a visitas
      </button>

      {/* Cabecera de la visita */}
      <div className={styles.visitaHeader}>
        <div className={styles.visitaHeaderInfo}>
          <h2 className={styles.visitaTitle}>
            {visita.nombreVisita || `Visita semana ${visita.semana}`}
          </h2>
          <div className={styles.visitaMeta}>
            <span>Semana {visita.semana}{visita.dia > 0 ? `, día ${visita.dia}` : ''}</span>
            <span>·</span>
            <span>Programada: {formatFecha(visita.fechaProgramada)}</span>
            {visita.fechaRealizada && <><span>·</span><span>Realizada: {formatFecha(visita.fechaRealizada)}</span></>}
          </div>
        </div>
        <div className={styles.visitaHeaderActions}>
          <span className={styles.badgeEstado} style={{ background: badge.bg, color: badge.color }}>
            {visita.estadoVisita}
          </span>
          {esMedico && (
            <select
              className={styles.selectEstado}
              value={visita.idEstadoVisita}
              onChange={e => handleCambiarEstado(e.target.value)}
              disabled={cambiandoEstado}
            >
              {estadosVisita.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`${styles.tabBtn} ${tab === i ? styles.tabActive : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab 0: Evolución médica ── */}
      {tab === 0 && (
        <div className={styles.tabContent}>
          {loadingEvo ? (
            <div className={styles.center}><SpinIcon /></div>
          ) : (
            <>
              {errorEvo && <div className={styles.errorBox}><AlertIcon /> {errorEvo}</div>}

              {evolucion?.bloqueadaPorOtro && (
                <div className={styles.warningBox}>
                  <LockIcon /> Siendo editada por {evolucion.bloqueadoPorNombre}
                </div>
              )}

              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h3>Evolución Clínica</h3>
                  {evolucion?.ultimaModificacion && (
                    <span className={styles.metaSmall}>
                      Última modificación: {formatDateTime(evolucion.ultimaModificacion)}
                      {evolucion.modificadoPorNombre && ` por ${evolucion.modificadoPorNombre}`}
                    </span>
                  )}
                </div>
                <div className={styles.panelBody}>
                  {esMedico ? (
                    <>
                      {!evolucion?.bloqueadaPorMi && !evolucion?.bloqueadaPorOtro && (
                        <button className={styles.btnPrimary} onClick={handleBloquear} disabled={bloqueandoEvo}>
                          {bloqueandoEvo ? <SpinIcon /> : <EditIcon />}
                          {bloqueandoEvo ? 'Abriendo editor…' : 'Editar evolución'}
                        </button>
                      )}

                      {evolucion?.bloqueadaPorMi && (
                        <div className={styles.editorWrap}>
                          <textarea
                            className={styles.evolucionTextarea}
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={10}
                            placeholder="Escriba la evolución clínica del paciente…"
                          />
                          <div className={styles.editorActions}>
                            <button className={styles.btnCancel} onClick={handleLiberar} disabled={liberandoEvo}>
                              Cancelar
                            </button>
                            <button className={styles.btnPrimary} onClick={handleGuardarEvo} disabled={guardandoEvo}>
                              {guardandoEvo ? <SpinIcon /> : <SaveIcon />}
                              {guardandoEvo ? 'Guardando…' : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      )}

                      {!evolucion?.bloqueadaPorMi && evolucion?.contenido && (
                        <div className={styles.evolucionContent}>
                          {evolucion.contenido}
                        </div>
                      )}

                      {!evolucion?.bloqueadaPorMi && !evolucion?.contenido && (
                        <div className={styles.emptyPanel}>
                          <DocumentIcon />
                          <p>Sin evolución registrada</p>
                        </div>
                      )}
                    </>
                  ) : (
                    evolucion?.contenido
                      ? <div className={styles.evolucionContent}>{evolucion.contenido}</div>
                      : <div className={styles.emptyPanel}><DocumentIcon /><p>Sin evolución registrada</p></div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab 1: Resultados de Laboratorio ── */}
      {tab === 1 && (
        <div className={styles.tabContent}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Resultados de Laboratorio</h3>
              {esMedico && (
                <button className={styles.btnPrimary} onClick={() => setShowFormRes(v => !v)}>
                  <PlusIcon /> {showFormRes ? 'Cancelar' : 'Agregar resultado'}
                </button>
              )}
            </div>

            {showFormRes && (
              <div className={styles.formWrap}>
                <form onSubmit={handleAgregarResultado} className={styles.formGrid2}>
                  {erroresRes.submit && <div className={`${styles.errorBox} ${styles.fullWidth}`}><AlertIcon /> {erroresRes.submit}</div>}

                  <div className={styles.field}>
                    <label className={styles.label}>Tipo de prueba <span className={styles.required}>*</span></label>
                    <div className={styles.selectWithAction}>
                      <select
                        className={`${styles.select} ${erroresRes.idTipoPrueba ? styles.inputError : ''}`}
                        value={formRes.idTipoPrueba}
                        onChange={e => setFormRes(f => ({ ...f, idTipoPrueba: e.target.value }))}
                      >
                        <option value="">Seleccionar…</option>
                        {tiposPrueba.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                      <button
                        type="button"
                        className={styles.btnAddInline}
                        title="Crear nuevo tipo de prueba"
                        onClick={() => { setShowNuevoTipo(v => !v); setErrorNuevoTipo(null); }}
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    {erroresRes.idTipoPrueba && <span className={styles.fieldError}>{erroresRes.idTipoPrueba}</span>}

                    {showNuevoTipo && (
                      <div className={styles.inlineCreateBox}>
                        <p className={styles.inlineCreateTitle}>Crear nuevo tipo de prueba</p>
                        {errorNuevoTipo && (
                          <div className={styles.inlineError}><AlertIcon /> {errorNuevoTipo}</div>
                        )}
                        <div className={styles.inlineCreateForm}>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="Nombre del tipo de prueba *"
                            value={formNuevoTipo.nombre}
                            onChange={e => setFormNuevoTipo(f => ({ ...f, nombre: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCrearTipoPrueba(e); } }}
                            maxLength={100}
                            autoFocus
                          />
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="Descripción (opcional)"
                            value={formNuevoTipo.descripcion}
                            onChange={e => setFormNuevoTipo(f => ({ ...f, descripcion: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCrearTipoPrueba(e); } }}
                            maxLength={255}
                          />
                          <div className={styles.inlineCreateActions}>
                            <button
                              type="button"
                              className={styles.btnSmCancel}
                              onClick={() => { setShowNuevoTipo(false); setFormNuevoTipo({ nombre: '', descripcion: '' }); setErrorNuevoTipo(null); }}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className={styles.btnSmPrimary}
                              disabled={guardandoTipo}
                              onClick={handleCrearTipoPrueba}
                            >
                              {guardandoTipo ? <SpinIcon /> : <PlusIcon />}
                              {guardandoTipo ? 'Creando…' : 'Crear tipo'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Fecha de toma <span className={styles.required}>*</span></label>
                    <input
                      type="date"
                      className={`${styles.input} ${erroresRes.fechaToma ? styles.inputError : ''}`}
                      value={formRes.fechaToma}
                      onChange={e => setFormRes(f => ({ ...f, fechaToma: e.target.value }))}
                      max={new Date().toISOString().split('T')[0]}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); severidadRef.current?.focus(); } }}
                    />
                    {erroresRes.fechaToma && <span className={styles.fieldError}>{erroresRes.fechaToma}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Severidad <span className={styles.required}>*</span></label>
                    <select
                      ref={severidadRef}
                      className={`${styles.select} ${erroresRes.idSeveridad ? styles.inputError : ''}`}
                      value={formRes.idSeveridad}
                      onChange={e => setFormRes(f => ({ ...f, idSeveridad: e.target.value }))}
                    >
                      <option value="">Seleccionar…</option>
                      {severidades.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    {erroresRes.idSeveridad && <span className={styles.fieldError}>{erroresRes.idSeveridad}</span>}
                  </div>

                  <div className={`${styles.formActions} ${styles.fullWidth}`}>
                    <button type="button" className={styles.btnCancel} onClick={() => setShowFormRes(false)}>Cancelar</button>
                    <button type="submit" className={styles.btnPrimary} disabled={guardandoRes}>
                      {guardandoRes ? <SpinIcon /> : <PlusIcon />}
                      {guardandoRes ? 'Guardando…' : 'Guardar resultado'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.panelBody}>
              {loadingRes ? (
                <div className={styles.center}><SpinIcon /></div>
              ) : resultados.length === 0 ? (
                <div className={styles.emptyPanel}><FlaskIcon /><p>Sin resultados registrados</p></div>
              ) : (
                <div className={styles.resultadosList}>
                  {resultados.map(r => (
                    <div key={r.idResultado} className={styles.resultadoItem}>
                      <div className={styles.resultadoInfo}>
                        <span className={styles.resultadoTipo}>{r.tipoPrueba}</span>
                      </div>
                      <div className={styles.resultadoMeta}>
                        {r.severidad && (
                          <span className={styles.severidadTag}>{r.severidad}</span>
                        )}
                        <span>{formatFecha(r.fechaToma)}</span>
                        <span>· {r.registradoPorNombre}</span>
                      </div>
                      {esMedico && (
                        <button
                          className={styles.btnEliminarRes}
                          title="Eliminar resultado"
                          disabled={eliminandoRes === r.idResultado}
                          onClick={() => setConfirmEliminar({ id: r.idResultado, nombre: r.tipoPrueba })}
                        >
                          {eliminandoRes === r.idResultado ? <SpinIcon /> : <TrashIcon />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Administración de Medicamentos ── */}
      {tab === 2 && (
        <div className={styles.tabContent}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Administración de Medicamentos</h3>
              {esMedico && (
                <button className={styles.btnPrimary} onClick={() => setShowFormMed(v => !v)}>
                  <PlusIcon /> {showFormMed ? 'Cancelar' : 'Registrar administración'}
                </button>
              )}
            </div>

            {showFormMed && (
              <div className={styles.formWrap}>
                <form onSubmit={handleRegistrarMed} className={styles.formGrid2}>
                  {erroresMed.submit && <div className={`${styles.errorBox} ${styles.fullWidth}`}><AlertIcon /> {erroresMed.submit}</div>}

                  <div className={styles.field}>
                    <label className={styles.label}>Medicamento del protocolo <span className={styles.required}>*</span></label>
                    <select
                      className={`${styles.select} ${erroresMed.idMedProtocolo ? styles.inputError : ''}`}
                      value={formMed.idMedProtocolo}
                      onChange={e => setFormMed(f => ({ ...f, idMedProtocolo: e.target.value }))}
                    >
                      <option value="">Seleccionar…</option>
                      {medProtocolos.map(m => (
                        <option key={m.idMedProtocolo} value={m.idMedProtocolo}>
                          {m.medicamento} — {m.dosis} {m.unidadDosis}
                        </option>
                      ))}
                    </select>
                    {erroresMed.idMedProtocolo && <span className={styles.fieldError}>{erroresMed.idMedProtocolo}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Número de lote <span className={styles.required}>*</span></label>
                    <input type="text" className={`${styles.input} ${erroresMed.numeroLote ? styles.inputError : ''}`}
                      value={formMed.numeroLote} onChange={e => setFormMed(f => ({ ...f, numeroLote: e.target.value }))}
                      placeholder="Ej: LOT-2024-001" />
                    {erroresMed.numeroLote && <span className={styles.fieldError}>{erroresMed.numeroLote}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Fecha y hora <span className={styles.required}>*</span></label>
                    <input type="datetime-local" className={`${styles.input} ${erroresMed.fechaHora ? styles.inputError : ''}`}
                      value={formMed.fechaHora} onChange={e => setFormMed(f => ({ ...f, fechaHora: e.target.value }))} />
                    {erroresMed.fechaHora && <span className={styles.fieldError}>{erroresMed.fechaHora}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Observación</label>
                    <input type="text" className={styles.input}
                      value={formMed.observacion} onChange={e => setFormMed(f => ({ ...f, observacion: e.target.value }))}
                      placeholder="Opcional" />
                  </div>

                  <div className={`${styles.formActions} ${styles.fullWidth}`}>
                    <button type="button" className={styles.btnCancel} onClick={() => setShowFormMed(false)}>Cancelar</button>
                    <button type="submit" className={styles.btnPrimary} disabled={guardandoMed}>
                      {guardandoMed ? <SpinIcon /> : <PlusIcon />}
                      {guardandoMed ? 'Guardando…' : 'Registrar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.panelBody}>
              {loadingMed ? (
                <div className={styles.center}><SpinIcon /></div>
              ) : medicamentos.length === 0 ? (
                <div className={styles.emptyPanel}><PillIcon /><p>Sin administraciones registradas</p></div>
              ) : (
                <div className={styles.medList}>
                  {medicamentos.map(m => (
                    <div key={m.idAdmin} className={styles.medItem}>
                      <div className={styles.medInfo}>
                        <span className={styles.medNombre}>{m.medicamento}</span>
                        <span className={styles.medDosis}>{m.dosis} {m.unidadDosis}{m.frecuencia && ` · ${m.frecuencia}`}</span>
                      </div>
                      <div className={styles.medMeta}>
                        <span>Lote: <strong>{m.numeroLote}</strong></span>
                        <span>· {formatDateTime(m.fechaHora)}</span>
                        <span>· {m.administradoPorNombre}</span>
                        {m.observacion && <span>· {m.observacion}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Eventos Adversos ── */}
      {tab === 3 && (
        <div className={styles.tabContent}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Eventos Adversos</h3>
              {esMedico && (
                <button className={styles.btnPrimary} onClick={() => setShowFormEv(v => !v)}>
                  <PlusIcon /> {showFormEv ? 'Cancelar' : 'Registrar evento'}
                </button>
              )}
            </div>

            {showFormEv && (
              <div className={styles.formWrap}>
                <form onSubmit={handleRegistrarEvento} className={styles.formGrid2}>
                  {erroresEv.submit && (
                    <div className={`${styles.errorBox} ${styles.fullWidth}`}>
                      <AlertIcon /> {erroresEv.submit}
                    </div>
                  )}

                  <div className={styles.field}>
                    <label className={styles.label}>Severidad <span className={styles.required}>*</span></label>
                    <select
                      className={`${styles.select} ${erroresEv.idSeveridad ? styles.inputError : ''}`}
                      value={formEv.idSeveridad}
                      onChange={e => setFormEv(f => ({ ...f, idSeveridad: e.target.value }))}
                    >
                      <option value="">Seleccionar…</option>
                      {severidades.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    {erroresEv.idSeveridad && <span className={styles.fieldError}>{erroresEv.idSeveridad}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Fecha de reporte <span className={styles.required}>*</span></label>
                    <input type="date" className={`${styles.input} ${erroresEv.fechaReporte ? styles.inputError : ''}`}
                      value={formEv.fechaReporte}
                      onChange={e => setFormEv(f => ({ ...f, fechaReporte: e.target.value }))}
                      max={new Date().toISOString().split('T')[0]} />
                    {erroresEv.fechaReporte && <span className={styles.fieldError}>{erroresEv.fechaReporte}</span>}
                  </div>

                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label className={styles.label}>Descripción <span className={styles.required}>*</span></label>
                    <textarea
                      className={`${styles.textarea} ${erroresEv.descripcion ? styles.inputError : ''}`}
                      value={formEv.descripcion}
                      onChange={e => setFormEv(f => ({ ...f, descripcion: e.target.value }))}
                      placeholder="Describa el evento adverso observado…"
                      rows={3}
                    />
                    {erroresEv.descripcion && <span className={styles.fieldError}>{erroresEv.descripcion}</span>}
                  </div>

                  <div className={`${styles.formActions} ${styles.fullWidth}`}>
                    <button type="button" className={styles.btnCancel} onClick={() => setShowFormEv(false)}>Cancelar</button>
                    <button type="submit" className={styles.btnPrimary} disabled={guardandoEv}>
                      {guardandoEv ? <SpinIcon /> : <PlusIcon />}
                      {guardandoEv ? 'Guardando…' : 'Registrar evento'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.panelBody}>
              {loadingEv ? (
                <div className={styles.center}><SpinIcon /></div>
              ) : eventos.length === 0 ? (
                <div className={styles.emptyPanel}><AlertTriangleIcon /><p>Sin eventos adversos registrados</p></div>
              ) : (
                <div className={styles.resultadosList}>
                  {eventos.map(ev => {
                    const sevColor = severidadColor(ev.severidad);
                    return (
                      <div key={ev.idEvento} className={styles.resultadoItem}>
                        <div className={styles.resultadoInfo}>
                          <span className={styles.resultadoTipo}>{ev.descripcion}</span>
                        </div>
                        <div className={styles.resultadoMeta}>
                          <span className={styles.severidadTag}
                            style={{ background: sevColor.bg, color: sevColor.color }}>
                            {ev.severidad}
                          </span>
                          <span>{formatFecha(ev.fechaReporte)}</span>
                          <span>· {ev.reportadoPorNombre}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Historial de cambios ── */}
      {tab === 4 && (
        <div className={styles.tabContent}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}><h3>Historial de Cambios</h3></div>
            <div className={styles.panelBody}>
              {loadingHist ? (
                <div className={styles.center}><SpinIcon /></div>
              ) : historial.length === 0 ? (
                <div className={styles.emptyPanel}><ClockIcon /><p>Sin cambios registrados</p></div>
              ) : (
                <div className={styles.historialList}>
                  {historial.map(h => (
                    <div key={h.idHistorial} className={styles.historialItem}>
                      <div className={styles.historialIcon}><ClockIcon size={14} /></div>
                      <div className={styles.historialInfo}>
                        <div className={styles.historialDescr}>
                          {h.estadoAnterior
                            ? <><span className={styles.estadoTag}>{h.estadoAnterior}</span> → <span className={styles.estadoTag}>{h.estadoNuevo}</span></>
                            : <span className={styles.estadoTag}>{h.estadoNuevo}</span>
                          }
                        </div>
                        <div className={styles.historialMeta}>
                          {formatDateTime(h.fechaCambio)} · {h.modificadoPorNombre}
                          {h.motivo && ` · "${h.motivo}"`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmación eliminar resultado ── */}
      {confirmEliminar && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmHeader}>
              <div className={styles.confirmIconWrap}>
                <TrashIcon />
              </div>
              <h3 className={styles.confirmTitle}>Eliminar resultado</h3>
            </div>
            <p className={styles.confirmMsg}>
              ¿Estás seguro de que deseas eliminar el resultado de{' '}
              <strong>{confirmEliminar.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.btnConfirmCancel}
                onClick={() => setConfirmEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnConfirmDelete}
                onClick={handleEliminarResultado}
              >
                <TrashIcon /> Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
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
function TrashIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function SaveIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
}
function LockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function DocumentIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function FlaskIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6m-5 0v8l-4 9h12l-4-9V3"/></svg>;
}
function PillIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20H4a2 2 0 0 1-2-2v-2c0-1.1.9-2 2-2h8.5M14 7l3 3M3 15l9-9a3 3 0 0 1 4.24 4.24L12 14.5"/><path d="m15 4 3 3-8.5 8.5-3-3L15 4z"/></svg>;
}
function AlertTriangleIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function ClockIcon({ size = 32 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

function severidadColor(nivel) {
  if (!nivel) return { bg: '#f3f4f6', color: '#374151' };
  const n = nivel.toLowerCase();
  if (n.includes('leve'))   return { bg: '#dcfce7', color: '#166534' };
  if (n.includes('modera')) return { bg: '#fef9c3', color: '#854d0e' };
  if (n.includes('grave') || n.includes('sever')) return { bg: '#fed7aa', color: '#9a3412' };
  if (n.includes('fatal') || n.includes('crít') || n.includes('crit')) return { bg: '#fee2e2', color: '#991b1b' };
  return { bg: '#f3f4f6', color: '#374151' };
}
