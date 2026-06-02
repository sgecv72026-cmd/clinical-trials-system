package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cat_genero")
@Getter @Setter @NoArgsConstructor
public class CatGenero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_genero")
    private Integer idGenero;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;
}
