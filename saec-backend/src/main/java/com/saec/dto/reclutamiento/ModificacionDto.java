package com.saec.dto.reclutamiento;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class ModificacionDto {
    private Integer idModificacion;
    private String nombreUsuario;
    private String estadoAnterior;
    private String estadoNuevo;
    private String motivo;
    private LocalDateTime fechaModificacion;
}
