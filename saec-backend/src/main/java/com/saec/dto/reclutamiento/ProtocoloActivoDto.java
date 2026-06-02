package com.saec.dto.reclutamiento;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ProtocoloActivoDto {
    private Integer idProtocolo;
    private String  codigo;
    private String  codigoProtocolo;    // alias usado en el frontend
    private String  titulo;
    private String  fase;
    private Integer metaPacientes;
    private Long    pacientesActivos;
    private Integer cupoDisponible;     // número de cupos restantes (no Boolean)
}
