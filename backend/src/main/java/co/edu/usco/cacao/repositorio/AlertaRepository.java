package co.edu.usco.cacao.repositorio;

import co.edu.usco.cacao.dominio.Alerta;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    long countByLoteIdAndActivaTrue(Long loteId);

    @Query("""
        SELECT a
          FROM Alerta a
          JOIN FETCH a.lote
          LEFT JOIN FETCH a.transformacion
         WHERE (:activa IS NULL OR a.activa = :activa)
           AND (:loteCodigo IS NULL OR a.lote.codigoLote = :loteCodigo)
         ORDER BY a.fechaGeneracion DESC, a.id DESC
        """)
    List<Alerta> filtrarAlertas(
        @Param("activa") Boolean activa,
        @Param("loteCodigo") String loteCodigo
    );

    @Query("""
        SELECT a
          FROM Alerta a
          JOIN FETCH a.lote
          LEFT JOIN FETCH a.transformacion
         WHERE a.lote.codigoLote IN :codigos
         ORDER BY a.fechaGeneracion ASC, a.id ASC
        """)
    List<Alerta> findByLoteCodigos(@Param("codigos") Collection<String> codigos);
}
