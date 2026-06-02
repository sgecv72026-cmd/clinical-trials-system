package com.saec.dto.visitas;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Builder
public class AdminMedicamentoDto {
    private Integer idAdmin;
    private String medicamento;
    private Integer idMedProtocolo;
    private BigDecimal dosis;
    private String unidadDosis;
    private String frecuencia;
    private String numeroLote;
    private LocalDateTime fechaHora;
    private String observacion;
    private String administradoPorNombre;
}
