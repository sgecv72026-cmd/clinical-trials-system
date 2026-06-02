package com.saec.dto.investigador;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class MedicamentoRequest {

    @NotNull(message = "El medicamento es obligatorio")
    private Integer idMedicamento;

    @NotNull(message = "La dosis es obligatoria")
    @DecimalMin(value = "0.01", message = "La dosis debe ser mayor a 0")
    private BigDecimal dosis;

    @NotNull(message = "La unidad de dosis es obligatoria")
    private Integer idUnidadDosis;

    @NotBlank(message = "La frecuencia es obligatoria")
    private String frecuencia;
}
