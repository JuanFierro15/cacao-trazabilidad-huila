package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.TipoGrano;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LoteCreacionSolicitudDTO(
    @Pattern(
        regexp = "^$|^[A-Z0-9-]{3,30}$",
        message = "El código de lote debe tener entre 3 y 30 caracteres en mayúscula, números o guiones"
    )
    String codigoLote,

    @NotNull(message = "El productor es obligatorio")
    Long productorId,

    @NotNull(message = "La fecha de recepción es obligatoria")
    LocalDate fechaRecepcion,

    @NotNull(message = "El tipo de grano es obligatorio")
    TipoGrano tipoGrano,

    @DecimalMin(value = "0.0", inclusive = true, message = "El porcentaje de humedad debe estar entre 0 y 100")
    @DecimalMax(value = "100.0", inclusive = true, message = "El porcentaje de humedad debe estar entre 0 y 100")
    BigDecimal porcentajeHumedad,

    @NotNull(message = "La cantidad recibida es obligatoria")
    @Positive(message = "Debe ser mayor que 0")
    BigDecimal cantidadRecibida
) {
}
