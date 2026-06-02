package com.saec.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ToggleActivoRequest {
    @NotNull(message = "El campo activo es obligatorio")
    private Boolean activo;
}
