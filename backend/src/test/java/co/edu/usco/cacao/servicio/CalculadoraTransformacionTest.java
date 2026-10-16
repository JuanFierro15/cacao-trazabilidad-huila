package co.edu.usco.cacao.servicio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import co.edu.usco.cacao.web.dto.BalanceTransformacionDTO;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CalculadoraTransformacionTest {

    @Test
    @DisplayName("100 kg → 80 kg calcula merma 20,00 % y rendimiento 80,00 %")
    void calcularMermaYRendimientoCasoJurado() {
        BigDecimal entrada = new BigDecimal("100");
        BigDecimal salida = new BigDecimal("80");

        assertEquals(new BigDecimal("20.00"), CalculadoraTransformacion.calcularPorcentajeMerma(entrada, salida));
        assertEquals(new BigDecimal("80.00"), CalculadoraTransformacion.calcularPorcentajeRendimiento(entrada, salida));
    }

    @Test
    @DisplayName("Salida mayor a entrada (con insumos) produce merma negativa redondeada a 2 decimales")
    void calcularMermaNegativaConInsumos() {
        BigDecimal entrada = new BigDecimal("100");
        BigDecimal salida = new BigDecimal("105.5");

        assertEquals(new BigDecimal("-5.50"), CalculadoraTransformacion.calcularPorcentajeMerma(entrada, salida));
        assertEquals(new BigDecimal("105.50"), CalculadoraTransformacion.calcularPorcentajeRendimiento(entrada, salida));
    }

    @Test
    @DisplayName("Costo unitario 1.600.000 ÷ 80 = 20.000,00 COP/kg y margen sobre 25.000 = 20,00 %")
    void calcularCostoUnitarioYMargenCasoJurado() {
        BigDecimal costoEtapa = new BigDecimal("1600000");
        BigDecimal salida = new BigDecimal("80");
        BigDecimal precioVenta = new BigDecimal("25000");

        BigDecimal costoUnitario = CalculadoraTransformacion.calcularCostoUnitario(costoEtapa, salida);
        BigDecimal margen = CalculadoraTransformacion.calcularMargenPorcentaje(costoUnitario, precioVenta);

        assertEquals(new BigDecimal("20000.00"), costoUnitario);
        assertEquals(new BigDecimal("20.00"), margen);
    }

    @Test
    @DisplayName("Salida 0 o precio 0 devuelven null en costo unitario y margen sin lanzar ArithmeticException")
    void divisionEntreCeroDevuelveNull() {
        assertNull(CalculadoraTransformacion.calcularCostoUnitario(new BigDecimal("1600000"), BigDecimal.ZERO));
        assertNull(CalculadoraTransformacion.calcularMargenPorcentaje(new BigDecimal("20000"), BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Reglas de alerta: MERMA_ALTA (> 15,0), REGISTRO_INCOMPLETO y SOBRECOSTO (margen < 0)")
    void evaluarCondicionesDeAlerta() {
        BigDecimal umbral = new BigDecimal("15.0");
        assertFalse(CalculadoraTransformacion.superaUmbralMerma(new BigDecimal("15.00"), umbral));
        assertTrue(CalculadoraTransformacion.superaUmbralMerma(new BigDecimal("15.01"), umbral));

        assertTrue(CalculadoraTransformacion.esRegistroIncompleto(new BigDecimal("20.00"), umbral, "   "));
        assertFalse(CalculadoraTransformacion.esRegistroIncompleto(new BigDecimal("20.00"), umbral, "Grano húmedo"));

        assertTrue(CalculadoraTransformacion.haySobrecosto(new BigDecimal("-0.01")));
        assertFalse(CalculadoraTransformacion.haySobrecosto(new BigDecimal("0.00")));
    }

    @Test
    @DisplayName("construirBalance genera fórmulas exactas con los números reales y marca calculable=false cuando salida es 0")
    void construirBalanceConFormulasYConSalidaCero() {
        BalanceTransformacionDTO balanceValido = CalculadoraTransformacion.construirBalance(
            1L,
            "CAC001-T1",
            new BigDecimal("1600000"),
            new BigDecimal("80"),
            new BigDecimal("25000"),
            null,
            "Materia prima acopiada, mano de obra de planta y energía"
        );

        assertTrue(balanceValido.calculable());
        assertFalse(balanceValido.esSimulacion());
        assertNull(balanceValido.motivoNoCalculable());
        assertEquals(new BigDecimal("20000.00"), balanceValido.costoUnitarioCop());
        assertEquals(new BigDecimal("20.00"), balanceValido.margenPorcentaje());
        assertEquals(
            "Costo unitario = costo total de la etapa ÷ kg de salida vendible = 1.600.000 ÷ 80 = 20.000 COP/kg",
            balanceValido.formulas().costoUnitario()
        );
        assertEquals(
            "Margen = (precio − costo unitario) ÷ precio × 100 = (25.000 − 20.000) ÷ 25.000 × 100 = 20,00 %",
            balanceValido.formulas().margen()
        );
        assertEquals(3, balanceValido.supuestos().size());
        assertEquals("Salida vendible = cantidad de salida registrada (80 kg).", balanceValido.supuestos().getFirst());

        BalanceTransformacionDTO balanceSalidaCero = CalculadoraTransformacion.construirBalance(
            2L,
            null,
            new BigDecimal("500000"),
            BigDecimal.ZERO,
            new BigDecimal("25000"),
            null,
            "Costos de prueba"
        );

        assertFalse(balanceSalidaCero.calculable());
        assertNull(balanceSalidaCero.costoUnitarioCop());
        assertNull(balanceSalidaCero.margenPorcentaje());
        assertEquals(CalculadoraTransformacion.MOTIVO_SALIDA_CERO, balanceSalidaCero.motivoNoCalculable());
    }

    @Test
    @DisplayName("Entrada menor o igual a 0 o salida negativa lanzan IllegalArgumentException")
    void validarArgumentosInvalidos() {
        assertThrows(
            IllegalArgumentException.class,
            () -> CalculadoraTransformacion.calcularPorcentajeMerma(BigDecimal.ZERO, BigDecimal.ONE)
        );
        assertThrows(
            IllegalArgumentException.class,
            () -> CalculadoraTransformacion.calcularPorcentajeMerma(BigDecimal.TEN, new BigDecimal("-1"))
        );
    }
}
