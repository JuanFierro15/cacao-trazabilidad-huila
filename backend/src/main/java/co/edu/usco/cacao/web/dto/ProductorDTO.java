package co.edu.usco.cacao.web.dto;

import java.math.BigDecimal;

public record ProductorDTO(
    Long id,
    String codigoProductor,
    String nombreProductor,
    String nombreFinca,
    String municipio,
    String vereda,
    BigDecimal hectareasProductivas,
    String variedadCacao,
    BigDecimal cuotaMaximaKg,
    BigDecimal entregadoAnioKg
) {
}
