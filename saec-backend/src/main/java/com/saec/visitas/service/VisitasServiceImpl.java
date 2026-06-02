package com.saec.visitas.service;

import com.saec.dto.investigador.CatItemDto;
import com.saec.dto.visitas.*;
import com.saec.dto.visitas.EventoAdversoDto;
import com.saec.dto.visitas.NuevoEventoAdversoRequest;
import com.saec.dto.visitas.NuevoTipoPruebaRequest;
import com.saec.entity.*;
import com.saec.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitasServiceImpl {

    private static final int LOCK_TIMEOUT_MINUTES = 5;

    private final JdbcTemplate                      jdbcTemplate;
    private final UsuarioRepository                 usuarioRepository;
    private final PacienteRepository                pacienteRepository;
    private final VisitaRepository                  visitaRepository;
    private final CatEstadoVisitaRepository         estadoVisitaRepo;
    private final EvolucionMedicaRepository         evolucionRepo;
    private final ResultadoLaboratorioRepository    resultadoRepo;
    private final AdministracionMedicamentoRepository adminMedRepo;
    private final HistorialVisitaRepository         historialRepo;
    private final CatSeveridadRepository            severidadRepo;
    private final CatTipoPruebaRepository           tipoPruebaRepo;
    private final MedicamentoProtocoloRepository    medProtocoloRepo;
    private final CatUnidadDosisRepository          unidadDosisRepo;
    private final EventoAdversoRepository           eventoAdversoRepo;

    /* ════════════════════════════════════════════════════════════════
       LISTA DE VISITAS
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<VisitaResumenDto> listarVisitas(Integer idPaciente, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        exigirAccesoVisitas(usuario);
        validarAccesoPaciente(idPaciente, usuario);

        return visitaRepository
                .findByPacienteIdPacienteAndActivoTrueOrderByFechaProgramadaAsc(idPaciente)
                .stream().map(this::toResumen).toList();
    }

    /* ════════════════════════════════════════════════════════════════
       CAMBIAR ESTADO
    ════════════════════════════════════════════════════════════════ */

    @Transactional
    public VisitaResumenDto cambiarEstado(Integer idVisita,
                                          CambiarEstadoVisitaRequest req,
                                          UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);

        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), medico);

        CatEstadoVisita nuevoEstado = estadoVisitaRepo.findById(req.getIdEstadoVisita())
                .orElseThrow(() -> new EntityNotFoundException("Estado no encontrado: " + req.getIdEstadoVisita()));

        visita.setEstadoVisita(nuevoEstado);
        if ("Realizada".equalsIgnoreCase(nuevoEstado.getNombre())) {
            visita.setFechaRealizada(java.time.LocalDate.now());
            visita.setAtendidaPor(medico.getIdUsuario());
        }
        visitaRepository.save(visita);
        log.info("Visita {} → estado '{}' por médico {}", idVisita, nuevoEstado.getNombre(), medico.getIdUsuario());
        return toResumen(visita);
    }

    /* ════════════════════════════════════════════════════════════════
       EVOLUCIÓN MÉDICA
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public EvolucionMedicaDto obtenerEvolucion(Integer idVisita, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        exigirAccesoVisitas(usuario);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), usuario);

        return evolucionRepo.findByVisitaIdVisitaAndActivoTrue(idVisita)
                .map(e -> toEvolucionDto(e, usuario.getIdUsuario()))
                .orElse(EvolucionMedicaDto.builder()
                        .idEvolucion(null)
                        .contenido(null)
                        .bloqueadaPorMi(false)
                        .bloqueadaPorOtro(false)
                        .build());
    }

    @Transactional
    public EvolucionMedicaDto bloquearEvolucion(Integer idVisita, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), medico);

        EvolucionMedica evolucion = evolucionRepo.findByVisitaIdVisitaAndActivoTrue(idVisita)
                .orElseGet(() -> crearEvolucion(visita));

        LocalDateTime ahora = LocalDateTime.now();
        boolean expirado = evolucion.getFechaBloqueo() != null &&
                evolucion.getFechaBloqueo().isBefore(ahora.minusMinutes(LOCK_TIMEOUT_MINUTES));

        if (evolucion.getBloqueadoPor() != null
                && !evolucion.getBloqueadoPor().equals(medico.getIdUsuario())
                && !expirado) {
            String bloqueador = usuarioRepository.findById(evolucion.getBloqueadoPor())
                    .map(u -> u.getNombre() + " " + u.getApellido()).orElse("otro usuario");
            throw new IllegalStateException(
                    "La evolución está siendo editada por " + bloqueador);
        }

        evolucion.setBloqueadoPor(medico.getIdUsuario());
        evolucion.setFechaBloqueo(ahora);
        evolucionRepo.save(evolucion);

        return toEvolucionDto(evolucion, medico.getIdUsuario());
    }

    @Transactional
    public EvolucionMedicaDto liberarEvolucion(Integer idVisita, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);

        EvolucionMedica evolucion = evolucionRepo.findByVisitaIdVisitaAndActivoTrue(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Evolución no encontrada para visita: " + idVisita));

        if (evolucion.getBloqueadoPor() != null
                && !evolucion.getBloqueadoPor().equals(medico.getIdUsuario())) {
            throw new AccessDeniedException("No puedes liberar un bloqueo que no es tuyo");
        }
        evolucion.setBloqueadoPor(null);
        evolucion.setFechaBloqueo(null);
        evolucionRepo.save(evolucion);
        return toEvolucionDto(evolucion, medico.getIdUsuario());
    }

    @Transactional
    public EvolucionMedicaDto guardarEvolucion(Integer idVisita,
                                               GuardarEvolucionRequest req,
                                               UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), medico);

        EvolucionMedica evolucion = evolucionRepo.findByVisitaIdVisitaAndActivoTrue(idVisita)
                .orElseGet(() -> crearEvolucion(visita));

        if (evolucion.getBloqueadoPor() == null
                || !evolucion.getBloqueadoPor().equals(medico.getIdUsuario())) {
            throw new AccessDeniedException(
                    "Debes bloquear la evolución antes de guardar cambios");
        }

        evolucion.setContenido(req.getContenido().trim());
        evolucion.setModificadoPor(medico.getIdUsuario());
        evolucion.setUltimaModificacion(LocalDateTime.now());
        evolucion.setBloqueadoPor(null);
        evolucion.setFechaBloqueo(null);
        evolucionRepo.save(evolucion);

        log.info("Evolución visita {} guardada por médico {}", idVisita, medico.getIdUsuario());
        return toEvolucionDto(evolucion, medico.getIdUsuario());
    }

    /* ════════════════════════════════════════════════════════════════
       RESULTADOS DE LABORATORIO
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<ResultadoLaboratorioDto> listarResultados(Integer idVisita, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        exigirAccesoVisitas(usuario);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), usuario);

        return resultadoRepo.findByVisitaIdVisitaAndActivoTrueOrderByFechaTomaDesc(idVisita)
                .stream().map(this::toResultadoDto).toList();
    }

    @Transactional
    public ResultadoLaboratorioDto agregarResultado(Integer idVisita,
                                                    NuevoResultadoRequest req,
                                                    UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), medico);

        CatTipoPrueba tipo = tipoPruebaRepo.findById(req.getIdTipoPrueba())
                .orElseThrow(() -> new EntityNotFoundException("Tipo de prueba no encontrado: " + req.getIdTipoPrueba()));

        ResultadoLaboratorio r = new ResultadoLaboratorio();
        r.setVisita(visita);
        r.setTipoPrueba(tipo);
        r.setFechaToma(req.getFechaToma());
        r.setRegistradoPor(medico.getIdUsuario());
        r.setActivo(true);
        r.setCreatedAt(LocalDateTime.now());

        if (req.getIdSeveridad() != null) {
            severidadRepo.findById(req.getIdSeveridad()).ifPresent(r::setSeveridad);
        }
        resultadoRepo.save(r);

        log.info("Resultado lab agregado a visita {} por médico {}", idVisita, medico.getIdUsuario());
        return toResultadoDto(r);
    }

    @Transactional
    public void eliminarResultado(Integer idResultado, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);
        ResultadoLaboratorio r = resultadoRepo.findById(idResultado)
                .orElseThrow(() -> new EntityNotFoundException("Resultado no encontrado: " + idResultado));
        resultadoRepo.delete(r);
        log.info("Resultado lab {} eliminado por médico {}", idResultado, medico.getIdUsuario());
    }

    /* ════════════════════════════════════════════════════════════════
       ADMINISTRACIÓN DE MEDICAMENTOS
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<AdminMedicamentoDto> listarMedicamentos(Integer idVisita, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        exigirAccesoVisitas(usuario);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), usuario);

        return adminMedRepo.findByVisitaIdVisitaAndActivoTrueOrderByFechaHoraDesc(idVisita)
                .stream().map(this::toAdminDto).toList();
    }

    @Transactional
    public AdminMedicamentoDto registrarMedicamento(Integer idVisita,
                                                    NuevoAdminMedicamentoRequest req,
                                                    UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), medico);

        MedicamentoProtocolo medProtocolo = medProtocoloRepo.findById(req.getIdMedProtocolo())
                .orElseThrow(() -> new EntityNotFoundException("Medicamento del protocolo no encontrado: " + req.getIdMedProtocolo()));

        AdministracionMedicamento a = new AdministracionMedicamento();
        a.setVisita(visita);
        a.setMedProtocolo(medProtocolo);
        a.setNumeroLote(req.getNumeroLote().trim());
        a.setFechaHora(req.getFechaHora());
        a.setObservacion(req.getObservacion());
        a.setAdministradoPor(medico.getIdUsuario());
        a.setActivo(true);
        adminMedRepo.save(a);

        log.info("Medicamento registrado en visita {} por médico {}", idVisita, medico.getIdUsuario());
        return toAdminDto(a);
    }

    /* ════════════════════════════════════════════════════════════════
       HISTORIAL DE VISITA
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<HistorialVisitaDto> listarHistorial(Integer idVisita, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        exigirAccesoVisitas(usuario);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), usuario);

        return historialRepo.findByIdVisitaOrderByFechaCambioDesc(idVisita)
                .stream().map(this::toHistorialDto).toList();
    }

    /* ════════════════════════════════════════════════════════════════
       CATÁLOGOS
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<CatItemDto> getSeveridades() {
        return severidadRepo.findByActivoTrueOrderByOrdenAsc().stream()
                .map(s -> CatItemDto.builder()
                        .id(s.getIdSeveridad())
                        .nombre(s.getNivel())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CatItemDto> getTiposPrueba() {
        return tipoPruebaRepo.findByActivoTrueOrderByNombreAsc().stream()
                .map(t -> CatItemDto.builder()
                        .id(t.getIdTipoPrueba())
                        .nombre(t.getNombre())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminMedicamentoDto> getMedicamentosProtocolo(Integer idProtocolo) {
        return medProtocoloRepo
                .findByProtocoloIdProtocoloAndActivoTrue(idProtocolo)
                .stream()
                /* Deduplicar: mismo medicamento + dosis + unidad puede aparecer en
                   varias visitas del protocolo. Conservamos la primera aparición. */
                .collect(Collectors.toMap(
                        m -> m.getMedicamento().getNombre()
                             + "|" + m.getDosis()
                             + "|" + m.getUnidadDosis().getNombre(),
                        m -> m,
                        (first, dup) -> first,
                        LinkedHashMap::new
                ))
                .values().stream()
                .map(m -> AdminMedicamentoDto.builder()
                        .idMedProtocolo(m.getIdMedProtocolo())
                        .medicamento(m.getMedicamento().getNombre())
                        .dosis(m.getDosis())
                        .unidadDosis(m.getUnidadDosis().getNombre())
                        .frecuencia(m.getFrecuencia())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CatItemDto> getUnidadesDosis() {
        return unidadDosisRepo.findByActivoTrueOrderByNombre().stream()
                .map(u -> CatItemDto.builder()
                        .id(u.getIdUnidadDosis())
                        .nombre(u.getNombre())
                        .build())
                .toList();
    }

    /* ════════════════════════════════════════════════════════════════
       EVENTOS ADVERSOS
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<EventoAdversoDto> listarEventosAdversos(Integer idVisita, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        exigirAccesoVisitas(usuario);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), usuario);

        return eventoAdversoRepo.findByVisitaActivos(idVisita)
                .stream().map(this::toEventoDto).toList();
    }

    @Transactional
    public EventoAdversoDto registrarEventoAdverso(Integer idVisita,
                                                   NuevoEventoAdversoRequest req,
                                                   UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);
        Visita visita = visitaRepository.findById(idVisita)
                .orElseThrow(() -> new EntityNotFoundException("Visita no encontrada: " + idVisita));
        validarAccesoPaciente(visita.getPaciente().getIdPaciente(), medico);

        CatSeveridad severidad = severidadRepo.findById(req.getIdSeveridad())
                .orElseThrow(() -> new EntityNotFoundException("Severidad no encontrada: " + req.getIdSeveridad()));

        EventoAdverso ev = new EventoAdverso();
        ev.setIdPaciente(visita.getPaciente().getIdPaciente());
        ev.setIdProtocolo(visita.getPaciente().getProtocolo().getIdProtocolo());
        ev.setIdVisita(idVisita);
        ev.setSeveridad(severidad);
        ev.setDescripcion(req.getDescripcion().trim());
        ev.setFechaReporte(req.getFechaReporte());
        ev.setReportadoPor(medico.getIdUsuario());
        ev.setActivo(true);
        ev.setCreatedAt(java.time.LocalDateTime.now());
        eventoAdversoRepo.save(ev);

        log.info("Evento adverso registrado en visita {} por médico {}", idVisita, medico.getIdUsuario());
        return toEventoDto(ev);
    }

    public List<CatItemDto> getEstadosVisita() {
        return estadoVisitaRepo.findAll().stream()
                .map(e -> CatItemDto.builder()
                        .id(e.getIdEstadoVisita())
                        .nombre(e.getNombre())
                        .build())
                .toList();
    }

    @Transactional
    public CatItemDto crearTipoPrueba(NuevoTipoPruebaRequest req, UserDetails userDetails) {
        exigirRolMedico(resolverUsuario(userDetails));

        String nombreNorm = req.getNombre().trim();
        if (tipoPruebaRepo.existsByNombreIgnoreCaseAndActivoTrue(nombreNorm)) {
            throw new IllegalArgumentException(
                    "Ya existe un tipo de prueba con el nombre: " + nombreNorm);
        }

        CatTipoPrueba t = new CatTipoPrueba();
        t.setNombre(nombreNorm);
        t.setDescripcion(req.getDescripcion() != null ? req.getDescripcion().trim() : null);
        t.setActivo(true);
        tipoPruebaRepo.saveAndFlush(t);

        log.info("Tipo de prueba '{}' creado (id={})", t.getNombre(), t.getIdTipoPrueba());
        return CatItemDto.builder()
                .id(t.getIdTipoPrueba())
                .nombre(t.getNombre())
                .descripcion(t.getDescripcion())
                .build();
    }

    /* ════════════════════════════════════════════════════════════════
       HELPERS PRIVADOS
    ════════════════════════════════════════════════════════════════ */

    private Usuario resolverUsuario(UserDetails userDetails) {
        Usuario u = usuarioRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + userDetails.getUsername()));
        try {
            jdbcTemplate.queryForObject(
                    "SELECT set_config('app.current_user_id', ?, true)",
                    String.class, String.valueOf(u.getIdUsuario()));
        } catch (Exception e) {
            log.warn("No se pudo establecer app.current_user_id: {}", e.getMessage());
        }
        return u;
    }

    private void exigirAccesoVisitas(Usuario usuario) {
        String rol = usuario.getRol().getNombre();
        if (rol.contains("Coordinador")) {
            throw new AccessDeniedException("El coordinador no tiene acceso a las visitas clínicas");
        }
    }

    private void exigirRolMedico(Usuario usuario) {
        String rol = usuario.getRol().getNombre();
        if (!rol.contains("Médico") && !rol.contains("Medico")) {
            throw new AccessDeniedException("Solo un médico puede realizar esta acción");
        }
    }

    private void validarAccesoPaciente(Integer idPaciente, Usuario usuario) {
        String rol = usuario.getRol().getNombre();
        if (rol.contains("Médico") || rol.contains("Medico")) {
            Paciente p = pacienteRepository.findById(idPaciente)
                    .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado: " + idPaciente));
            if (!p.getIdMedico().equals(usuario.getIdUsuario())) {
                throw new AccessDeniedException("No tienes acceso a este paciente");
            }
        }
    }

    private EvolucionMedica crearEvolucion(Visita visita) {
        EvolucionMedica e = new EvolucionMedica();
        e.setVisita(visita);
        e.setContenido(null);
        e.setActivo(true);
        e.setCreatedAt(LocalDateTime.now());
        return evolucionRepo.save(e);
    }

    private VisitaResumenDto toResumen(Visita v) {
        return VisitaResumenDto.builder()
                .idVisita(v.getIdVisita())
                .nombreVisita(v.getVisitaProtocolo().getNombreVisita())
                .semana(v.getVisitaProtocolo().getSemana())
                .dia(v.getVisitaProtocolo().getDia())
                .fechaProgramada(v.getFechaProgramada())
                .fechaRealizada(v.getFechaRealizada())
                .estadoVisita(v.getEstadoVisita().getNombre())
                .idEstadoVisita(v.getEstadoVisita().getIdEstadoVisita())
                .activo(v.getActivo())
                .build();
    }

    private EvolucionMedicaDto toEvolucionDto(EvolucionMedica e, Integer idActual) {
        String bloqueadorNombre = null;
        if (e.getBloqueadoPor() != null) {
            bloqueadorNombre = usuarioRepository.findById(e.getBloqueadoPor())
                    .map(u -> u.getNombre() + " " + u.getApellido()).orElse("—");
        }
        String modificadorNombre = null;
        if (e.getModificadoPor() != null) {
            modificadorNombre = usuarioRepository.findById(e.getModificadoPor())
                    .map(u -> u.getNombre() + " " + u.getApellido()).orElse("—");
        }

        LocalDateTime ahora = LocalDateTime.now();
        boolean expirado = e.getFechaBloqueo() != null &&
                e.getFechaBloqueo().isBefore(ahora.minusMinutes(LOCK_TIMEOUT_MINUTES));
        boolean bloqueadaPorMi   = e.getBloqueadoPor() != null && e.getBloqueadoPor().equals(idActual) && !expirado;
        boolean bloqueadaPorOtro = e.getBloqueadoPor() != null && !e.getBloqueadoPor().equals(idActual) && !expirado;

        return EvolucionMedicaDto.builder()
                .idEvolucion(e.getIdEvolucion())
                .contenido(e.getContenido())
                .bloqueadoPor(e.getBloqueadoPor())
                .bloqueadoPorNombre(bloqueadorNombre)
                .fechaBloqueo(e.getFechaBloqueo())
                .modificadoPor(e.getModificadoPor())
                .modificadoPorNombre(modificadorNombre)
                .ultimaModificacion(e.getUltimaModificacion())
                .bloqueadaPorMi(bloqueadaPorMi)
                .bloqueadaPorOtro(bloqueadaPorOtro)
                .build();
    }

    private ResultadoLaboratorioDto toResultadoDto(ResultadoLaboratorio r) {
        String registradorNombre = usuarioRepository.findById(r.getRegistradoPor())
                .map(u -> u.getNombre() + " " + u.getApellido()).orElse("—");
        return ResultadoLaboratorioDto.builder()
                .idResultado(r.getIdResultado())
                .tipoPrueba(r.getTipoPrueba().getNombre())
                .idTipoPrueba(r.getTipoPrueba().getIdTipoPrueba())
                .fechaToma(r.getFechaToma())
                .severidad(r.getSeveridad() != null ? r.getSeveridad().getNivel() : null)
                .idSeveridad(r.getSeveridad() != null ? r.getSeveridad().getIdSeveridad() : null)
                .registradoPorNombre(registradorNombre)
                .createdAt(r.getCreatedAt())
                .build();
    }

    private AdminMedicamentoDto toAdminDto(AdministracionMedicamento a) {
        String adminNombre = usuarioRepository.findById(a.getAdministradoPor())
                .map(u -> u.getNombre() + " " + u.getApellido()).orElse("—");
        MedicamentoProtocolo mp = a.getMedProtocolo();
        return AdminMedicamentoDto.builder()
                .idAdmin(a.getIdAdmin())
                .medicamento(mp.getMedicamento().getNombre())
                .idMedProtocolo(mp.getIdMedProtocolo())
                .dosis(mp.getDosis())
                .unidadDosis(mp.getUnidadDosis().getNombre())
                .frecuencia(mp.getFrecuencia())
                .numeroLote(a.getNumeroLote())
                .fechaHora(a.getFechaHora())
                .observacion(a.getObservacion())
                .administradoPorNombre(adminNombre)
                .build();
    }

    private EventoAdversoDto toEventoDto(EventoAdverso e) {
        String reportadorNombre = usuarioRepository.findById(e.getReportadoPor())
                .map(u -> u.getNombre() + " " + u.getApellido()).orElse("—");
        return EventoAdversoDto.builder()
                .idEvento(e.getIdEvento())
                .severidad(e.getSeveridad().getNivel())
                .idSeveridad(e.getSeveridad().getIdSeveridad())
                .descripcion(e.getDescripcion())
                .fechaReporte(e.getFechaReporte())
                .reportadoPorNombre(reportadorNombre)
                .build();
    }

    private HistorialVisitaDto toHistorialDto(HistorialVisita h) {
        String modNombre = usuarioRepository.findById(h.getModificadoPor())
                .map(u -> u.getNombre() + " " + u.getApellido()).orElse("—");
        String estadoAnt = h.getEstadoAnterior() != null
                ? estadoVisitaRepo.findById(h.getEstadoAnterior())
                        .map(CatEstadoVisita::getNombre).orElse("—")
                : null;
        String estadoNuevo = estadoVisitaRepo.findById(h.getEstadoNuevo())
                .map(CatEstadoVisita::getNombre).orElse("—");
        return HistorialVisitaDto.builder()
                .idHistorial(h.getIdHistorial())
                .estadoAnterior(estadoAnt)
                .estadoNuevo(estadoNuevo)
                .fechaProgAnterior(h.getFechaProgAnterior())
                .fechaProgNueva(h.getFechaProgNueva())
                .modificadoPorNombre(modNombre)
                .motivo(h.getMotivo())
                .fechaCambio(h.getFechaCambio())
                .build();
    }
}
