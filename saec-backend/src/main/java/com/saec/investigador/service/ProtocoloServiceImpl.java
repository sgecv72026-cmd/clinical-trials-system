package com.saec.investigador.service;

import com.saec.dto.admin.PageResponseDto;
import com.saec.dto.investigador.*;
import com.saec.entity.*;
import com.saec.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProtocoloServiceImpl implements ProtocoloService {

    private final UsuarioRepository             usuarioRepository;
    private final ProtocoloRepository           protocoloRepository;
    private final CriterioProtocoloRepository   criterioRepository;
    private final VisitaProtocoloRepository     visitaRepository;
    private final MedicamentoProtocoloRepository medProtocoloRepository;
    private final CatEstadoProtocoloRepository  estadoRepository;
    private final CatFaseClinicaRepository      faseRepository;
    private final CatMedicamentoRepository      medicamentoRepository;
    private final CatUnidadDosisRepository      unidadDosisRepository;

    /* ─── Estadísticas ──────────────────────────────────────────── */

    @Override
    @Transactional(readOnly = true)
    public ProtocoloStatsDto obtenerStats(UserDetails userDetails) {
        Integer id = resolverInvestigador(userDetails);
        return ProtocoloStatsDto.builder()
                .total(protocoloRepository.countByInvestigador(id))
                .activos(protocoloRepository.countByInvestigadorAndEstado(id, "activo"))
                .finalizados(protocoloRepository.countByInvestigadorAndEstado(id, "cerrado")
                           + protocoloRepository.countByInvestigadorAndEstado(id, "analisis"))
                .build();
    }

    /* ─── Listar protocolos ─────────────────────────────────────── */

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<ProtocoloResumenDto> listar(Integer idEstado, String search, int page, int size, UserDetails userDetails) {
        Integer id = resolverInvestigador(userDetails);
        String  safeSearch = (search != null && search.isBlank()) ? null : search;
        PageRequest pageable = PageRequest.of(page, size);
        Page<Protocolo> resultado = protocoloRepository.buscarPorInvestigador(id, idEstado, safeSearch, pageable);
        return PageResponseDto.from(resultado, this::toResumenDto);
    }

    /* ─── Crear protocolo (una transacción) ─────────────────────── */

    @Override
    @Transactional
    public ProtocoloDetalleDto crear(ProtocoloCreateRequest request, UserDetails userDetails) {
        Integer idInvestigador = resolverInvestigador(userDetails);

        String codigoTrimmed = request.getCodigo().trim();
        if (protocoloRepository.existsByCodigo(codigoTrimmed)) {
            throw new IllegalArgumentException(
                    "Ya existe un protocolo con el código \"" + codigoTrimmed + "\".");
        }

        CatFaseClinical fase = faseRepository.findById(request.getIdFase())
                .orElseThrow(() -> new EntityNotFoundException("Fase clínica no encontrada: " + request.getIdFase()));
        CatEstadoProtocolo estado = estadoRepository.findById(request.getIdEstadoProtocolo())
                .orElseThrow(() -> new EntityNotFoundException("Estado de protocolo no encontrado: " + request.getIdEstadoProtocolo()));

        Protocolo protocolo = new Protocolo();
        protocolo.setIdInvestigador(idInvestigador);
        protocolo.setFase(fase);
        protocolo.setEstadoProtocolo(estado);
        protocolo.setCodigo(codigoTrimmed);
        protocolo.setTitulo(request.getTitulo().trim());
        protocolo.setObjetivos(request.getObjetivos());
        protocolo.setFechaInicio(request.getFechaInicio());
        protocolo.setFechaFinEstimada(request.getFechaFinEstimada());
        protocolo.setMetaPacientes(request.getMetaPacientes());
        protocolo.setCreatedAt(LocalDateTime.now());
        protocoloRepository.save(protocolo);

        guardarCriterios(protocolo, request.getCriterios());
        List<VisitaProtocolo> visitasGuardadas = guardarVisitas(protocolo, request.getVisitas());

        log.info("Protocolo creado id={} por investigador id={}", protocolo.getIdProtocolo(), idInvestigador);

        return toDetalleDto(protocolo, visitasGuardadas);
    }

    /* ─── Obtener detalle ───────────────────────────────────────── */

    @Override
    @Transactional(readOnly = true)
    public ProtocoloDetalleDto obtenerPorId(Integer id, UserDetails userDetails) {
        Integer idInvestigador = resolverInvestigador(userDetails);
        Protocolo protocolo = protocoloRepository.findById(id)
                .filter(p -> p.getIdInvestigador().equals(idInvestigador))
                .orElseThrow(() -> new EntityNotFoundException("Protocolo no encontrado: " + id));
        List<VisitaProtocolo> visitas = visitaRepository
                .findByProtocoloIdProtocoloAndActivoTrueOrderBySemanaAscDiaAsc(id);
        return toDetalleDto(protocolo, visitas);
    }

    /* ─── Catálogos ─────────────────────────────────────────────── */

    @Override
    @Transactional(readOnly = true)
    public List<CatItemDto> listarFases() {
        return faseRepository.findByActivoTrueOrderByNombre()
                .stream().map(f -> CatItemDto.builder().id(f.getIdFase()).nombre(f.getNombre()).build()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatItemDto> listarEstados() {
        return estadoRepository.findByActivoTrueOrderByNombre()
                .stream().map(e -> CatItemDto.builder().id(e.getIdEstadoProtocolo()).nombre(e.getNombre()).build()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatItemDto> listarMedicamentosCatalogo() {
        return medicamentoRepository.findByActivoTrueOrderByNombre()
                .stream().map(m -> CatItemDto.builder().id(m.getIdMedicamento()).nombre(m.getNombre()).build()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatItemDto> listarUnidadesDosis() {
        return unidadDosisRepository.findByActivoTrueOrderByNombre()
                .stream().map(u -> CatItemDto.builder().id(u.getIdUnidadDosis()).nombre(u.getNombre()).build()).toList();
    }

    @Override
    @Transactional
    public CatItemDto crearMedicamento(CrearMedicamentoRequest request) {
        String nombre = request.getNombre().trim();
        if (medicamentoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new IllegalArgumentException(
                    "Ya existe un medicamento con el nombre \"" + nombre + "\" en el catálogo.");
        }
        CatMedicamento med = new CatMedicamento();
        med.setNombre(nombre);
        med.setDescripcion(request.getDescripcion());
        med.setActivo(true);
        medicamentoRepository.save(med);
        log.info("Medicamento creado: id={} nombre={}", med.getIdMedicamento(), med.getNombre());
        return CatItemDto.builder().id(med.getIdMedicamento()).nombre(med.getNombre()).descripcion(med.getDescripcion()).build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<CatItemDto> listarMedicamentosInvestigador(String search, int page, int size, UserDetails userDetails) {
        Integer idInvestigador = resolverInvestigador(userDetails);
        String  safeSearch = (search != null && search.isBlank()) ? null : search;
        PageRequest pageable = PageRequest.of(page, size);   // el ORDER BY ya viene en la query
        Page<CatMedicamento> resultado = medicamentoRepository.findByInvestigadorAndSearch(idInvestigador, safeSearch, pageable);
        return PageResponseDto.from(resultado, m -> CatItemDto.builder().id(m.getIdMedicamento()).nombre(m.getNombre()).descripcion(m.getDescripcion()).build());
    }

    @Override
    @Transactional
    public ProtocoloDetalleDto actualizar(Integer id, ProtocoloUpdateRequest request, UserDetails userDetails) {
        Integer idInvestigador = resolverInvestigador(userDetails);
        Protocolo protocolo = protocoloRepository.findById(id)
                .filter(p -> p.getIdInvestigador().equals(idInvestigador))
                .orElseThrow(() -> new EntityNotFoundException("Protocolo no encontrado: " + id));

        CatEstadoProtocolo estado = estadoRepository.findById(request.getIdEstadoProtocolo())
                .orElseThrow(() -> new EntityNotFoundException("Estado no encontrado: " + request.getIdEstadoProtocolo()));

        // Solo se actualiza lo que NO compromete la integridad histórica
        protocolo.setTitulo(request.getTitulo().trim());
        protocolo.setObjetivos(request.getObjetivos());
        protocolo.setEstadoProtocolo(estado);
        protocolo.setFechaFinEstimada(request.getFechaFinEstimada());
        protocolo.setMetaPacientes(request.getMetaPacientes());
        // código, fase, fechaInicio, criterios y visitas NO se modifican aquí

        protocoloRepository.save(protocolo);
        log.info("Protocolo actualizado id={} por investigador id={}", id, idInvestigador);

        List<VisitaProtocolo> visitas = visitaRepository
                .findByProtocoloIdProtocoloAndActivoTrueOrderBySemanaAscDiaAsc(id);
        return toDetalleDto(protocolo, visitas);
    }

    /* ─── Helpers privados ──────────────────────────────────────── */

    private Integer resolverInvestigador(UserDetails userDetails) {
        return usuarioRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"))
                .getIdUsuario();
    }

    private void guardarCriterios(Protocolo protocolo, List<CriterioRequest> criterios) {
        if (CollectionUtils.isEmpty(criterios)) return;
        for (CriterioRequest cr : criterios) {
            CriterioProtocolo criterio = new CriterioProtocolo();
            criterio.setProtocolo(protocolo);
            criterio.setTipo(cr.getTipo());
            criterio.setDescripcion(cr.getDescripcion());
            criterio.setActivo(true);
            criterioRepository.save(criterio);
        }
    }

    private List<VisitaProtocolo> guardarVisitas(Protocolo protocolo, List<VisitaRequest> visitas) {
        if (CollectionUtils.isEmpty(visitas)) return Collections.emptyList();
        return visitas.stream().map(vr -> {
            VisitaProtocolo visita = new VisitaProtocolo();
            visita.setProtocolo(protocolo);
            visita.setSemana(vr.getSemana());
            visita.setDia(vr.getDia());
            visita.setNombreVisita(vr.getNombreVisita());
            visita.setDescripcion(vr.getDescripcion());
            visita.setActivo(true);
            visitaRepository.save(visita);
            guardarMedicamentos(protocolo, visita, vr.getMedicamentos());
            return visita;
        }).toList();
    }

    private void guardarMedicamentos(Protocolo protocolo, VisitaProtocolo visita, List<MedicamentoRequest> medicamentos) {
        if (CollectionUtils.isEmpty(medicamentos)) return;
        for (MedicamentoRequest mr : medicamentos) {
            CatMedicamento med = medicamentoRepository.findById(mr.getIdMedicamento())
                    .orElseThrow(() -> new EntityNotFoundException("Medicamento no encontrado: " + mr.getIdMedicamento()));
            CatUnidadDosis unidad = unidadDosisRepository.findById(mr.getIdUnidadDosis())
                    .orElseThrow(() -> new EntityNotFoundException("Unidad de dosis no encontrada: " + mr.getIdUnidadDosis()));
            MedicamentoProtocolo mp = new MedicamentoProtocolo();
            mp.setProtocolo(protocolo);
            mp.setVisitaProtocolo(visita);
            mp.setMedicamento(med);
            mp.setDosis(mr.getDosis());
            mp.setUnidadDosis(unidad);
            mp.setFrecuencia(mr.getFrecuencia());
            mp.setActivo(true);
            medProtocoloRepository.save(mp);
        }
    }

    private ProtocoloResumenDto toResumenDto(Protocolo p) {
        return ProtocoloResumenDto.builder()
                .idProtocolo(p.getIdProtocolo())
                .codigo(p.getCodigo())
                .titulo(p.getTitulo())
                .fase(p.getFase().getNombre())
                .estado(p.getEstadoProtocolo().getNombre())
                .fechaInicio(p.getFechaInicio())
                .fechaFinEstimada(p.getFechaFinEstimada())
                .metaPacientes(p.getMetaPacientes())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private ProtocoloDetalleDto toDetalleDto(Protocolo p, List<VisitaProtocolo> visitas) {
        List<CriterioDto> criteriosDto = criterioRepository
                .findByProtocoloIdProtocoloAndActivoTrue(p.getIdProtocolo())
                .stream()
                .map(c -> CriterioDto.builder()
                        .idCriterio(c.getIdCriterio())
                        .tipo(c.getTipo())
                        .descripcion(c.getDescripcion())
                        .build())
                .toList();

        List<VisitaDto> visitasDto = visitas.stream().map(v -> {
            List<MedicamentoProtocoloDto> medsDto = medProtocoloRepository
                    .findByVisitaProtocoloIdVisitaProtocoloAndActivoTrue(v.getIdVisitaProtocolo())
                    .stream()
                    .map(mp -> MedicamentoProtocoloDto.builder()
                            .idMedProtocolo(mp.getIdMedProtocolo())
                            .nombreMedicamento(mp.getMedicamento().getNombre())
                            .dosis(mp.getDosis())
                            .unidadDosis(mp.getUnidadDosis().getNombre())
                            .frecuencia(mp.getFrecuencia())
                            .build())
                    .toList();
            return VisitaDto.builder()
                    .idVisitaProtocolo(v.getIdVisitaProtocolo())
                    .semana(v.getSemana())
                    .dia(v.getDia())
                    .nombreVisita(v.getNombreVisita())
                    .descripcion(v.getDescripcion())
                    .medicamentos(medsDto)
                    .build();
        }).toList();

        return ProtocoloDetalleDto.builder()
                .idProtocolo(p.getIdProtocolo())
                .codigo(p.getCodigo())
                .titulo(p.getTitulo())
                .objetivos(p.getObjetivos())
                .idFase(p.getFase().getIdFase())
                .fase(p.getFase().getNombre())
                .idEstadoProtocolo(p.getEstadoProtocolo().getIdEstadoProtocolo())
                .estado(p.getEstadoProtocolo().getNombre())
                .fechaInicio(p.getFechaInicio())
                .fechaFinEstimada(p.getFechaFinEstimada())
                .metaPacientes(p.getMetaPacientes())
                .createdAt(p.getCreatedAt())
                .criterios(criteriosDto)
                .visitas(visitasDto)
                .build();
    }
}
