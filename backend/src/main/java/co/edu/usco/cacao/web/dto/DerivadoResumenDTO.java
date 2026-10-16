package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.Lote;
import java.math.BigDecimal;

public record DerivadoResumenDTO(
    String codigoLote,
    String producto,
    String etapa,
    BigDecimal cantidadKg,
    BigDecimal disponibleKg,
    String estado
) {

    public static DerivadoResumenDTO de(Lote loteDerivado, String etapaProductora) {
        return new DerivadoResumenDTO(
            loteDerivado.getCodigoLote(),
            loteDerivado.getProducto(),
            etapaProductora,
            normalizarNumero(loteDerivado.getCantidadRecibida()),
            normalizarNumero(loteDerivado.getCantidadDisponible()),
            loteDerivado.getEstado().name()
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
