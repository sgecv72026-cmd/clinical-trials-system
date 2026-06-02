package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidato_criterio",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_postulacion", "id_criterio"}))
@Getter @Setter @NoArgsConstructor
public class CandidatoCriterio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_postulacion", nullable = false)
    private Postulacion postulacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_criterio", nullable = false)
    private CriterioProtocolo criterio;

    @Column(name = "cumple", nullable = false)
    private Boolean cumple;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "evaluado_por", nullable = false)
    private Integer evaluadoPor;

    @Column(name = "fecha_evaluacion", nullable = false, updatable = false)
    private LocalDateTime fechaEvaluacion;
}
