package co.edu.usco.cacao.web.dto;

public record LoginRespuestaDTO(
    String token,
    String username,
    String nombreCompleto,
    String rol,
    String expiraEn
) {
}
