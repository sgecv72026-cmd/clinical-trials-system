package com.saec.dto.investigador;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CriterioDto {
    private Integer idCriterio;
    private String  tipo;
    private String  descripcion;
}
