package com.saec.service.admin;

import com.saec.dto.admin.RolDto;
import com.saec.repository.CatTipoRolRepository;
import com.saec.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminRolService {

    private final CatTipoRolRepository rolRepository;
    private final UsuarioRepository    usuarioRepository;

    @Transactional(readOnly = true)
    public List<RolDto> listar() {
        return rolRepository.findAll().stream()
                .map(r -> RolDto.builder()
                        .idRol(r.getIdRol())
                        .nombre(r.getNombre())
                        .descripcion(r.getDescripcion())
                        .activo(r.getActivo())
                        .totalUsuarios(usuarioRepository.countByRol(r.getIdRol()))
                        .usuariosActivos(0L) // extendible
                        .build())
                .toList();
    }
}
