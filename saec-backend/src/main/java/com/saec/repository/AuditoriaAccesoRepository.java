package com.saec.repository;

import com.saec.entity.AuditoriaAcceso;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditoriaAccesoRepository extends JpaRepository<AuditoriaAcceso, Long> {

    /* Nota: se usa LEFT JOIN para incluir registros sin usuario (ej. LOGIN del sistema).
     * El count query es explícito para que la paginación funcione en BD. */
    /* Nota: se usan valores centinela en lugar de IS NULL para evitar el error
     * "could not determine data type of parameter $N" de PostgreSQL / Hibernate 6.
     * Strings vacíos = sin filtro; idUsuario = -1 = sin filtro;
     * fechas: se pasan siempre (1900 / 9999 cuando no hay filtro). */
    @Query(
        value = """
            SELECT a FROM AuditoriaAcceso a
            LEFT JOIN a.usuario u
            WHERE (:accion        = '' OR a.accion                    = :accion)
              AND (:tabla         = '' OR LOWER(a.tablaAfectada)      LIKE :tabla)
              AND (:idUsuario     = -1 OR u.idUsuario                 = :idUsuario)
              AND (:nombrePattern = '' OR LOWER(u.nombre)             LIKE :nombrePattern
                                      OR LOWER(u.apellido)            LIKE :nombrePattern
                                      OR LOWER(u.email)               LIKE :nombrePattern)
              AND a.fechaHora >= :desde
              AND a.fechaHora <= :hasta
            ORDER BY a.fechaHora DESC
        """,
        countQuery = """
            SELECT COUNT(a) FROM AuditoriaAcceso a
            LEFT JOIN a.usuario u
            WHERE (:accion        = '' OR a.accion                    = :accion)
              AND (:tabla         = '' OR LOWER(a.tablaAfectada)      LIKE :tabla)
              AND (:idUsuario     = -1 OR u.idUsuario                 = :idUsuario)
              AND (:nombrePattern = '' OR LOWER(u.nombre)             LIKE :nombrePattern
                                      OR LOWER(u.apellido)            LIKE :nombrePattern
                                      OR LOWER(u.email)               LIKE :nombrePattern)
              AND a.fechaHora >= :desde
              AND a.fechaHora <= :hasta
        """
    )
    Page<AuditoriaAcceso> buscarConFiltros(
            @Param("accion")        String accion,
            @Param("tabla")         String tabla,
            @Param("idUsuario")     Integer idUsuario,
            @Param("nombrePattern") String nombrePattern,
            @Param("desde")         LocalDateTime desde,
            @Param("hasta")         LocalDateTime hasta,
            Pageable pageable
    );
}
