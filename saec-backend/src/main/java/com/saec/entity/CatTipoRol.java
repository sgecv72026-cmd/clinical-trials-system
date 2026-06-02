package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cat_tipo_rol")
@Getter
@NoArgsConstructor
public class CatTipoRol {

    @Id
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "nombre", nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
