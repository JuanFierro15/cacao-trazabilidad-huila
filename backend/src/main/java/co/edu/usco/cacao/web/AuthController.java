package co.edu.usco.cacao.web;

import co.edu.usco.cacao.dominio.Usuario;
import co.edu.usco.cacao.excepcion.ReglaNegocioException;
import co.edu.usco.cacao.repositorio.UsuarioRepository;
import co.edu.usco.cacao.seguridad.JwtServicio;
import co.edu.usco.cacao.web.dto.LoginRespuestaDTO;
import co.edu.usco.cacao.web.dto.LoginSolicitudDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.format.DateTimeFormatter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "1. Autenticación", description = "Inicio de sesión y emisión de tokens JWT (HS256)")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServicio jwtServicio;

    public AuthController(
        UsuarioRepository usuarioRepository,
        PasswordEncoder passwordEncoder,
        JwtServicio jwtServicio
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtServicio = jwtServicio;
    }

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(
        summary = "[Público] Iniciar sesión y obtener token JWT",
        description = "Valida credenciales de usuario activo y devuelve el token JWT junto con el rol (OPERADOR o ADMINISTRADOR) y fecha de expiración."
    )
    public ResponseEntity<LoginRespuestaDTO> login(@Valid @RequestBody LoginSolicitudDTO solicitud) {
        Usuario usuario = usuarioRepository.findByUsername(solicitud.username().trim())
            .filter(Usuario::isActivo)
            .orElseThrow(ReglaNegocioException::credencialesInvalidas);

        if (!passwordEncoder.matches(solicitud.password(), usuario.getPasswordHash())) {
            throw ReglaNegocioException.credencialesInvalidas();
        }

        JwtServicio.TokenGenerado tokenGenerado = jwtServicio.generarToken(
            usuario.getUsername(),
            usuario.getRol()
        );

        LoginRespuestaDTO respuesta = new LoginRespuestaDTO(
            tokenGenerado.token(),
            usuario.getUsername(),
            usuario.getNombreCompleto(),
            usuario.getRol().name(),
            tokenGenerado.expiraEn().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
        );
        return ResponseEntity.ok(respuesta);
    }
}
