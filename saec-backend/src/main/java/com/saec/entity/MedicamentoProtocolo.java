package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "medicamento_protocolo")
@Getter
@Setter
@NoArgsConstructor
public class MedicamentoProtocolo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_med_protocolo")
    private Integer idMedProtocolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_protocolo", nullable = false)
    private Protocolo protocolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_visita_protocolo", nullable = false)
    private VisitaProtocolo visitaProtocolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medicamento", nullable = false)
    private CatMedicamento medicamento;

    @Column(name = "dosis", nullable = false, precision = 10, scale = 2)
    private BigDecimal dosis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_unidad_dosis", nullable = false)
    private CatUnidadDosis unidadDosis;

    @Column(name = "frecuencia", length = 100)
    private String frecuencia;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
