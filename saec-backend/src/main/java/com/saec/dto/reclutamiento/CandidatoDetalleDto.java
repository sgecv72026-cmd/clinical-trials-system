package com.saec.dto.reclutamiento;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Builder
public class CandidatoDetalleDto {
    private Integer idCandidato;
    private String nombre;
    private String apellido;
    private String genero;
    private LocalDate fechaNacimiento;
    private String contacto;
    private String centro;
    private LocalDateTime createdAt;

    /* Postulacion */
    private Integer idPostulacion;
    private String protocolo;          // título del protocolo
    private String codigoProtocolo;    // código del protocolo (ej. SGEC-2025-KHP)
    private String observacionGeneral; // observación del coordinador
    private String estadoPostulacion;
    private Integer idEstado;
    private Boolean elegibilidadAuto;
    private LocalDateTime fechaPostulacion;
    private LocalDateTime fechaDecision;

    /* Criterios del protocolo (para que el médico pueda evaluarlos) */
    private List<CriterioEvaluadoDto> criteriosProtocolo;

    /* Historial de modificaciones */
    private List<ModificacionDto> historial;

    /* Antecedentes (solo médico) */
    private List<AntecedenteDto> antecedentes;

    /* Consentimiento (solo médico) */
    private ConsentimientoDto consentimiento;

    /* Criterios evaluados */
    private List<CriterioEvaluadoDto> criteriosEvaluados;

    /* Datos del paciente si ya fue inscrito */
    private Integer idPaciente;
    private Boolean pacienteActivo;
}
