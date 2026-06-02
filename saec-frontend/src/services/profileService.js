import api from './api';

const profileService = {
  /**
   * GET /api/profile/me
   * Devuelve el perfil completo del usuario autenticado.
   * @returns {Promise<PerfilUsuarioDto>}
   */
  async getMyProfile() {
    const { data } = await api.get('/profile/me');
    return data;
  },

  /**
   * PATCH /api/profile/me
   * Actualiza teléfono y correo electrónico del usuario autenticado.
   * @param {{ email: string, telefono: string|null }} payload
   * @returns {Promise<PerfilUsuarioDto>}
   */
  async updateMyContact(payload) {
    const { data } = await api.patch('/profile/me', payload);
    return data;
  },
};

export default profileService;

/**
 * @typedef {Object} CentroPerfilDto
 * @property {number}  idCentro
 * @property {string}  nombre
 * @property {string}  ciudad
 * @property {string|null} direccion
 * @property {string|null} telefono
 */

/**
 * @typedef {Object} PerfilUsuarioDto
 * @property {number}  idUsuario
 * @property {string}  nombre
 * @property {string}  apellido
 * @property {string}  nombreCompleto
 * @property {string}  email
 * @property {string|null} documentoIdentidad
 * @property {string}  rol
 * @property {string|null} descripcionRol
 * @property {CentroPerfilDto[]} centros
 * @property {boolean} activo
 * @property {string}  createdAt    ISO-8601
 * @property {string|null} ultimoAcceso ISO-8601
 * @property {string|null} fotoPerfil
 * @property {string|null} especialidadCargo
 * @property {string|null} telefono
 * @property {string|null} ciudad
 * @property {string|null} direccion
 */
