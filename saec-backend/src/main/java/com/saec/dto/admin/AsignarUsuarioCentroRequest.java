package com.saec.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class AsignarUsuarioCentroRequest {

    @NotNull(message = "El usuario es obligatorio")
    private Integer idUsuario;
}
