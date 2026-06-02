package com.saec.dto.investigador;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ProtocoloDetalleDto {
    private Integer          idProtocolo;
    private String           codigo;
    private String           titulo;
    private String           objetivos;
    private Integer          idFase;
    private String           fase;
    private Integer          idEstadoProtocolo;
    private String           estado;
    private LocalDate        fechaInicio;
    private LocalDate        fechaFinEstimada;
    private Integer          metaPacientes;
    private LocalDateTime    createdAt;
    private List<CriterioDto>  criterios;
    private List<VisitaDto>    visitas;
}
