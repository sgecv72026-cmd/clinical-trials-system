package com.saec.repository;

import com.saec.entity.CatFaseClinical;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatFaseClinicaRepository extends JpaRepository<CatFaseClinical, Integer> {

    List<CatFaseClinical> findByActivoTrueOrderByNombre();
}
