package com.saec.dto.reclutamiento;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CriterioEvaluacionRequest {

    @NotNull
    private Integer idCriterio;

    @NotNull
    private Boolean cumple;

    private String observacion;
}
