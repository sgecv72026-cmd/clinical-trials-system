package com.saec.investigador.controller;

import com.saec.dto.investigador.CatItemDto;
import com.saec.dto.investigador.CrearMedicamentoRequest;
import com.saec.investigador.service.ProtocoloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/investigador/catalogos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INVESTIGADOR_PRINCIPAL')")
public class CatalogoInvestigadorController {

    private final ProtocoloService protocoloService;

    @GetMapping("/fases")
    public ResponseEntity<List<CatItemDto>> getFases() {
        return ResponseEntity.ok(protocoloService.listarFases());
    }

    @GetMapping("/estados")
    public ResponseEntity<List<CatItemDto>> getEstados() {
        return ResponseEntity.ok(protocoloService.listarEstados());
    }

    @GetMapping("/medicamentos")
    public ResponseEntity<List<CatItemDto>> getMedicamentos() {
        return ResponseEntity.ok(protocoloService.listarMedicamentosCatalogo());
    }

    @GetMapping("/unidades-dosis")
    public ResponseEntity<List<CatItemDto>> getUnidadesDosis() {
        return ResponseEntity.ok(protocoloService.listarUnidadesDosis());
    }

    /** Crea un nuevo medicamento en el catálogo desde el formulario de protocolo. */
    @PostMapping("/medicamentos")
    public ResponseEntity<CatItemDto> crearMedicamento(
            @Valid @RequestBody CrearMedicamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(protocoloService.crearMedicamento(request));
    }
}
