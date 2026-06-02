package com.saec.dto.profile;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Respuesta completa del endpoint GET /profile/me.
 * Contiene toda la información pública del usuario autenticado.
 */
public record PerfilUsuarioDto(

        Integer idUsuario,
        String  nombre,
        String  apellido,
        String  nombreCompleto,
        String  email,
        String  documentoIdentidad,

        /* Rol */
        String  rol,
        String  descripcionRol,

        /* Centros asignados */
        List<CentroPerfilDto> centros,

        /* Estado */
        Boolean activo,

        /* Fechas */
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime ultimoAcceso,

        /* Datos adicionales de perfil */
        String fotoPerfil,
        String especialidadCargo,
        String telefono,
        String ciudad,
        String direccion

) {}
