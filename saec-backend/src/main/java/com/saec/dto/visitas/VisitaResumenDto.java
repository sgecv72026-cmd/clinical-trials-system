package com.saec.dto.visitas;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter @Builder
public class VisitaResumenDto {
    private Integer idVisita;
    private String nombreVisita;
    private Integer semana;
    private Integer dia;
    private LocalDate fechaProgramada;
    private LocalDate fechaRealizada;
    private String estadoVisita;
    private Integer idEstadoVisita;
    private Boolean activo;
}
