package co.edu.usco.cacao.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioCreacionSolicitudDTO(
    @NotBlank(message = "El nombre de usuario es obligatorio.")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres.")
    String username,

    @NotBlank(message = "El nombre completo es obligatorio.")
    @Size(max = 120, message = "El nombre completo no puede superar los 120 caracteres.")
    String nombreCompleto,

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, max = 100, message = "La contraseña debe tener al menos 6 caracteres.")
    String password
) {
}
