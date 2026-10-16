package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.Lote;
import java.math.BigDecimal;

public record InventarioOrigenDTO(
    String codigoLote,
    BigDecimal cantidadRecibida,
    BigDecimal cantidadConsumida,
    BigDecimal cantidadDisponible
) {

    public static InventarioOrigenDTO de(Lote lote) {
        return new InventarioOrigenDTO(
            lote.getCodigoLote(),
            normalizarNumero(lote.getCantidadRecibida()),
            normalizarNumero(lote.getCantidadConsumida()),
            normalizarNumero(lote.getCantidadDisponible())
        );
    }

    private static BigDecimal normalizarNumero(BigDecimal valor) {
        if (valor == null) {
            return null;
        }
        if (valor.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return valor.stripTrailingZeros();
    }
}
