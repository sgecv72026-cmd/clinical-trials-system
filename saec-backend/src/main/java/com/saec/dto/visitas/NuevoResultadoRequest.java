package com.saec.dto.visitas;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter @NoArgsConstructor
public class NuevoResultadoRequest {
    @NotNull(message = "El tipo de prueba es requerido")
    private Integer idTipoPrueba;

    @NotNull(message = "La fecha de toma es requerida")
    private LocalDate fechaToma;

    private Integer idSeveridad;
}
