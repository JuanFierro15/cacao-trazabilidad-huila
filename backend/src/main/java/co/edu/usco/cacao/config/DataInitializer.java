package co.edu.usco.cacao.config;

import co.edu.usco.cacao.dominio.Rol;
import co.edu.usco.cacao.dominio.Usuario;
import co.edu.usco.cacao.repositorio.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        crearUsuarioSiNoExiste("operador1", "cacao123", "Operador Demo", Rol.OPERADOR);
        crearUsuarioSiNoExiste("admin1", "admin123", "Administrador Demo", Rol.ADMINISTRADOR);
    }

    private void crearUsuarioSiNoExiste(String username, String passwordPlano, String nombreCompleto, Rol rol) {
        if (!usuarioRepository.existsByUsername(username)) {
            Usuario usuario = new Usuario(
                username,
                passwordEncoder.encode(passwordPlano),
                nombreCompleto,
                rol,
                true
            );
            usuarioRepository.save(usuario);
            log.info("Usuario de demostración inicializado: {} ({})", username, rol);
        }
    }
}
