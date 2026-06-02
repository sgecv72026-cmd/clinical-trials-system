package com.saec.repository;

import com.saec.entity.Visita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitaRepository extends JpaRepository<Visita, Integer> {
    List<Visita> findByPacienteIdPacienteAndActivoTrueOrderByFechaProgramadaAsc(Integer idPaciente);
}
