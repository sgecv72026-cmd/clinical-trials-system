package com.saec.repository;

import com.saec.entity.PostulacionModificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostulacionModificacionRepository extends JpaRepository<PostulacionModificacion, Integer> {
    List<PostulacionModificacion> findByPostulacionIdPostulacionOrderByFechaModificacionAsc(Integer idPostulacion);
}
