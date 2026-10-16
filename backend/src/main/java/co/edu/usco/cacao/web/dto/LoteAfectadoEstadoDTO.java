package co.edu.usco.cacao.web.dto;

public record LoteAfectadoEstadoDTO(
    String codigoLote,
    String estadoAnterior,
    String estadoNuevo
) {
}
