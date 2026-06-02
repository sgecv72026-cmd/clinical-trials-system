package com.saec.controller.admin;

import com.saec.dto.admin.AuditoriaDto;
import com.saec.dto.admin.PageResponseDto;
import com.saec.service.admin.AdminAuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/admin/auditoria")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminAuditoriaController {

    private final AdminAuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<PageResponseDto<AuditoriaDto>> listar(
            @RequestParam(required = false) String     accion,
            @RequestParam(required = false) String     tabla,
            @RequestParam(required = false) Integer    idUsuario,
            @RequestParam(required = false) String     nombreUsuario,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(auditoriaService.listar(accion, tabla, idUsuario, nombreUsuario, desde, hasta, page, size));
    }
}
