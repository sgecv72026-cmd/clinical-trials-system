package com.saec.service;

import com.saec.dto.profile.ActualizarContactoDto;
import com.saec.dto.profile.PerfilUsuarioDto;
import org.springframework.security.core.userdetails.UserDetails;

public interface ProfileService {

    /**
     * Devuelve el perfil completo del usuario actualmente autenticado.
     *
     * @param userDetails principal Spring Security del usuario autenticado
     * @return DTO con toda la información del perfil
     */
    PerfilUsuarioDto getMyProfile(UserDetails userDetails);

    /**
     * Actualiza teléfono y/o correo electrónico del usuario autenticado.
     *
     * @param userDetails principal Spring Security del usuario autenticado
     * @param dto         campos a actualizar
     * @return perfil actualizado
     */
    PerfilUsuarioDto updateMyContact(UserDetails userDetails, ActualizarContactoDto dto);
}
