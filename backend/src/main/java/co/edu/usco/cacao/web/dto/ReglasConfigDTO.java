package co.edu.usco.cacao.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReglasConfigDTO(
    BigDecimal umbralMermaPorcentaje,
    int rendimientoPlausibleKgHaAnio,
    List<EtapaItemDTO> etapas
) {

    public record EtapaItemDTO(
        String codigo,
        String nombre
    ) {
    }
}
