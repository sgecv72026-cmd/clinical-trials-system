package com.saec.service.admin;

import com.saec.dto.admin.AuditoriaDto;
import com.saec.dto.admin.PageResponseDto;
import com.saec.entity.AuditoriaAcceso;
import com.saec.repository.AuditoriaAccesoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AdminAuditoriaService {

    private final AuditoriaAccesoRepository auditoriaRepository;

    @Transactional(readOnly = true)
    public PageResponseDto<AuditoriaDto> listar(
            String accion, String tabla, Integer idUsuario, String nombreUsuario,
            LocalDate desde, LocalDate hasta,
            int page, int size
    ) {
        // Centinelas: string vacío = sin filtro; -1 = sin filtro para entero;
        // fechas siempre presentes (1900 / 9999) para evitar IS NULL en la query.
        String accionParam  = (accion  != null && !accion.isBlank())  ? accion.trim()  : "";
        String tablaParam   = (tabla   != null && !tabla.isBlank())
                              ? "%" + tabla.toLowerCase().trim() + "%" : "";
        Integer idUsParam   = (idUsuario != null)                     ? idUsuario      : -1;
        String  nombrePat   = (nombreUsuario != null && !nombreUsuario.isBlank())
                              ? "%" + nombreUsuario.toLowerCase().trim() + "%" : "";

        LocalDateTime desdeTs = desde != null ? desde.atStartOfDay()
                                              : LocalDateTime.of(1900, 1, 1, 0, 0);
        LocalDateTime hastaTs = hasta != null ? hasta.atTime(LocalTime.MAX)
                                              : LocalDateTime.of(9999, 12, 31, 23, 59, 59);

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaAcceso> resultado = auditoriaRepository.buscarConFiltros(
                accionParam, tablaParam, idUsParam, nombrePat, desdeTs, hastaTs, pageable
        );

        return PageResponseDto.from(resultado, this::toDto);
    }

    private AuditoriaDto toDto(AuditoriaAcceso a) {
        String nombreUsuario = a.getUsuario() != null
                ? a.getUsuario().getNombre() + " " + a.getUsuario().getApellido()
                : "Sistema";
        String emailUsuario = a.getUsuario() != null ? a.getUsuario().getEmail() : "";

        return AuditoriaDto.builder()
                .idAuditoria(a.getIdAuditoria())
                .idUsuario(a.getUsuario() != null ? a.getUsuario().getIdUsuario() : null)
                .nombreUsuario(nombreUsuario)
                .emailUsuario(emailUsuario)
                .accion(a.getAccion())
                .tablaAfectada(a.getTablaAfectada())
                .idRegistro(a.getIdRegistro())
                .detalle(a.getDetalle())
                .fechaHora(a.getFechaHora())
                .build();
    }

}
