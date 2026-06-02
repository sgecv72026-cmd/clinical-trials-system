package com.saec.repository;

import com.saec.entity.CatGenero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatGeneroRepository extends JpaRepository<CatGenero, Integer> {
    List<CatGenero> findAllByOrderByNombre();
}
