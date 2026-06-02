package com.saec.repository;

import com.saec.entity.ResultadoLaboratorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultadoLaboratorioRepository extends JpaRepository<ResultadoLaboratorio, Integer> {
    List<ResultadoLaboratorio> findByVisitaIdVisitaAndActivoTrueOrderByFechaTomaDesc(Integer idVisita);
}
