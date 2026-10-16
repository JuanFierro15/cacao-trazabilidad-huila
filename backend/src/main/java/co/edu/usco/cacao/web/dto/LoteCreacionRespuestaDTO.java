package co.edu.usco.cacao.web.dto;

import java.util.List;

public record LoteCreacionRespuestaDTO(
    LoteDTO lote,
    List<AlertaDTO> alertasGeneradas
) {
}
