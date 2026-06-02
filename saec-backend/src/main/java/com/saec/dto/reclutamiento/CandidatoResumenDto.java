package com.saec.dto.reclutamiento;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class CandidatoResumenDto {
    private Integer idCandidato;
    private Integer idPostulacion;
    private String  nombre;
    private String  apellido;
    /* Protocolo */
    private String  protocolo;          // backward compat
    private String  nombreProtocolo;
    private String  codigoProtocolo;
    /* Centro */
    private String  nombreCentro;
    /* Estado */
    private String  estadoPostulacion;
    private String  nombreEstado;       // alias
    private Integer idEstado;
    /* Elegibilidad y fechas */
    private Boolean elegibilidadAuto;
    private LocalDateTime fechaPostulacion;
    private LocalDateTime fechaDecision;
}
