package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.Etapa;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransformacionSolicitudDTO(
    @NotNull(message = "El identificador de operación (operacionUuid) es obligatorio")
    UUID operacionUuid,

    @NotBlank(message = "El código del lote de origen es obligatorio")
    String loteOrigenCodigo,

    @NotNull(message = "La etapa de transformación es obligatoria")
    Etapa etapa,

    @NotBlank(message = "El responsable de la etapa es obligatorio")
    @Size(max = 120, message = "El nombre del responsable no puede superar 120 caracteres")
    String responsable,

    @NotNull(message = "La fecha de transformación es obligatoria")
    LocalDate fechaTransformacion,

    @NotNull(message = "La cantidad de entrada es obligatoria")
    @DecimalMin(value = "0.001", message = "Debe ser mayor que 0")
    BigDecimal cantidadEntrada,

    @NotNull(message = "La cantidad de salida es obligatoria")
    @DecimalMin(value = "0.0", inclusive = true, message = "No puede ser negativa")
    BigDecimal cantidadSalida,

    @Size(max = 80, message = "El nombre del producto de salida no puede superar 80 caracteres")
    String productoSalida,

    @Size(max = 500, message = "La justificación no puede superar 500 caracteres")
    String justificacionIncidencia,

    @Size(max = 300, message = "Los insumos agregados no pueden superar 300 caracteres")
    String insumosAgregados,

    BigDecimal temperaturaProceso,

    @DecimalMin(value = "0.0", inclusive = true, message = "La humedad debe estar entre 0 y 100")
    @DecimalMax(value = "100.0", inclusive = true, message = "La humedad debe estar entre 0 y 100")
    BigDecimal humedadSalida,

    @DecimalMin(value = "0.0", inclusive = true, message = "El costo de la etapa no puede ser negativo")
    BigDecimal costoEtapaCop,

    @DecimalMin(value = "0.0", inclusive = true, message = "El precio de venta estimado no puede ser negativo")
    BigDecimal precioVentaEstimadoCop,

    @Size(max = 500, message = "El detalle de costos incluidos no puede superar 500 caracteres")
    String detalleCostosIncluidos
) {
}
