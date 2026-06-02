package com.saec.repository;

import com.saec.entity.CatUnidadDosis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatUnidadDosisRepository extends JpaRepository<CatUnidadDosis, Integer> {

    List<CatUnidadDosis> findByActivoTrueOrderByNombre();
}
