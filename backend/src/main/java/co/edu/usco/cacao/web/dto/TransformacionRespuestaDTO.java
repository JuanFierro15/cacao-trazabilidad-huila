package co.edu.usco.cacao.web.dto;

import java.util.List;

public record TransformacionRespuestaDTO(
    TransformacionDTO transformacion,
    InventarioOrigenDTO inventarioOrigen,
    List<AlertaDTO> alertasGeneradas
) {
}
