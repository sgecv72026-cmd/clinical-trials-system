package com.saec.dto.investigador;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CrearMedicamentoRequest {

    @NotBlank(message = "El nombre del medicamento es obligatorio")
    private String nombre;

    private String descripcion;
}
