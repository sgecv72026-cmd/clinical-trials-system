package com.saec.dto.investigador;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;

/**
 * Campos del protocolo que SÍ pueden editarse después de la creación.
 * Los campos estructurales (código, fase, criterios, visitas) quedan excluidos
 * deliberadamente para preservar la integridad de los datos históricos.
 */
@Getter
public class ProtocoloUpdateRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    private String objetivos;

    @NotNull(message = "El estado del protocolo es obligatorio")
    private Integer idEstadoProtocolo;

    private LocalDate fechaFinEstimada;

    @Min(value = 1, message = "La meta de pacientes debe ser al menos 1")
    private Integer metaPacientes;
}
