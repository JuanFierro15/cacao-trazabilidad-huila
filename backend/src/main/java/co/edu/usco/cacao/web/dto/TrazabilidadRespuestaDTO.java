package co.edu.usco.cacao.web.dto;

import java.util.List;

public record TrazabilidadRespuestaDTO(
    String codigoLote,
    String producto,
    String estado,
    LoteRaizTrazabilidadDTO loteRaiz,
    OrigenTrazabilidadDTO origen,
    List<EventoLineaTrazabilidadDTO> linea,
    List<DerivadoResumenDTO> derivados,
    List<AlertaDTO> alertas,
    long tiempoConsultaMs
) {
}
