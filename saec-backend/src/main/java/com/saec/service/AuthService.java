package com.saec.service;

import com.saec.dto.LoginRequest;
import com.saec.dto.LoginResponse;
import com.saec.entity.Usuario;
import com.saec.repository.UsuarioRepository;
import com.saec.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciales incorrectas"));

        if (!usuario.getActivo()) {
            throw new DisabledException("La cuenta se encuentra deshabilitada");
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) auth.getPrincipal();

            Map<String, Object> claims = Map.of(
                    "idUsuario", usuario.getIdUsuario(),
                    "nombre",    usuario.getNombre(),
                    "apellido",  usuario.getApellido(),
                    "rol",       usuario.getRol().getNombre()
            );

            String token = jwtService.generateToken(userDetails, claims);

            // Registrar timestamp de último acceso
            usuarioRepository.actualizarUltimoAcceso(usuario.getIdUsuario(), java.time.LocalDateTime.now());

            log.info("Login exitoso para usuario id={} rol={}", usuario.getIdUsuario(), usuario.getRol().getNombre());

            return LoginResponse.builder()
                    .token(token)
                    .tipo("Bearer")
                    .idUsuario(usuario.getIdUsuario())
                    .nombre(usuario.getNombre())
                    .apellido(usuario.getApellido())
                    .email(usuario.getEmail())
                    .rol(usuario.getRol().getNombre())
                    .telefono(usuario.getTelefono())
                    .build();

        } catch (DisabledException e) {
            throw e;
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Credenciales incorrectas");
        }
    }
}
