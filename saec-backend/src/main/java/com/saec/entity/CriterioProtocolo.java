package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

@Entity
@Table(name = "criterio_protocolo")
@Getter
@Setter
@NoArgsConstructor
public class CriterioProtocolo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_criterio")
    private Integer idCriterio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_protocolo", nullable = false)
    private Protocolo protocolo;

    // PostgreSQL custom enum type: inclusion | exclusion
    // @ColumnTransformer hace que Hibernate emita CAST(? AS tipo_criterio) en INSERT/UPDATE,
    // necesario porque PostgreSQL no acepta varchar implícito para tipos enum personalizados.
    @Column(name = "tipo", nullable = false, columnDefinition = "tipo_criterio")
    @ColumnTransformer(write = "CAST(? AS tipo_criterio)")
    private String tipo;

    @Column(name = "descripcion", nullable = false)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
