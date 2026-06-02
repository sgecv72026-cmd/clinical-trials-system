package com.saec.dto.reportes;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter @Builder
public class ResumenMedicoDto {

    /* ── KPIs ────────────────────────────────────────────────────── */
    private Integer totalPacientes;
    private Integer pacientesActivos;
    private Integer visitasEstaSemana;
    private Integer visitasPendientes;
    private Integer visitasVencidasCount;

    /* ── Visitas por estado ─────────────────────────────────────── */
    private List<EstadoItem>  visitasPorEstado;

    /* ── Próximas visitas (programadas) ─────────────────────────── */
    private List<VisitaItem>  proximasVisitas;

    /* ── Visitas vencidas (programadas y ya pasadas) ────────────── */
    private List<VisitaItem>  visitasVencidas;

    /* ── Adherencia al tratamiento ──────────────────────────────── */
    private List<AdherenciaItem> adherenciaPacientes;

    /* ════ Inner classes ════════════════════════════════════════════ */

    @Getter @Builder
    public static class EstadoItem {
        private String estado;
        private Long   total;
    }

    @Getter @Builder
    public static class VisitaItem {
        private String    pseudonimo;
        private String    nombreVisita;
        private LocalDate fechaProgramada;
        private String    estado;
        private Integer   semana;
    }

    @Getter @Builder
    public static class AdherenciaItem {
        private String  pseudonimo;
        private Integer planificadas;
        private Integer administradas;
        private Integer porcentaje;
    }
}
