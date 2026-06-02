package com.saec.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsDto {
    private long totalUsuarios;
    private long usuariosActivos;
    private long totalProtocolos;
    private long pacientesActivos;
    private long postulacionesPendientes;
    private long eventosAdversos;
    private long centrosOperativos;
    private long totalCentros;
}
