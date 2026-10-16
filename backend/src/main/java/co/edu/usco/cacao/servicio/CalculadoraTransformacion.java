package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.web.dto.BalanceTransformacionDTO;
import co.edu.usco.cacao.web.dto.FormulasBalanceDTO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.List;
import java.util.Locale;

/**
 * Calculadora pura de reglas de negocio de transformación (sin dependencias de Spring).
 * Aritmética BigDecimal con RoundingMode.HALF_UP: porcentajes y COP a 2 decimales, kg a 3 decimales.
 */
public final class CalculadoraTransformacion {

    private static final BigDecimal CIEN = new BigDecimal("100");
    public static final String MOTIVO_SALIDA_CERO =
        "No se puede calcular: la salida vendible es 0 kg (división entre cero).";
    public static final String MOTIVO_SIN_COSTO_ETAPA =
        "No se registraron costos para esta etapa de transformación.";
    public static final String MOTIVO_PRECIO_CERO =
        "No se puede calcular el margen: el precio de venta es 0 COP/kg (división entre cero).";

    private CalculadoraTransformacion() {
    }

    public static BigDecimal calcularPorcentajeMerma(BigDecimal cantidadEntrada, BigDecimal cantidadSalida) {
        validarEntradaPositivaYSalidaNoNegativa(cantidadEntrada, cantidadSalida);
        return cantidadEntrada.subtract(cantidadSalida)
            .multiply(CIEN)
            .divide(cantidadEntrada, 2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calcularPorcentajeRendimiento(BigDecimal cantidadEntrada, BigDecimal cantidadSalida) {
        validarEntradaPositivaYSalidaNoNegativa(cantidadEntrada, cantidadSalida);
        return cantidadSalida
            .multiply(CIEN)
            .divide(cantidadEntrada, 2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calcularCostoUnitario(BigDecimal costoEtapaCop, BigDecimal cantidadSalida) {
        if (costoEtapaCop == null || cantidadSalida == null || cantidadSalida.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return costoEtapaCop.divide(cantidadSalida, 2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calcularMargenPorcentaje(BigDecimal costoUnitarioCop, BigDecimal precioVentaCop) {
        if (costoUnitarioCop == null || precioVentaCop == null || precioVentaCop.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return precioVentaCop.subtract(costoUnitarioCop)
            .multiply(CIEN)
            .divide(precioVentaCop, 2, RoundingMode.HALF_UP);
    }

    public static boolean superaUmbralMerma(BigDecimal porcentajeMerma, BigDecimal umbralMerma) {
        if (porcentajeMerma == null || umbralMerma == null) {
            return false;
        }
        return porcentajeMerma.compareTo(umbralMerma) > 0;
    }

    public static boolean esRegistroIncompleto(
        BigDecimal porcentajeMerma,
        BigDecimal umbralMerma,
        String justificacionIncidencia
    ) {
        return superaUmbralMerma(porcentajeMerma, umbralMerma)
            && (justificacionIncidencia == null || justificacionIncidencia.isBlank());
    }

    public static boolean haySobrecosto(BigDecimal margenPorcentaje) {
        return margenPorcentaje != null && margenPorcentaje.compareTo(BigDecimal.ZERO) < 0;
    }

    public static BalanceTransformacionDTO construirBalance(
        Long transformacionId,
        String loteSalidaCodigo,
        BigDecimal costoEtapaCop,
        BigDecimal cantidadSalidaKg,
        BigDecimal precioVentaGuardadoCop,
        BigDecimal precioVentaSimuladoCop,
        String costosIncluidos
    ) {
        boolean esSimulacion = precioVentaSimuladoCop != null;
        BigDecimal cantidadSalidaEscala = cantidadSalidaKg != null
            ? cantidadSalidaKg.setScale(3, RoundingMode.HALF_UP)
            : BigDecimal.ZERO.setScale(3, RoundingMode.HALF_UP);
        BigDecimal costoEtapaEscala = costoEtapaCop != null
            ? costoEtapaCop.setScale(2, RoundingMode.HALF_UP)
            : null;
        BigDecimal precioEfectivo = esSimulacion ? precioVentaSimuladoCop : precioVentaGuardadoCop;
        BigDecimal precioEfectivoEscala = precioEfectivo != null
            ? precioEfectivo.setScale(2, RoundingMode.HALF_UP)
            : null;

        List<String> supuestos = List.of(
            "Salida vendible = cantidad de salida registrada (" + formatearFlexibleEsCo(cantidadSalidaEscala) + " kg).",
            "Precio de venta hipotético del ejercicio.",
            "Valores del caso simulado; no son estándares agronómicos ni de mercado."
        );

        if (cantidadSalidaEscala.compareTo(BigDecimal.ZERO) <= 0) {
            return new BalanceTransformacionDTO(
                transformacionId,
                loteSalidaCodigo,
                costoEtapaEscala,
                cantidadSalidaEscala,
                null,
                precioEfectivoEscala,
                null,
                esSimulacion,
                false,
                MOTIVO_SALIDA_CERO,
                new FormulasBalanceDTO(
                    "Costo unitario = no calculable (salida vendible = 0 kg)",
                    "Margen = no calculable (salida vendible = 0 kg)"
                ),
                costosIncluidos,
                supuestos
            );
        }

        if (costoEtapaEscala == null) {
            return new BalanceTransformacionDTO(
                transformacionId,
                loteSalidaCodigo,
                null,
                cantidadSalidaEscala,
                null,
                precioEfectivoEscala,
                null,
                esSimulacion,
                false,
                MOTIVO_SIN_COSTO_ETAPA,
                new FormulasBalanceDTO(
                    "Costo unitario = no calculable (costo de etapa no registrado)",
                    "Margen = no calculable (costo de etapa no registrado)"
                ),
                costosIncluidos,
                supuestos
            );
        }

        BigDecimal costoUnitarioCop = calcularCostoUnitario(costoEtapaEscala, cantidadSalidaEscala);
        String formulaCostoUnitario = String.format(
            "Costo unitario = costo total de la etapa ÷ kg de salida vendible = %s ÷ %s = %s COP/kg",
            formatearFlexibleEsCo(costoEtapaEscala),
            formatearFlexibleEsCo(cantidadSalidaEscala),
            formatearFlexibleEsCo(costoUnitarioCop)
        );

        if (precioEfectivoEscala == null) {
            return new BalanceTransformacionDTO(
                transformacionId,
                loteSalidaCodigo,
                costoEtapaEscala,
                cantidadSalidaEscala,
                costoUnitarioCop,
                null,
                null,
                esSimulacion,
                true,
                null,
                new FormulasBalanceDTO(
                    formulaCostoUnitario,
                    "Margen = no calculable (precio de venta no especificado)"
                ),
                costosIncluidos,
                supuestos
            );
        }

        if (precioEfectivoEscala.compareTo(BigDecimal.ZERO) == 0) {
            return new BalanceTransformacionDTO(
                transformacionId,
                loteSalidaCodigo,
                costoEtapaEscala,
                cantidadSalidaEscala,
                costoUnitarioCop,
                precioEfectivoEscala,
                null,
                esSimulacion,
                false,
                MOTIVO_PRECIO_CERO,
                new FormulasBalanceDTO(
                    formulaCostoUnitario,
                    "Margen = no calculable (precio de venta = 0 COP/kg, división entre cero)"
                ),
                costosIncluidos,
                supuestos
            );
        }

        BigDecimal margenPorcentaje = calcularMargenPorcentaje(costoUnitarioCop, precioEfectivoEscala);
        String formulaMargen = String.format(
            "Margen = (precio − costo unitario) ÷ precio × 100 = (%s − %s) ÷ %s × 100 = %s %%",
            formatearFlexibleEsCo(precioEfectivoEscala),
            formatearFlexibleEsCo(costoUnitarioCop),
            formatearFlexibleEsCo(precioEfectivoEscala),
            formatearDosDecimalesEsCo(margenPorcentaje)
        );

        return new BalanceTransformacionDTO(
            transformacionId,
            loteSalidaCodigo,
            costoEtapaEscala,
            cantidadSalidaEscala,
            costoUnitarioCop,
            precioEfectivoEscala,
            margenPorcentaje,
            esSimulacion,
            true,
            null,
            new FormulasBalanceDTO(formulaCostoUnitario, formulaMargen),
            costosIncluidos,
            supuestos
        );
    }

    public static String formatearFlexibleEsCo(BigDecimal valor) {
        DecimalFormatSymbols simbolos = simbolosEsCo();
        DecimalFormat df = new DecimalFormat("#,##0.###", simbolos);
        return df.format(valor);
    }

    public static String formatearUnDecimalEsCo(BigDecimal valor) {
        DecimalFormatSymbols simbolos = simbolosEsCo();
        DecimalFormat df = new DecimalFormat("#,##0.0", simbolos);
        return df.format(valor);
    }

    public static String formatearDosDecimalesEsCo(BigDecimal valor) {
        DecimalFormatSymbols simbolos = simbolosEsCo();
        DecimalFormat df = new DecimalFormat("#,##0.00", simbolos);
        return df.format(valor);
    }

    private static DecimalFormatSymbols simbolosEsCo() {
        DecimalFormatSymbols simbolos = new DecimalFormatSymbols(Locale.forLanguageTag("es-CO"));
        simbolos.setDecimalSeparator(',');
        simbolos.setGroupingSeparator('.');
        return simbolos;
    }

    private static void validarEntradaPositivaYSalidaNoNegativa(BigDecimal cantidadEntrada, BigDecimal cantidadSalida) {
        if (cantidadEntrada == null || cantidadEntrada.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La cantidad de entrada debe ser mayor que 0.");
        }
        if (cantidadSalida == null || cantidadSalida.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("La cantidad de salida no puede ser negativa.");
        }
    }
}
