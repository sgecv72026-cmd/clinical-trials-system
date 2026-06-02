package com.saec.investigador.service;

import com.saec.dto.admin.PageResponseDto;
import com.saec.dto.investigador.*;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;


public interface ProtocoloService {

    ProtocoloStatsDto obtenerStats(UserDetails userDetails);

    PageResponseDto<ProtocoloResumenDto> listar(Integer idEstado, String search, int page, int size, UserDetails userDetails);

    ProtocoloDetalleDto crear(ProtocoloCreateRequest request, UserDetails userDetails);

    ProtocoloDetalleDto obtenerPorId(Integer id, UserDetails userDetails);

    ProtocoloDetalleDto actualizar(Integer id, ProtocoloUpdateRequest request, UserDetails userDetails);

    List<CatItemDto> listarFases();

    List<CatItemDto> listarEstados();

    List<CatItemDto> listarMedicamentosCatalogo();

    List<CatItemDto> listarUnidadesDosis();

    PageResponseDto<CatItemDto> listarMedicamentosInvestigador(String search, int page, int size, UserDetails userDetails);

    CatItemDto crearMedicamento(CrearMedicamentoRequest request);
}
