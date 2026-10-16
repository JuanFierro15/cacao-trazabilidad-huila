package co.edu.usco.cacao.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record BalanceTransformacionDTO(
    Long transformacionId,
    String loteSalidaCodigo,
    BigDecimal costoEtapaCop,
    BigDecimal cantidadSalidaKg,
    BigDecimal costoUnitarioCop,
    BigDecimal precioVentaCop,
    BigDecimal margenPorcentaje,
    boolean esSimulacion,
    boolean calculable,
    String motivoNoCalculable,
    FormulasBalanceDTO formulas,
    String costosIncluidos,
    List<String> supuestos
) {
}
