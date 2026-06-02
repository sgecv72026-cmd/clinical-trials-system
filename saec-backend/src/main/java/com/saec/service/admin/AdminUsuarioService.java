package com.saec.service.admin;

import com.saec.dto.admin.CrearUsuarioRequest;
import com.saec.dto.admin.PageResponseDto;
import com.saec.dto.admin.ToggleActivoRequest;
import com.saec.dto.admin.UsuarioAdminDto;
import com.saec.entity.CatTipoRol;
import com.saec.entity.Usuario;
import com.saec.repository.CatTipoRolRepository;
import com.saec.repository.UsuarioCentroRepository;
import com.saec.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUsuarioService {

    private final UsuarioRepository       usuarioRepository;
    private final UsuarioCentroRepository  usuarioCentroRepository;
    private final CatTipoRolRepository    catTipoRolRepository;
    private final PasswordEncoder         passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponseDto<UsuarioAdminDto> listar(String search, Integer idRol, Boolean activo, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("apellido", "nombre"));
        Page<Usuario> resultado = usuarioRepository.buscarConFiltros(
                (search != null && search.isBlank()) ? null : search,
                idRol, activo, pageable
        );
        return PageResponseDto.from(resultado, this::toDto);
    }

    @Transactional(readOnly = true)
    public UsuarioAdminDto obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + id));
        return toDto(usuario);
    }

    @Transactional
    public UsuarioAdminDto crearUsuario(CrearUsuarioRequest request) {
        if (usuarioRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }
        CatTipoRol rol = catTipoRolRepository.findById(request.getIdRol())
                .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado: " + request.getIdRol()));

        Usuario usuario = Usuario.builder()
                .rol(rol)
                .nombre(request.getNombre().trim())
                .apellido(request.getApellido().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .activo(true)
                .createdAt(LocalDateTime.now())
                .telefono(request.getTelefono() != null ? request.getTelefono().trim() : null)
                .build();

        usuario = usuarioRepository.save(usuario);
        return toDto(usuario);
    }

    @Transactional
    public void toggleActivo(Integer id, ToggleActivoRequest request) {
        int updated = usuarioRepository.actualizarActivo(id, request.getActivo());
        if (updated == 0) {
            throw new EntityNotFoundException("Usuario no encontrado: " + id);
        }
    }

    private UsuarioAdminDto toDto(Usuario u) {
        List<String> centros = usuarioCentroRepository
                .findByUsuarioIdWithCentro(u.getIdUsuario())
                .stream()
                .map(uc -> uc.getCentro().getNombre())
                .toList();

        return UsuarioAdminDto.builder()
                .idUsuario(u.getIdUsuario())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .email(u.getEmail())
                .telefono(u.getTelefono())
                .activo(u.getActivo())
                .rol(u.getRol().getNombre())
                .idRol(u.getRol().getIdRol())
                .createdAt(u.getCreatedAt())
                .centros(centros)
                .build();
    }
}
