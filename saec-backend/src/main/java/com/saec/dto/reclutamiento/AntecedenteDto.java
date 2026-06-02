package com.saec.dto.reclutamiento;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Builder
public class AntecedenteDto {
    private Integer idAntecedente;
    private String descripcion;
    private LocalDate fechaDiagnostico;
    private String registradoPorNombre;
    private LocalDateTime fechaRegistro;
    private Boolean activo;
}
