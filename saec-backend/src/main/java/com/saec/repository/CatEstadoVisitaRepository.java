package com.saec.repository;

import com.saec.entity.CatEstadoVisita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatEstadoVisitaRepository extends JpaRepository<CatEstadoVisita, Integer> {
}
