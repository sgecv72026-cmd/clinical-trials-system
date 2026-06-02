package com.saec.dto.visitas;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Builder
public class ResultadoLaboratorioDto {
    private Integer idResultado;
    private String tipoPrueba;
    private Integer idTipoPrueba;
    private LocalDate fechaToma;
    private String severidad;
    private Integer idSeveridad;
    private String registradoPorNombre;
    private LocalDateTime createdAt;
}
