package com.saec.repository;

import com.saec.entity.CatTipoRol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CatTipoRolRepository extends JpaRepository<CatTipoRol, Integer> {

    @Query("SELECT r FROM CatTipoRol r WHERE r.activo = true ORDER BY r.nombre")
    List<CatTipoRol> findAllActivos();
}
