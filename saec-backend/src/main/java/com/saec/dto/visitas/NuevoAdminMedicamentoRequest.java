package com.saec.dto.visitas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter @NoArgsConstructor
public class NuevoAdminMedicamentoRequest {
    @NotNull(message = "El medicamento del protocolo es requerido")
    private Integer idMedProtocolo;

    @NotBlank(message = "El número de lote es requerido")
    private String numeroLote;

    @NotNull(message = "La fecha y hora son requeridas")
    private LocalDateTime fechaHora;

    private String observacion;
}
