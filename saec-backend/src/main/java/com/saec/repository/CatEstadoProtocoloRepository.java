package com.saec.repository;

import com.saec.entity.CatEstadoProtocolo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatEstadoProtocoloRepository extends JpaRepository<CatEstadoProtocolo, Integer> {

    List<CatEstadoProtocolo> findByActivoTrueOrderByNombre();
}
