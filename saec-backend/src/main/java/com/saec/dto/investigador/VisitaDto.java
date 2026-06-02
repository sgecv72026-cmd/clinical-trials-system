package com.saec.dto.investigador;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class VisitaDto {
    private Integer                    idVisitaProtocolo;
    private Integer                    semana;
    private Integer                    dia;
    private String                     nombreVisita;
    private String                     descripcion;
    private List<MedicamentoProtocoloDto> medicamentos;
}
