import { useEffect, useState } from 'react';
import investigadorService from '../../../../../services/investigadorService';
import { Step1DatosBasicos } from './Step1DatosBasicos';
import { Step2Criterios }    from './Step2Criterios';
import { Step3Visitas }      from './Step3Visitas';
import { Step4Medicamentos } from './Step4Medicamentos';
import styles from './CrearProtocoloModal.module.css';

const STEPS = [
  { num: 1, label: 'Datos básicos'  },
  { num: 2, label: 'Criterios'      },
  { num: 3, label: 'Visitas'        },
  { num: 4, label: 'Medicamentos'   },
];

const FORM_INITIAL = {
  codigo: '', titulo: '', objetivos: '',
  idFase: '', idEstadoProtocolo: '',
  fechaInicio: '', fechaFinEstimada: '',
  metaPacientes: '',
  criterios: [],
  visitas: [],
};

export function CrearProtocoloModal({ onClose, onCreated }) {
  const [step,         setStep]         = useState(1);
  const [formData,     setFormData]     = useState(FORM_INITIAL);
  const [catalogos,    setCatalogos]    = useState({ fases: [], estados: [], medicamentos: [], unidadesDosis: [] });
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    Promise.all([
      investigadorService.getCatFases(),
      investigadorService.getCatEstados(),
      investigadorService.getCatMedicamentos(),
      investigadorService.getCatUnidadesDosis(),
    ]).then(([fases, estados, medicamentos, unidadesDosis]) => {
      setCatalogos({ fases, estados, medicamentos, unidadesDosis });
    }).catch(() => {});
  }, []);

  /* ── Verificar si el formulario tiene datos ingresados ── */
  function hasData() {
    return (
      formData.codigo.trim() ||
      formData.titulo.trim() ||
      formData.criterios.some(c => c.descripcion.trim()) ||
      formData.visitas.length > 0
    );
  }

  /* ── Solicitar cierre (con confirmación si hay datos) ── */
  function requestClose() {
    if (hasData()) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  }

  /* ── Validar paso actual ── */
  function validateStep() {
    if (step === 1) {
      if (!formData.codigo.trim())         return 'El código es obligatorio.';
      if (!formData.titulo.trim())         return 'El título es obligatorio.';
      if (!formData.idFase)                return 'Selecciona una fase clínica.';
      if (!formData.idEstadoProtocolo)     return 'Selecciona un estado inicial.';
    }
    return '';
  }

  /* ── Limpiar filas vacías al avanzar de paso ── */
  function cleanEmptyRows(currentStep) {
    setFormData(prev => {
      if (currentStep === 2) {
        // Quitar criterios sin descripción
        return {
          ...prev,
          criterios: prev.criterios.filter(c => c.descripcion.trim() !== ''),
        };
      }
      if (currentStep === 3) {
        // Quitar visitas sin semana o día
        return {
          ...prev,
          visitas: prev.visitas.filter(v => v.semana !== '' && v.dia !== ''),
        };
      }
      return prev;
    });
  }

  function handleNext() {
    const msg = validateStep();
    if (msg) { setError(msg); return; }
    setError('');
    cleanEmptyRows(step);
    setStep(s => s + 1);
  }

  function handleBack() {
    setError('');
    setStep(s => s - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        codigo:              formData.codigo.trim(),
        titulo:              formData.titulo.trim(),
        objetivos:           formData.objetivos || null,
        idFase:              Number(formData.idFase),
        idEstadoProtocolo:   Number(formData.idEstadoProtocolo),
        fechaInicio:         formData.fechaInicio || null,
        fechaFinEstimada:    formData.fechaFinEstimada || null,
        metaPacientes:       formData.metaPacientes ? Number(formData.metaPacientes) : null,
        criterios: formData.criterios
          .filter(c => c.descripcion.trim())
          .map(c => ({ tipo: c.tipo, descripcion: c.descripcion.trim() })),
        visitas: formData.visitas
          .filter(v => v.semana && v.dia)
          .map(v => ({
            semana:       Number(v.semana),
            dia:          Number(v.dia),
            nombreVisita: v.nombreVisita || null,
            descripcion:  v.descripcion  || null,
            medicamentos: (v.medicamentos || [])
              .filter(m => m.idMedicamento && m.dosis && m.idUnidadDosis)
              .map(m => ({
                idMedicamento:  Number(m.idMedicamento),
                dosis:          Number(m.dosis),
                idUnidadDosis:  Number(m.idUnidadDosis),
                frecuencia:     m.frecuencia || null,
              })),
          })),
      };
      const created = await investigadorService.crearProtocolo(payload);
      onCreated(created);
    } catch (err) {
      const msg = err?.response?.data?.mensaje ?? 'Error al crear el protocolo. Intenta de nuevo.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const stepProps = { data: formData, onChange: setFormData, catalogos, onCatalogoUpdate: setCatalogos };

  return (
    /* ── Sin onClick en el overlay: el modal NO se cierra al hacer clic fuera ── */
    <div className={styles.overlay}>
      <div className={styles.dialog}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Crear Protocolo</h2>
          <button className={styles.closeBtn} onClick={requestClose} aria-label="Cerrar" disabled={submitting}>
            <CloseIcon />
          </button>
        </div>

        {/* Indicador de pasos */}
        <div className={styles.stepper}>
          {STEPS.map((s, idx) => (
            <div key={s.num} className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${step > s.num ? styles.done : step === s.num ? styles.current : ''}`}>
                {step > s.num ? <CheckSmallIcon /> : s.num}
              </div>
              <span className={`${styles.stepLabel} ${step === s.num ? styles.stepLabelActive : ''}`}>
                {s.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${step > s.num ? styles.stepLineDone : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Contenido del paso */}
        <div className={styles.body}>
          {step === 1 && <Step1DatosBasicos {...stepProps} />}
          {step === 2 && <Step2Criterios    {...stepProps} />}
          {step === 3 && <Step3Visitas      {...stepProps} />}
          {step === 4 && <Step4Medicamentos {...stepProps} />}
        </div>

        {/* Error */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Confirmación de cierre (reemplaza el footer normal) */}
        {confirmClose ? (
          <div className={styles.confirmFooter}>
            <WarningIcon />
            <p className={styles.confirmText}>
              ¿Seguro que deseas cerrar? La información ingresada <strong>se perderá</strong>.
            </p>
            <div className={styles.confirmBtns}>
              <button className={styles.cancelBtn} onClick={() => setConfirmClose(false)}>
                Seguir editando
              </button>
              <button className={styles.discardBtn} onClick={onClose}>
                Sí, descartar
              </button>
            </div>
          </div>
        ) : (
          /* Footer de navegación normal */
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={requestClose} disabled={submitting}>
              Cancelar
            </button>
            <div className={styles.navBtns}>
              {step > 1 && (
                <button className={styles.backBtn} onClick={handleBack} disabled={submitting}>
                  ← Anterior
                </button>
              )}
              {step < 4 && (
                <button className={styles.nextBtn} onClick={handleNext}>
                  Siguiente →
                </button>
              )}
              {step === 4 && (
                <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <span className={styles.spinner} /> : 'Crear Protocolo'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function CheckSmallIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function WarningIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
