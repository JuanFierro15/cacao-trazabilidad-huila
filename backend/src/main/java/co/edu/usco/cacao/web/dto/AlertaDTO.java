package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.Alerta;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public record AlertaDTO(
    Long id,
    String tipoAlerta,
    String loteCodigo,
    Long transformacionId,
    String reglaAplicada,
    String causa,
    BigDecimal valorMedido,
    BigDecimal umbral,
    String fechaGeneracion,
    boolean activa
) {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");

    public static AlertaDTO de(Alerta alerta) {
        Long transId = alerta.getTransformacion() != null ? alerta.getTransformacion().getId() : null;
        String fecha = alerta.getFechaGeneracion() != null
            ? alerta.getFechaGeneracion()
                .atZoneSameInstant(ZONA_BOGOTA)
                .toOffsetDateTime()
                .truncatedTo(ChronoUnit.SECONDS)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
            : null;

        return new AlertaDTO(
            alerta.getId(),
            alerta.getTipoAlerta().name(),
            alerta.getLote().getCodigoLote(),
            transId,
            alerta.getReglaAplicada(),
            alerta.getCausa(),
            alerta.getValorMedido(),
            alerta.getUmbral(),
            fecha,
            alerta.isActiva()
        );
    }
}
