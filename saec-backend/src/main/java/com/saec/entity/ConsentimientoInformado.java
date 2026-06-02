package com.saec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consentimiento_informado")
@Getter @Setter @NoArgsConstructor
public class ConsentimientoInformado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consentimiento")
    private Integer idConsentimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(name = "id_medico", nullable = false)
    private Integer idMedico;

    @Column(name = "fecha_firma", nullable = false)
    private LocalDate fechaFirma;

    @Column(name = "version_documento", nullable = false, length = 20)
    private String versionDocumento;

    @Column(name = "ruta_archivo_pdf", length = 500)
    private String rutaArchivoPdf;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
