package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.Transformacion;
import co.edu.usco.cacao.servicio.CalculadoraTransformacion;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransformacionDTO(
    Long id,
    String operacionUuid,
    String loteOrigenCodigo,
    String loteSalidaCodigo,
    String etapa,
    String responsable,
    LocalDate fechaTransformacion,
    BigDecimal cantidadEntrada,
    BigDecimal cantidadSalida,
    BigDecimal porcentajeMerma,
    BigDecimal porcentajeRendimiento,
    String justificacionIncidencia,
    String insumosAgregados
) {

    public static TransformacionDTO de(Transformacion transformacion) {
        String loteSalidaCod = transformacion.getLoteSalida() != null
            ? transformacion.getLoteSalida().getCodigoLote()
            : null;
        BigDecimal rendimiento = CalculadoraTransformacion.calcularPorcentajeRendimiento(
            transformacion.getCantidadEntrada(),
            transformacion.getCantidadSalida()
        );

        return new TransformacionDTO(
            transformacion.getId(),
            transformacion.getOperacionUuid().toString(),
            transformacion.getLoteOrigen().getCodigoLote(),
            loteSalidaCod,
            transformacion.getEtapa().name(),
            transformacion.getResponsable(),
            transformacion.getFechaTransformacion(),
            normalizarNumero(transformacion.getCantidadEntrada()),
            normalizarNumero(transformacion.getCantidadSalida()),
            transformacion.getPorcentajeMerma(),
            rendimiento,
            transformacion.getJustificacionIncidencia(),
            transformacion.getInsumosAgregados()
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
