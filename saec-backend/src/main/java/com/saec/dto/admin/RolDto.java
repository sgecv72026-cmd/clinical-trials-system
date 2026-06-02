package com.saec.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RolDto {
    private Integer idRol;
    private String  nombre;
    private String  descripcion;
    private Boolean activo;
    private long    totalUsuarios;
    private long    usuariosActivos;
}
