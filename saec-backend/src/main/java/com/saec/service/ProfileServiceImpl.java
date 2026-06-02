package com.saec.service;

import com.saec.dto.profile.ActualizarContactoDto;
import com.saec.dto.profile.CentroPerfilDto;
import com.saec.dto.profile.PerfilUsuarioDto;
import com.saec.entity.CentroInvestigacion;
import com.saec.entity.Usuario;
import com.saec.entity.UsuarioCentro;
import com.saec.repository.UsuarioCentroRepository;
import com.saec.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    private final UsuarioRepository       usuarioRepository;
    private final UsuarioCentroRepository usuarioCentroRepository;

    @Override
    @Transactional(readOnly = true)
    public PerfilUsuarioDto getMyProfile(UserDetails userDetails) {

        String email = userDetails.getUsername();

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> {
                    log.error("Usuario autenticado no encontrado en BD: {}", email);
                    return new UsernameNotFoundException("Usuario no encontrado: " + email);
                });

        List<UsuarioCentro> asignaciones =
                usuarioCentroRepository.findByUsuarioIdWithCentro(usuario.getIdUsuario());

        List<CentroPerfilDto> centrosDto = asignaciones.stream()
                .map(uc -> {
                    CentroInvestigacion c = uc.getCentro();
                    return new CentroPerfilDto(
                            c.getIdCentro(),
                            c.getNombre(),
                            c.getCiudad(),
                            c.getDireccion(),
                            c.getTelefono()
                    );
                })
                .toList();

        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();

        log.debug("Perfil cargado para usuario id={}", usuario.getIdUsuario());

        return buildDto(usuario, centrosDto);
    }

    @Override
    @Transactional
    public PerfilUsuarioDto updateMyContact(UserDetails userDetails, ActualizarContactoDto dto) {

        String emailActual = userDetails.getUsername();

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(emailActual)
                .orElseThrow(() -> {
                    log.error("Usuario autenticado no encontrado en BD al actualizar: {}", emailActual);
                    return new UsernameNotFoundException("Usuario no encontrado: " + emailActual);
                });

        // Si el email cambia, verificar que no esté en uso por otro usuario
        String nuevoEmail = dto.email().trim().toLowerCase();
        if (!nuevoEmail.equalsIgnoreCase(emailActual)) {
            boolean emailEnUso = usuarioRepository.findByEmailIgnoreCase(nuevoEmail)
                    .filter(u -> !u.getIdUsuario().equals(usuario.getIdUsuario()))
                    .isPresent();
            if (emailEnUso) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "El correo electrónico ya está en uso por otro usuario");
            }
        }

        usuario.setEmail(nuevoEmail);
        usuario.setTelefono(dto.telefono() != null ? dto.telefono().trim() : null);
        usuarioRepository.save(usuario);

        log.info("Contacto actualizado para usuario id={}", usuario.getIdUsuario());

        // Construimos el DTO directamente desde la entidad ya actualizada en memoria
        List<UsuarioCentro> asignaciones =
                usuarioCentroRepository.findByUsuarioIdWithCentro(usuario.getIdUsuario());
        List<CentroPerfilDto> centrosDto = asignaciones.stream()
                .map(uc -> {
                    CentroInvestigacion c = uc.getCentro();
                    return new CentroPerfilDto(
                            c.getIdCentro(), c.getNombre(), c.getCiudad(),
                            c.getDireccion(), c.getTelefono());
                })
                .toList();

        return buildDto(usuario, centrosDto);
    }

    /* ── Construcción del DTO (reutilizable) ──────────────────── */
    private PerfilUsuarioDto buildDto(Usuario usuario, List<CentroPerfilDto> centros) {
        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();
        return new PerfilUsuarioDto(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellido(),
                nombreCompleto,
                usuario.getEmail(),
                usuario.getDocumentoIdentidad(),
                usuario.getRol().getNombre(),
                usuario.getRol().getDescripcion(),
                centros,
                usuario.getActivo(),
                usuario.getCreatedAt(),
                usuario.getUltimoAcceso(),
                usuario.getFotoPerfil(),
                usuario.getEspecialidadCargo(),
                usuario.getTelefono(),
                usuario.getCiudad(),
                usuario.getDireccion()
        );
    }
}
