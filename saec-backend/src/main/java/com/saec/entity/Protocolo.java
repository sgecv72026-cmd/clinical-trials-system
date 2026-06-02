package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "protocolo")
@Getter
@Setter
@NoArgsConstructor
public class Protocolo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_protocolo")
    private Integer idProtocolo;

    @Column(name = "id_investigador", nullable = false)
    private Integer idInvestigador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_fase", nullable = false)
    private CatFaseClinical fase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado_protocolo", nullable = false)
    private CatEstadoProtocolo estadoProtocolo;

    @Column(name = "codigo", nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "objetivos")
    private String objetivos;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin_estimada")
    private LocalDate fechaFinEstimada;

    @Column(name = "meta_pacientes")
    private Integer metaPacientes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
