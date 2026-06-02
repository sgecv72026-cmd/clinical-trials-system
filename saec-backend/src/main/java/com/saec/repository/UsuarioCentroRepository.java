package com.saec.repository;

import com.saec.entity.UsuarioCentro;
import com.saec.entity.UsuarioCentroId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UsuarioCentroRepository extends JpaRepository<UsuarioCentro, UsuarioCentroId> {

    @Query("""
        SELECT uc FROM UsuarioCentro uc
        JOIN FETCH uc.usuario u
        JOIN FETCH u.rol
        WHERE uc.centro.idCentro = :idCentro
        ORDER BY u.apellido, u.nombre
    """)
    List<UsuarioCentro> findByCentroIdWithUsuario(@Param("idCentro") Integer idCentro);

    @Query("""
        SELECT uc FROM UsuarioCentro uc
        JOIN FETCH uc.centro c
        WHERE uc.usuario.idUsuario = :idUsuario
    """)
    List<UsuarioCentro> findByUsuarioIdWithCentro(@Param("idUsuario") Integer idUsuario);

    @Query("SELECT COUNT(uc) FROM UsuarioCentro uc WHERE uc.centro.idCentro = :idCentro")
    long countByIdCentro(@Param("idCentro") Integer idCentro);
}
