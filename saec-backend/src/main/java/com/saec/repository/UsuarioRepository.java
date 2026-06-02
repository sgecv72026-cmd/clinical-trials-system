package com.saec.repository;

import com.saec.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @Query("SELECT u FROM Usuario u JOIN FETCH u.rol WHERE LOWER(u.email) = LOWER(:email)")
    Optional<Usuario> findByEmailIgnoreCase(@Param("email") String email);

    @Query("""
        SELECT u FROM Usuario u JOIN FETCH u.rol r
        WHERE (:search  IS NULL OR :search  = ''
               OR LOWER(u.nombre)   LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:idRol   IS NULL OR r.idRol  = :idRol)
          AND (:activo  IS NULL OR u.activo = :activo)
        ORDER BY u.apellido, u.nombre
    """)
    Page<Usuario> buscarConFiltros(
            @Param("search")  String search,
            @Param("idRol")   Integer idRol,
            @Param("activo")  Boolean activo,
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE Usuario u SET u.activo = :activo WHERE u.idUsuario = :id")
    int actualizarActivo(@Param("id") Integer id, @Param("activo") boolean activo);

    @Modifying
    @Query("UPDATE Usuario u SET u.ultimoAcceso = :ts WHERE u.idUsuario = :id")
    void actualizarUltimoAcceso(@Param("id") Integer id, @Param("ts") java.time.LocalDateTime ts);

    long countByActivoTrue();

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.rol.idRol = :idRol")
    long countByRol(@Param("idRol") Integer idRol);
}
