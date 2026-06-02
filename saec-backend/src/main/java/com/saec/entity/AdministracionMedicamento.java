package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "administracion_medicamento")
@Getter @Setter @NoArgsConstructor
public class AdministracionMedicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_admin")
    private Integer idAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_visita", nullable = false)
    private Visita visita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_med_protocolo", nullable = false)
    private MedicamentoProtocolo medProtocolo;

    @Column(name = "numero_lote", nullable = false, length = 100)
    private String numeroLote;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "observacion", columnDefinition = "text")
    private String observacion;

    @Column(name = "administrado_por", nullable = false)
    private Integer administradoPor;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
