package com.saec.repository;

import com.saec.entity.HistorialVisita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialVisitaRepository extends JpaRepository<HistorialVisita, Integer> {
    List<HistorialVisita> findByIdVisitaOrderByFechaCambioDesc(Integer idVisita);
}
