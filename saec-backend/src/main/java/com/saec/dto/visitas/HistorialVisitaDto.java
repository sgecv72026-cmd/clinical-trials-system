package com.saec.dto.visitas;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Builder
public class HistorialVisitaDto {
    private Integer idHistorial;
    private String estadoAnterior;
    private String estadoNuevo;
    private LocalDate fechaProgAnterior;
    private LocalDate fechaProgNueva;
    private String modificadoPorNombre;
    private String motivo;
    private LocalDateTime fechaCambio;
}
