package com.saec.pacientes.service;

import com.saec.dto.pacientes.MedicacionHabitualDto;
import com.saec.dto.pacientes.MedicacionHabitualRequest;
import com.saec.dto.pacientes.PacienteDetalleDto;
import com.saec.dto.pacientes.PacienteResumenDto;
import com.saec.dto.reclutamiento.AntecedenteDto;
import com.saec.dto.reclutamiento.AntecedenteRequest;
import com.saec.dto.reclutamiento.ConsentimientoDto;
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

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PacientesServiceImpl {

    private final JdbcTemplate                      jdbcTemplate;
    private final UsuarioRepository                 usuarioRepository;
    private final PacienteRepository                pacienteRepository;
    private final AntecedenteMedicoRepository       antecedenteRepository;
    private final MedicacionHabitualRepository      medicacionRepository;
    private final ConsentimientoInformadoRepository consentimientoRepository;
    private final PostulacionRepository             postulacionRepository;

    /* ════════════════════════════════════════════════════════════════
       LISTADO POR ROL
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<PacienteResumenDto> listarPacientes(UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        String rol = usuario.getRol().getNombre();

        if (rol.contains("Médico") || rol.contains("Medico")) {
            return pacienteRepository.findByMedico(usuario.getIdUsuario())
                    .stream().map(this::toResumen).toList();
        }
        if (rol.contains("Investigador")) {
            return pacienteRepository.findByInvestigador(usuario.getIdUsuario())
                    .stream().map(this::toResumen).toList();
        }
        if (rol.contains("Coordinador")) {
            return pacienteRepository.findAllConDetalle()
                    .stream().map(this::toResumen).toList();
        }
        throw new AccessDeniedException("Rol sin acceso al módulo de pacientes: " + rol);
    }

    /* ════════════════════════════════════════════════════════════════
       DETALLE
    ════════════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public PacienteDetalleDto obtenerDetalle(Integer idPaciente, UserDetails userDetails) {
        Usuario usuario = resolverUsuario(userDetails);
        String rol = usuario.getRol().getNombre();

        if (rol.contains("Coordinador")) {
            throw new AccessDeniedException("El coordinador no tiene acceso a la ficha clínica");
        }

        Paciente paciente = pacienteRepository.findByIdConDetalle(idPaciente)
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado: " + idPaciente));

        validarAccesoMedico(paciente, usuario, rol);

        return toDetalle(paciente, usuario);
    }

    /* ════════════════════════════════════════════════════════════════
       ANTECEDENTES (solo médico)
    ════════════════════════════════════════════════════════════════ */

    @Transactional
    public AntecedenteDto agregarAntecedente(Integer idPaciente, AntecedenteRequest req,
                                             UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);

        Paciente paciente = pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado: " + idPaciente));

        if (!paciente.getIdMedico().equals(medico.getIdUsuario())) {
            throw new AccessDeniedException("Solo el médico asignado puede agregar antecedentes");
        }

        AntecedenteMedico ant = new AntecedenteMedico();
        ant.setPaciente(paciente);
        ant.setDescripcion(req.getDescripcion().trim());
        ant.setFechaDiagnostico(req.getFechaDiagnostico());
        ant.setRegistradoPor(medico.getIdUsuario());
        ant.setFechaRegistro(LocalDateTime.now());
        ant.setActivo(true);
        antecedenteRepository.save(ant);

        log.info("Antecedente agregado a paciente {} por médico {}", idPaciente, medico.getIdUsuario());
        return toAntecedenteDto(ant, medico.getNombre() + " " + medico.getApellido());
    }

    /* ════════════════════════════════════════════════════════════════
       MEDICACIÓN HABITUAL (solo médico)
    ════════════════════════════════════════════════════════════════ */

    @Transactional
    public MedicacionHabitualDto agregarMedicacion(Integer idPaciente, MedicacionHabitualRequest req,
                                                   UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);

        Paciente paciente = pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado: " + idPaciente));

        if (!paciente.getIdMedico().equals(medico.getIdUsuario())) {
            throw new AccessDeniedException("Solo el médico asignado puede agregar medicación habitual");
        }

        MedicacionHabitual med = new MedicacionHabitual();
        med.setPaciente(paciente);
        med.setNombreMedicamento(req.getNombreMedicamento().trim());
        med.setDosis(req.getDosis() != null ? req.getDosis().trim() : null);
        med.setFrecuencia(req.getFrecuencia() != null ? req.getFrecuencia().trim() : null);
        med.setRegistradoPor(medico.getIdUsuario());
        med.setFechaRegistro(LocalDateTime.now());
        med.setActivo(true);
        medicacionRepository.save(med);

        log.info("Medicación habitual agregada a paciente {} por médico {}", idPaciente, medico.getIdUsuario());
        return toMedicacionDto(med, medico.getNombre() + " " + medico.getApellido());
    }

    @Transactional
    public void desactivarMedicacion(Integer idMedicacion, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);

        MedicacionHabitual med = medicacionRepository.findById(idMedicacion)
                .orElseThrow(() -> new EntityNotFoundException("Medicación no encontrada: " + idMedicacion));

        if (!med.getPaciente().getIdMedico().equals(medico.getIdUsuario())) {
            throw new AccessDeniedException("Solo el médico asignado puede desactivar medicación habitual");
        }

        med.setActivo(false);
        medicacionRepository.save(med);
        log.info("Medicación {} desactivada por médico {}", idMedicacion, medico.getIdUsuario());
    }

    @Transactional
    public void desactivarAntecedente(Integer idAntecedente, UserDetails userDetails) {
        Usuario medico = resolverUsuario(userDetails);
        exigirRolMedico(medico);

        AntecedenteMedico ant = antecedenteRepository.findById(idAntecedente)
                .orElseThrow(() -> new EntityNotFoundException("Antecedente no encontrado: " + idAntecedente));

        if (!ant.getPaciente().getIdMedico().equals(medico.getIdUsuario())) {
            throw new AccessDeniedException("Solo el médico asignado puede desactivar antecedentes");
        }

        ant.setActivo(false);
        antecedenteRepository.save(ant);
        log.info("Antecedente {} desactivado por médico {}", idAntecedente, medico.getIdUsuario());
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
            log.warn("No se pudo establecer app.current_user_id para usuario {}: {}",
                    u.getIdUsuario(), e.getMessage());
        }
        return u;
    }

    private void exigirRolMedico(Usuario usuario) {
        String rol = usuario.getRol().getNombre();
        if (!rol.contains("Médico") && !rol.contains("Medico")) {
            throw new AccessDeniedException("Solo un médico puede realizar esta acción");
        }
    }

    private void validarAccesoMedico(Paciente paciente, Usuario usuario, String rol) {
        if ((rol.contains("Médico") || rol.contains("Medico"))
                && !paciente.getIdMedico().equals(usuario.getIdUsuario())) {
            throw new AccessDeniedException("No tienes acceso a este paciente");
        }
    }

    private String pseudonimo(Integer idPaciente) {
        return String.format("PAC-%04d", idPaciente);
    }

    private PacienteResumenDto toResumen(Paciente p) {
        String nombreMedico = usuarioRepository.findById(p.getIdMedico())
                .map(u -> u.getNombre() + " " + u.getApellido())
                .orElse("—");
        return PacienteResumenDto.builder()
                .idPaciente(p.getIdPaciente())
                .pseudonimo(pseudonimo(p.getIdPaciente()))
                .protocolo(p.getProtocolo().getTitulo())
                .codigoProtocolo(p.getProtocolo().getCodigo())
                .nombreMedico(nombreMedico)
                .nombreCentro(p.getCentro().getNombre())
                .fechaIngreso(p.getFechaIngreso())
                .activo(p.getActivo())
                .build();
    }

    private PacienteDetalleDto toDetalle(Paciente p, Usuario usuarioActual) {
        String nombreMedico = usuarioRepository.findById(p.getIdMedico())
                .map(u -> u.getNombre() + " " + u.getApellido())
                .orElse("—");

        List<AntecedenteDto> antecedentes = antecedenteRepository
                .findByPacienteIdPacienteAndActivoTrueOrderByFechaRegistroDesc(p.getIdPaciente())
                .stream()
                .map(a -> {
                    String nombreRegistro = usuarioRepository.findById(a.getRegistradoPor())
                            .map(u -> u.getNombre() + " " + u.getApellido())
                            .orElse("—");
                    return toAntecedenteDto(a, nombreRegistro);
                })
                .toList();

        List<MedicacionHabitualDto> medicaciones = medicacionRepository
                .findByPacienteIdPacienteAndActivoTrueOrderByFechaRegistroDesc(p.getIdPaciente())
                .stream()
                .map(m -> {
                    String nombreRegistro = usuarioRepository.findById(m.getRegistradoPor())
                            .map(u -> u.getNombre() + " " + u.getApellido())
                            .orElse("—");
                    return toMedicacionDto(m, nombreRegistro);
                })
                .toList();

        ConsentimientoDto consentimiento = consentimientoRepository
                .findByPacienteIdPacienteAndActivoTrue(p.getIdPaciente())
                .map(c -> ConsentimientoDto.builder()
                        .idConsentimiento(c.getIdConsentimiento())
                        .fechaFirma(c.getFechaFirma())
                        .versionDocumento(c.getVersionDocumento())
                        .rutaArchivoPdf(c.getRutaArchivoPdf())
                        .observaciones(c.getObservaciones())
                        .activo(c.getActivo())
                        .build())
                .orElse(null);

        Integer idPostulacion = postulacionRepository
                .findByCandidatoIdCandidato(p.getCandidato().getIdCandidato())
                .map(Postulacion::getIdPostulacion)
                .orElse(null);

        Candidato c = p.getCandidato();
        return PacienteDetalleDto.builder()
                .idPaciente(p.getIdPaciente())
                .pseudonimo(pseudonimo(p.getIdPaciente()))
                .nombre(c.getNombre())
                .apellido(c.getApellido())
                .genero(c.getGenero().getNombre())
                .fechaNacimiento(c.getFechaNacimiento())
                .contacto(c.getContacto())
                .idProtocolo(p.getProtocolo().getIdProtocolo())
                .protocolo(p.getProtocolo().getTitulo())
                .codigoProtocolo(p.getProtocolo().getCodigo())
                .nombreMedico(nombreMedico)
                .nombreCentro(p.getCentro().getNombre())
                .fechaIngreso(p.getFechaIngreso())
                .activo(p.getActivo())
                .createdAt(p.getCreatedAt())
                .antecedentes(antecedentes)
                .medicacionHabitual(medicaciones)
                .consentimiento(consentimiento)
                .idPostulacion(idPostulacion)
                .build();
    }

    private MedicacionHabitualDto toMedicacionDto(MedicacionHabitual m, String nombreRegistro) {
        return MedicacionHabitualDto.builder()
                .idMedicacion(m.getIdMedicacion())
                .nombreMedicamento(m.getNombreMedicamento())
                .dosis(m.getDosis())
                .frecuencia(m.getFrecuencia())
                .registradoPorNombre(nombreRegistro)
                .fechaRegistro(m.getFechaRegistro())
                .activo(m.getActivo())
                .build();
    }

    private AntecedenteDto toAntecedenteDto(AntecedenteMedico a, String nombreRegistro) {
        return AntecedenteDto.builder()
                .idAntecedente(a.getIdAntecedente())
                .descripcion(a.getDescripcion())
                .fechaDiagnostico(a.getFechaDiagnostico())
                .registradoPorNombre(nombreRegistro)
                .fechaRegistro(a.getFechaRegistro())
                .activo(a.getActivo())
                .build();
    }
}
