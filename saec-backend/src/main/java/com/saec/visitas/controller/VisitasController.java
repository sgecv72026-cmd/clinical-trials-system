package com.saec.visitas.controller;

import com.saec.dto.investigador.CatItemDto;
import com.saec.dto.visitas.*;
import com.saec.dto.visitas.EventoAdversoDto;
import com.saec.dto.visitas.NuevoEventoAdversoRequest;
import com.saec.dto.visitas.NuevoTipoPruebaRequest;
import com.saec.visitas.service.VisitasServiceImpl;
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
public class VisitasController {

    private final VisitasServiceImpl service;

    /* ── Lista de visitas por paciente ──────────────────────────── */

    @GetMapping("/{idPaciente}/visitas")
    public ResponseEntity<List<VisitaResumenDto>> listar(
            @PathVariable Integer idPaciente,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarVisitas(idPaciente, userDetails));
    }

    /* ── Cambiar estado ─────────────────────────────────────────── */

    @PutMapping("/visitas/{idVisita}/estado")
    public ResponseEntity<VisitaResumenDto> cambiarEstado(
            @PathVariable Integer idVisita,
            @Valid @RequestBody CambiarEstadoVisitaRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.cambiarEstado(idVisita, req, userDetails));
    }

    /* ── Evolución médica ───────────────────────────────────────── */

    @GetMapping("/visitas/{idVisita}/evolucion")
    public ResponseEntity<EvolucionMedicaDto> obtenerEvolucion(
            @PathVariable Integer idVisita,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.obtenerEvolucion(idVisita, userDetails));
    }

    @PutMapping("/visitas/{idVisita}/evolucion/bloquear")
    public ResponseEntity<EvolucionMedicaDto> bloquear(
            @PathVariable Integer idVisita,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.bloquearEvolucion(idVisita, userDetails));
    }

    @PutMapping("/visitas/{idVisita}/evolucion/liberar")
    public ResponseEntity<EvolucionMedicaDto> liberar(
            @PathVariable Integer idVisita,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.liberarEvolucion(idVisita, userDetails));
    }

    @PutMapping("/visitas/{idVisita}/evolucion")
    public ResponseEntity<EvolucionMedicaDto> guardarEvolucion(
            @PathVariable Integer idVisita,
            @Valid @RequestBody GuardarEvolucionRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.guardarEvolucion(idVisita, req, userDetails));
    }

    /* ── Resultados de laboratorio ──────────────────────────────── */

    @GetMapping("/visitas/{idVisita}/resultados")
    public ResponseEntity<List<ResultadoLaboratorioDto>> listarResultados(
            @PathVariable Integer idVisita,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarResultados(idVisita, userDetails));
    }

    @PostMapping("/visitas/{idVisita}/resultados")
    public ResponseEntity<ResultadoLaboratorioDto> agregarResultado(
            @PathVariable Integer idVisita,
            @Valid @RequestBody NuevoResultadoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.agregarResultado(idVisita, req, userDetails));
    }

    @DeleteMapping("/visitas/resultados/{idResultado}")
    public ResponseEntity<Void> eliminarResultado(
            @PathVariable Integer idResultado,
            @AuthenticationPrincipal UserDetails userDetails) {
        service.eliminarResultado(idResultado, userDetails);
        return ResponseEntity.noContent().build();
    }

    /* ── Administración de medicamentos ────────────────────────── */

    @GetMapping("/visitas/{idVisita}/medicamentos")
    public ResponseEntity<List<AdminMedicamentoDto>> listarMedicamentos(
            @PathVariable Integer idVisita,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarMedicamentos(idVisita, userDetails));
    }

    @PostMapping("/visitas/{idVisita}/medicamentos")
    public ResponseEntity<AdminMedicamentoDto> registrarMedicamento(
            @PathVariable Integer idVisita,
            @Valid @RequestBody NuevoAdminMedicamentoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.registrarMedicamento(idVisita, req, userDetails));
    }

    /* ── Historial ──────────────────────────────────────────────── */

    @GetMapping("/visitas/{idVisita}/historial")
    public ResponseEntity<List<HistorialVisitaDto>> historial(
            @PathVariable Integer idVisita,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarHistorial(idVisita, userDetails));
    }

    /* ── Catálogos ──────────────────────────────────────────────── */

    @GetMapping("/catalogos/severidades")
    public ResponseEntity<List<CatItemDto>> severidades() {
        return ResponseEntity.ok(service.getSeveridades());
    }

    @GetMapping("/catalogos/tipos-prueba")
    public ResponseEntity<List<CatItemDto>> tiposPrueba() {
        return ResponseEntity.ok(service.getTiposPrueba());
    }

    @PostMapping("/catalogos/tipos-prueba")
    public ResponseEntity<CatItemDto> crearTipoPrueba(
            @Valid @RequestBody NuevoTipoPruebaRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crearTipoPrueba(req, userDetails));
    }

    @GetMapping("/catalogos/medicamentos-protocolo/{idProtocolo}")
    public ResponseEntity<List<AdminMedicamentoDto>> medicamentosProtocolo(
            @PathVariable Integer idProtocolo) {
        return ResponseEntity.ok(service.getMedicamentosProtocolo(idProtocolo));
    }

    @GetMapping("/catalogos/estados-visita")
    public ResponseEntity<List<CatItemDto>> estadosVisita() {
        return ResponseEntity.ok(service.getEstadosVisita());
    }

    @GetMapping("/catalogos/unidades-dosis")
    public ResponseEntity<List<CatItemDto>> unidadesDosis() {
        return ResponseEntity.ok(service.getUnidadesDosis());
    }

    /* ── Eventos adversos ──────────────────────────────────────── */

    @GetMapping("/visitas/{idVisita}/eventos-adversos")
    public ResponseEntity<List<EventoAdversoDto>> listarEventos(
            @PathVariable Integer idVisita,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarEventosAdversos(idVisita, userDetails));
    }

    @PostMapping("/visitas/{idVisita}/eventos-adversos")
    public ResponseEntity<EventoAdversoDto> registrarEvento(
            @PathVariable Integer idVisita,
            @Valid @RequestBody NuevoEventoAdversoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.registrarEventoAdverso(idVisita, req, userDetails));
    }
}
