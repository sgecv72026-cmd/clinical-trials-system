package com.saec.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private CatTipoRol rol;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @Setter
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Setter
    @Column(name = "telefono", length = 20)
    private String telefono;

    /* ── Campos de perfil extendido ─────────────────────────── */

    @Column(name = "documento_identidad", length = 50)
    private String documentoIdentidad;

    @Column(name = "foto_perfil", length = 500)
    private String fotoPerfil;

    @Column(name = "especialidad_cargo", length = 100)
    private String especialidadCargo;

    @Column(name = "ciudad", length = 100)
    private String ciudad;

    @Column(name = "direccion", length = 255)
    private String direccion;

    /** Fecha/hora del último inicio de sesión exitoso. */
    @Setter
    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;
}
