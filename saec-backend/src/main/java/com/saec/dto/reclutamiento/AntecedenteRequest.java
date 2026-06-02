package com.saec.dto.reclutamiento;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class AntecedenteRequest {

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    private LocalDate fechaDiagnostico;
}
