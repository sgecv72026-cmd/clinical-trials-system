package com.saec.service.admin;

import com.saec.dto.admin.DashboardStatsDto;
import com.saec.repository.CentroInvestigacionRepository;
import com.saec.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardService {

    private final UsuarioRepository           usuarioRepository;
    private final CentroInvestigacionRepository centroRepository;
    private final JdbcTemplate                jdbcTemplate;

    @Transactional(readOnly = true)
    public DashboardStatsDto obtenerStats() {
        long totalUsuarios         = usuarioRepository.count();
        long usuariosActivos       = usuarioRepository.countByActivoTrue();
        long centrosOperativos     = centroRepository.countByActivoTrue();
        long totalCentros          = centroRepository.count();

        long totalProtocolos       = countSafe("SELECT COUNT(*) FROM protocolo");
        long pacientesActivos      = countSafe("SELECT COUNT(*) FROM paciente WHERE activo = true");
        long postulacionesPendientes = countSafe(
            "SELECT COUNT(*) FROM postulacion p " +
            "JOIN cat_estado_postulacion e ON p.id_estado = e.id_estado " +
            "WHERE e.nombre IN ('Pendiente', 'En evaluación')"
        );
        long eventosAdversos       = countSafe("SELECT COUNT(*) FROM evento_adverso WHERE activo = true");

        return DashboardStatsDto.builder()
                .totalUsuarios(totalUsuarios)
                .usuariosActivos(usuariosActivos)
                .totalProtocolos(totalProtocolos)
                .pacientesActivos(pacientesActivos)
                .postulacionesPendientes(postulacionesPendientes)
                .eventosAdversos(eventosAdversos)
                .centrosOperativos(centrosOperativos)
                .totalCentros(totalCentros)
                .build();
    }

    private long countSafe(String sql) {
        try {
            Long result = jdbcTemplate.queryForObject(sql, Long.class);
            return result != null ? result : 0L;
        } catch (Exception e) {
            log.warn("No se pudo ejecutar conteo SQL: {}", e.getMessage());
            return 0L;
        }
    }
}
