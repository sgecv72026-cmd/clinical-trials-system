package com.saec.investigador.controller;

import com.saec.dto.admin.PageResponseDto;
import com.saec.dto.investigador.CatItemDto;
import com.saec.investigador.service.ProtocoloService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/investigador/medicamentos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INVESTIGADOR_PRINCIPAL')")
public class MedicamentoInvestigadorController {

    private final ProtocoloService protocoloService;

    @GetMapping
    public ResponseEntity<PageResponseDto<CatItemDto>> getMedicamentos(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                protocoloService.listarMedicamentosInvestigador(search, page, size, userDetails));
    }
}
