package com.saec.repository;

import com.saec.entity.CatSeveridad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatSeveridadRepository extends JpaRepository<CatSeveridad, Integer> {
    List<CatSeveridad> findByActivoTrueOrderByOrdenAsc();
}
