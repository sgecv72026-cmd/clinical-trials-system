package com.saec.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class UsuarioAdminDto {
    private Integer idUsuario;
    private String  nombre;
    private String  apellido;
    private String  email;
    private String  telefono;
    private Boolean activo;
    private String  rol;
    private Integer idRol;
    private LocalDateTime createdAt;
    private List<String> centros;
}
