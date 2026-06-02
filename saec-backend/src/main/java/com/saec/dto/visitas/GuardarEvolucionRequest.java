package com.saec.dto.visitas;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class GuardarEvolucionRequest {
    @NotBlank(message = "El contenido es requerido")
    private String contenido;
}
