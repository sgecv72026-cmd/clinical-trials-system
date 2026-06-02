package com.saec.dto.pacientes;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class MedicacionHabitualRequest {

    @NotBlank(message = "El nombre del medicamento es obligatorio")
    private String nombreMedicamento;

    private String dosis;

    private String frecuencia;
}
