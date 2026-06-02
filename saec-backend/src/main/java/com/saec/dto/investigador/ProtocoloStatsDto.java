package com.saec.dto.investigador;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProtocoloStatsDto {
    private long total;
    private long activos;
    private long finalizados;
}
