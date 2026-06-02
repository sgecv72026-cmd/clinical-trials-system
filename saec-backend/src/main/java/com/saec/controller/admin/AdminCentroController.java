package com.saec.controller.admin;

import com.saec.dto.admin.AsignarUsuarioCentroRequest;
import com.saec.dto.admin.CentroDetalleDto;
import com.saec.dto.admin.CentroResumenDto;
import com.saec.dto.admin.CrearCentroRequest;
import com.saec.service.admin.AdminCentroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/centros")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminCentroController {

    private final AdminCentroService centroService;

    @GetMapping
    public ResponseEntity<List<CentroResumenDto>> listar() {
        return ResponseEntity.ok(centroService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentroDetalleDto> detalle(@PathVariable Integer id) {
        return ResponseEntity.ok(centroService.obtenerDetalle(id));
    }

    @PostMapping
    public ResponseEntity<CentroResumenDto> crear(@Valid @RequestBody CrearCentroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(centroService.crearCentro(request));
    }

    @PostMapping("/{id}/usuarios")
    public ResponseEntity<Void> asignarUsuario(
            @PathVariable Integer id,
            @Valid @RequestBody AsignarUsuarioCentroRequest request
    ) {
        centroService.asignarUsuario(id, request);
        return ResponseEntity.noContent().build();
    }
}
