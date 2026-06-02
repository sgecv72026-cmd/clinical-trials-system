package com.saec.reclutamiento.controller;

import com.saec.dto.investigador.CatItemDto;
import com.saec.dto.reclutamiento.*;
import com.saec.reclutamiento.service.ReclutamientoServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reclutamiento")
@RequiredArgsConstructor
public class ReclutamientoController {

    private final ReclutamientoServiceImpl service;

    /* ─── Catálogos ─────────────────────────────────────────────── */

    @GetMapping("/catalogos/generos")
    public ResponseEntity<List<CatItemDto>> generos() {
        return ResponseEntity.ok(service.listarGeneros());
    }

    @GetMapping("/catalogos/centros")
    public ResponseEntity<List<CatItemDto>> centros() {
        return ResponseEntity.ok(service.listarCentros());
    }

    @GetMapping("/catalogos/protocolos-activos")
    public ResponseEntity<List<ProtocoloActivoDto>> protocolosActivos() {
        return ResponseEntity.ok(service.listarProtocolosActivos());
    }

    @GetMapping("/catalogos/protocolos/{idProtocolo}/criterios")
    public ResponseEntity<List<CriterioEvaluadoDto>> criteriosProtocolo(
            @PathVariable Integer idProtocolo) {
        return ResponseEntity.ok(service.listarCriteriosProtocolo(idProtocolo));
    }

    /* ─── Candidatos (Coordinador) ──────────────────────────────── */

    @GetMapping("/candidatos")
    public ResponseEntity<List<CandidatoResumenDto>> listarCandidatos(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarMisCandidatos(userDetails));
    }

    @PostMapping("/candidatos")
    public ResponseEntity<CandidatoResumenDto> crearCandidato(
            @Valid @RequestBody NuevoCandidatoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crearCandidato(request, userDetails));
    }

    @GetMapping("/candidatos/{id}")
    public ResponseEntity<CandidatoDetalleDto> detalleCandidato(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.obtenerDetalle(id, userDetails));
    }

    @PatchMapping("/candidatos/{id}")
    public ResponseEntity<Void> actualizarCandidato(
            @PathVariable Integer id,
            @Valid @RequestBody ActualizarCandidatoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        service.actualizarCandidato(id, request, userDetails);
        return ResponseEntity.noContent().build();
    }

    /* ─── Postulaciones (Investigador) ──────────────────────────── */

    @GetMapping("/postulaciones/pendientes")
    public ResponseEntity<List<CandidatoResumenDto>> pendientesInvestigador(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarPendientesInvestigador(userDetails));
    }

    @GetMapping("/postulaciones/historial")
    public ResponseEntity<List<CandidatoResumenDto>> historialInvestigador(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarHistorialInvestigador(userDetails));
    }

    @PutMapping("/postulaciones/{id}/aprobar")
    public ResponseEntity<CandidatoResumenDto> aprobar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.aprobarPostulacion(id, userDetails));
    }

    @PutMapping("/postulaciones/{id}/rechazar")
    public ResponseEntity<CandidatoResumenDto> rechazar(
            @PathVariable Integer id,
            @RequestBody DecisionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.rechazarPostulacion(id, request, userDetails));
    }

    /* ─── Médico ────────────────────────────────────────────────── */

    @GetMapping("/medico/pendientes")
    public ResponseEntity<List<CandidatoResumenDto>> pendientesMedico(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarPendientesMedico(userDetails));
    }

    @PostMapping("/candidatos/{id}/iniciar-evaluacion")
    public ResponseEntity<Void> iniciarEvaluacion(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        service.iniciarEvaluacion(id, userDetails);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/candidatos/{id}/antecedentes")
    public ResponseEntity<AntecedenteDto> agregarAntecedente(
            @PathVariable Integer id,
            @Valid @RequestBody AntecedenteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.agregarAntecedente(id, request, userDetails));
    }

    @PutMapping("/antecedentes/{antId}/desactivar")
    public ResponseEntity<Void> desactivarAntecedente(
            @PathVariable Integer antId,
            @AuthenticationPrincipal UserDetails userDetails) {
        service.desactivarAntecedente(antId, userDetails);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/postulaciones/{id}/criterios")
    public ResponseEntity<Void> guardarCriterios(
            @PathVariable Integer id,
            @Valid @RequestBody List<CriterioEvaluacionRequest> criterios,
            @AuthenticationPrincipal UserDetails userDetails) {
        service.guardarCriterios(id, criterios, userDetails);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/candidatos/{id}/consentimiento/pdf")
    public ResponseEntity<Map<String, String>> subirPdfConsentimiento(
            @PathVariable Integer id,
            @RequestParam("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UserDetails userDetails) {
        String ruta = service.subirPdfConsentimiento(id, archivo, userDetails);
        return ResponseEntity.ok(Map.of("rutaArchivoPdf", ruta));
    }

    @PostMapping("/candidatos/{id}/consentimiento")
    public ResponseEntity<ConsentimientoDto> registrarConsentimiento(
            @PathVariable Integer id,
            @Valid @RequestBody ConsentimientoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrarConsentimiento(id, request, userDetails));
    }

    @PostMapping("/candidatos/{id}/inscribir")
    public ResponseEntity<CandidatoDetalleDto> inscribir(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.inscribirPaciente(id, userDetails));
    }

    @PutMapping("/postulaciones/{id}/no-apto")
    public ResponseEntity<CandidatoResumenDto> noApto(
            @PathVariable Integer id,
            @RequestBody DecisionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.marcarNoApto(id, request, userDetails));
    }

    @GetMapping("/consentimientos/pdf")
    public ResponseEntity<Resource> verPdfConsentimiento(@RequestParam String ruta) {
        Resource resource = service.cargarPdfConsentimiento(ruta);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
