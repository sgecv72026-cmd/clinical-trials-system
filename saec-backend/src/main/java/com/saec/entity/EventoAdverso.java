package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "evento_adverso")
@Getter @Setter @NoArgsConstructor
public class EventoAdverso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Integer idEvento;

    @Column(name = "id_paciente", nullable = false)
    private Integer idPaciente;

    @Column(name = "id_protocolo", nullable = false)
    private Integer idProtocolo;

    @Column(name = "id_visita")
    private Integer idVisita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_severidad", nullable = false)
    private CatSeveridad severidad;

    @Column(name = "descripcion", nullable = false, columnDefinition = "text")
    private String descripcion;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDate fechaReporte;

    @Column(name = "reportado_por", nullable = false)
    private Integer reportadoPor;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
