package co.edu.usco.cacao.seguridad;

import co.edu.usco.cacao.dominio.Rol;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtServicio {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");

    private final SecretKey claveSecreta;
    private final long expiracionMinutos;

    public record TokenGenerado(String token, OffsetDateTime expiraEn) {
    }

    public JwtServicio(
        @Value("${app.jwt.secreto}") String secreto,
        @Value("${app.jwt.expiracion-minutos:480}") long expiracionMinutos
    ) {
        if (secreto == null || secreto.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 bytes para firmar con HS256.");
        }
        this.claveSecreta = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.expiracionMinutos = expiracionMinutos;
    }

    public TokenGenerado generarToken(String username, Rol rol) {
        Instant ahora = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        Instant expiraInstant = ahora.plus(Duration.ofMinutes(expiracionMinutos));

        String token = Jwts.builder()
            .subject(username)
            .claim("rol", rol.name())
            .issuedAt(Date.from(ahora))
            .expiration(Date.from(expiraInstant))
            .signWith(claveSecreta, Jwts.SIG.HS256)
            .compact();

        OffsetDateTime expiraEn = OffsetDateTime.ofInstant(expiraInstant, ZONA_BOGOTA)
            .truncatedTo(ChronoUnit.SECONDS);
        return new TokenGenerado(token, expiraEn);
    }

    public Claims validarYExtraerClaims(String token) {
        return Jwts.parser()
            .verifyWith(claveSecreta)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
