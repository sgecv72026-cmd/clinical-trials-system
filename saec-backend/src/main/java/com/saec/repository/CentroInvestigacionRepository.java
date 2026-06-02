package com.saec.repository;

import com.saec.entity.CentroInvestigacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CentroInvestigacionRepository extends JpaRepository<CentroInvestigacion, Integer> {

    @Query("SELECT c FROM CentroInvestigacion c ORDER BY c.activo DESC, c.nombre ASC")
    List<CentroInvestigacion> findAllOrdenados();

    long countByActivoTrue();

    List<CentroInvestigacion> findByActivoTrueOrderByNombre();
}
