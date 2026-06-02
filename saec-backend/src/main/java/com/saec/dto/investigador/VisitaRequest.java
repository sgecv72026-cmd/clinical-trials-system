package com.saec.dto.investigador;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class VisitaRequest {

    @NotNull(message = "La semana es obligatoria")
    @Min(value = 1, message = "La semana debe ser al menos 1")
    private Integer semana;

    @NotNull(message = "El día es obligatorio")
    @Min(value = 1, message = "El día debe estar entre 1 y 7")
    @Max(value = 7, message = "El día debe estar entre 1 y 7")
    private Integer dia;

    private String nombreVisita;
    private String descripcion;

    @Valid
    private List<MedicamentoRequest> medicamentos;
}
