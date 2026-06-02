package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_visita")
@Getter @NoArgsConstructor
public class HistorialVisita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Integer idHistorial;

    @Column(name = "id_visita", nullable = false)
    private Integer idVisita;

    @Column(name = "estado_anterior")
    private Integer estadoAnterior;

    @Column(name = "estado_nuevo", nullable = false)
    private Integer estadoNuevo;

    @Column(name = "fecha_prog_anterior")
    private LocalDate fechaProgAnterior;

    @Column(name = "fecha_prog_nueva")
    private LocalDate fechaProgNueva;

    @Column(name = "modificado_por", nullable = false)
    private Integer modificadoPor;

    @Column(name = "motivo", columnDefinition = "text")
    private String motivo;

    @Column(name = "fecha_cambio", nullable = false)
    private LocalDateTime fechaCambio;
}
