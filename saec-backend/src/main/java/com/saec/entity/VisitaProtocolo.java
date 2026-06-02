package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "visita_protocolo")
@Getter
@Setter
@NoArgsConstructor
public class VisitaProtocolo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_visita_protocolo")
    private Integer idVisitaProtocolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_protocolo", nullable = false)
    private Protocolo protocolo;

    @Column(name = "semana", nullable = false)
    private Integer semana;

    @Column(name = "dia", nullable = false)
    private Integer dia;

    @Column(name = "nombre_visita", length = 50)
    private String nombreVisita;

    @Column(name = "descripcion", length = 150)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
