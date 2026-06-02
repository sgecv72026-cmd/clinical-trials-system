package com.saec.dto.visitas;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class CambiarEstadoVisitaRequest {
    @NotNull(message = "El estado es requerido")
    private Integer idEstadoVisita;
    private String motivo;
}
