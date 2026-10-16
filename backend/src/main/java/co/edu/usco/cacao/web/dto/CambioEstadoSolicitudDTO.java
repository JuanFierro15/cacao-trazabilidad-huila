package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.EstadoLote;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CambioEstadoSolicitudDTO(
    @NotNull(message = "El nuevo estado es obligatorio")
    EstadoLote estado,

    @NotBlank(message = "El motivo del cambio de estado es obligatorio")
    @Size(min = 10, max = 300, message = "El motivo debe tener entre 10 y 300 caracteres")
    String motivo,

    Boolean propagarADerivados
) {
}
