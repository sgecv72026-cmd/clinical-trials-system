package com.saec.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CrearCentroRequest {

    @NotBlank(message = "El nombre del centro es obligatorio")
    private String nombre;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    private String direccion;

    private String telefono;
}
