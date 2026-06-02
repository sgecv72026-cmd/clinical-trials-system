package com.saec.pacientes.controller;

import com.saec.dto.pacientes.MedicacionHabitualDto;
import com.saec.dto.pacientes.MedicacionHabitualRequest;
import com.saec.dto.pacientes.PacienteDetalleDto;
import com.saec.dto.pacientes.PacienteResumenDto;
import com.saec.dto.reclutamiento.AntecedenteDto;
import com.saec.dto.reclutamiento.AntecedenteRequest;
import com.saec.pacientes.service.PacientesServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pacientes")
@RequiredArgsConstructor
public class PacientesController {

    private final PacientesServiceImpl service;

    /* ── Lista ──────────────────────────────────────────────────── */

    @GetMapping
    public ResponseEntity<List<PacienteResumenDto>> listar(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarPacientes(userDetails));
    }

    /* ── Detalle ────────────────────────────────────────────────── */

    @GetMapping("/{id}")
    public ResponseEntity<PacienteDetalleDto> detalle(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.obtenerDetalle(id, userDetails));
    }

    /* ── Antecedentes (médico) ──────────────────────────────────── */

    @PostMapping("/{id}/antecedentes")
    public ResponseEntity<AntecedenteDto> agregarAntecedente(
            @PathVariable Integer id,
            @Valid @RequestBody AntecedenteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.agregarAntecedente(id, request, userDetails));
    }

    @PutMapping("/antecedentes/{antId}/desactivar")
    public ResponseEntity<Void> desactivarAntecedente(
            @PathVariable Integer antId,
            @AuthenticationPrincipal UserDetails userDetails) {
        service.desactivarAntecedente(antId, userDetails);
        return ResponseEntity.noContent().build();
    }

    /* ── Medicación habitual (médico) ──────────────────────────── */

    @PostMapping("/{id}/medicacion")
    public ResponseEntity<MedicacionHabitualDto> agregarMedicacion(
            @PathVariable Integer id,
            @Valid @RequestBody MedicacionHabitualRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.agregarMedicacion(id, request, userDetails));
    }

    @PutMapping("/medicacion/{medId}/desactivar")
    public ResponseEntity<Void> desactivarMedicacion(
            @PathVariable Integer medId,
            @AuthenticationPrincipal UserDetails userDetails) {
        service.desactivarMedicacion(medId, userDetails);
        return ResponseEntity.noContent().build();
    }
}
