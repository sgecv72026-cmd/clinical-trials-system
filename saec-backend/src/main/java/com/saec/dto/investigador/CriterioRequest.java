package com.saec.dto.investigador;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class CriterioRequest {

    @NotBlank(message = "El tipo de criterio es obligatorio")
    @Pattern(regexp = "inclusion|exclusion", message = "El tipo debe ser 'inclusion' o 'exclusion'")
    private String tipo;

    @NotBlank(message = "La descripción del criterio es obligatoria")
    private String descripcion;
}
