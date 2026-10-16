package co.edu.usco.cacao.config;

import co.edu.usco.cacao.dominio.Usuario;
import co.edu.usco.cacao.repositorio.UsuarioRepository;
import co.edu.usco.cacao.seguridad.JsonAccessDeniedHandler;
import co.edu.usco.cacao.seguridad.JsonAuthenticationEntryPoint;
import co.edu.usco.cacao.seguridad.JwtAutenticacionFiltro;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAutenticacionFiltro jwtAutenticacionFiltro;
    private final JsonAuthenticationEntryPoint authenticationEntryPoint;
    private final JsonAccessDeniedHandler accessDeniedHandler;
    private final String origenesCors;

    public SecurityConfig(
        JwtAutenticacionFiltro jwtAutenticacionFiltro,
        JsonAuthenticationEntryPoint authenticationEntryPoint,
        JsonAccessDeniedHandler accessDeniedHandler,
        @Value("${app.cors.origenes:http://localhost:5173}") String origenesCors
    ) {
        this.jwtAutenticacionFiltro = jwtAutenticacionFiltro;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.origenesCors = origenesCors;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(UsuarioRepository usuarioRepository) {
        return username -> {
            Usuario usuario = usuarioRepository.findByUsername(username)
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
            return new User(
                usuario.getUsername(),
                usuario.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()))
            );
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origenes = Arrays.stream(origenesCors.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
        config.setAllowedOrigins(origenes);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setExposedHeaders(List.of("Content-Disposition"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(eh -> eh
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas (sección 7 del contrato)
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/public/ficha/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // Rutas exclusivas de ADMINISTRADOR (403 para OPERADOR)
                .requestMatchers(HttpMethod.PATCH, "/api/lotes/*/estado").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/lotes/*/recall").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/transformaciones/*/balance").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/alertas").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/auditoria").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/reportes/exportar-csv").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/usuarios", "/api/usuarios/**").hasRole("ADMINISTRADOR")

                // Rutas compartidas entre OPERADOR y ADMINISTRADOR
                .requestMatchers(HttpMethod.GET, "/api/config/reglas").hasAnyRole("OPERADOR", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/productores").hasAnyRole("OPERADOR", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST, "/api/lotes").hasAnyRole("OPERADOR", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/lotes", "/api/lotes/*").hasAnyRole("OPERADOR", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/lotes/*/trazabilidad").hasAnyRole("OPERADOR", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST, "/api/transformaciones").hasAnyRole("OPERADOR", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/transformaciones").hasAnyRole("OPERADOR", "ADMINISTRADOR")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAutenticacionFiltro, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
