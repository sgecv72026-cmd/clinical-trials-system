import api from './api';

const reclutamientoService = {

  /* ── Catálogos ──────────────────────────────────────────────── */

  getGeneros() {
    return api.get('/reclutamiento/catalogos/generos').then(r => r.data);
  },

  getCentros() {
    return api.get('/reclutamiento/catalogos/centros').then(r => r.data);
  },

  getProtocolosActivos() {
    return api.get('/reclutamiento/catalogos/protocolos-activos').then(r => r.data);
  },

  getCriteriosProtocolo(idProtocolo) {
    return api.get(`/reclutamiento/catalogos/protocolos/${idProtocolo}/criterios`).then(r => r.data);
  },

  /* ── Coordinador ────────────────────────────────────────────── */

  getMisCandidatos() {
    return api.get('/reclutamiento/candidatos').then(r => r.data);
  },

  crearCandidato(data) {
    return api.post('/reclutamiento/candidatos', data).then(r => r.data);
  },

  actualizarCandidato(idCandidato, data) {
    return api.patch(`/reclutamiento/candidatos/${idCandidato}`, data).then(r => r.data);
  },

  /* ── Detalle candidato (compartido) ─────────────────────────── */

  getDetalleCandidato(idCandidato) {
    return api.get(`/reclutamiento/candidatos/${idCandidato}`).then(r => r.data);
  },

  /* ── Investigador ───────────────────────────────────────────── */

  getPostulacionesPendientes() {
    return api.get('/reclutamiento/postulaciones/pendientes').then(r => r.data);
  },

  getPostulacionesHistorial() {
    return api.get('/reclutamiento/postulaciones/historial').then(r => r.data);
  },

  aprobarPostulacion(idPostulacion) {
    return api.put(`/reclutamiento/postulaciones/${idPostulacion}/aprobar`).then(r => r.data);
  },

  rechazarPostulacion(idPostulacion, motivo) {
    return api.put(`/reclutamiento/postulaciones/${idPostulacion}/rechazar`, { motivo }).then(r => r.data);
  },

  /* ── Médico ─────────────────────────────────────────────────── */

  getPendientesMedico() {
    return api.get('/reclutamiento/medico/pendientes').then(r => r.data);
  },

  iniciarEvaluacion(idCandidato) {
    return api.post(`/reclutamiento/candidatos/${idCandidato}/iniciar-evaluacion`).then(r => r.data);
  },

  agregarAntecedente(idCandidato, data) {
    return api.post(`/reclutamiento/candidatos/${idCandidato}/antecedentes`, data).then(r => r.data);
  },

  desactivarAntecedente(idAntecedente) {
    return api.put(`/reclutamiento/antecedentes/${idAntecedente}/desactivar`).then(r => r.data);
  },

  guardarCriterios(idPostulacion, criterios) {
    return api.post(`/reclutamiento/postulaciones/${idPostulacion}/criterios`, criterios).then(r => r.data);
  },

  subirPdfConsentimiento(idCandidato, file) {
    const formData = new FormData();
    formData.append('archivo', file);
    return api.post(`/reclutamiento/candidatos/${idCandidato}/consentimiento/pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  registrarConsentimiento(idCandidato, data) {
    return api.post(`/reclutamiento/candidatos/${idCandidato}/consentimiento`, data).then(r => r.data);
  },

  inscribirPaciente(idCandidato) {
    return api.post(`/reclutamiento/candidatos/${idCandidato}/inscribir`).then(r => r.data);
  },

  marcarNoApto(idPostulacion, motivo) {
    return api.put(`/reclutamiento/postulaciones/${idPostulacion}/no-apto`, { motivo }).then(r => r.data);
  },

  abrirPdfConsentimiento(ruta) {
    return api.get('/reclutamiento/consentimientos/pdf', {
      params: { ruta },
      responseType: 'blob',
    }).then(r => {
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });
  },
};

export default reclutamientoService;
