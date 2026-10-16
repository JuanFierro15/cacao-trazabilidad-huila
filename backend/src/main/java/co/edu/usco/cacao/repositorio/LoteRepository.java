package co.edu.usco.cacao.repositorio;

import co.edu.usco.cacao.dominio.EstadoLote;
import co.edu.usco.cacao.dominio.Lote;
import co.edu.usco.cacao.dominio.TipoLote;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LoteRepository extends JpaRepository<Lote, Long> {

    Optional<Lote> findByCodigoLote(String codigoLote);

    @Query("SELECT l FROM Lote l JOIN FETCH l.productor WHERE l.codigoLote = :codigoLote")
    Optional<Lote> findByCodigoLoteConProductor(@Param("codigoLote") String codigoLote);

    boolean existsByCodigoLote(String codigoLote);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Lote l JOIN FETCH l.productor WHERE l.codigoLote = :codigoLote")
    Optional<Lote> findByCodigoLoteForUpdate(@Param("codigoLote") String codigoLote);

    @Query("""
        SELECT COALESCE(SUM(l.cantidadRecibida), 0)
          FROM Lote l
         WHERE l.productor.id = :productorId
           AND l.tipoLote = co.edu.usco.cacao.dominio.TipoLote.RECEPCION
           AND l.fechaRecepcion BETWEEN :inicioAnio AND :finAnio
        """)
    BigDecimal sumarEntregasProductorEnRango(
        @Param("productorId") Long productorId,
        @Param("inicioAnio") LocalDate inicioAnio,
        @Param("finAnio") LocalDate finAnio
    );

    @Query("SELECT l.codigoLote FROM Lote l WHERE l.tipoLote = co.edu.usco.cacao.dominio.TipoLote.RECEPCION AND l.codigoLote LIKE 'CAC%'")
    List<String> findCodigosRecepcionCac();

    @Query("SELECT COUNT(l) FROM Lote l WHERE l.codigoLote LIKE CONCAT(:prefijoRaiz, '-T%')")
    long countDerivadosPorRaiz(@Param("prefijoRaiz") String prefijoRaiz);

    @Query("""
        SELECT l
          FROM Lote l
          JOIN FETCH l.productor
         WHERE (:origen IS NULL OR LOWER(l.origenMunicipio) = :origen)
           AND (:estado IS NULL OR l.estado = :estado)
           AND (:tipo IS NULL OR l.tipoLote = :tipo)
         ORDER BY l.id ASC
        """)
    List<Lote> filtrarLotes(
        @Param("origen") String origen,
        @Param("estado") EstadoLote estado,
        @Param("tipo") TipoLote tipo
    );

    @Query("SELECT l FROM Lote l JOIN FETCH l.productor WHERE l.codigoLote IN :codigos ORDER BY l.id ASC")
    List<Lote> findByCodigoLoteInConProductor(@Param("codigos") Collection<String> codigos);
}
