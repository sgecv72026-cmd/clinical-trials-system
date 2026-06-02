package com.saec.service.admin;

import com.saec.dto.admin.AsignarUsuarioCentroRequest;
import com.saec.dto.admin.CentroDetalleDto;
import com.saec.dto.admin.CentroResumenDto;
import com.saec.dto.admin.CrearCentroRequest;
import com.saec.entity.CentroInvestigacion;
import com.saec.entity.Usuario;
import com.saec.entity.UsuarioCentro;
import com.saec.entity.UsuarioCentroId;
import com.saec.repository.CentroInvestigacionRepository;
import com.saec.repository.UsuarioCentroRepository;
import com.saec.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCentroService {

    private final CentroInvestigacionRepository centroRepository;
    private final UsuarioCentroRepository       usuarioCentroRepository;
    private final UsuarioRepository             usuarioRepository;

    @Transactional(readOnly = true)
    public List<CentroResumenDto> listar() {
        return centroRepository.findAllOrdenados().stream()
                .map(c -> CentroResumenDto.builder()
                        .idCentro(c.getIdCentro())
                        .nombre(c.getNombre())
                        .ciudad(c.getCiudad())
                        .direccion(c.getDireccion())
                        .telefono(c.getTelefono())
                        .activo(c.getActivo())
                        .totalUsuarios(usuarioCentroRepository.countByIdCentro(c.getIdCentro()))
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public CentroDetalleDto obtenerDetalle(Integer idCentro) {
        CentroInvestigacion centro = centroRepository.findById(idCentro)
                .orElseThrow(() -> new EntityNotFoundException("Centro no encontrado: " + idCentro));

        List<CentroDetalleDto.UsuarioCentroDto> usuarios =
                usuarioCentroRepository.findByCentroIdWithUsuario(idCentro).stream()
                        .map(this::toUsuarioCentroDto)
                        .toList();

        return CentroDetalleDto.builder()
                .idCentro(centro.getIdCentro())
                .nombre(centro.getNombre())
                .ciudad(centro.getCiudad())
                .direccion(centro.getDireccion())
                .telefono(centro.getTelefono())
                .activo(centro.getActivo())
                .usuarios(usuarios)
                .build();
    }

    @Transactional
    public CentroResumenDto crearCentro(CrearCentroRequest request) {
        CentroInvestigacion centro = CentroInvestigacion.builder()
                .nombre(request.getNombre().trim())
                .ciudad(request.getCiudad().trim())
                .direccion(request.getDireccion() != null ? request.getDireccion().trim() : null)
                .telefono(request.getTelefono() != null ? request.getTelefono().trim() : null)
                .activo(true)
                .build();
        centro = centroRepository.save(centro);
        return CentroResumenDto.builder()
                .idCentro(centro.getIdCentro())
                .nombre(centro.getNombre())
                .ciudad(centro.getCiudad())
                .direccion(centro.getDireccion())
                .telefono(centro.getTelefono())
                .activo(centro.getActivo())
                .totalUsuarios(0)
                .build();
    }

    @Transactional
    public void asignarUsuario(Integer idCentro, AsignarUsuarioCentroRequest request) {
        CentroInvestigacion centro = centroRepository.findById(idCentro)
                .orElseThrow(() -> new EntityNotFoundException("Centro no encontrado: " + idCentro));
        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + request.getIdUsuario()));

        UsuarioCentroId id = new UsuarioCentroId(usuario.getIdUsuario(), centro.getIdCentro());
        if (usuarioCentroRepository.existsById(id)) {
            throw new IllegalArgumentException("El usuario ya está asignado a este centro");
        }

        UsuarioCentro uc = new UsuarioCentro(id, usuario, centro, LocalDate.now());
        usuarioCentroRepository.save(uc);
    }

    private CentroDetalleDto.UsuarioCentroDto toUsuarioCentroDto(UsuarioCentro uc) {
        return CentroDetalleDto.UsuarioCentroDto.builder()
                .idUsuario(uc.getUsuario().getIdUsuario())
                .nombre(uc.getUsuario().getNombre())
                .apellido(uc.getUsuario().getApellido())
                .email(uc.getUsuario().getEmail())
                .rol(uc.getUsuario().getRol().getNombre())
                .activo(uc.getUsuario().getActivo())
                .fechaAsignacion(uc.getFechaAsignacion())
                .build();
    }
}
