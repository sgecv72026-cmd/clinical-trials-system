package com.saec.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "centro_investigacion")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CentroInvestigacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_centro")
    private Integer idCentro;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "ciudad", nullable = false, length = 100)
    private String ciudad;

    @Column(name = "direccion", length = 255)
    private String direccion;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
