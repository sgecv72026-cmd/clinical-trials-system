package com.saec.dto.investigador;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
public class ProtocoloCreateRequest {

    @NotBlank(message = "El código del protocolo es obligatorio")
    private String codigo;

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    private String objetivos;

    @NotNull(message = "La fase clínica es obligatoria")
    private Integer idFase;

    @NotNull(message = "El estado del protocolo es obligatorio")
    private Integer idEstadoProtocolo;

    private LocalDate fechaInicio;
    private LocalDate fechaFinEstimada;

    @Min(value = 1, message = "La meta de pacientes debe ser al menos 1")
    private Integer metaPacientes;

    @Valid
    private List<CriterioRequest> criterios;

    @Valid
    private List<VisitaRequest> visitas;
}
