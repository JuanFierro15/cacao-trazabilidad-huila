package co.edu.usco.cacao.web.dto;

import java.time.LocalDate;

public record PasoRecorridoPublicoDTO(
    int orden,
    String etapa,
    String nombre,
    LocalDate fecha
) {
}
