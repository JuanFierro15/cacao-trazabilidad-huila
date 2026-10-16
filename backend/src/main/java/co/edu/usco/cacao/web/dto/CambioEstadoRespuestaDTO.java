package co.edu.usco.cacao.web.dto;

import java.util.List;

public record CambioEstadoRespuestaDTO(
    LoteDTO lote,
    List<LoteAfectadoEstadoDTO> lotesAfectados
) {
}
