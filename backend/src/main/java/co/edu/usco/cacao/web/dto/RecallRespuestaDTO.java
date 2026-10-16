package co.edu.usco.cacao.web.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Respuesta de GET /api/lotes/{codigo}/recall (sección 8.6 del contrato).
 * Solo la ve el ADMINISTRADOR; no lleva costos porque el recall es de inventario y origen.
 */
public record RecallRespuestaDTO(
    String codigoLote,
    String estado,
    String loteRaiz,
    Origen origen,
    Cantidades cantidades,
    List<DerivadoResumenDTO> derivados,
    BigDecimal kgAfectadosEnInventario,
    HistorialConservado historialConservado
) {

    public record Origen(
        String productor,
        String finca,
        String municipio,
        String variedadCacao
    ) {
    }

    public record Cantidades(
        BigDecimal recibidaKg,
        BigDecimal consumidaKg,
        BigDecimal disponibleKg
    ) {
    }

    public record HistorialConservado(
        long transformaciones,
        long registrosAuditoria
    ) {
    }
}
