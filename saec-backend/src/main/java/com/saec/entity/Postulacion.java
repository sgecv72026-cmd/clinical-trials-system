package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "postulacion",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_candidato", "id_protocolo"}))
@Getter @Setter @NoArgsConstructor
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_postulacion")
    private Integer idPostulacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_candidato", nullable = false)
    private Candidato candidato;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_protocolo", nullable = false)
    private Protocolo protocolo;

    @Column(name = "id_coordinador", nullable = false)
    private Integer idCoordinador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado", nullable = false)
    private CatEstadoPostulacion estado;

    @Column(name = "elegibilidad_auto")
    private Boolean elegibilidadAuto;

    @Column(name = "observacion_general", columnDefinition = "TEXT")
    private String observacionGeneral;

    @Column(name = "fecha_postulacion", nullable = false, updatable = false)
    private LocalDateTime fechaPostulacion;

    @Column(name = "fecha_decision")
    private LocalDateTime fechaDecision;
}
