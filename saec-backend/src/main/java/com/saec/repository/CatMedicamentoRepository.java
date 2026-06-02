package com.saec.repository;

import com.saec.entity.CatMedicamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CatMedicamentoRepository extends JpaRepository<CatMedicamento, Integer> {

    List<CatMedicamento> findByActivoTrueOrderByNombre();

    boolean existsByNombreIgnoreCase(String nombre);

    /**
     * Medicamentos (activos) que están asignados a al menos una visita de los
     * protocolos del investigador dado.  Usa EXISTS para evitar problemas con
     * DISTINCT + Page en JPQL.
     */
    @Query("""
        SELECT m FROM CatMedicamento m
        WHERE m.activo = true
          AND EXISTS (
              SELECT mp FROM MedicamentoProtocolo mp
              WHERE mp.medicamento = m
                AND mp.protocolo.idInvestigador = :idInvestigador
                AND mp.activo = true
          )
          AND (:search IS NULL OR :search = ''
               OR LOWER(m.nombre) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY m.nombre
    """)
    Page<CatMedicamento> findByInvestigadorAndSearch(
            @Param("idInvestigador") Integer idInvestigador,
            @Param("search")         String  search,
            Pageable pageable
    );
}
