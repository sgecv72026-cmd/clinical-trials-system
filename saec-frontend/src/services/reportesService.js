import api from './api';

const reportesService = {

  getResumenComite({ fechaDesde, fechaHasta, idCentro } = {}) {
    const params = {};
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    if (idCentro)   params.idCentro   = idCentro;
    return api.get('/reportes/comite', { params }).then(r => r.data);
  },

  getResumenMedico() {
    return api.get('/reportes/medico').then(r => r.data);
  },

  getResumenCoordinador() {
    return api.get('/reportes/coordinador').then(r => r.data);
  },
};

export default reportesService;
