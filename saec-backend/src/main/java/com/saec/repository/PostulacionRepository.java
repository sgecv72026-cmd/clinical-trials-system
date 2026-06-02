package com.saec.repository;

import com.saec.entity.Postulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostulacionRepository extends JpaRepository<Postulacion, Integer> {

    /* Coordinador: sus candidatos */
    @Query("""
        SELECT p FROM Postulacion p
        JOIN FETCH p.candidato c
        JOIN FETCH c.centro ci
        JOIN FETCH c.genero g
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.estado e
        WHERE p.idCoordinador = :idCoordinador
        ORDER BY p.fechaPostulacion DESC
    """)
    List<Postulacion> findByCoordinadorConDetalle(@Param("idCoordinador") Integer idCoordinador);

    /* Investigador: postulaciones pendientes de sus protocolos */
    @Query("""
        SELECT p FROM Postulacion p
        JOIN FETCH p.candidato c
        JOIN FETCH c.centro ci
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.estado e
        WHERE pr.idInvestigador = :idInvestigador
          AND e.idEstado = :idEstado
        ORDER BY p.fechaPostulacion ASC
    """)
    List<Postulacion> findByInvestigadorYEstado(
            @Param("idInvestigador") Integer idInvestigador,
            @Param("idEstado") Integer idEstado);

    /* Investigador: historial completo (aceptados y rechazados) */
    @Query("""
        SELECT p FROM Postulacion p
        JOIN FETCH p.candidato c
        JOIN FETCH c.centro ci
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.estado e
        WHERE pr.idInvestigador = :idInvestigador
          AND e.idEstado <> :idEstadoEspera
        ORDER BY p.fechaDecision DESC NULLS LAST
    """)
    List<Postulacion> findHistorialByInvestigador(
            @Param("idInvestigador") Integer idInvestigador,
            @Param("idEstadoEspera") Integer idEstadoEspera);

    /* Médico: candidatos aceptados en su centro sin paciente activo */
    @Query("""
        SELECT p FROM Postulacion p
        JOIN FETCH p.candidato c
        JOIN FETCH c.centro ci
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.estado e
        WHERE c.centro.idCentro = :idCentro
          AND e.idEstado = :idEstadoAceptado
          AND NOT EXISTS (
            SELECT pac FROM Paciente pac
            WHERE pac.candidato.idCandidato = c.idCandidato
              AND pac.activo = true
          )
        ORDER BY p.fechaDecision DESC NULLS LAST
    """)
    List<Postulacion> findAceptadosPorCentroSinPacienteActivo(
            @Param("idCentro") Integer idCentro,
            @Param("idEstadoAceptado") Integer idEstadoAceptado);

    /* Carga completa de una postulación por ID (para toResumen después de aprobar/rechazar) */
    @Query("""
        SELECT p FROM Postulacion p
        JOIN FETCH p.candidato c
        JOIN FETCH c.centro ci
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.estado e
        WHERE p.idPostulacion = :idPostulacion
    """)
    Optional<Postulacion> findByIdConDetalle(@Param("idPostulacion") Integer idPostulacion);

    Optional<Postulacion> findByCandidatoIdCandidatoAndProtocoloIdProtocolo(
            Integer idCandidato, Integer idProtocolo);

    Optional<Postulacion> findByCandidatoIdCandidato(Integer idCandidato);
}
