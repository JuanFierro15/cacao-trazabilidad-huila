package co.edu.usco.cacao.web.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO de lista blanca para la ficha pública del comprador (sección 8.7 del contrato).
 * Prohibido incluir: costos, precios, márgenes, cantidades, merma, responsable,
 * nombre del productor, hectáreas, cuota, motivo del estado, alertas e ids internos.
 */
public record FichaPublicaDTO(
    String codigoLote,
    String producto,
    String estado,
    boolean disponibleParaVenta,
    String mensajeEstado,
    OrigenPublicoDTO origen,
    LocalDate fechaRecepcionOrigen,
    List<PasoRecorridoPublicoDTO> recorrido,
    String consultadoEn
) {
}
