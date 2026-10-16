package co.edu.usco.cacao.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAutenticacionFiltro extends OncePerRequestFilter {

    public static final String ATRIBUTO_ERROR_JWT = "jwt_error_mensaje";
    private static final String PREFIJO_BEARER = "Bearer ";

    private final JwtServicio jwtServicio;

    public JwtAutenticacionFiltro(JwtServicio jwtServicio) {
        this.jwtServicio = jwtServicio;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String encabezado = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (encabezado != null && encabezado.startsWith(PREFIJO_BEARER)) {
            String token = encabezado.substring(PREFIJO_BEARER.length()).trim();
            if (!token.isEmpty()) {
                try {
                    Claims claims = jwtServicio.validarYExtraerClaims(token);
                    String username = claims.getSubject();
                    String rol = claims.get("rol", String.class);

                    if (username != null && rol != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        SimpleGrantedAuthority autoridad = new SimpleGrantedAuthority("ROLE_" + rol);
                        UsernamePasswordAuthenticationToken autenticacion = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            List.of(autoridad)
                        );
                        autenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(autenticacion);
                    }
                } catch (JwtException | IllegalArgumentException ex) {
                    SecurityContextHolder.clearContext();
                    request.setAttribute(
                        ATRIBUTO_ERROR_JWT,
                        "El token de sesión es inválido o ha vencido. Inicie sesión nuevamente."
                    );
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
