package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "evolucion_medica")
@Getter @Setter @NoArgsConstructor
public class EvolucionMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evolucion")
    private Integer idEvolucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_visita", nullable = false)
    private Visita visita;

    @Column(name = "contenido", columnDefinition = "text")
    private String contenido;

    @Column(name = "bloqueado_por")
    private Integer bloqueadoPor;

    @Column(name = "fecha_bloqueo")
    private LocalDateTime fechaBloqueo;

    @Column(name = "modificado_por")
    private Integer modificadoPor;

    @Column(name = "ultima_modificacion")
    private LocalDateTime ultimaModificacion;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
