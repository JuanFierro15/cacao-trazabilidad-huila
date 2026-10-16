package co.edu.usco.cacao.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public sealed interface EventoLineaTrazabilidadDTO
    permits EventoLineaTrazabilidadDTO.Recepcion, EventoLineaTrazabilidadDTO.TransformacionEvento {

    int orden();

    String tipo();

    LocalDate fecha();

    record Recepcion(
        int orden,
        String tipo,
        LocalDate fecha,
        String codigoLote,
        String descripcion
    ) implements EventoLineaTrazabilidadDTO {

        public static Recepcion crear(int orden, LocalDate fecha, String codigoLote, String descripcion) {
            return new Recepcion(orden, "RECEPCION", fecha, codigoLote, descripcion);
        }
    }

    record TransformacionEvento(
        int orden,
        String tipo,
        LocalDate fecha,
        String etapa,
        String loteEntrada,
        String loteSalida,
        BigDecimal cantidadEntradaKg,
        BigDecimal cantidadSalidaKg,
        BigDecimal porcentajeMerma,
        String responsable,
        String incidencia
    ) implements EventoLineaTrazabilidadDTO {

        public static TransformacionEvento crear(
            int orden,
            LocalDate fecha,
            String etapa,
            String loteEntrada,
            String loteSalida,
            BigDecimal cantidadEntradaKg,
            BigDecimal cantidadSalidaKg,
            BigDecimal porcentajeMerma,
            String responsable,
            String incidencia
        ) {
            return new TransformacionEvento(
                orden,
                "TRANSFORMACION",
                fecha,
                etapa,
                loteEntrada,
                loteSalida,
                cantidadEntradaKg,
                cantidadSalidaKg,
                porcentajeMerma,
                responsable,
                incidencia
            );
        }
    }
}
