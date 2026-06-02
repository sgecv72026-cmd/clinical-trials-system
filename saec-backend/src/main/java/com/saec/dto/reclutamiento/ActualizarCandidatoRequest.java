package com.saec.dto.reclutamiento;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class ActualizarCandidatoRequest {

    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;

    @Pattern(regexp = "^[0-9]{7,10}$",
             message = "El contacto debe contener entre 7 y 10 dígitos numéricos")
    private String contacto;

    private String observacion;
}
