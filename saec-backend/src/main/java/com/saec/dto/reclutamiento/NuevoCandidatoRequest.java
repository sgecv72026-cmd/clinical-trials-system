package com.saec.dto.reclutamiento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class NuevoCandidatoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, message = "El nombre debe tener al menos 2 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, message = "El apellido debe tener al menos 2 caracteres")
    private String apellido;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @NotNull(message = "El género es obligatorio")
    private Integer idGenero;

    @Pattern(regexp = "^[0-9]{7,10}$",
             message = "El contacto debe contener entre 7 y 10 dígitos numéricos")
    private String contacto;

    /** Opcional: si no viene, se deriva del centro asignado al coordinador autenticado. */
    private Integer idCentro;

    @NotNull(message = "El protocolo es obligatorio")
    private Integer idProtocolo;

    private String observacion;
}
