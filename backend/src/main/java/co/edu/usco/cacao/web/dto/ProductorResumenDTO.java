package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.FincaProductor;

public record ProductorResumenDTO(
    Long id,
    String codigoProductor,
    String nombreProductor,
    String nombreFinca
) {

    public static ProductorResumenDTO de(FincaProductor p) {
        return new ProductorResumenDTO(
            p.getId(),
            p.getCodigoProductor(),
            p.getNombreProductor(),
            p.getNombreFinca()
        );
    }
}
