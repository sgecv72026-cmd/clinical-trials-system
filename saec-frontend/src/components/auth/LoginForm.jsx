import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PasswordInput } from './PasswordInput';
import styles from './LoginForm.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FIELDS = { email: '', password: '' };
const INITIAL_ERRORS = { email: '',  password: '' };

export function LoginForm() {
  const { login, loading } = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();

  const [fields,    setFields]    = useState(INITIAL_FIELDS);
  const [errors,    setErrors]    = useState(INITIAL_ERRORS);
  const [apiError,  setApiError]  = useState('');

  const destination = location.state?.from?.pathname ?? '/';

  function validate() {
    const next = { email: '', password: '' };
    let ok = true;

    if (!fields.email.trim()) {
      next.email = 'El correo electrónico es obligatorio';
      ok = false;
    } else if (!EMAIL_REGEX.test(fields.email)) {
      next.email = 'Ingrese un correo electrónico válido';
      ok = false;
    }

    if (!fields.password) {
      next.password = 'La contraseña es obligatoria';
      ok = false;
    }

    setErrors(next);
    return ok;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError)     setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(fields.email.trim().toLowerCase(), fields.password);
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.mensaje;
      if (err.response?.status === 403) {
        setApiError('La cuenta se encuentra deshabilitada');
      } else if (err.response?.status === 401) {
        setApiError('Correo o contraseña incorrectos');
      } else if (msg) {
        setApiError(msg);
      } else {
        setApiError('Error de conexión. Intente nuevamente.');
      }
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className={styles.apiError} role="alert">
          <AlertIcon />
          <span>{apiError}</span>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Correo electrónico
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}><MailIcon /></span>
          <input
            id="email"
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="usuario@institución.com"
            autoComplete="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className={styles.fieldError} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Contraseña
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}><LockIcon /></span>
          <div className={styles.passwordField}>
            <PasswordInput
              id="password"
              value={fields.password}
              onChange={(e) => handleChange({ target: { name: 'password', value: e.target.value } })}
              error={errors.password}
              disabled={loading}
            />
          </div>
        </div>
        {errors.password && (
          <p id="password-error" className={styles.fieldError} role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? (
          <span className={styles.loaderWrapper}>
            <span className={styles.spinner} aria-hidden="true" />
            Autenticando…
          </span>
        ) : (
          'Iniciar sesión'
        )}
      </button>
    </form>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
