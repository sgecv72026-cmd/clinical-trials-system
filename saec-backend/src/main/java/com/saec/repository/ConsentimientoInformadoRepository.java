package com.saec.repository;

import com.saec.entity.ConsentimientoInformado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsentimientoInformadoRepository extends JpaRepository<ConsentimientoInformado, Integer> {
    Optional<ConsentimientoInformado> findByPacienteIdPacienteAndActivoTrue(Integer idPaciente);
    boolean existsByPacienteIdPacienteAndActivoTrue(Integer idPaciente);
}
