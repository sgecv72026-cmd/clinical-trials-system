package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "postulacion_modificacion")
@Getter @Setter @NoArgsConstructor
public class PostulacionModificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modificacion")
    private Integer idModificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_postulacion", nullable = false)
    private Postulacion postulacion;

    @Column(name = "id_usuario", nullable = false)
    private Integer idUsuario;

    @Column(name = "estado_anterior")
    private Integer estadoAnterior;

    @Column(name = "estado_nuevo", nullable = false)
    private Integer estadoNuevo;

    @Column(name = "motivo", columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "es_override")
    private Boolean esOverride;

    @Column(name = "fecha_modificacion", nullable = false, updatable = false)
    private LocalDateTime fechaModificacion;
}
