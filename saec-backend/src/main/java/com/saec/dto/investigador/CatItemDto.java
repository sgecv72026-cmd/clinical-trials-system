package com.saec.dto.investigador;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CatItemDto {
    private Integer id;
    private String  nombre;
    private String  descripcion;
}
