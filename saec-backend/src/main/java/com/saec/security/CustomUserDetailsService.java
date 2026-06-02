package com.saec.security;

import com.saec.entity.Usuario;
import com.saec.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        String authority = "ROLE_" + normalizeRoleName(usuario.getRol().getNombre());

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority(authority)))
                .accountLocked(!usuario.getActivo())
                .build();
    }

    private String normalizeRoleName(String nombre) {
        return nombre.toUpperCase()
                .replace(" ", "_")
                .replace("Á", "A").replace("É", "E")
                .replace("Í", "I").replace("Ó", "O")
                .replace("Ú", "U");
    }
}
