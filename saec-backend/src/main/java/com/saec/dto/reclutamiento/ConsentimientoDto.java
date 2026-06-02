package com.saec.dto.reclutamiento;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter @Builder
public class ConsentimientoDto {
    private Integer idConsentimiento;
    private LocalDate fechaFirma;
    private String versionDocumento;
    private String rutaArchivoPdf;
    private String observaciones;
    private Boolean activo;
}
