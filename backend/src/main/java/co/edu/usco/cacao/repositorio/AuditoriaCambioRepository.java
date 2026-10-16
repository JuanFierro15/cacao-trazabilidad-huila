package co.edu.usco.cacao.repositorio;

import co.edu.usco.cacao.dominio.AuditoriaCambio;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditoriaCambioRepository extends JpaRepository<AuditoriaCambio, Long> {

    @Query("""
        SELECT a
          FROM AuditoriaCambio a
         WHERE (:referencia IS NULL OR a.registroReferencia = :referencia)
           AND (:entidad IS NULL OR a.entidadAfectada = :entidad)
         ORDER BY a.fechaHora DESC, a.id DESC
        """)
    List<AuditoriaCambio> filtrarAuditoria(
        @Param("referencia") String referencia,
        @Param("entidad") String entidad
    );

    long countByRegistroReferenciaIn(Collection<String> referencias);
}
