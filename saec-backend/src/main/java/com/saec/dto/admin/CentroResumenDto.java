package com.saec.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CentroResumenDto {
    private Integer idCentro;
    private String  nombre;
    private String  ciudad;
    private String  direccion;
    private String  telefono;
    private Boolean activo;
    private long    totalUsuarios;
}
