import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import styles from './AdminModal.module.css';

export function CrearCentroModal({ onClose, onCreado }) {
  const [form, setForm] = useState({
    nombre: '', ciudad: '', direccion: '', telefono: '',
  });
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setError('');
    if (name === 'telefono') {
      setFieldErrors(p => ({
        ...p,
        telefono: value && !/^[0-9+\-\s()]+$/.test(value)
          ? 'Solo se permiten números y los caracteres + - ( )'
          : '',
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (Object.values(fieldErrors).some(Boolean)) return;
    setSaving(true);
    try {
      const nuevo = await adminService.crearCentro({
        nombre:    form.nombre,
        ciudad:    form.ciudad,
        direccion: form.direccion || null,
        telefono:  form.telefono  || null,
      });
      onCreado(nuevo);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el centro');
    } finally {
      setSaving(false);
    }
  }

  function stopProp(e) { e.stopPropagation(); }

  return (
    <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.dialog} onMouseDown={stopProp}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Nuevo centro de investigación</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label}>
                Nombre del centro <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Ej. Hospital General del Norte"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Ciudad <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
                placeholder="Ej. Guadalajara"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Dirección</label>
              <input
                className={styles.input}
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <input
                className={`${styles.input} ${fieldErrors.telefono ? styles.inputError : ''}`}
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Opcional"
              />
              {fieldErrors.telefono && (
                <span className={styles.helperError}>{fieldErrors.telefono}</span>
              )}
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving && <span className={styles.spinner} />}
              {saving ? 'Guardando…' : 'Crear centro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
