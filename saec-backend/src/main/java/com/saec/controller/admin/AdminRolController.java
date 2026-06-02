package com.saec.controller.admin;

import com.saec.dto.admin.RolDto;
import com.saec.service.admin.AdminRolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminRolController {

    private final AdminRolService rolService;

    @GetMapping
    public ResponseEntity<List<RolDto>> listar() {
        return ResponseEntity.ok(rolService.listar());
    }
}
