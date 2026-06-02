package com.saec.repository;

import com.saec.entity.Protocolo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProtocoloRepository extends JpaRepository<Protocolo, Integer> {

    @Query("""
        SELECT p FROM Protocolo p
            JOIN FETCH p.fase
            JOIN FETCH p.estadoProtocolo
        WHERE p.idInvestigador = :idInvestigador
          AND (:idEstado IS NULL OR p.estadoProtocolo.idEstadoProtocolo = :idEstado)
          AND (:search IS NULL OR :search = ''
               OR LOWER(p.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.titulo) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY p.createdAt DESC
    """)
    Page<Protocolo> buscarPorInvestigador(
            @Param("idInvestigador") Integer idInvestigador,
            @Param("idEstado")      Integer idEstado,
            @Param("search")        String  search,
            Pageable pageable
    );

    boolean existsByCodigo(String codigo);

    @Query("SELECT COUNT(p) FROM Protocolo p WHERE p.idInvestigador = :id")
    long countByInvestigador(@Param("id") Integer id);

    @Query("SELECT COUNT(p) FROM Protocolo p WHERE p.idInvestigador = :id AND p.estadoProtocolo.nombre = :estado")
    long countByInvestigadorAndEstado(@Param("id") Integer id, @Param("estado") String estado);
}
