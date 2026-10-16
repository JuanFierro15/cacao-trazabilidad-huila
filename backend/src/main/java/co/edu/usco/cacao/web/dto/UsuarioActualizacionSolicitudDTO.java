package co.edu.usco.cacao.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioActualizacionSolicitudDTO(
    @NotBlank(message = "El nombre completo es obligatorio.")
    @Size(max = 120, message = "El nombre completo no puede superar los 120 caracteres.")
    String nombreCompleto,

    String passwordActual,

    @Size(max = 100, message = "La nueva contraseña no puede superar los 100 caracteres.")
    String passwordNueva,

    Boolean activo
) {
}
