package com.saec.dto.reportes;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter @Builder
public class ResumenComiteDto {

    /* ── KPIs ────────────────────────────────────────────────────── */
    private Integer totalPacientesActivos;
    private Integer totalEventosAdversos;
    private Integer totalConsentimientos;

    /* ── Eventos adversos (filtrados) ───────────────────────────── */
    private List<SeveridadItem> eventosPorSeveridad;
    private List<EventoItem>    eventos;           // lista completa filtrada
    private List<ProtocoloItem> eventosPorProtocolo;

    /* ── Pacientes por protocolo ─────────────────────────────────── */
    private List<ProtocoloItem> pacientesPorProtocolo;

    /* ── Progreso por centro ────────────────────────────────────── */
    private List<CentroProtocoloItem> progresoPorCentro;

    /* ── Centros disponibles (para el dropdown de filtros) ───────── */
    private List<CentroSimpleItem> centrosDisponibles;

    /* ── Análisis demográfico ───────────────────────────────────── */
    private DemograficoData demografico;

    /* ════ Inner classes ════════════════════════════════════════════ */

    @Getter @Builder
    public static class SeveridadItem {
        private String  nivel;
        private Long    total;
        private Integer orden;
    }

    @Getter @Builder
    public static class ProtocoloItem {
        private String codigo;
        private String titulo;
        private Long   total;
    }

    @Getter @Builder
    public static class EventoItem {
        private String    pseudonimo;
        private String    severidad;
        private String    protocolo;
        private LocalDate fechaReporte;
        private String    descripcion;
    }

    @Getter @Builder
    public static class CentroProtocoloItem {
        private String  centro;
        private String  codigoProtocolo;
        private String  tituloProtocolo;
        private Integer activos;
        private Integer meta;
        private Integer porcentaje;
    }

    @Getter @Builder
    public static class CentroSimpleItem {
        private Integer id;
        private String  nombre;
    }

    @Getter @Builder
    public static class DemograficoData {
        private Integer             totalPacientes;
        private List<RangoEdadItem> distribucionEdad;
        private List<GeneroItem>    distribucionGenero;
        private List<ComorbididadItem> topComorbilidades;
    }

    @Getter @Builder
    public static class RangoEdadItem {
        private String  rango;
        private Long    total;
        private Integer porcentaje;
    }

    @Getter @Builder
    public static class GeneroItem {
        private String  genero;
        private Long    total;
        private Integer porcentaje;
    }

    @Getter @Builder
    public static class ComorbididadItem {
        private String descripcion;
        private Long   total;
    }
}
