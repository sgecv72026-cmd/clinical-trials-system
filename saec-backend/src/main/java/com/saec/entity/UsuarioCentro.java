package com.saec.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "usuario_centro")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCentro {

    @EmbeddedId
    private UsuarioCentroId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUsuario")
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idCentro")
    @JoinColumn(name = "id_centro")
    private CentroInvestigacion centro;

    @Column(name = "fecha_asignacion")
    private LocalDate fechaAsignacion;
}
