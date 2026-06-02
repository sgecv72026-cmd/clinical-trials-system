package com.saec.dto.investigador;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class MedicamentoProtocoloDto {
    private Integer    idMedProtocolo;
    private String     nombreMedicamento;
    private BigDecimal dosis;
    private String     unidadDosis;
    private String     frecuencia;
}
