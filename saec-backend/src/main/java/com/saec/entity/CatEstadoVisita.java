package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cat_estado_visita")
@Getter @Setter @NoArgsConstructor
public class CatEstadoVisita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_visita")
    private Integer idEstadoVisita;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;
}
