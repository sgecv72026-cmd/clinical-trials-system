package com.saec.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AuditoriaDto {
    private Long          idAuditoria;
    private Integer       idUsuario;
    private String        nombreUsuario;
    private String        emailUsuario;
    private String        accion;
    private String        tablaAfectada;
    private Integer       idRegistro;
    private String        detalle;
    private LocalDateTime fechaHora;
}
