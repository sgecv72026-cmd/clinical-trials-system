package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "visita")
@Getter @Setter @NoArgsConstructor
public class Visita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_visita")
    private Integer idVisita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_visita_protocolo", nullable = false)
    private VisitaProtocolo visitaProtocolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado_visita", nullable = false)
    private CatEstadoVisita estadoVisita;

    @Column(name = "atendida_por")
    private Integer atendidaPor;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;

    @Column(name = "fecha_realizada")
    private LocalDate fechaRealizada;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
