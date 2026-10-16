package co.edu.usco.cacao.seguridad;

import co.edu.usco.cacao.excepcion.CodigoError;
import co.edu.usco.cacao.excepcion.ErrorRespuestaDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JsonAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
        HttpServletRequest request,
        HttpServletResponse response,
        AuthenticationException authException
    ) throws IOException {
        Object errorJwt = request.getAttribute(JwtAutenticacionFiltro.ATRIBUTO_ERROR_JWT);
        String mensaje = errorJwt instanceof String detalle
            ? detalle
            : "No se encontró una sesión activa o el token ha expirado. Inicie sesión para continuar.";

        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(CodigoError.NO_AUTENTICADO, mensaje);
        response.setStatus(CodigoError.NO_AUTENTICADO.getStatusValue());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), cuerpo);
    }
}
