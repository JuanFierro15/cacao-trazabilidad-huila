package co.edu.usco.cacao.web.dto;

import co.edu.usco.cacao.dominio.AuditoriaCambio;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public record AuditoriaCambioDTO(
    Long id,
    String fechaHora,
    String usuarioUsername,
    String usuarioRol,
    String accion,
    String entidadAfectada,
    String registroReferencia,
    String campoModificado,
    String valorAnterior,
    String valorNuevo,
    String motivo
) {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");

    public static AuditoriaCambioDTO de(AuditoriaCambio auditoria) {
        String fecha = auditoria.getFechaHora() != null
            ? auditoria.getFechaHora()
                .atZoneSameInstant(ZONA_BOGOTA)
                .toOffsetDateTime()
                .truncatedTo(ChronoUnit.SECONDS)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
            : null;

        return new AuditoriaCambioDTO(
            auditoria.getId(),
            fecha,
            auditoria.getUsuarioUsername(),
            auditoria.getUsuarioRol(),
            auditoria.getAccion(),
            auditoria.getEntidadAfectada(),
            auditoria.getRegistroReferencia(),
            auditoria.getCampoModificado(),
            auditoria.getValorAnterior(),
            auditoria.getValorNuevo(),
            auditoria.getMotivo()
        );
    }
}
