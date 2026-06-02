package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cat_severidad")
@Getter @NoArgsConstructor
public class CatSeveridad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_severidad")
    private Integer idSeveridad;

    @Column(name = "nivel", nullable = false, length = 50)
    private String nivel;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
