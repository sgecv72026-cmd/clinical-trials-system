package com.saec.dto.pacientes;

import com.saec.dto.reclutamiento.AntecedenteDto;
import com.saec.dto.reclutamiento.ConsentimientoDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Getter @Builder
public class PacienteDetalleDto {
    private Integer     idPaciente;
    private String      pseudonimo;
    /* Candidato / demográfico */
    private String      nombre;
    private String      apellido;
    private String      genero;
    private LocalDate   fechaNacimiento;
    private String      contacto;
    /* Inscripción */
    private Integer     idProtocolo;
    private String      protocolo;
    private String      codigoProtocolo;
    private String      nombreMedico;
    private String      nombreCentro;
    private LocalDate   fechaIngreso;
    private Boolean     activo;
    private LocalDateTime createdAt;
    /* Clínico */
    private List<AntecedenteDto>        antecedentes;
    private List<MedicacionHabitualDto> medicacionHabitual;
    private ConsentimientoDto           consentimiento;
    /* Vínculo al módulo de visitas */
    private Integer     idPostulacion;
}
