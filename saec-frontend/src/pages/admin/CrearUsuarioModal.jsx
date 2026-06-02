import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import styles from './AdminModal.module.css';

export function CrearUsuarioModal({ onClose, onCreado, roles }) {
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '',
    password: '', confirmar: '',
    idRol: '', telefono: '',
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
    if (name === 'telefono') {
      const soloDigitos = value.replace(/\D/g, '').slice(0, 10);
      setForm(p => ({ ...p, telefono: soloDigitos }));
      setFieldErrors(p => ({
        ...p,
        telefono: soloDigitos.length > 0 && soloDigitos.length < 10
          ? `${soloDigitos.length}/10 dígitos`
          : '',
      }));
      return;
    }
    setForm(p => ({ ...p, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.telefono && form.telefono.length !== 10) {
      setFieldErrors(p => ({ ...p, telefono: 'El teléfono debe tener exactamente 10 dígitos' }));
      return;
    }
    if (Object.values(fieldErrors).some(Boolean)) return;
    setSaving(true);
    try {
      const nuevo = await adminService.crearUsuario({
        nombre:   form.nombre,
        apellido: form.apellido,
        email:    form.email,
        password: form.password,
        idRol:    Number(form.idRol),
        telefono: form.telefono || null,
      });
      onCreado(nuevo);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el usuario');
    } finally {
      setSaving(false);
    }
  }

  function stopProp(e) { e.stopPropagation(); }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} onMouseDown={stopProp}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Nuevo usuario</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Nombre <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Apellido <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Email <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Contraseña <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Confirmar contraseña <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="password"
                  name="confirmar"
                  value={form.confirmar}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Rol <span className={styles.req}>*</span>
              </label>
              <select
                className={styles.select}
                name="idRol"
                value={form.idRol}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar rol…</option>
                {roles.map(r => (
                  <option key={r.idRol} value={r.idRol}>{r.nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <input
                className={`${styles.input} ${fieldErrors.telefono ? styles.inputError : ''}`}
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="10 dígitos (opcional)"
                inputMode="numeric"
                maxLength={10}
              />
              {fieldErrors.telefono
                ? <span className={styles.helperError}>{fieldErrors.telefono}</span>
                : form.telefono.length > 0 && (
                    <span className={styles.helperHint}>{form.telefono.length}/10 dígitos</span>
                  )
              }
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
              {saving ? 'Guardando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
