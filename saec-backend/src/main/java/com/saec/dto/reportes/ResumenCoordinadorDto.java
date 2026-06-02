package com.saec.dto.reportes;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter @Builder
public class ResumenCoordinadorDto {

    /* ── KPIs ────────────────────────────────────────────────────── */
    private Integer totalCandidatos;
    private Integer enEspera;
    private Integer aprobados;
    private Integer rechazados;
    private Integer tasaAprobacion;

    /* ── Por protocolo ──────────────────────────────────────────── */
    private List<ProtocoloItem> porProtocolo;

    /* ── Por centro ─────────────────────────────────────────────── */
    private List<CentroItem> porCentro;

    /* ════ Inner classes ════════════════════════════════════════════ */

    @Getter @Builder
    public static class ProtocoloItem {
        private String  codigo;
        private String  titulo;
        private Long    total;
        private Long    aprobados;
        private Long    rechazados;
        private Long    enEspera;
        private Integer meta;
        private Integer porcentajeLlenado;
    }

    @Getter @Builder
    public static class CentroItem {
        private String  centro;
        private Long    total;
        private Long    aprobados;
        private Integer meta;
        private Integer porcentajeLlenado;
    }
}
