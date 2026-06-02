package com.saec.repository;

import com.saec.entity.EventoAdverso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoAdversoRepository extends JpaRepository<EventoAdverso, Integer> {

    long countByActivoTrue();

    @Query("""
        SELECT e FROM EventoAdverso e
        JOIN FETCH e.severidad s
        WHERE e.activo = true
        ORDER BY e.fechaReporte DESC
    """)
    List<EventoAdverso> findActivosOrdenados();

    @Query("""
        SELECT e FROM EventoAdverso e
        JOIN FETCH e.severidad s
        WHERE e.idProtocolo = :idProtocolo AND e.activo = true
        ORDER BY e.fechaReporte DESC
    """)
    List<EventoAdverso> findByProtocoloActivos(@Param("idProtocolo") Integer idProtocolo);

    @Query("""
        SELECT e FROM EventoAdverso e
        JOIN FETCH e.severidad s
        WHERE e.idVisita = :idVisita AND e.activo = true
        ORDER BY e.fechaReporte DESC
    """)
    List<EventoAdverso> findByVisitaActivos(@Param("idVisita") Integer idVisita);
}
