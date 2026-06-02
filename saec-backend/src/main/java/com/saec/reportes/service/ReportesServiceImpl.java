package com.saec.reportes.service;

import com.saec.dto.reportes.ResumenCoordinadorDto;
import com.saec.dto.reportes.ResumenComiteDto;
import com.saec.dto.reportes.ResumenMedicoDto;
import com.saec.entity.*;
import com.saec.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportesServiceImpl {

    private final JdbcTemplate                         jdbcTemplate;
    private final UsuarioRepository                    usuarioRepository;
    private final PacienteRepository                   pacienteRepository;
    private final VisitaRepository                     visitaRepository;
    private final PostulacionRepository                postulacionRepository;
    private final ProtocoloRepository                  protocoloRepository;
    private final ConsentimientoInformadoRepository    consentimientoRepo;
    private final EventoAdversoRepository              eventoRepo;
    private final AntecedenteMedicoRepository          antecedenteRepo;
    private final MedicamentoProtocoloRepository       medProtocoloRepo;
    private final AdministracionMedicamentoRepository  adminMedRepo;
    private final CentroInvestigacionRepository        centroRepo;

    /* ════════════════════════════════════════════════════════════════
       COMITÉ DE ÉTICA
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public ResumenComiteDto getResumenComite(UserDetails userDetails,
                                             LocalDate fechaDesde,
                                             LocalDate fechaHasta,
                                             Integer idCentro) {
        Usuario u = resolverUsuario(userDetails);
        if (!u.getRol().getNombre().contains("Ética") && !u.getRol().getNombre().contains("Etica")) {
            throw new AccessDeniedException("Acceso restringido al Comité de Ética");
        }

        /* ── Pacientes (con genero para demografía) ─────────────── */
        List<Paciente> todosPacientes = pacienteRepository.findAllConDetalleCompleto();
        long activosPacientes = todosPacientes.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo())).count();

        /* ── Centros disponibles (para filtro) ───────────────────── */
        List<ResumenComiteDto.CentroSimpleItem> centrosDisponibles = centroRepo.findByActivoTrueOrderByNombre()
                .stream()
                .map(c -> ResumenComiteDto.CentroSimpleItem.builder()
                        .id(c.getIdCentro()).nombre(c.getNombre()).build())
                .toList();

        /* ── Eventos con filtros opcionales ─────────────────────── */
        Map<Integer, Integer> pacienteCentroMap = todosPacientes.stream()
                .collect(Collectors.toMap(Paciente::getIdPaciente,
                        p -> p.getCentro().getIdCentro(), (a, b) -> a));
        Map<Integer, String> pacientePseudoMap = todosPacientes.stream()
                .collect(Collectors.toMap(Paciente::getIdPaciente,
                        p -> String.format("PAC-%04d", p.getIdPaciente()), (a, b) -> a));
        Map<Integer, String> protocoloCodigoMap = todosPacientes.stream()
                .collect(Collectors.toMap(Paciente::getIdPaciente,
                        p -> p.getProtocolo().getCodigo(), (a, b) -> a));

        List<EventoAdverso> todosEventos = eventoRepo.findActivosOrdenados();
        List<EventoAdverso> eventosFiltrados = todosEventos.stream()
                .filter(e -> fechaDesde == null || !e.getFechaReporte().isBefore(fechaDesde))
                .filter(e -> fechaHasta == null || !e.getFechaReporte().isAfter(fechaHasta))
                .filter(e -> idCentro == null ||
                        idCentro.equals(pacienteCentroMap.get(e.getIdPaciente())))
                .toList();

        long totalEventos = (fechaDesde == null && fechaHasta == null && idCentro == null)
                ? todosEventos.size()
                : eventosFiltrados.size();

        long totalConsentimientos = consentimientoRepo.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActivo())).count();

        /* ── Severidades ─────────────────────────────────────────── */
        Map<String, Long> porSeveridad = eventosFiltrados.stream()
                .collect(Collectors.groupingBy(e -> e.getSeveridad().getNivel(), Collectors.counting()));
        List<ResumenComiteDto.SeveridadItem> severidadItems = eventosFiltrados.stream()
                .map(EventoAdverso::getSeveridad)
                .distinct()
                .sorted(Comparator.comparing(CatSeveridad::getOrden))
                .map(s -> ResumenComiteDto.SeveridadItem.builder()
                        .nivel(s.getNivel())
                        .total(porSeveridad.getOrDefault(s.getNivel(), 0L))
                        .orden(s.getOrden())
                        .build())
                .toList();

        /* ── Eventos por protocolo ───────────────────────────────── */
        Map<String, Long> evPorProtocolo = eventosFiltrados.stream()
                .collect(Collectors.groupingBy(
                        e -> protocoloCodigoMap.getOrDefault(e.getIdPaciente(), "?"),
                        Collectors.counting()));
        List<ResumenComiteDto.ProtocoloItem> eventosPorProtocolo = evPorProtocolo.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(en -> ResumenComiteDto.ProtocoloItem.builder()
                        .codigo(en.getKey()).titulo(en.getKey()).total(en.getValue()).build())
                .toList();

        /* ── Lista completa filtrada ─────────────────────────────── */
        List<ResumenComiteDto.EventoItem> listaEventos = eventosFiltrados.stream()
                .map(e -> ResumenComiteDto.EventoItem.builder()
                        .pseudonimo(pacientePseudoMap.getOrDefault(e.getIdPaciente(),
                                String.format("PAC-%04d", e.getIdPaciente())))
                        .severidad(e.getSeveridad().getNivel())
                        .protocolo(protocoloCodigoMap.getOrDefault(e.getIdPaciente(), "—"))
                        .fechaReporte(e.getFechaReporte())
                        .descripcion(truncar(e.getDescripcion(), 100))
                        .build())
                .toList();

        /* ── Pacientes por protocolo ─────────────────────────────── */
        Map<Integer, Long> conteoXProtocolo = todosPacientes.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .collect(Collectors.groupingBy(
                        p -> p.getProtocolo().getIdProtocolo(), Collectors.counting()));
        List<ResumenComiteDto.ProtocoloItem> protocoloItems = conteoXProtocolo.entrySet().stream()
                .map(entry -> {
                    Protocolo pr = protocoloRepository.findById(entry.getKey()).orElse(null);
                    if (pr == null) return null;
                    return ResumenComiteDto.ProtocoloItem.builder()
                            .codigo(pr.getCodigo()).titulo(pr.getTitulo()).total(entry.getValue()).build();
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingLong(ResumenComiteDto.ProtocoloItem::getTotal).reversed())
                .toList();

        /* ── Progreso por centro ─────────────────────────────────── */
        List<ResumenComiteDto.CentroProtocoloItem> progresoPorCentro = todosPacientes.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .collect(Collectors.groupingBy(
                        p -> p.getCentro().getNombre() + "|||" + p.getProtocolo().getIdProtocolo()))
                .entrySet().stream()
                .map(entry -> {
                    List<Paciente> grupo = entry.getValue();
                    Paciente rep = grupo.get(0);
                    Protocolo pr = rep.getProtocolo();
                    int meta = pr.getMetaPacientes() != null ? pr.getMetaPacientes() : 0;
                    int activos = grupo.size();
                    int pct = meta > 0 ? Math.min(100, (int) Math.round((double) activos / meta * 100)) : 0;
                    return ResumenComiteDto.CentroProtocoloItem.builder()
                            .centro(rep.getCentro().getNombre())
                            .codigoProtocolo(pr.getCodigo())
                            .tituloProtocolo(pr.getTitulo())
                            .activos(activos)
                            .meta(meta)
                            .porcentaje(pct)
                            .build();
                })
                .sorted(Comparator.comparing(ResumenComiteDto.CentroProtocoloItem::getCentro))
                .toList();

        /* ── Análisis demográfico ────────────────────────────────── */
        ResumenComiteDto.DemograficoData demografico = buildDemografico(todosPacientes);

        return ResumenComiteDto.builder()
                .totalPacientesActivos((int) activosPacientes)
                .totalEventosAdversos((int) totalEventos)
                .totalConsentimientos((int) totalConsentimientos)
                .eventosPorSeveridad(severidadItems)
                .eventos(listaEventos)
                .eventosPorProtocolo(eventosPorProtocolo)
                .pacientesPorProtocolo(protocoloItems)
                .progresoPorCentro(progresoPorCentro)
                .centrosDisponibles(centrosDisponibles)
                .demografico(demografico)
                .build();
    }

    /* ════════════════════════════════════════════════════════════════
       MÉDICO
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public ResumenMedicoDto getResumenMedico(UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        if (!medico.getRol().getNombre().contains("Médico") &&
            !medico.getRol().getNombre().contains("Medico")) {
            throw new AccessDeniedException("Solo el médico puede ver este reporte");
        }

        List<Paciente> misPacientes = pacienteRepository.findByMedico(medico.getIdUsuario());
        int totalPacientes   = misPacientes.size();
        int pacientesActivos = (int) misPacientes.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo())).count();

        List<Integer> idsPacientes = misPacientes.stream().map(Paciente::getIdPaciente).toList();
        List<Visita> todasVisitas = idsPacientes.stream()
                .flatMap(idP -> visitaRepository
                        .findByPacienteIdPacienteAndActivoTrueOrderByFechaProgramadaAsc(idP).stream())
                .toList();

        LocalDate hoy    = LocalDate.now();
        LocalDate finSem = hoy.plusDays(6);
        LocalDate en2sem = hoy.plusDays(14);

        int visitasEstaSemana = (int) todasVisitas.stream()
                .filter(v -> !v.getFechaProgramada().isBefore(hoy)
                          && !v.getFechaProgramada().isAfter(finSem))
                .count();
        int visitasPendientes = (int) todasVisitas.stream()
                .filter(v -> !v.getFechaProgramada().isBefore(hoy)
                          && !v.getFechaProgramada().isAfter(en2sem)
                          && "Programada".equalsIgnoreCase(v.getEstadoVisita().getNombre()))
                .count();

        /* Vencidas: fecha ya pasó y sigue en estado "Programada" */
        int visitasVencidasCount = (int) todasVisitas.stream()
                .filter(v -> v.getFechaProgramada().isBefore(hoy)
                          && "Programada".equalsIgnoreCase(v.getEstadoVisita().getNombre()))
                .count();

        /* Visitas por estado */
        Map<String, Long> estadoCount = todasVisitas.stream()
                .collect(Collectors.groupingBy(v -> v.getEstadoVisita().getNombre(), Collectors.counting()));
        List<ResumenMedicoDto.EstadoItem> visitasPorEstado = estadoCount.entrySet().stream()
                .map(e -> ResumenMedicoDto.EstadoItem.builder()
                        .estado(e.getKey()).total(e.getValue()).build())
                .sorted(Comparator.comparingLong(ResumenMedicoDto.EstadoItem::getTotal).reversed())
                .toList();

        Map<Integer, String> pseudonimoCache = new HashMap<>();
        misPacientes.forEach(p -> pseudonimoCache.put(
                p.getIdPaciente(), String.format("PAC-%04d", p.getIdPaciente())));

        /* Próximas visitas */
        List<ResumenMedicoDto.VisitaItem> proximasVisitas = todasVisitas.stream()
                .filter(v -> !v.getFechaProgramada().isBefore(hoy)
                          && "Programada".equalsIgnoreCase(v.getEstadoVisita().getNombre()))
                .sorted(Comparator.comparing(Visita::getFechaProgramada))
                .limit(8)
                .map(v -> toVisitaItem(v, pseudonimoCache))
                .toList();

        /* Lista de vencidas */
        List<ResumenMedicoDto.VisitaItem> visitasVencidas = todasVisitas.stream()
                .filter(v -> v.getFechaProgramada().isBefore(hoy)
                          && "Programada".equalsIgnoreCase(v.getEstadoVisita().getNombre()))
                .sorted(Comparator.comparing(Visita::getFechaProgramada))
                .map(v -> toVisitaItem(v, pseudonimoCache))
                .toList();

        /* Adherencia por paciente */
        List<ResumenMedicoDto.AdherenciaItem> adherencia = misPacientes.stream()
                .map(p -> calcularAdherencia(p, pseudonimoCache))
                .sorted(Comparator.comparingInt(ResumenMedicoDto.AdherenciaItem::getPorcentaje))
                .toList();

        return ResumenMedicoDto.builder()
                .totalPacientes(totalPacientes)
                .pacientesActivos(pacientesActivos)
                .visitasEstaSemana(visitasEstaSemana)
                .visitasPendientes(visitasPendientes)
                .visitasVencidasCount(visitasVencidasCount)
                .visitasPorEstado(visitasPorEstado)
                .proximasVisitas(proximasVisitas)
                .visitasVencidas(visitasVencidas)
                .adherenciaPacientes(adherencia)
                .build();
    }

    /* ════════════════════════════════════════════════════════════════
       COORDINADOR
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public ResumenCoordinadorDto getResumenCoordinador(UserDetails userDetails) {
        Usuario coord = resolverUsuario(userDetails);
        if (!coord.getRol().getNombre().contains("Coordinador")) {
            throw new AccessDeniedException("Solo el coordinador puede ver este reporte");
        }

        List<Postulacion> misPostulaciones = postulacionRepository
                .findByCoordinadorConDetalle(coord.getIdUsuario());

        int total      = misPostulaciones.size();
        int enEspera   = (int) misPostulaciones.stream()
                .filter(p -> "En Espera".equalsIgnoreCase(p.getEstado().getNombre())).count();
        int aprobados  = (int) misPostulaciones.stream()
                .filter(p -> "Aprobado".equalsIgnoreCase(p.getEstado().getNombre())).count();
        int rechazados = (int) misPostulaciones.stream()
                .filter(p -> "Rechazado".equalsIgnoreCase(p.getEstado().getNombre())).count();
        int tasaAprobacion = total > 0 ? Math.round((float) aprobados / total * 100) : 0;

        /* Por protocolo */
        Map<Integer, List<Postulacion>> porProt = misPostulaciones.stream()
                .collect(Collectors.groupingBy(p -> p.getProtocolo().getIdProtocolo()));
        List<ResumenCoordinadorDto.ProtocoloItem> protItems = porProt.entrySet().stream()
                .map(entry -> {
                    Protocolo pr = entry.getValue().get(0).getProtocolo();
                    List<Postulacion> ps = entry.getValue();
                    long pAprobados  = ps.stream().filter(p -> "Aprobado".equalsIgnoreCase(p.getEstado().getNombre())).count();
                    long pRechazados = ps.stream().filter(p -> "Rechazado".equalsIgnoreCase(p.getEstado().getNombre())).count();
                    long pEspera     = ps.stream().filter(p -> "En Espera".equalsIgnoreCase(p.getEstado().getNombre())).count();
                    int meta         = pr.getMetaPacientes() != null ? pr.getMetaPacientes() : 0;
                    int pctLlenado   = meta > 0 ? Math.min(100, (int) Math.round((double) pAprobados / meta * 100)) : 0;
                    return ResumenCoordinadorDto.ProtocoloItem.builder()
                            .codigo(pr.getCodigo()).titulo(pr.getTitulo())
                            .total((long) ps.size())
                            .aprobados(pAprobados).rechazados(pRechazados).enEspera(pEspera)
                            .meta(meta).porcentajeLlenado(pctLlenado)
                            .build();
                })
                .sorted(Comparator.comparingLong(ResumenCoordinadorDto.ProtocoloItem::getTotal).reversed())
                .toList();

        /* Por centro */
        Map<String, List<Postulacion>> porCentroMap = misPostulaciones.stream()
                .collect(Collectors.groupingBy(p -> p.getCandidato().getCentro().getNombre()));
        List<ResumenCoordinadorDto.CentroItem> centroItems = porCentroMap.entrySet().stream()
                .map(entry -> {
                    List<Postulacion> ps = entry.getValue();
                    long pAprobados = ps.stream().filter(p -> "Aprobado".equalsIgnoreCase(p.getEstado().getNombre())).count();
                    /* meta = suma de metas de los protocolos con postulaciones en este centro */
                    int meta = ps.stream()
                            .map(p -> p.getProtocolo().getIdProtocolo())
                            .distinct()
                            .mapToInt(id -> {
                                Protocolo pr = protocoloRepository.findById(id).orElse(null);
                                return pr != null && pr.getMetaPacientes() != null ? pr.getMetaPacientes() : 0;
                            }).sum();
                    int pct = meta > 0 ? Math.min(100, (int) Math.round((double) pAprobados / meta * 100)) : 0;
                    return ResumenCoordinadorDto.CentroItem.builder()
                            .centro(entry.getKey())
                            .total((long) ps.size())
                            .aprobados(pAprobados)
                            .meta(meta)
                            .porcentajeLlenado(pct)
                            .build();
                })
                .sorted(Comparator.comparing(ResumenCoordinadorDto.CentroItem::getCentro))
                .toList();

        return ResumenCoordinadorDto.builder()
                .totalCandidatos(total)
                .enEspera(enEspera)
                .aprobados(aprobados)
                .rechazados(rechazados)
                .tasaAprobacion(tasaAprobacion)
                .porProtocolo(protItems)
                .porCentro(centroItems)
                .build();
    }

    /* ════════════════════════════════════════════════════════════════
       HELPERS PRIVADOS
    ════════════════════════════════════════════════════════════════ */

    private ResumenComiteDto.DemograficoData buildDemografico(List<Paciente> pacientes) {
        int total = pacientes.size();
        if (total == 0) {
            return ResumenComiteDto.DemograficoData.builder()
                    .totalPacientes(0)
                    .distribucionEdad(List.of())
                    .distribucionGenero(List.of())
                    .topComorbilidades(List.of())
                    .build();
        }

        LocalDate hoy = LocalDate.now();

        /* Distribución por edad */
        Map<String, Long> edadMap = new LinkedHashMap<>();
        edadMap.put("< 30", 0L);
        edadMap.put("30–39", 0L);
        edadMap.put("40–49", 0L);
        edadMap.put("50–59", 0L);
        edadMap.put("≥ 60", 0L);

        for (Paciente p : pacientes) {
            LocalDate fn = p.getCandidato().getFechaNacimiento();
            if (fn == null) continue;
            int edad = Period.between(fn, hoy).getYears();
            String rango = edad < 30 ? "< 30"
                    : edad < 40 ? "30–39"
                    : edad < 50 ? "40–49"
                    : edad < 60 ? "50–59"
                    : "≥ 60";
            edadMap.merge(rango, 1L, Long::sum);
        }

        List<ResumenComiteDto.RangoEdadItem> distribucionEdad = edadMap.entrySet().stream()
                .map(e -> ResumenComiteDto.RangoEdadItem.builder()
                        .rango(e.getKey()).total(e.getValue())
                        .porcentaje(total > 0 ? (int) Math.round((double) e.getValue() / total * 100) : 0)
                        .build())
                .toList();

        /* Distribución por género */
        Map<String, Long> generoMap = pacientes.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getCandidato().getGenero().getNombre(), Collectors.counting()));
        List<ResumenComiteDto.GeneroItem> distribucionGenero = generoMap.entrySet().stream()
                .map(e -> ResumenComiteDto.GeneroItem.builder()
                        .genero(e.getKey()).total(e.getValue())
                        .porcentaje(total > 0 ? (int) Math.round((double) e.getValue() / total * 100) : 0)
                        .build())
                .sorted(Comparator.comparingLong(ResumenComiteDto.GeneroItem::getTotal).reversed())
                .toList();

        /* Top 5 comorbilidades (antecedentes más frecuentes, primeras 60 chars) */
        List<Integer> idsPacientes = pacientes.stream().map(Paciente::getIdPaciente).toList();
        Map<String, Long> comorbMap = new HashMap<>();
        for (Integer idP : idsPacientes) {
            antecedenteRepo.findByPacienteIdPacienteAndActivoTrueOrderByFechaRegistroDesc(idP)
                    .forEach(a -> {
                        String key = truncar(a.getDescripcion(), 60);
                        comorbMap.merge(key, 1L, Long::sum);
                    });
        }
        List<ResumenComiteDto.ComorbididadItem> topComorbilidades = comorbMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> ResumenComiteDto.ComorbididadItem.builder()
                        .descripcion(e.getKey()).total(e.getValue()).build())
                .toList();

        return ResumenComiteDto.DemograficoData.builder()
                .totalPacientes(total)
                .distribucionEdad(distribucionEdad)
                .distribucionGenero(distribucionGenero)
                .topComorbilidades(topComorbilidades)
                .build();
    }

    private ResumenMedicoDto.AdherenciaItem calcularAdherencia(Paciente p,
                                                               Map<Integer, String> pseudoCache) {
        List<Visita> visitas = visitaRepository
                .findByPacienteIdPacienteAndActivoTrueOrderByFechaProgramadaAsc(p.getIdPaciente());

        int planificadas   = 0;
        int administradas  = 0;

        for (Visita v : visitas) {
            int plan = medProtocoloRepo
                    .findByVisitaProtocoloIdVisitaProtocoloAndActivoTrue(
                            v.getVisitaProtocolo().getIdVisitaProtocolo())
                    .size();
            int admin = adminMedRepo
                    .findByVisitaIdVisitaAndActivoTrueOrderByFechaHoraDesc(v.getIdVisita())
                    .size();
            planificadas  += plan;
            administradas += admin;
        }

        int pct = planificadas > 0
                ? Math.min(100, (int) Math.round((double) administradas / planificadas * 100))
                : 0;

        return ResumenMedicoDto.AdherenciaItem.builder()
                .pseudonimo(pseudoCache.getOrDefault(p.getIdPaciente(),
                        String.format("PAC-%04d", p.getIdPaciente())))
                .planificadas(planificadas)
                .administradas(administradas)
                .porcentaje(pct)
                .build();
    }

    private ResumenMedicoDto.VisitaItem toVisitaItem(Visita v, Map<Integer, String> pseudoCache) {
        return ResumenMedicoDto.VisitaItem.builder()
                .pseudonimo(pseudoCache.getOrDefault(
                        v.getPaciente().getIdPaciente(),
                        String.format("PAC-%04d", v.getPaciente().getIdPaciente())))
                .nombreVisita(v.getVisitaProtocolo().getNombreVisita())
                .fechaProgramada(v.getFechaProgramada())
                .estado(v.getEstadoVisita().getNombre())
                .semana(v.getVisitaProtocolo().getSemana())
                .build();
    }

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

    private String truncar(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }
}
