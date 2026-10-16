package co.edu.usco.cacao.repositorio;

import co.edu.usco.cacao.dominio.FincaProductor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FincaProductorRepository extends JpaRepository<FincaProductor, Long> {

    Optional<FincaProductor> findByCodigoProductor(String codigoProductor);

    List<FincaProductor> findAllByOrderByIdAsc();
}
