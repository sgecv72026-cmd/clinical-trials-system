package com.saec.repository;

import com.saec.entity.CatMedicamento;
import com.saec.entity.MedicamentoProtocolo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicamentoProtocoloRepository extends JpaRepository<MedicamentoProtocolo, Integer> {

    List<MedicamentoProtocolo> findByVisitaProtocoloIdVisitaProtocoloAndActivoTrue(Integer idVisita);

    List<MedicamentoProtocolo> findByProtocoloIdProtocoloAndActivoTrue(Integer idProtocolo);

    @Query("""
        SELECT DISTINCT mp.medicamento FROM MedicamentoProtocolo mp
        WHERE mp.protocolo.idInvestigador = :idInvestigador
          AND mp.activo = true
          AND (:search IS NULL OR :search = ''
               OR LOWER(mp.medicamento.nombre) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY mp.medicamento.nombre
    """)
    Page<CatMedicamento> findMedicamentosByInvestigador(
            @Param("idInvestigador") Integer idInvestigador,
            @Param("search")         String  search,
            Pageable pageable
    );
}
