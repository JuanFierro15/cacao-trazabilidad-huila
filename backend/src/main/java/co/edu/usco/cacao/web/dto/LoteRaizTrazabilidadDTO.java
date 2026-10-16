package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.Lote;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LoteRaizTrazabilidadDTO(
    String codigoLote,
    LocalDate fechaRecepcion,
    BigDecimal cantidadRecibidaKg,
    String tipoGrano,
    BigDecimal porcentajeHumedad
) {

    public static LoteRaizTrazabilidadDTO de(Lote loteRaiz) {
        return new LoteRaizTrazabilidadDTO(
            loteRaiz.getCodigoLote(),
            loteRaiz.getFechaRecepcion(),
            normalizarNumero(loteRaiz.getCantidadRecibida()),
            loteRaiz.getTipoGrano() != null ? loteRaiz.getTipoGrano().name() : null,
            normalizarNumero(loteRaiz.getPorcentajeHumedad())
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
