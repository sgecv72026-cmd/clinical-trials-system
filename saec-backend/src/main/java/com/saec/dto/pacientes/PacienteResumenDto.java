package com.saec.dto.pacientes;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter @Builder
public class PacienteResumenDto {
    private Integer     idPaciente;
    private String      pseudonimo;
    private String      protocolo;
    private String      codigoProtocolo;
    private String      nombreMedico;
    private String      nombreCentro;
    private LocalDate   fechaIngreso;
    private Boolean     activo;
}
