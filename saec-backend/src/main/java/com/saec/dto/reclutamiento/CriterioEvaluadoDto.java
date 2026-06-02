package com.saec.dto.reclutamiento;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class CriterioEvaluadoDto {
    private Integer idCriterio;
    private String tipo;
    private String descripcion;
    private Boolean cumple;
    private String observacion;
}
