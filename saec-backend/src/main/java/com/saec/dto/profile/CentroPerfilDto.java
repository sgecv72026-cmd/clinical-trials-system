package com.saec.dto.profile;

/**
 * Información resumida de un centro de investigación asociado al usuario.
 */
public record CentroPerfilDto(
        Integer idCentro,
        String  nombre,
        String  ciudad,
        String  direccion,
        String  telefono
) {}
