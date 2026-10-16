package co.edu.usco.cacao.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record LoteDTO(
    Long id,
    String codigoLote,
    String tipoLote,
    String producto,
    ProductorResumenDTO productor,
    String origenMunicipio,
    LocalDate fechaRecepcion,
    String tipoGrano,
    BigDecimal porcentajeHumedad,
    BigDecimal cantidadRecibida,
    BigDecimal cantidadConsumida,
    BigDecimal cantidadDisponible,
    String unidad,
    String estado,
    String motivoEstado,
    List<String> lotesPadre,
    long alertasActivas
) {
}
