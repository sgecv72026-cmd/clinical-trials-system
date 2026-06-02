import api from './api';

const adminService = {
  // ── Dashboard ──────────────────────────────────────────
  getDashboardStats() {
    return api.get('/admin/dashboard/stats').then(r => r.data);
  },

  // ── Usuarios ───────────────────────────────────────────
  getUsuarios({ search = '', idRol, activo, page = 0, size = 10 } = {}) {
    const params = { page, size };
    if (search)              params.search = search;
    if (idRol  != null)      params.idRol  = idRol;
    if (activo != null)      params.activo = activo;
    return api.get('/admin/usuarios', { params }).then(r => r.data);
  },

  getUsuario(id) {
    return api.get(`/admin/usuarios/${id}`).then(r => r.data);
  },

  toggleActivo(id, activo) {
    return api.put(`/admin/usuarios/${id}/activo`, { activo }).then(r => r.data);
  },

  crearUsuario(data) {
    return api.post('/admin/usuarios', data).then(r => r.data);
  },

  // ── Roles ──────────────────────────────────────────────
  getRoles() {
    return api.get('/admin/roles').then(r => r.data);
  },

  // ── Centros ────────────────────────────────────────────
  getCentros() {
    return api.get('/admin/centros').then(r => r.data);
  },

  getCentroDetalle(id) {
    return api.get(`/admin/centros/${id}`).then(r => r.data);
  },

  crearCentro(data) {
    return api.post('/admin/centros', data).then(r => r.data);
  },

  asignarUsuarioCentro(idCentro, idUsuario) {
    return api.post(`/admin/centros/${idCentro}/usuarios`, { idUsuario }).then(r => r.data);
  },

  // ── Auditoría ──────────────────────────────────────────
  getAuditoria({ accion, tabla, idUsuario, nombreUsuario, desde, hasta, page = 0, size = 20 } = {}) {
    const params = { page, size };
    if (accion)        params.accion        = accion;
    if (tabla)         params.tabla         = tabla;
    if (idUsuario)     params.idUsuario     = idUsuario;
    if (nombreUsuario) params.nombreUsuario = nombreUsuario;
    if (desde)         params.desde         = desde;
    if (hasta)         params.hasta         = hasta;
    return api.get('/admin/auditoria', { params }).then(r => r.data);
  },
};

export default adminService;
