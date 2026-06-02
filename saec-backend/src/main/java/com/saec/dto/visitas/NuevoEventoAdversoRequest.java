package com.saec.dto.visitas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class NuevoEventoAdversoRequest {

    @NotNull(message = "La severidad es requerida")
    private Integer idSeveridad;

    @NotBlank(message = "La descripción es requerida")
    private String descripcion;

    @NotNull(message = "La fecha de reporte es requerida")
    private LocalDate fechaReporte;
}
