package com.saec.repository;

import com.saec.entity.CandidatoCriterio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatoCriterioRepository extends JpaRepository<CandidatoCriterio, Integer> {
    List<CandidatoCriterio> findByPostulacionIdPostulacion(Integer idPostulacion);
    Optional<CandidatoCriterio> findByPostulacionIdPostulacionAndCriterioIdCriterio(
            Integer idPostulacion, Integer idCriterio);
}
