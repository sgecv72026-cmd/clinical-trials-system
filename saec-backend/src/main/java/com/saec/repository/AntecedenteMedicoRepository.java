package com.saec.repository;

import com.saec.entity.AntecedenteMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AntecedenteMedicoRepository extends JpaRepository<AntecedenteMedico, Integer> {
    List<AntecedenteMedico> findByPacienteIdPacienteAndActivoTrueOrderByFechaRegistroDesc(Integer idPaciente);
}
