package co.edu.usco.cacao.repositorio;

import co.edu.usco.cacao.dominio.Transformacion;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransformacionRepository extends JpaRepository<Transformacion, Long> {

    Optional<Transformacion> findByOperacionUuid(UUID operacionUuid);

    Optional<Transformacion> findByLoteSalidaId(Long loteSalidaId);

    @Query("SELECT t FROM Transformacion t JOIN FETCH t.loteOrigen LEFT JOIN FETCH t.loteSalida WHERE t.id = :id")
    Optional<Transformacion> findByIdConLotes(@Param("id") Long id);

    @Query("""
        SELECT t
          FROM Transformacion t
          JOIN FETCH t.loteOrigen
          LEFT JOIN FETCH t.loteSalida
         WHERE (:loteCodigo IS NULL OR t.loteOrigen.codigoLote = :loteCodigo)
         ORDER BY t.fechaTransformacion ASC, t.id ASC
        """)
    List<Transformacion> listarPorLoteOrigen(@Param("loteCodigo") String loteCodigo);

    @Query("""
        SELECT t
          FROM Transformacion t
          JOIN FETCH t.loteOrigen
          LEFT JOIN FETCH t.loteSalida
         WHERE t.loteOrigen.codigoLote IN :codigos
            OR (t.loteSalida IS NOT NULL AND t.loteSalida.codigoLote IN :codigos)
         ORDER BY t.fechaTransformacion ASC, t.id ASC
        """)
    List<Transformacion> findByCodigosLoteInvolucrados(@Param("codigos") Collection<String> codigos);
}
