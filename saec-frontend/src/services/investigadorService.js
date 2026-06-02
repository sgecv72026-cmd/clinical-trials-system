import api from './api';

const investigadorService = {

  /* ── Protocolos ──────────────────────────────────────────────── */

  getStats() {
    return api.get('/investigador/protocolos/stats').then(r => r.data);
  },

  getProtocolos({ idEstado, search, page = 0, size = 10 } = {}) {
    return api.get('/investigador/protocolos', {
      params: { idEstado, search, page, size },
    }).then(r => r.data);
  },

  crearProtocolo(data) {
    return api.post('/investigador/protocolos', data).then(r => r.data);
  },

  getProtocolo(id) {
    return api.get(`/investigador/protocolos/${id}`).then(r => r.data);
  },

  actualizarProtocolo(id, data) {
    return api.patch(`/investigador/protocolos/${id}`, data).then(r => r.data);
  },

  /* ── Catálogos (para el formulario) ─────────────────────────── */

  getCatFases() {
    return api.get('/investigador/catalogos/fases').then(r => r.data);
  },

  getCatEstados() {
    return api.get('/investigador/catalogos/estados').then(r => r.data);
  },

  getCatMedicamentos() {
    return api.get('/investigador/catalogos/medicamentos').then(r => r.data);
  },

  getCatUnidadesDosis() {
    return api.get('/investigador/catalogos/unidades-dosis').then(r => r.data);
  },

  crearMedicamento({ nombre, descripcion }) {
    return api.post('/investigador/catalogos/medicamentos', { nombre, descripcion }).then(r => r.data);
  },

  /* ── Medicamentos del investigador ──────────────────────────── */

  getMedicamentosInvestigador({ search, page = 0, size = 10 } = {}) {
    return api.get('/investigador/medicamentos', {
      params: { search, page, size },
    }).then(r => r.data);
  },
};

export default investigadorService;
