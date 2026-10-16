package co.edu.usco.cacao.excepcion;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorRespuestaDTO(
    String timestamp,
    int status,
    String codigo,
    String mensaje,
    List<ErrorCampoDTO> errores,
    Long transformacionId
) {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");

    public static ErrorRespuestaDTO de(CodigoError codigoError, String mensaje) {
        return de(codigoError, mensaje, List.of(), null);
    }

    public static ErrorRespuestaDTO de(CodigoError codigoError, String mensaje, List<ErrorCampoDTO> errores) {
        return de(codigoError, mensaje, errores, null);
    }

    public static ErrorRespuestaDTO de(
        CodigoError codigoError,
        String mensaje,
        List<ErrorCampoDTO> errores,
        Long transformacionId
    ) {
        String marcaTiempo = OffsetDateTime.now(ZONA_BOGOTA)
            .truncatedTo(ChronoUnit.SECONDS)
            .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        return new ErrorRespuestaDTO(
            marcaTiempo,
            codigoError.getStatusValue(),
            codigoError.name(),
            mensaje,
            errores == null ? List.of() : List.copyOf(errores),
            transformacionId
        );
    }
}
