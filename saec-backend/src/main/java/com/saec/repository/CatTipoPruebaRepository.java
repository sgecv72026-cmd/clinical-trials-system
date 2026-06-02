package com.saec.repository;

import com.saec.entity.CatTipoPrueba;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatTipoPruebaRepository extends JpaRepository<CatTipoPrueba, Integer> {
    List<CatTipoPrueba> findByActivoTrueOrderByNombreAsc();

    boolean existsByNombreIgnoreCaseAndActivoTrue(String nombre);
}
