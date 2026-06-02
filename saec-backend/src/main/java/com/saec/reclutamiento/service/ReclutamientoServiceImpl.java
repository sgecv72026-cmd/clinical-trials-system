package com.saec.reclutamiento.service;

import com.saec.dto.investigador.CatItemDto;
import com.saec.dto.reclutamiento.*;
import com.saec.entity.*;
import com.saec.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReclutamientoServiceImpl {

    // Estados: se resuelven por nombre para no depender de IDs de la BD
    private static final int ESTADO_VISITA_PROGRAMADA = 1;

    /** Resuelve el id_estado buscando por nombre exacto (case-insensitive). Si hay duplicados, toma el primero. */
    private Integer idEstado(String nombre) {
        // Busca todos los estados que coincidan y toma el primero
        // (En caso de duplicados en BD, usa el de menor ID)
        return estadoPostRepo.findByNombreIgnoreCase(nombre)
                .map(CatEstadoPostulacion::getIdEstado)
                .or(() -> {
                    // Fallback: buscar entre todos los estados (útil si hay problema con case)
                    return estadoPostRepo.findAll().stream()
                            .filter(e -> e.getNombre().equalsIgnoreCase(nombre))
                            .map(CatEstadoPostulacion::getIdEstado)
                            .findFirst();
                })
                .orElseThrow(() -> new EntityNotFoundException(
                        "Estado de postulación no encontrado en BD: \"" + nombre + "\""));
    }

    /** Obtiene la entidad de estado por nombre (case-insensitive). Si hay duplicados, toma el primero. */
    private CatEstadoPostulacion estadoPorNombre(String nombre) {
        Integer id = idEstado(nombre);
        return estadoPostRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Estado no encontrado por ID: " + id));
    }

    private final JdbcTemplate                    jdbcTemplate;
    private final UsuarioRepository              usuarioRepository;
    private final CandidatoRepository            candidatoRepository;
    private final PostulacionRepository          postulacionRepository;
    private final PostulacionModificacionRepository modificacionRepository;
    private final CandidatoCriterioRepository    criterioEvaluadoRepo;
    private final PacienteRepository             pacienteRepository;
    private final AntecedenteMedicoRepository    antecedenteRepository;
    private final ConsentimientoInformadoRepository consentimientoRepository;
    private final VisitaRepository               visitaRepository;
    private final CatGeneroRepository            generoRepository;
    private final CatEstadoPostulacionRepository estadoPostRepo;
    private final CatEstadoVisitaRepository      estadoVisitaRepo;
    private final CentroInvestigacionRepository  centroRepository;
    private final ProtocoloRepository            protocoloRepository;
    private final CriterioProtocoloRepository    criterioProtocoloRepo;
    private final VisitaProtocoloRepository      visitaProtocoloRepo;
    private final UsuarioCentroRepository        usuarioCentroRepository;

    /* ═══════════════════════════════════════════════════════════════
       CATÁLOGOS
    ═══════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<CatItemDto> listarGeneros() {
        return generoRepository.findAllByOrderByNombre()
                .stream()
                .map(g -> CatItemDto.builder().id(g.getIdGenero()).nombre(g.getNombre()).build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CatItemDto> listarCentros() {
        return centroRepository.findByActivoTrueOrderByNombre()
                .stream()
                .map(c -> CatItemDto.builder().id(c.getIdCentro()).nombre(c.getNombre()).build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CriterioEvaluadoDto> listarCriteriosProtocolo(Integer idProtocolo) {
        return criterioProtocoloRepo.findByProtocoloIdProtocoloAndActivoTrue(idProtocolo)
                .stream()
                .map(c -> CriterioEvaluadoDto.builder()
                        .idCriterio(c.getIdCriterio())
                        .tipo(c.getTipo())
                        .descripcion(c.getDescripcion())
                        .cumple(null)
                        .observacion(null)
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProtocoloActivoDto> listarProtocolosActivos() {
        return protocoloRepository.findAll().stream()
                .filter(p -> "activo".equalsIgnoreCase(p.getEstadoProtocolo().getNombre()))
                .map(p -> {
                    long activos = pacienteRepository.findAll().stream()
                            .filter(pac -> pac.getProtocolo().getIdProtocolo().equals(p.getIdProtocolo())
                                    && Boolean.TRUE.equals(pac.getActivo()))
                            .count();
                    int cupoRestante = p.getMetaPacientes() != null
                            ? Math.max(0, p.getMetaPacientes() - (int) activos)
                            : 999;
                    return ProtocoloActivoDto.builder()
                            .idProtocolo(p.getIdProtocolo())
                            .codigo(p.getCodigo())
                            .codigoProtocolo(p.getCodigo())
                            .titulo(p.getTitulo())
                            .fase(p.getFase().getNombre())
                            .metaPacientes(p.getMetaPacientes())
                            .pacientesActivos(activos)
                            .cupoDisponible(cupoRestante)
                            .build();
                }).toList();
    }

    /* ═══════════════════════════════════════════════════════════════
       COORDINADOR
    ═══════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<CandidatoResumenDto> listarMisCandidatos(UserDetails userDetails) {
        Usuario coordinador = resolverUsuario(userDetails);
        exigirRol(coordinador, "Coordinador de Reclutamiento");

        return postulacionRepository.findByCoordinadorConDetalle(coordinador.getIdUsuario())
                .stream()
                .map(this::toResumen)
                .toList();
    }

    @Transactional
    public CandidatoResumenDto crearCandidato(NuevoCandidatoRequest req, UserDetails userDetails) {
        Usuario coordinador = resolverUsuario(userDetails);
        exigirRol(coordinador, "Coordinador de Reclutamiento");

        // Derivar el centro desde la asignación del coordinador autenticado.
        // Si no tiene centro asignado es un error de configuración que debe resolverse
        // en la administración — no se hace fallback silencioso.
        List<UsuarioCentro> asignaciones =
                usuarioCentroRepository.findByUsuarioIdWithCentro(coordinador.getIdUsuario());
        if (asignaciones.isEmpty()) {
            throw new IllegalStateException(
                    "Su usuario no tiene ningún centro de investigación asignado. " +
                    "Contacte al administrador del sistema para que le asigne un centro.");
        }
        CentroInvestigacion centro = asignaciones.get(0).getCentro();
        CatGenero genero = generoRepository.findById(req.getIdGenero())
                .orElseThrow(() -> new EntityNotFoundException("Género no encontrado: " + req.getIdGenero()));
        Protocolo protocolo = protocoloRepository.findById(req.getIdProtocolo())
                .orElseThrow(() -> new EntityNotFoundException("Protocolo no encontrado: " + req.getIdProtocolo()));
        CatEstadoPostulacion estadoEspera = estadoPostRepo.findByNombreIgnoreCase("En Espera")
                .orElseThrow(() -> new EntityNotFoundException("Estado 'En Espera' no encontrado en BD"));

        Candidato candidato = new Candidato();
        candidato.setCentro(centro);
        candidato.setGenero(genero);
        candidato.setNombre(req.getNombre().trim());
        candidato.setApellido(req.getApellido().trim());
        candidato.setContacto(req.getContacto());
        candidato.setFechaNacimiento(req.getFechaNacimiento());
        candidato.setCreatedAt(LocalDateTime.now());
        candidatoRepository.save(candidato);

        Postulacion postulacion = new Postulacion();
        postulacion.setCandidato(candidato);
        postulacion.setProtocolo(protocolo);
        postulacion.setIdCoordinador(coordinador.getIdUsuario());
        postulacion.setEstado(estadoEspera);
        postulacion.setFechaPostulacion(LocalDateTime.now());
        postulacion.setObservacionGeneral(req.getObservacion());
        postulacionRepository.save(postulacion);

        registrarModificacion(postulacion, coordinador.getIdUsuario(), null, estadoEspera.getIdEstado(), null);

        log.info("Candidato creado id={} por coordinador id={}",
                candidato.getIdCandidato(), coordinador.getIdUsuario());

        return CandidatoResumenDto.builder()
                .idCandidato(candidato.getIdCandidato())
                .idPostulacion(postulacion.getIdPostulacion())
                .nombre(candidato.getNombre())
                .apellido(candidato.getApellido())
                .protocolo(protocolo.getTitulo())
                .estadoPostulacion(estadoEspera.getNombre())
                .idEstado(estadoEspera.getIdEstado())
                .fechaPostulacion(postulacion.getFechaPostulacion())
                .build();
    }

    /* ═══════════════════════════════════════════════════════════════
       ACTUALIZAR DATOS CANDIDATO (Coordinador)
    ═══════════════════════════════════════════════════════════════ */

    @Transactional
    public void actualizarCandidato(Integer idCandidato, ActualizarCandidatoRequest req, UserDetails userDetails) {
        Usuario coordinador = resolverUsuario(userDetails);
        exigirRol(coordinador, "Coordinador de Reclutamiento");

        Candidato candidato = candidatoRepository.findById(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Candidato no encontrado: " + idCandidato));

        Postulacion postulacion = postulacionRepository.findByCandidatoIdCandidato(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Postulación no encontrada para candidato: " + idCandidato));

        if (!postulacion.getIdCoordinador().equals(coordinador.getIdUsuario())) {
            throw new AccessDeniedException("No tiene permiso para editar este candidato");
        }

        if (req.getNombre() != null && !req.getNombre().isBlank())
            candidato.setNombre(req.getNombre().trim());
        if (req.getApellido() != null && !req.getApellido().isBlank())
            candidato.setApellido(req.getApellido().trim());
        if (req.getFechaNacimiento() != null)
            candidato.setFechaNacimiento(req.getFechaNacimiento());
        if (req.getContacto() != null)
            candidato.setContacto(req.getContacto().isBlank() ? null : req.getContacto().trim());
        candidatoRepository.save(candidato);

        postulacion.setObservacionGeneral(
                req.getObservacion() == null || req.getObservacion().isBlank() ? null : req.getObservacion().trim());
        postulacionRepository.save(postulacion);

        int estadoActual = postulacion.getEstado().getIdEstado();
        registrarModificacion(postulacion, coordinador.getIdUsuario(),
                estadoActual, estadoActual, "Datos del candidato actualizados por coordinador");

        log.info("Candidato {} actualizado por coordinador {}", idCandidato, coordinador.getIdUsuario());
    }

    /* ═══════════════════════════════════════════════════════════════
       DETALLE CANDIDATO (compartido)
    ═══════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public CandidatoDetalleDto obtenerDetalle(Integer idCandidato, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        Candidato candidato = candidatoRepository.findById(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Candidato no encontrado: " + idCandidato));

        Postulacion postulacion = postulacionRepository.findByCandidatoIdCandidato(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Postulación no encontrada para candidato: " + idCandidato));

        List<ModificacionDto> historial = modificacionRepository
                .findByPostulacionIdPostulacionOrderByFechaModificacionAsc(postulacion.getIdPostulacion())
                .stream()
                .map(m -> {
                    String nombreUsuario = usuarioRepository.findById(m.getIdUsuario())
                            .map(u -> u.getNombre() + " " + u.getApellido())
                            .orElse("Desconocido");
                    String eAnterior = m.getEstadoAnterior() != null
                            ? estadoPostRepo.findById(m.getEstadoAnterior()).map(CatEstadoPostulacion::getNombre).orElse("-")
                            : null;
                    String eNuevo = estadoPostRepo.findById(m.getEstadoNuevo())
                            .map(CatEstadoPostulacion::getNombre).orElse("-");
                    return ModificacionDto.builder()
                            .idModificacion(m.getIdModificacion())
                            .nombreUsuario(nombreUsuario)
                            .estadoAnterior(eAnterior)
                            .estadoNuevo(eNuevo)
                            .motivo(m.getMotivo())
                            .fechaModificacion(m.getFechaModificacion())
                            .build();
                }).toList();

        // Datos médico (solo si corresponde)
        String rolNombre = usuario.getRol().getNombre();
        boolean esMedico = rolNombre.contains("Médico") || rolNombre.contains("Medico");

        Paciente paciente = pacienteRepository.findByCandidatoIdCandidato(idCandidato).orElse(null);

        List<AntecedenteDto> antecedentes = null;
        ConsentimientoDto consentimiento = null;
        List<CriterioEvaluadoDto> criteriosEvaluados = null;

        if (esMedico && paciente != null) {
            antecedentes = antecedenteRepository
                    .findByPacienteIdPacienteAndActivoTrueOrderByFechaRegistroDesc(paciente.getIdPaciente())
                    .stream()
                    .map(a -> {
                        String regPor = usuarioRepository.findById(a.getRegistradoPor())
                                .map(u -> u.getNombre() + " " + u.getApellido()).orElse("-");
                        return AntecedenteDto.builder()
                                .idAntecedente(a.getIdAntecedente())
                                .descripcion(a.getDescripcion())
                                .fechaDiagnostico(a.getFechaDiagnostico())
                                .registradoPorNombre(regPor)
                                .fechaRegistro(a.getFechaRegistro())
                                .activo(a.getActivo())
                                .build();
                    }).toList();

            consentimientoRepository.findByPacienteIdPacienteAndActivoTrue(paciente.getIdPaciente())
                    .ifPresent(c -> {
                    });
            var cons = consentimientoRepository.findByPacienteIdPacienteAndActivoTrue(paciente.getIdPaciente());
            if (cons.isPresent()) {
                var c = cons.get();
                consentimiento = ConsentimientoDto.builder()
                        .idConsentimiento(c.getIdConsentimiento())
                        .fechaFirma(c.getFechaFirma())
                        .versionDocumento(c.getVersionDocumento())
                        .rutaArchivoPdf(c.getRutaArchivoPdf())
                        .observaciones(c.getObservaciones())
                        .activo(c.getActivo())
                        .build();
            }
        }

        criteriosEvaluados = criterioEvaluadoRepo
                .findByPostulacionIdPostulacion(postulacion.getIdPostulacion())
                .stream()
                .map(cc -> CriterioEvaluadoDto.builder()
                        .idCriterio(cc.getCriterio().getIdCriterio())
                        .tipo(cc.getCriterio().getTipo())
                        .descripcion(cc.getCriterio().getDescripcion())
                        .cumple(cc.getCumple())
                        .observacion(cc.getObservacion())
                        .build())
                .toList();

        // Criterios del protocolo (definiciones, no evaluaciones)
        List<CriterioEvaluadoDto> criteriosProtocolo = criterioProtocoloRepo
                .findByProtocoloIdProtocoloAndActivoTrue(postulacion.getProtocolo().getIdProtocolo())
                .stream()
                .map(c -> CriterioEvaluadoDto.builder()
                        .idCriterio(c.getIdCriterio())
                        .tipo(c.getTipo())
                        .descripcion(c.getDescripcion())
                        .cumple(null)
                        .observacion(null)
                        .build())
                .toList();

        return CandidatoDetalleDto.builder()
                .idCandidato(candidato.getIdCandidato())
                .nombre(candidato.getNombre())
                .apellido(candidato.getApellido())
                .genero(candidato.getGenero().getNombre())
                .fechaNacimiento(candidato.getFechaNacimiento())
                .contacto(candidato.getContacto())
                .centro(candidato.getCentro().getNombre())
                .createdAt(candidato.getCreatedAt())
                .idPostulacion(postulacion.getIdPostulacion())
                .protocolo(postulacion.getProtocolo().getTitulo())
                .codigoProtocolo(postulacion.getProtocolo().getCodigo())
                .observacionGeneral(postulacion.getObservacionGeneral())
                .estadoPostulacion(postulacion.getEstado().getNombre())
                .idEstado(postulacion.getEstado().getIdEstado())
                .elegibilidadAuto(postulacion.getElegibilidadAuto())
                .fechaPostulacion(postulacion.getFechaPostulacion())
                .fechaDecision(postulacion.getFechaDecision())
                .historial(historial)
                .antecedentes(antecedentes)
                .consentimiento(consentimiento)
                .criteriosEvaluados(criteriosEvaluados)
                .criteriosProtocolo(criteriosProtocolo)
                .idPaciente(paciente != null ? paciente.getIdPaciente() : null)
                .pacienteActivo(paciente != null ? paciente.getActivo() : null)
                .build();
    }

    /* ═══════════════════════════════════════════════════════════════
       INVESTIGADOR
    ═══════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<CandidatoResumenDto> listarPendientesInvestigador(UserDetails userDetails) {
        Usuario investigador = resolverUsuario(userDetails);
        exigirRol(investigador, "Investigador Principal");
        return postulacionRepository
                .findByInvestigadorYEstado(investigador.getIdUsuario(), idEstado("En Espera"))
                .stream().map(this::toResumen).toList();
    }

    @Transactional(readOnly = true)
    public List<CandidatoResumenDto> listarHistorialInvestigador(UserDetails userDetails) {
        Usuario investigador = resolverUsuario(userDetails);
        exigirRol(investigador, "Investigador Principal");
        return postulacionRepository
                .findHistorialByInvestigador(investigador.getIdUsuario(), idEstado("En Espera"))
                .stream().map(this::toResumen).toList();
    }

    @Transactional
    public CandidatoResumenDto aprobarPostulacion(Integer idPostulacion, UserDetails userDetails) {
        Usuario investigador = resolverUsuario(userDetails);
        exigirRol(investigador, "Investigador Principal");

        // Usar findByIdConDetalle para que protocolo esté disponible sin lazy-load issues
        Postulacion post = postulacionRepository.findByIdConDetalle(idPostulacion)
                .orElseThrow(() -> new EntityNotFoundException("Postulación no encontrada: " + idPostulacion));
        if (!post.getProtocolo().getIdInvestigador().equals(investigador.getIdUsuario())) {
            throw new AccessDeniedException("No tienes acceso a esta postulación");
        }

        int estadoAnterior = post.getEstado().getIdEstado();
        CatEstadoPostulacion aceptado = estadoPorNombre("Aceptado");
        post.setEstado(aceptado);
        post.setFechaDecision(LocalDateTime.now());
        postulacionRepository.save(post);

        registrarModificacion(post, investigador.getIdUsuario(), estadoAnterior, aceptado.getIdEstado(), null);
        log.info("Postulación {} aprobada por investigador {}", idPostulacion, investigador.getIdUsuario());

        // Recargar con JOIN FETCH para evitar LazyInitializationException en toResumen
        return postulacionRepository.findByIdConDetalle(idPostulacion)
                .map(this::toResumen)
                .orElseThrow(() -> new EntityNotFoundException("Postulación no encontrada tras guardar: " + idPostulacion));
    }

    @Transactional
    public CandidatoResumenDto rechazarPostulacion(Integer idPostulacion, DecisionRequest req, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        String rol = usuario.getRol().getNombre();
        boolean esInvestigador = rol.contains("Investigador");
        boolean esMedico = rol.contains("Médico") || rol.contains("Medico");
        if (!esInvestigador && !esMedico) {
            throw new AccessDeniedException("Sin permiso para rechazar postulaciones");
        }

        Postulacion post = getPostulacion(idPostulacion);
        int estadoAnterior = post.getEstado().getIdEstado();
        CatEstadoPostulacion rechazado = estadoPorNombre("Rechazado");
        post.setEstado(rechazado);
        post.setFechaDecision(LocalDateTime.now());
        postulacionRepository.save(post);

        String motivo = (req != null && req.getMotivo() != null && !req.getMotivo().isBlank())
                ? req.getMotivo() : null;
        registrarModificacion(post, usuario.getIdUsuario(), estadoAnterior, rechazado.getIdEstado(), motivo);
        log.info("Postulación {} rechazada por usuario {}", idPostulacion, usuario.getIdUsuario());

        // Recargar con JOIN FETCH para evitar LazyInitializationException en toResumen
        return postulacionRepository.findByIdConDetalle(idPostulacion)
                .map(this::toResumen)
                .orElseThrow(() -> new EntityNotFoundException("Postulación no encontrada tras guardar: " + idPostulacion));
    }

    /* ═══════════════════════════════════════════════════════════════
       MÉDICO
    ═══════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<CandidatoResumenDto> listarPendientesMedico(UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolContieneTexto(medico, "Médico", "Medico");

        Integer idCentro = resolverCentroMedico(medico.getIdUsuario());
        return postulacionRepository.findAceptadosPorCentroSinPacienteActivo(idCentro, idEstado("Aceptado"))
                .stream().map(this::toResumen).toList();
    }

    /**
     * Crea el registro de Paciente (activo=false) si no existe todavía.
     * NO llama a obtenerDetalle() para evitar problemas con transacciones anidadas.
     * El frontend debe llamar a getDetalleCandidato() por separado después.
     */
    @Transactional
    public void iniciarEvaluacion(Integer idCandidato, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolContieneTexto(medico, "Médico", "Medico");

        // Si ya tiene paciente (incluso activo=false), no crear otro
        if (pacienteRepository.findByCandidatoIdCandidato(idCandidato).isPresent()) {
            log.info("Evaluación ya iniciada para candidato {} – paciente existe", idCandidato);
            return;
        }

        Candidato candidato = candidatoRepository.findById(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Candidato no encontrado: " + idCandidato));

        Postulacion postulacion = postulacionRepository.findByCandidatoIdCandidato(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Postulación no encontrada para candidato: " + idCandidato));

        Integer idCentro = resolverCentroMedico(medico.getIdUsuario());
        CentroInvestigacion centro = centroRepository.findById(idCentro)
                .orElseThrow(() -> new EntityNotFoundException("Centro no encontrado: " + idCentro));

        // Crear paciente con activo=false (evaluación en curso, aún no inscrito)
        Paciente paciente = new Paciente();
        paciente.setCandidato(candidato);
        paciente.setProtocolo(postulacion.getProtocolo());
        paciente.setIdMedico(medico.getIdUsuario());
        paciente.setCentro(centro);
        paciente.setFechaIngreso(LocalDate.now());
        paciente.setActivo(false);
        paciente.setCreatedAt(LocalDateTime.now());
        pacienteRepository.save(paciente);

        log.info("Evaluación iniciada para candidato {} por médico {}", idCandidato, medico.getIdUsuario());
    }

    @Transactional
    public AntecedenteDto agregarAntecedente(Integer idCandidato, AntecedenteRequest req, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolContieneTexto(medico, "Médico", "Medico");

        Paciente paciente = pacienteRepository.findByCandidatoIdCandidato(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Debe iniciar la evaluación antes de registrar antecedentes"));

        AntecedenteMedico ant = new AntecedenteMedico();
        ant.setPaciente(paciente);
        ant.setDescripcion(req.getDescripcion().trim());
        ant.setFechaDiagnostico(req.getFechaDiagnostico());
        ant.setRegistradoPor(medico.getIdUsuario());
        ant.setFechaRegistro(LocalDateTime.now());
        ant.setActivo(true);
        antecedenteRepository.save(ant);

        String nombreMedico = medico.getNombre() + " " + medico.getApellido();
        return AntecedenteDto.builder()
                .idAntecedente(ant.getIdAntecedente())
                .descripcion(ant.getDescripcion())
                .fechaDiagnostico(ant.getFechaDiagnostico())
                .registradoPorNombre(nombreMedico)
                .fechaRegistro(ant.getFechaRegistro())
                .activo(ant.getActivo())
                .build();
    }

    @Transactional
    public void desactivarAntecedente(Integer idAntecedente, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolContieneTexto(medico, "Médico", "Medico");

        AntecedenteMedico ant = antecedenteRepository.findById(idAntecedente)
                .orElseThrow(() -> new EntityNotFoundException("Antecedente no encontrado: " + idAntecedente));
        ant.setActivo(false);
        antecedenteRepository.save(ant);
        log.info("Antecedente {} desactivado por médico {}", idAntecedente, medico.getIdUsuario());
    }

    @Transactional
    public void guardarCriterios(Integer idPostulacion, List<CriterioEvaluacionRequest> criterios, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        String rol = usuario.getRol().getNombre();
        boolean esMed  = rol.contains("Médico") || rol.contains("Medico");
        boolean esCoor = rol.contains("Coordinador");
        if (!esMed && !esCoor) {
            throw new AccessDeniedException("Solo el médico tratante o el coordinador puede evaluar criterios");
        }

        Postulacion postulacion = getPostulacion(idPostulacion);

        for (CriterioEvaluacionRequest cr : criterios) {
            CriterioProtocolo criterio = criterioProtocoloRepo.findById(cr.getIdCriterio())
                    .orElseThrow(() -> new EntityNotFoundException("Criterio no encontrado: " + cr.getIdCriterio()));

            CandidatoCriterio cc = criterioEvaluadoRepo
                    .findByPostulacionIdPostulacionAndCriterioIdCriterio(idPostulacion, cr.getIdCriterio())
                    .orElse(new CandidatoCriterio());

            cc.setPostulacion(postulacion);
            cc.setCriterio(criterio);
            cc.setCumple(cr.getCumple());
            cc.setObservacion(cr.getObservacion());
            cc.setEvaluadoPor(usuario.getIdUsuario());
            cc.setFechaEvaluacion(LocalDateTime.now());
            criterioEvaluadoRepo.save(cc);
        }

        // Calcular elegibilidad_auto
        List<CriterioProtocolo> todosLoscriterios = criterioProtocoloRepo
                .findByProtocoloIdProtocoloAndActivoTrue(postulacion.getProtocolo().getIdProtocolo());

        boolean elegible = todosLoscriterios.stream().allMatch(c -> {
            return criterioEvaluadoRepo
                    .findByPostulacionIdPostulacionAndCriterioIdCriterio(idPostulacion, c.getIdCriterio())
                    .map(cc -> {
                        if ("inclusion".equalsIgnoreCase(c.getTipo())) return Boolean.TRUE.equals(cc.getCumple());
                        if ("exclusion".equalsIgnoreCase(c.getTipo())) return Boolean.FALSE.equals(cc.getCumple());
                        return true;
                    }).orElse(false);
        });

        postulacion.setElegibilidadAuto(elegible);
        postulacionRepository.save(postulacion);

        int estadoActual = postulacion.getEstado().getIdEstado();
        registrarModificacion(postulacion, usuario.getIdUsuario(),
                estadoActual, estadoActual, "Criterios de elegibilidad actualizados");

        log.info("Criterios guardados para postulación {} por usuario {}", idPostulacion, usuario.getIdUsuario());
    }

    public String subirPdfConsentimiento(Integer idCandidato, MultipartFile archivo, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolContieneTexto(medico, "Médico", "Medico");

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }
        String originalName = archivo.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Solo se permiten archivos PDF");
        }

        String year = String.valueOf(LocalDate.now().getYear());
        Path uploadDir = Paths.get("uploads", "consentimientos", year);
        try {
            Files.createDirectories(uploadDir);
            String uniqueName = idCandidato + "_" + System.currentTimeMillis() + ".pdf";
            Path destino = uploadDir.resolve(uniqueName);
            archivo.transferTo(destino);
            return "consentimientos/" + year + "/" + uniqueName;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar el archivo PDF.", e);
        }
    }

    public Resource cargarPdfConsentimiento(String ruta) {
        if (ruta == null || ruta.contains("..")) {
            throw new IllegalArgumentException("Ruta de archivo no válida");
        }
        try {
            Path archivo = Paths.get("uploads").resolve(ruta).normalize();
            Resource resource = new UrlResource(archivo.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Archivo no encontrado: " + ruta);
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("No se pudo leer el archivo PDF.", e);
        }
    }

    @Transactional
    public ConsentimientoDto registrarConsentimiento(Integer idCandidato, ConsentimientoRequest req, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolContieneTexto(medico, "Médico", "Medico");

        Paciente paciente = pacienteRepository.findByCandidatoIdCandidato(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Debe iniciar la evaluación primero"));

        // Desactivar consentimiento anterior si existe
        consentimientoRepository.findByPacienteIdPacienteAndActivoTrue(paciente.getIdPaciente())
                .ifPresent(c -> { c.setActivo(false); consentimientoRepository.save(c); });

        ConsentimientoInformado c = new ConsentimientoInformado();
        c.setPaciente(paciente);
        c.setIdMedico(medico.getIdUsuario());
        c.setFechaFirma(req.getFechaFirma());
        c.setVersionDocumento(req.getVersionDocumento().trim());
        c.setRutaArchivoPdf(req.getRutaArchivoPdf());
        c.setObservaciones(req.getObservaciones());
        c.setActivo(true);
        c.setCreatedAt(LocalDateTime.now());
        consentimientoRepository.save(c);

        log.info("Consentimiento registrado para candidato {} por médico {}", idCandidato, medico.getIdUsuario());
        return ConsentimientoDto.builder()
                .idConsentimiento(c.getIdConsentimiento())
                .fechaFirma(c.getFechaFirma())
                .versionDocumento(c.getVersionDocumento())
                .rutaArchivoPdf(c.getRutaArchivoPdf())
                .observaciones(c.getObservaciones())
                .activo(c.getActivo())
                .build();
    }

    @Transactional
    public CandidatoDetalleDto inscribirPaciente(Integer idCandidato, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolContieneTexto(medico, "Médico", "Medico");

        Paciente paciente = pacienteRepository.findByCandidatoIdCandidato(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Debe iniciar la evaluación primero"));

        // Validar consentimiento
        if (!consentimientoRepository.existsByPacienteIdPacienteAndActivoTrue(paciente.getIdPaciente())) {
            throw new IllegalStateException("El consentimiento informado es obligatorio antes de inscribir al candidato");
        }

        // Inscribir: activar paciente
        paciente.setActivo(true);
        paciente.setFechaIngreso(LocalDate.now());
        pacienteRepository.save(paciente);

        // Actualizar postulación
        Postulacion postulacion = postulacionRepository.findByCandidatoIdCandidato(idCandidato)
                .orElseThrow(() -> new EntityNotFoundException("Postulación no encontrada"));
        CatEstadoPostulacion aceptado = estadoPorNombre("Aceptado");
        int estadoAnteriorInscr = postulacion.getEstado().getIdEstado();
        postulacion.setEstado(aceptado);
        postulacion.setFechaDecision(LocalDateTime.now());
        postulacionRepository.save(postulacion);

        registrarModificacion(postulacion, medico.getIdUsuario(),
                estadoAnteriorInscr, aceptado.getIdEstado(),
                "Inscrito como paciente por médico");

        // Generar visitas: fecha_programada = fecha_ingreso + (semana × 7 + dia) días
        CatEstadoVisita estadoProgramada = estadoVisitaRepo.findById(ESTADO_VISITA_PROGRAMADA)
                .orElseThrow(() -> new EntityNotFoundException("Estado visita programada no encontrado"));

        List<VisitaProtocolo> plantillas = visitaProtocoloRepo
                .findByProtocoloIdProtocoloAndActivoTrueOrderBySemanaAscDiaAsc(
                        paciente.getProtocolo().getIdProtocolo());

        for (VisitaProtocolo vp : plantillas) {
            int diasOffset = (vp.getSemana() != null ? vp.getSemana() * 7 : 0)
                           + (vp.getDia() != null ? vp.getDia() : 0);
            Visita visita = new Visita();
            visita.setPaciente(paciente);
            visita.setVisitaProtocolo(vp);
            visita.setEstadoVisita(estadoProgramada);
            visita.setFechaProgramada(paciente.getFechaIngreso().plusDays(diasOffset));
            visita.setActivo(true);
            visita.setCreatedAt(LocalDateTime.now());
            visitaRepository.save(visita);
        }

        log.info("Paciente inscrito id={} candidato={} por médico={}",
                paciente.getIdPaciente(), idCandidato, medico.getIdUsuario());

        return obtenerDetalle(idCandidato, userDetails);
    }

    @Transactional
    public CandidatoResumenDto marcarNoApto(Integer idPostulacion, DecisionRequest req, UserDetails userDetails) {
        return rechazarPostulacion(idPostulacion, req, userDetails);
    }

    /* ═══════════════════════════════════════════════════════════════
       HELPERS PRIVADOS
    ═══════════════════════════════════════════════════════════════ */

    private Usuario resolverUsuario(UserDetails userDetails) {
        Usuario u = usuarioRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + userDetails.getUsername()));

        // Establecer contexto de auditoría requerido por los triggers de PostgreSQL
        // (Módulo 8 - Bitácoras). Se usa set_config con is_local=true para que aplique
        // solo durante la transacción actual.
        try {
            jdbcTemplate.queryForObject(
                    "SELECT set_config('app.current_user_id', ?, true)",
                    String.class,
                    String.valueOf(u.getIdUsuario()));
        } catch (Exception e) {
            log.warn("No se pudo establecer app.current_user_id para usuario {}: {}", u.getIdUsuario(), e.getMessage());
        }

        return u;
    }

    private void exigirRol(Usuario usuario, String rolEsperado) {
        if (!usuario.getRol().getNombre().equalsIgnoreCase(rolEsperado)) {
            throw new AccessDeniedException("Acceso denegado. Se requiere rol: " + rolEsperado);
        }
    }

    private void exigirRolContieneTexto(Usuario usuario, String... textos) {
        String rolNombre = usuario.getRol().getNombre();
        for (String t : textos) {
            if (rolNombre.contains(t)) return;
        }
        throw new AccessDeniedException("Acceso denegado para el rol: " + rolNombre);
    }

    private Integer resolverCentroMedico(Integer idMedico) {
        return usuarioCentroRepository.findByUsuarioIdWithCentro(idMedico)
                .stream()
                .findFirst()
                .map(uc -> uc.getCentro().getIdCentro())
                .orElseThrow(() -> new EntityNotFoundException("El médico no tiene centro asignado"));
    }

    private Postulacion getPostulacion(Integer idPostulacion) {
        return postulacionRepository.findById(idPostulacion)
                .orElseThrow(() -> new EntityNotFoundException("Postulación no encontrada: " + idPostulacion));
    }

    private void registrarModificacion(Postulacion postulacion, Integer idUsuario,
                                        Integer estadoAnterior, Integer estadoNuevo, String motivo) {
        PostulacionModificacion mod = new PostulacionModificacion();
        mod.setPostulacion(postulacion);
        mod.setIdUsuario(idUsuario);
        mod.setEstadoAnterior(estadoAnterior);
        mod.setEstadoNuevo(estadoNuevo);
        mod.setMotivo(motivo);
        mod.setEsOverride(false);
        mod.setFechaModificacion(LocalDateTime.now());
        modificacionRepository.save(mod);
    }

    private CandidatoResumenDto toResumen(Postulacion p) {
        String nombreCentro = null;
        try { nombreCentro = p.getCandidato().getCentro().getNombre(); } catch (Exception ignored) {}

        return CandidatoResumenDto.builder()
                .idCandidato(p.getCandidato().getIdCandidato())
                .idPostulacion(p.getIdPostulacion())
                .nombre(p.getCandidato().getNombre())
                .apellido(p.getCandidato().getApellido())
                .protocolo(p.getProtocolo().getTitulo())
                .nombreProtocolo(p.getProtocolo().getTitulo())
                .codigoProtocolo(p.getProtocolo().getCodigo())
                .nombreCentro(nombreCentro)
                .estadoPostulacion(p.getEstado().getNombre())
                .nombreEstado(p.getEstado().getNombre())
                .idEstado(p.getEstado().getIdEstado())
                .elegibilidadAuto(p.getElegibilidadAuto())
                .fechaPostulacion(p.getFechaPostulacion())
                .fechaDecision(p.getFechaDecision())
                .build();
    }
}
