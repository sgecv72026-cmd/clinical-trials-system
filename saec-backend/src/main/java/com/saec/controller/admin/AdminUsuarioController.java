package com.saec.controller.admin;

import com.saec.dto.admin.CrearUsuarioRequest;
import com.saec.dto.admin.PageResponseDto;
import com.saec.dto.admin.ToggleActivoRequest;
import com.saec.dto.admin.UsuarioAdminDto;
import com.saec.service.admin.AdminUsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminUsuarioController {

    private final AdminUsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<PageResponseDto<UsuarioAdminDto>> listar(
            @RequestParam(required = false)              String  search,
            @RequestParam(required = false)              Integer idRol,
            @RequestParam(required = false)              Boolean activo,
            @RequestParam(defaultValue = "0")            int     page,
            @RequestParam(defaultValue = "10")           int     size
    ) {
        return ResponseEntity.ok(usuarioService.listar(search, idRol, activo, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioAdminDto> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioAdminDto> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearUsuario(request));
    }

    @PutMapping("/{id}/activo")
    public ResponseEntity<Void> toggleActivo(
            @PathVariable Integer id,
            @Valid @RequestBody ToggleActivoRequest request
    ) {
        usuarioService.toggleActivo(id, request);
        return ResponseEntity.noContent().build();
    }
}
