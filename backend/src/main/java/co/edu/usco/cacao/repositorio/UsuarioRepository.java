package co.edu.usco.cacao.repositorio;

import co.edu.usco.cacao.dominio.Rol;
import co.edu.usco.cacao.dominio.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);

    List<Usuario> findAllByOrderByRolAscUsernameAsc();

    long countByRolAndActivoTrue(Rol rol);
}
