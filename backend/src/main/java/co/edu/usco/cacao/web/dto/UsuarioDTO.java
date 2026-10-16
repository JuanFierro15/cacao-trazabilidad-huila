package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.Usuario;

public record UsuarioDTO(
    Long id,
    String username,
    String nombreCompleto,
    String rol,
    boolean activo
) {

    public static UsuarioDTO de(Usuario usuario) {
        return new UsuarioDTO(
            usuario.getId(),
            usuario.getUsername(),
            usuario.getNombreCompleto(),
            usuario.getRol().name(),
            usuario.isActivo()
        );
    }
}
