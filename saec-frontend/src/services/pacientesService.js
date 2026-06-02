import api from './api';

const pacientesService = {

  /* ── Lista ──────────────────────────────────────────────────── */

  listarPacientes() {
    return api.get('/pacientes').then(r => r.data);
  },

  /* ── Detalle ────────────────────────────────────────────────── */

  obtenerDetalle(idPaciente) {
    return api.get(`/pacientes/${idPaciente}`).then(r => r.data);
  },

  /* ── Antecedentes ───────────────────────────────────────────── */

  agregarAntecedente(idPaciente, data) {
    return api.post(`/pacientes/${idPaciente}/antecedentes`, data).then(r => r.data);
  },

  desactivarAntecedente(idAntecedente) {
    return api.put(`/pacientes/antecedentes/${idAntecedente}/desactivar`).then(r => r.data);
  },

  /* ── Visitas ────────────────────────────────────────────────── */

  listarVisitas(idPaciente) {
    return api.get(`/pacientes/${idPaciente}/visitas`).then(r => r.data);
  },

  obtenerVisita(idVisita) {
    return api.get(`/pacientes/visitas/${idVisita}`).then(r => r.data);
  },

  cambiarEstadoVisita(idVisita, data) {
    return api.put(`/pacientes/visitas/${idVisita}/estado`, data).then(r => r.data);
  },

  /* ── Evolución clínica ──────────────────────────────────────── */

  obtenerEvolucion(idVisita) {
    return api.get(`/pacientes/visitas/${idVisita}/evolucion`).then(r => r.data);
  },

  guardarEvolucion(idVisita, data) {
    return api.put(`/pacientes/visitas/${idVisita}/evolucion`, data).then(r => r.data);
  },

  bloquearEvolucion(idVisita) {
    return api.put(`/pacientes/visitas/${idVisita}/evolucion/bloquear`).then(r => r.data);
  },

  liberarEvolucion(idVisita) {
    return api.put(`/pacientes/visitas/${idVisita}/evolucion/liberar`).then(r => r.data);
  },

  /* ── Resultados de laboratorio ──────────────────────────────── */

  listarResultados(idVisita) {
    return api.get(`/pacientes/visitas/${idVisita}/resultados`).then(r => r.data);
  },

  agregarResultado(idVisita, data) {
    return api.post(`/pacientes/visitas/${idVisita}/resultados`, data).then(r => r.data);
  },

  eliminarResultado(idResultado) {
    return api.delete(`/pacientes/visitas/resultados/${idResultado}`);
  },

  /* ── Administración de medicamentos ────────────────────────── */

  listarMedicamentos(idVisita) {
    return api.get(`/pacientes/visitas/${idVisita}/medicamentos`).then(r => r.data);
  },

  registrarMedicamento(idVisita, data) {
    return api.post(`/pacientes/visitas/${idVisita}/medicamentos`, data).then(r => r.data);
  },

  /* ── Historial ──────────────────────────────────────────────── */

  listarHistorialVisita(idVisita) {
    return api.get(`/pacientes/visitas/${idVisita}/historial`).then(r => r.data);
  },

  /* ── Catálogos ──────────────────────────────────────────────── */

  getSeveridades() {
    return api.get('/pacientes/catalogos/severidades').then(r => r.data);
  },

  getTiposPrueba() {
    return api.get('/pacientes/catalogos/tipos-prueba').then(r => r.data);
  },

  crearTipoPrueba(data) {
    return api.post('/pacientes/catalogos/tipos-prueba', data).then(r => r.data);
  },

  getEstadosVisita() {
    return api.get('/pacientes/catalogos/estados-visita').then(r => r.data);
  },

  getMedicamentosProtocolo(idProtocolo) {
    return api.get(`/pacientes/catalogos/medicamentos-protocolo/${idProtocolo}`).then(r => r.data);
  },

  getUnidadesDosis() {
    return api.get('/pacientes/catalogos/unidades-dosis').then(r => r.data);
  },

  /* ── Eventos adversos ──────────────────────────────────────── */

  listarEventosAdversos(idVisita) {
    return api.get(`/pacientes/visitas/${idVisita}/eventos-adversos`).then(r => r.data);
  },

  registrarEventoAdverso(idVisita, data) {
    return api.post(`/pacientes/visitas/${idVisita}/eventos-adversos`, data).then(r => r.data);
  },

  /* ── Medicación habitual ───────────────────────────────────── */

  agregarMedicacion(idPaciente, data) {
    return api.post(`/pacientes/${idPaciente}/medicacion`, data).then(r => r.data);
  },

  desactivarMedicacion(idMedicacion) {
    return api.put(`/pacientes/medicacion/${idMedicacion}/desactivar`).then(r => r.data);
  },
};

export default pacientesService;
