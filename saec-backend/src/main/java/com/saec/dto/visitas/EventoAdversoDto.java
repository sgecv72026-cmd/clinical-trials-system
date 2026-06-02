package com.saec.dto.visitas;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter @Builder
public class EventoAdversoDto {
    private Integer   idEvento;
    private String    severidad;
    private Integer   idSeveridad;
    private String    descripcion;
    private LocalDate fechaReporte;
    private String    reportadoPorNombre;
}
