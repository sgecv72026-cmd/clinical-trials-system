package com.saec.dto.visitas;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class EvolucionMedicaDto {
    private Integer idEvolucion;
    private String contenido;
    private Integer bloqueadoPor;
    private String bloqueadoPorNombre;
    private LocalDateTime fechaBloqueo;
    private Integer modificadoPor;
    private String modificadoPorNombre;
    private LocalDateTime ultimaModificacion;
    private boolean bloqueadaPorMi;
    private boolean bloqueadaPorOtro;
}
