import { useEffect, useRef, useState } from 'react';
import profileService from '../../services/profileService';
import { useAuth } from '../../hooks/useAuth';

/* ── Constantes de color por rol ─────────────────────────────── */
const ROL_CONFIG = {
  'Administrador': {
    badge:  'bg-blue-100 text-blue-800 ring-1 ring-blue-300',
    header: 'from-blue-700 via-blue-800 to-slate-900',
    icon:   '🛡️',
  },
  'Investigador Principal': {
    badge:  'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
    header: 'from-emerald-700 via-emerald-800 to-slate-900',
    icon:   '🔬',
  },
  'Coordinador': {
    badge:  'bg-violet-100 text-violet-800 ring-1 ring-violet-300',
    header: 'from-violet-700 via-violet-800 to-slate-900',
    icon:   '📋',
  },
  'Monitor': {
    badge:  'bg-amber-100 text-amber-800 ring-1 ring-amber-300',
    header: 'from-amber-600 via-amber-700 to-slate-900',
    icon:   '👁️',
  },
  'Paciente': {
    badge:  'bg-cyan-100 text-cyan-800 ring-1 ring-cyan-300',
    header: 'from-cyan-700 via-cyan-800 to-slate-900',
    icon:   '🏥',
  },
};

const DEFAULT_CONFIG = {
  badge:  'bg-slate-100 text-slate-700 ring-1 ring-slate-300',
  header: 'from-slate-700 via-slate-800 to-slate-900',
  icon:   '👤',
};

/* ── Utilidades ──────────────────────────────────────────────── */
function getRolConfig(rol) {
  return ROL_CONFIG[rol] ?? DEFAULT_CONFIG;
}

function formatDate(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleDateString('es-CL', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });
}

