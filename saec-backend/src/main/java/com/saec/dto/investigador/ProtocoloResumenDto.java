package com.saec.dto.investigador;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProtocoloResumenDto {
    private Integer       idProtocolo;
    private String        codigo;
    private String        titulo;
    private String        fase;
    private String        estado;
    private LocalDate     fechaInicio;
    private LocalDate     fechaFinEstimada;
    private Integer       metaPacientes;
    private LocalDateTime createdAt;
}
