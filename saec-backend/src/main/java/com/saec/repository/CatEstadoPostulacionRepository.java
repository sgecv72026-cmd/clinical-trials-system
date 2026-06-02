package com.saec.repository;

import com.saec.entity.CatEstadoPostulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatEstadoPostulacionRepository extends JpaRepository<CatEstadoPostulacion, Integer> {
    Optional<CatEstadoPostulacion> findByNombreIgnoreCase(String nombre);
}
