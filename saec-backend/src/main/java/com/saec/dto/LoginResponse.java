package com.saec.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private String tipo;
    private Integer idUsuario;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;
    private String telefono;
}
