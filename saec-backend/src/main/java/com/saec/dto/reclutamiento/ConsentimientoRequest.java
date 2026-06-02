package com.saec.dto.reclutamiento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class ConsentimientoRequest {

    @NotNull(message = "La fecha de firma es obligatoria")
    private LocalDate fechaFirma;

    @NotBlank(message = "La versión del documento es obligatoria")
    private String versionDocumento;

    private String rutaArchivoPdf;
    private String observaciones;
}
