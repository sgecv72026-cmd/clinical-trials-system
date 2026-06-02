package com.saec.repository;

import com.saec.entity.AdministracionMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdministracionMedicamentoRepository extends JpaRepository<AdministracionMedicamento, Integer> {
    List<AdministracionMedicamento> findByVisitaIdVisitaAndActivoTrueOrderByFechaHoraDesc(Integer idVisita);
}
