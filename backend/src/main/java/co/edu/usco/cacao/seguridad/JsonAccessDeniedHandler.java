package co.edu.usco.cacao.seguridad;

import co.edu.usco.cacao.excepcion.CodigoError;
import co.edu.usco.cacao.excepcion.ErrorRespuestaDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class JsonAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public JsonAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(
        HttpServletRequest request,
        HttpServletResponse response,
        AccessDeniedException accessDeniedException
    ) throws IOException {
        String uri = request.getRequestURI();
        String mensaje = (uri != null && uri.matches("^/api/lotes/[^/]+/estado$"))
            ? "Solo el Administrador puede liberar o bloquear lotes."
            : "No tiene permisos para acceder a este recurso. Se requiere rol ADMINISTRADOR.";

        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(CodigoError.ACCESO_DENEGADO, mensaje);
        response.setStatus(CodigoError.ACCESO_DENEGADO.getStatusValue());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), cuerpo);
    }
}
