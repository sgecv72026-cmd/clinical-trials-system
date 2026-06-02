package com.saec.repository;

import com.saec.entity.EvolucionMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvolucionMedicaRepository extends JpaRepository<EvolucionMedica, Integer> {
    Optional<EvolucionMedica> findByVisitaIdVisitaAndActivoTrue(Integer idVisita);
}
