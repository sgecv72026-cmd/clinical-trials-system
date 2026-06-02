package com.saec.reportes.controller;

import com.saec.dto.reportes.ResumenComiteDto;
import com.saec.dto.reportes.ResumenCoordinadorDto;
import com.saec.dto.reportes.ResumenMedicoDto;
import com.saec.reportes.service.ReportesServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesServiceImpl reportesService;

    @GetMapping("/comite")
    public ResponseEntity<ResumenComiteDto> resumenComite(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) Integer idCentro) {
        return ResponseEntity.ok(
                reportesService.getResumenComite(userDetails, fechaDesde, fechaHasta, idCentro));
    }

    @GetMapping("/medico")
    public ResponseEntity<ResumenMedicoDto> resumenMedico(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reportesService.getResumenMedico(userDetails));
    }

    @GetMapping("/coordinador")
    public ResponseEntity<ResumenCoordinadorDto> resumenCoordinador(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reportesService.getResumenCoordinador(userDetails));
    }
}
