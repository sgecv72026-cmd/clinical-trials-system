package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "medicacion_habitual")
@Getter @Setter @NoArgsConstructor
public class MedicacionHabitual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medicacion")
    private Integer idMedicacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(name = "nombre_medicamento", nullable = false, length = 200)
    private String nombreMedicamento;

    @Column(name = "dosis", length = 100)
    private String dosis;

    @Column(name = "frecuencia", length = 100)
    private String frecuencia;

    @Column(name = "registrado_por", nullable = false)
    private Integer registradoPor;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