function formatDateTime(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleString('es-CL', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

function getInitials(nombre, apellido) {
  return `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();
}

/* ── Sub-componente: campo de información ─────────────────────── */
function InfoField({ icon, label, value, placeholder = 'No registrado' }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="text-lg mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-medium ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
          {value || placeholder}
        </p>
      </div>
    </div>
  );
}

/* ── Sub-componente: tarjeta contenedora ─────────────────────── */
function Card({ title, icon, children, className = '', action }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-base">{icon}</span>}
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {title}
            </h2>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Sub-componente: skeleton loader ─────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="bg-slate-200 rounded-2xl h-52 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-100 rounded-2xl h-80" />
        <div className="space-y-6">
          <div className="bg-slate-100 rounded-2xl h-48" />
          <div className="bg-slate-100 rounded-2xl h-32" />
        </div>
      </div>
    </div>
  );
}

/* ── Sub-componente: estado de error ─────────────────────────── */
function ProfileError({ message }) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <span className="text-4xl block mb-3">⚠️</span>
        <h3 className="text-base font-semibold text-red-700 mb-1">
          Error al cargar el perfil
        </h3>
        <p className="text-sm text-red-500">{message}</p>
      </div>
    </div>
  );
}

/* ── Header del perfil ───────────────────────────────────────── */
function ProfileHeader({ perfil }) {
  const config   = getRolConfig(perfil.rol);
  const initials = getInitials(perfil.nombre, perfil.apellido);

  return (
    <div className={`bg-gradient-to-br ${config.header} rounded-2xl p-8 text-white shadow-lg`}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

        {/* Avatar */}
        <div className="shrink-0">
          {perfil.fotoPerfil ? (
            <img
              src={perfil.fotoPerfil}
              alt={perfil.nombreCompleto}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 ring-4 ring-white/30 shadow-xl
                            flex items-center justify-center text-3xl font-bold tracking-tight
                            backdrop-blur-sm">
              {initials}
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2 truncate">
            {perfil.nombreCompleto}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
            {/* Badge de rol */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                             text-xs font-semibold ${config.badge} bg-white/90`}>
              <span>{config.icon}</span>
              {perfil.rol}
            </span>

            {/* Estado */}
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium
                              ${perfil.activo ? 'text-emerald-300' : 'text-red-300'}`}>
              <span className={`w-2 h-2 rounded-full ${perfil.activo ? 'bg-emerald-400' : 'bg-red-400'}
                                animate-pulse`} />
              {perfil.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <p className="text-blue-200 text-sm truncate">{perfil.email}</p>

          {/* Metadata rápida */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4
                          mt-4 text-xs text-white/60">
            {perfil.createdAt && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Miembro desde {formatDate(perfil.createdAt)}
              </span>
            )}
            {perfil.telefono && (
              <span className="flex items-center gap-1">
                <PhoneIcon className="w-3.5 h-3.5" />
                {perfil.telefono}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal: editar contacto ───────────────────────────────────── */
function EditContactModal({ perfil, onClose, onSaved }) {
  const { logout }                = useAuth();
  const [telefono, setTelefono]   = useState(perfil.telefono ?? '');
  const [email,    setEmail]      = useState(perfil.email    ?? '');
  const [saving,   setSaving]     = useState(false);
  const [cerrando, setCerrando]   = useState(false);
  const [errores,  setErrores]    = useState({});
  const emailRef                  = useRef(null);

  const emailCambio = email.trim().toLowerCase() !== (perfil.email ?? '').toLowerCase();

  /* Autofocus al abrir */
  useEffect(() => { emailRef.current?.focus(); }, []);

  /* Cerrar con Escape (solo si no está cerrando sesión) */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !cerrando) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, cerrando]);

  function validate() {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Formato de correo inválido';
    }
    if (telefono.trim().length > 20) {
      errs.telefono = 'Máximo 20 caracteres';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }

    setSaving(true);
    try {
      const updated = await profileService.updateMyContact({
        email:    email.trim().toLowerCase(),
        telefono: telefono.trim() || null,
      });

      if (emailCambio) {
        /* El JWT actual usa el email viejo → hay que cerrar sesión */
        setCerrando(true);
        setTimeout(() => logout(), 2000);
      } else {
        onSaved(updated);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje
               ?? err.response?.data?.message
               ?? err.message
               ?? 'Error al guardar';
      setErrores({ general: msg });
    } finally {
      setSaving(false);
    }
  }

  /* ── Estado: cerrando sesión ── */
  if (cerrando) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center
                       bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm
                        border border-slate-100 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center
                          mx-auto mb-4 text-2xl">
            ✅
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Correo actualizado
          </h3>
          <p className="text-sm text-slate-500">
            Cerrando sesión… Inicia sesión con tu nuevo correo.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="w-5 h-5 border-2 border-slate-300 border-t-blue-500
                             rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-sm p-4"
    >
      {/* Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md
                      border border-slate-100 overflow-hidden">

        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">✏️</span>
            <h2 className="text-sm font-semibold text-slate-700">Editar información de contacto</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full
                       text-slate-400 hover:text-slate-600 hover:bg-slate-100
                       transition-colors text-lg leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Error general */}
          {errores.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                            text-sm text-red-600">
              {errores.general}
            </div>
          )}

          {/* Aviso de cierre de sesión cuando el email cambia */}
          {emailCambio && (
            <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-amber-500 text-base shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                Al cambiar el correo electrónico tu sesión se cerrará automáticamente.
                Deberás iniciar sesión con el nuevo correo.
              </p>
            </div>
          )}

          {/* Correo */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase
                               tracking-wider mb-1.5">
              Correo electrónico *
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('input-telefono')?.focus(); } }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800
                          bg-white outline-none transition-colors
                          focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                          ${errores.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              placeholder="correo@ejemplo.cl"
            />
            {errores.email && (
              <p className="mt-1 text-xs text-red-500">{errores.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase
                               tracking-wider mb-1.5">
              Teléfono
            </label>
            <input
              id="input-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800
                          bg-white outline-none transition-colors
                          focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                          ${errores.telefono ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              placeholder="+56 9 1234 5678"
              maxLength={20}
            />
            {errores.telefono && (
              <p className="mt-1 text-xs text-red-500">{errores.telefono}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200
                         text-sm font-medium text-slate-600
                         hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600
                         text-sm font-semibold text-white
                         hover:bg-blue-700 active:bg-blue-800
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white
                                   rounded-full animate-spin" />
                  Guardando…
                </>
              ) : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Tarjeta: información personal ───────────────────────────── */
function PersonalInfoCard({ perfil, onEdit }) {
  return (
    <Card
      title="Información Personal"
      icon="👤"
      action={
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     text-blue-600 bg-blue-50 hover:bg-blue-100
                     border border-blue-200 transition-colors"
        >
          ✏️ Editar
        </button>
      }
    >
      <InfoField icon="📞" label="Teléfono"           value={perfil.telefono} />
      <InfoField icon="✉️" label="Correo electrónico" value={perfil.email} />
    </Card>
  );
}

/* ── Tarjeta: información del sistema ────────────────────────── */
function SystemInfoCard({ perfil }) {
  const config = getRolConfig(perfil.rol);
  return (
    <Card title="Información del Sistema" icon="⚙️">
      {/* Rol con badge */}
      <div className="flex items-start gap-3 py-3 border-b border-slate-100">
        <span className="text-lg mt-0.5">🛡️</span>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Rol asignado</p>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                           text-xs font-semibold ${config.badge}`}>
            {config.icon} {perfil.rol}
          </span>
          {perfil.descripcionRol && (
            <p className="text-xs text-slate-500 mt-1 italic">{perfil.descripcionRol}</p>
          )}
        </div>
      </div>

      {/* Estado */}
      <div className="flex items-start gap-3 py-3 border-b border-slate-100">
        <span className="text-lg mt-0.5">{perfil.activo ? '✅' : '🚫'}</span>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Estado de cuenta</p>
          <p className={`text-sm font-semibold ${perfil.activo ? 'text-emerald-600' : 'text-red-600'}`}>
            {perfil.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
          </p>
        </div>
      </div>

      {/* Fecha creación */}
      <div className="flex items-start gap-3 py-3 border-b border-slate-100">
        <span className="text-lg mt-0.5">📅</span>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Miembro desde</p>
          <p className="text-sm font-medium text-slate-800">
            {perfil.createdAt ? formatDate(perfil.createdAt) : '—'}
          </p>
        </div>
      </div>

      {/* Último acceso */}
      <div className="flex items-start gap-3 py-3">
        <span className="text-lg mt-0.5">🕐</span>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Último acceso</p>
          <p className={`text-sm font-medium ${perfil.ultimoAcceso ? 'text-slate-800' : 'text-slate-400 italic'}`}>
            {perfil.ultimoAcceso ? formatDateTime(perfil.ultimoAcceso) : 'Sin registro'}
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ── Tarjeta: centros asignados ──────────────────────────────── */
function CentrosCard({ centros }) {
  return (
    <Card title="Centros de Investigación Asignados" icon="🏥">
      {centros.length === 0 ? (
        <div className="text-center py-4">
          <span className="text-3xl block mb-2">🏗️</span>
          <p className="text-sm text-slate-400 italic">Sin centros asignados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {centros.map((centro) => (
            <div
              key={centro.idCentro}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl
                         border border-slate-100 hover:border-blue-200
                         hover:bg-blue-50/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center
                              justify-center shrink-0 text-base">
                🏥
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {centro.nombre}
                </p>
                {(centro.ciudad || centro.direccion) && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {[centro.ciudad, centro.direccion].filter(Boolean).join(' — ')}
                  </p>
                )}
                {centro.telefono && (
                  <p className="text-xs text-slate-400 mt-0.5">{centro.telefono}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ── Iconos SVG inline ───────────────────────────────────────── */
function CalendarIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function PhoneIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12
               19.79 19.79 0 0 1 1.61 3.53 2 2 0 0 1 3.62 1.35h3a2 2 0 0 1 2 1.72
               12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91
               a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45
               12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export function ProfilePage() {
  const [perfil,     setPerfil]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [editOpen,   setEditOpen]   = useState(false);
  const [saveToast,  setSaveToast]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    profileService.getMyProfile()
      .then(data => { if (!cancelled) setPerfil(data); })
      .catch(err  => { if (!cancelled) setError(err.response?.data?.mensaje ?? err.message); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function handleSaved(updated) {
    setPerfil(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  }

  if (loading) return <ProfileSkeleton />;
  if (error)   return <ProfileError message={error} />;
  if (!perfil) return null;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">

      {/* Banner de cabecera */}
      <ProfileHeader perfil={perfil} />

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* Columna izquierda: datos personales */}
        <PersonalInfoCard perfil={perfil} onEdit={() => setEditOpen(true)} />

        {/* Columna derecha: sistema + centros */}
        <div className="flex flex-col gap-6">
          <SystemInfoCard perfil={perfil} />
          <CentrosCard    centros={perfil.centros} />
        </div>

      </div>

      {/* Modal de edición */}
      {editOpen && (
        <EditContactModal
          perfil={perfil}
          onClose={() => setEditOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Toast de éxito */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5
                        bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg
                        animate-fade-in text-sm font-medium">
          <span>✅</span> Información de contacto actualizada
        </div>
      )}
    </div>
  );
}
