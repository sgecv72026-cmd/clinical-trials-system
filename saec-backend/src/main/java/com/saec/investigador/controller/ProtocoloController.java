package com.saec.investigador.controller;

import com.saec.dto.admin.PageResponseDto;
import com.saec.dto.investigador.ProtocoloCreateRequest;
import com.saec.dto.investigador.ProtocoloDetalleDto;
import com.saec.dto.investigador.ProtocoloResumenDto;
import com.saec.dto.investigador.ProtocoloStatsDto;
import com.saec.dto.investigador.ProtocoloUpdateRequest;
import com.saec.investigador.service.ProtocoloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/investigador/protocolos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INVESTIGADOR_PRINCIPAL')")
public class ProtocoloController {

    private final ProtocoloService protocoloService;

    @GetMapping("/stats")
    public ResponseEntity<ProtocoloStatsDto> getStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(protocoloService.obtenerStats(userDetails));
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<ProtocoloResumenDto>> listar(
            @RequestParam(required = false)              Integer idEstado,
            @RequestParam(required = false, defaultValue = "") String  search,
            @RequestParam(defaultValue = "0")            int     page,
            @RequestParam(defaultValue = "10")           int     size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(protocoloService.listar(idEstado, search, page, size, userDetails));
    }

    @PostMapping
    public ResponseEntity<ProtocoloDetalleDto> crear(
            @Valid @RequestBody ProtocoloCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(protocoloService.crear(request, userDetails));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProtocoloDetalleDto> obtener(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(protocoloService.obtenerPorId(id, userDetails));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProtocoloDetalleDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ProtocoloUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(protocoloService.actualizar(id, request, userDetails));
    }
}
