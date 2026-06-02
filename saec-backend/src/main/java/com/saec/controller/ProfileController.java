package com.saec.controller;

import com.saec.dto.profile.ActualizarContactoDto;
import com.saec.dto.profile.PerfilUsuarioDto;
import com.saec.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints del módulo Mi Perfil.
 * Accesible por cualquier usuario autenticado (cualquier rol).
 */
@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * GET /api/profile/me
     * Devuelve el perfil completo del usuario que realiza la petición.
     * No permite ver perfiles de otros usuarios.
     */
    @GetMapping("/me")
    public ResponseEntity<PerfilUsuarioDto> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.getMyProfile(userDetails));
    }

    /**
     * PATCH /api/profile/me
     * Actualiza teléfono y correo electrónico del usuario autenticado.
     */
    @PatchMapping("/me")
    public ResponseEntity<PerfilUsuarioDto> updateMyContact(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ActualizarContactoDto dto) {
        return ResponseEntity.ok(profileService.updateMyContact(userDetails, dto));
    }
}
