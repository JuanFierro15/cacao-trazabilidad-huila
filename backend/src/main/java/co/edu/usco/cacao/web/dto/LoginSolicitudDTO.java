package co.edu.usco.cacao.web.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginSolicitudDTO(
    @NotBlank(message = "El nombre de usuario es obligatorio")
    String username,

    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {
}
