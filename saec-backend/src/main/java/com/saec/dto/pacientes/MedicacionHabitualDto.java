package com.saec.dto.pacientes;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class MedicacionHabitualDto {
    private Integer       idMedicacion;
    private String        nombreMedicamento;
    private String        dosis;
    private String        frecuencia;
    private String        registradoPorNombre;
    private LocalDateTime fechaRegistro;
    private Boolean       activo;
}
