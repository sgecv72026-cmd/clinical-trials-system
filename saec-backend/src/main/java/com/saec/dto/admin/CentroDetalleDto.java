package com.saec.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class CentroDetalleDto {
    private Integer idCentro;
    private String  nombre;
    private String  ciudad;
    private String  direccion;
    private String  telefono;
    private Boolean activo;
    private List<UsuarioCentroDto> usuarios;

    @Getter
    @Builder
    public static class UsuarioCentroDto {
        private Integer   idUsuario;
        private String    nombre;
        private String    apellido;
        private String    email;
        private String    rol;
        private Boolean   activo;
        private LocalDate fechaAsignacion;
    }
}
