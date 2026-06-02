package com.saec.dto.profile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload para PATCH /api/profile/me
 * Permite actualizar teléfono y correo electrónico del usuario autenticado.
 */
public record ActualizarContactoDto(

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "Formato de correo inválido")
        @Size(max = 150, message = "El correo no puede superar 150 caracteres")
        String email,

        @Size(max = 20, message = "El teléfono no puede superar 20 caracteres")
        String telefono
) {}
