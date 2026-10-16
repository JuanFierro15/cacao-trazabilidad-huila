package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.FincaProductor;
import java.math.BigDecimal;

public record OrigenTrazabilidadDTO(
    String productor,
    String finca,
    String municipio,
    String vereda,
    String variedadCacao,
    BigDecimal hectareasProductivas
) {

    public static OrigenTrazabilidadDTO de(FincaProductor productor) {
        return new OrigenTrazabilidadDTO(
            productor.getNombreProductor(),
            productor.getNombreFinca(),
            productor.getMunicipio(),
            productor.getVereda(),
            productor.getVariedadCacao(),
            productor.getHectareasProductivas()
        );
    }
}
