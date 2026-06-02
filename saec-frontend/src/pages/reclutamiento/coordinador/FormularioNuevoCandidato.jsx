import { useState, useEffect, useCallback, useRef } from 'react';
import reclutamientoService from '../../../services/reclutamientoService';
import styles from './FormularioNuevoCandidato.module.css';

export function FormularioNuevoCandidato({ onClose, onCreado }) {
  const [form, setForm] = useState({
    nombre: '', apellido: '',
    fechaNacimiento: '', idGenero: '', contacto: '',
    idProtocolo: '', observacion: '',
  });
  const [errors, setErrors]               = useState({});
  const [generos, setGeneros]             = useState([]);
  const [protocolos, setProtocolos]       = useState([]);
  const [protocoloSel, setProtocoloSel]   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const errorRef                          = useRef(null);

  /* Scroll al error: se llama directamente tras setear el error */
  const scrollToError = () => {
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  /* Criterios del protocolo seleccionado */
  const [criteriosProto,   setCriteriosProto]   = useState([]);  // definiciones del protocolo
  const [criteriosEval,    setCriteriosEval]    = useState({});  // { idCriterio: true|false }
  const [loadingCriterios, setLoadingCriterios] = useState(false);

  /* Catálogos */
  useEffect(() => {
    Promise.all([
      reclutamientoService.getGeneros(),
      reclutamientoService.getProtocolosActivos(),
    ]).then(([g, p]) => {
      setGeneros(g);
      setProtocolos(p);
    }).catch(console.error);
  }, []);

  /* Campo genérico */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(err => { const e2 = { ...err }; delete e2[name]; return e2; });

    if (name === 'idProtocolo') {
      const p = protocolos.find(p => String(p.idProtocolo) === value);
      setProtocoloSel(p ?? null);
      setCriteriosEval({});   // resetear evaluaciones al cambiar protocolo
      if (value) {
        setLoadingCriterios(true);
        reclutamientoService.getCriteriosProtocolo(value)
          .then(setCriteriosProto)
          .catch(() => setCriteriosProto([]))
          .finally(() => setLoadingCriterios(false));
      } else {
        setCriteriosProto([]);
      }
    }
  }, [protocolos]);

  /* Marcar un criterio como Sí / No (toggle si vuelve a pulsar el mismo) */
  const toggleCriterio = (idCriterio, valor) => {
    setCriteriosEval(ev => {
      const actual = ev[idCriterio];
      // Si el mismo botón ya estaba activo, desmarcar (undefined = pendiente)
      if (actual === valor) {
        const copia = { ...ev };
        delete copia[idCriterio];
        return copia;
      }
      return { ...ev, [idCriterio]: valor };
    });
  };

  /* Validación local */
  const validate = () => {
    const e = {};
    const nombre   = form.nombre.trim();
    const apellido = form.apellido.trim();
    const contacto = form.contacto.trim();
    if (!nombre)               e.nombre         = 'El nombre es requerido';
    else if (nombre.length < 2) e.nombre        = 'El nombre debe tener al menos 2 caracteres';
    if (!apellido)             e.apellido        = 'El apellido es requerido';
    else if (apellido.length < 2) e.apellido    = 'El apellido debe tener al menos 2 caracteres';
    if (!form.fechaNacimiento) e.fechaNacimiento = 'La fecha de nacimiento es requerida';
    if (!form.idGenero)        e.idGenero        = 'Seleccione un género';
    if (!form.idProtocolo)     e.idProtocolo     = 'Seleccione un protocolo';
    if (contacto && !/^[0-9]{7,10}$/.test(contacto)) {
      e.contacto = 'El contacto debe tener entre 7 y 10 dígitos numéricos';
    }
    return e;
  };

  /* Envío */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      /* 1) Crear candidato */
      const resumen = await reclutamientoService.crearCandidato({
        nombre:          form.nombre.trim(),
        apellido:        form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento,
        idGenero:        Number(form.idGenero),
        contacto:        form.contacto.trim() || null,
        idProtocolo:     Number(form.idProtocolo),
        observacion:     form.observacion.trim() || null,
      });

      /* 2) Guardar criterios evaluados (si alguno fue marcado) */
      const criteriosParaGuardar = criteriosProto
        .filter(c => criteriosEval[c.idCriterio] !== undefined)
        .map(c => ({
          idCriterio:  c.idCriterio,
          cumple:      criteriosEval[c.idCriterio],
          observacion: null,
        }));

      if (criteriosParaGuardar.length > 0 && resumen.idPostulacion) {
        try {
          await reclutamientoService.guardarCriterios(resumen.idPostulacion, criteriosParaGuardar);
        } catch (criterioErr) {
          // No bloquear el flujo principal si falla el guardado de criterios
          console.warn('Criterios no guardados:', criterioErr);
        }
      }

      setSuccess(true);
      setTimeout(() => { onCreado?.(); onClose(); }, 1500);
    } catch (err) {
      const msg = err.response?.data?.mensaje ?? err.response?.data?.message ?? 'Error al registrar candidato';
      setErrors({ submit: msg });
      scrollToError();
    } finally {
      setLoading(false);
    }
  };

  const cupoWarning = protocoloSel &&
    protocoloSel.cupoDisponible !== undefined &&
    protocoloSel.cupoDisponible <= 5;

  const totalEvaluados = Object.keys(criteriosEval).length;

  return (
    <div className={styles.modal}>

      {/* Cabecera */}
      <div className={styles.modalHeader}>
        <h2>Registrar Nuevo Candidato</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.modalBody}>

          {/* Error de envío */}
          {errors.submit && (
            <div ref={errorRef} className={styles.warningBox}>
              <WarningIcon /> {errors.submit}
            </div>
          )}

          {/* Nombre / Apellido */}
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>
                Nombre <span className={styles.required}>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.nombre ? styles.error : ''}`}
                name="nombre" value={form.nombre} onChange={handleChange}
                placeholder="Nombre del candidato" autoComplete="off"
              />
              {errors.nombre && (
                <span className={styles.fieldError}><AlertIcon /> {errors.nombre}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Apellido <span className={styles.required}>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.apellido ? styles.error : ''}`}
                name="apellido" value={form.apellido} onChange={handleChange}
                placeholder="Apellido del candidato" autoComplete="off"
              />
              {errors.apellido && (
                <span className={styles.fieldError}><AlertIcon /> {errors.apellido}</span>
              )}
            </div>
          </div>

          {/* Fecha de Nacimiento */}
          <div className={styles.field}>
            <label className={styles.label}>
              Fecha de Nacimiento <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={`${styles.input} ${errors.fechaNacimiento ? styles.error : ''}`}
              name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.fechaNacimiento && (
              <span className={styles.fieldError}><AlertIcon /> {errors.fechaNacimiento}</span>
            )}
          </div>

          {/* Género / Contacto */}
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>
                Género <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${errors.idGenero ? styles.error : ''}`}
                name="idGenero" value={form.idGenero} onChange={handleChange}
              >
                <option value="">Seleccionar género</option>
                {generos.map(g => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
              {errors.idGenero && (
                <span className={styles.fieldError}><AlertIcon /> {errors.idGenero}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Contacto</label>
              <input
                className={`${styles.input} ${errors.contacto ? styles.error : ''}`}
                name="contacto" value={form.contacto} onChange={handleChange}
                placeholder="7 a 10 dígitos numéricos" autoComplete="off"
                type="tel" inputMode="numeric" maxLength={10}
              />
              {errors.contacto && (
                <span className={styles.fieldError}><AlertIcon /> {errors.contacto}</span>
              )}
            </div>
          </div>

          {/* Protocolo */}
          <div className={styles.field}>
            <label className={styles.label}>
              Protocolo <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${errors.idProtocolo ? styles.error : ''}`}
              name="idProtocolo" value={form.idProtocolo} onChange={handleChange}
            >
              <option value="">Seleccionar protocolo</option>
              {protocolos.map(p => (
                <option key={p.idProtocolo} value={p.idProtocolo}>
                  {p.codigoProtocolo} — {p.titulo} ({p.cupoDisponible ?? '?'} cupos)
                </option>
              ))}
            </select>
            {errors.idProtocolo && (
              <span className={styles.fieldError}><AlertIcon /> {errors.idProtocolo}</span>
            )}
          </div>

          {/* Advertencia cupo */}
          {cupoWarning && (
            <div className={styles.warningBox}>
              <WarningIcon />
              <span>
                {protocoloSel.cupoDisponible === 0
                  ? 'Este protocolo no tiene cupos disponibles actualmente.'
                  : `Atención: solo quedan ${protocoloSel.cupoDisponible} cupo(s) en este protocolo.`}
              </span>
            </div>
          )}

          {/* ── Criterios del protocolo ── */}
          {form.idProtocolo && (
            <div className={styles.criteriosBox}>
              <div className={styles.criteriosBoxHeader}>
                <h4 className={styles.criteriosBoxTitle}>
                  <ClipboardIcon /> Criterios de Inclusión / Exclusión
                </h4>
                <span className={styles.criteriosHint}>
                  {loadingCriterios
                    ? 'Cargando…'
                    : criteriosProto.length === 0
                      ? 'Sin criterios definidos para este protocolo'
                      : totalEvaluados === 0
                        ? 'Evalúe los criterios del candidato (opcional)'
                        : `${totalEvaluados} de ${criteriosProto.length} evaluado(s)`
                  }
                </span>
              </div>

              {loadingCriterios && (
                <div className={styles.criteriosCargando}>
                  <SpinIcon /> Cargando criterios del protocolo…
                </div>
              )}

              {!loadingCriterios && criteriosProto.length === 0 && form.idProtocolo && (
                <p className={styles.criteriosSinDatos}>
                  Este protocolo no tiene criterios de inclusión/exclusión registrados.
                </p>
              )}

              {!loadingCriterios && criteriosProto.length > 0 && (
                <>
                  <p className={styles.criteriosDesc}>
                    Marque si el candidato <strong>cumple (Sí)</strong> o <strong>no cumple (No)</strong> cada criterio.
                    Esta evaluación es opcional ahora y puede completarse más adelante.
                  </p>
                  {criteriosProto.map(c => {
                    const val = criteriosEval[c.idCriterio];
                    return (
                      <div key={c.idCriterio} className={styles.criterioItem}>
                        <span
                          className={`${styles.tipoBadge} ${
                            c.tipo === 'inclusion' ? styles.inclusion : styles.exclusion
                          }`}
                        >
                          {c.tipo === 'inclusion' ? 'INC' : 'EXC'}
                        </span>
                        <span className={styles.criterioDesc}>{c.descripcion}</span>
                        <div className={styles.criterioEvalBtns}>
                          <button
                            type="button"
                            className={`${styles.evalBtn} ${val === true ? styles.evalBtnSiActivo : ''}`}
                            onClick={() => toggleCriterio(c.idCriterio, true)}
                            title="Cumple"
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            className={`${styles.evalBtn} ${val === false ? styles.evalBtnNoActivo : ''}`}
                            onClick={() => toggleCriterio(c.idCriterio, false)}
                            title="No cumple"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Observación */}
          <div className={styles.field}>
            <label className={styles.label}>Observación inicial</label>
            <textarea
              className={styles.textarea}
              name="observacion"
              value={form.observacion}
              onChange={handleChange}
              placeholder="Información adicional relevante sobre el candidato…"
            />
          </div>

        </div>

        {/* Pie */}
        <div className={styles.modalFooter}>
          {success ? (
            <div className={styles.successMsg}>
              <CheckIcon /> Candidato registrado exitosamente
            </div>
          ) : (
            <>
              <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? <SpinIcon /> : <PlusIcon />}
                {loading ? 'Guardando…' : 'Registrar Candidato'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

/* ── Iconos SVG ──────────────────────────────────────────────────── */
function AlertIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function SpinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}
