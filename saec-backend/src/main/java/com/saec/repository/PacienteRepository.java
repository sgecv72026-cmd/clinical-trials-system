package com.saec.repository;

import com.saec.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {

    Optional<Paciente> findByCandidatoIdCandidato(Integer idCandidato);

    boolean existsByCandidatoIdCandidatoAndActivoTrue(Integer idCandidato);

    /* Médico: sus propios pacientes */
    @Query("""
        SELECT p FROM Paciente p
        JOIN FETCH p.candidato c
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.centro ce
        WHERE p.idMedico = :idMedico
        ORDER BY p.fechaIngreso DESC
    """)
    List<Paciente> findByMedico(@Param("idMedico") Integer idMedico);

    /* Investigador: pacientes de sus protocolos */
    @Query("""
        SELECT p FROM Paciente p
        JOIN FETCH p.candidato c
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.centro ce
        WHERE pr.idInvestigador = :idInvestigador
        ORDER BY p.fechaIngreso DESC
    """)
    List<Paciente> findByInvestigador(@Param("idInvestigador") Integer idInvestigador);

    /* Coordinador: todos los pacientes activos */
    @Query("""
        SELECT p FROM Paciente p
        JOIN FETCH p.candidato c
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.centro ce
        ORDER BY p.fechaIngreso DESC
    """)
    List<Paciente> findAllConDetalle();

    /* Reportes: todos los pacientes con genero incluido (para demografía) */
    @Query("""
        SELECT p FROM Paciente p
        JOIN FETCH p.candidato c
        JOIN FETCH c.genero g
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.centro ce
        ORDER BY p.fechaIngreso DESC
    """)
    List<Paciente> findAllConDetalleCompleto();

    /* Por id con detalle completo */
    @Query("""
        SELECT p FROM Paciente p
        JOIN FETCH p.candidato c
        JOIN FETCH c.genero g
        JOIN FETCH p.protocolo pr
        JOIN FETCH p.centro ce
        WHERE p.idPaciente = :id
    """)
    Optional<Paciente> findByIdConDetalle(@Param("id") Integer id);
}
