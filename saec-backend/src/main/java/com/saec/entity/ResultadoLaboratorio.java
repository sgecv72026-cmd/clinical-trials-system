package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "resultado_laboratorio")
@Getter @Setter @NoArgsConstructor
public class ResultadoLaboratorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resultado")
    private Integer idResultado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_visita", nullable = false)
    private Visita visita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_prueba", nullable = false)
    private CatTipoPrueba tipoPrueba;

    @Column(name = "fecha_toma", nullable = false)
    private LocalDate fechaToma;

    @Column(name = "ruta_archivo_pdf", length = 500)
    private String rutaArchivoPdf;

    @Column(name = "registrado_por", nullable = false)
    private Integer registradoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_severidad")
    private CatSeveridad severidad;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
