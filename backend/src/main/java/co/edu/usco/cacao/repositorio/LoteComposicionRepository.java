package co.edu.usco.cacao.repositorio;

import co.edu.usco.cacao.dominio.LoteComposicion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LoteComposicionRepository extends JpaRepository<LoteComposicion, Long> {

    @Query("""
        SELECT lc
          FROM LoteComposicion lc
          JOIN FETCH lc.lotePadre
          JOIN FETCH lc.loteHijo
          JOIN FETCH lc.transformacion
         WHERE lc.loteHijo.id = :loteHijoId
         ORDER BY lc.id ASC
        """)
    List<LoteComposicion> findByLoteHijoId(@Param("loteHijoId") Long loteHijoId);

    @Query("""
        SELECT lc
          FROM LoteComposicion lc
          JOIN FETCH lc.lotePadre
          JOIN FETCH lc.loteHijo
          JOIN FETCH lc.transformacion
         WHERE lc.lotePadre.id = :lotePadreId
         ORDER BY lc.id ASC
        """)
    List<LoteComposicion> findByLotePadreId(@Param("lotePadreId") Long lotePadreId);

    @Query("SELECT lc.lotePadre.codigoLote FROM LoteComposicion lc WHERE lc.loteHijo.id = :loteHijoId ORDER BY lc.id ASC")
    List<String> findCodigosPadresByLoteHijoId(@Param("loteHijoId") Long loteHijoId);

    @Query(
        value = """
            WITH RECURSIVE ancestros AS (
              SELECT lc.lote_padre_id, lc.lote_hijo_id, 1 AS nivel
                FROM lote_composicion lc
                JOIN lotes h ON h.id = lc.lote_hijo_id
               WHERE h.codigo_lote = :codigo
              UNION ALL
              SELECT lc.lote_padre_id, lc.lote_hijo_id, a.nivel + 1
                FROM lote_composicion lc
                JOIN ancestros a ON lc.lote_hijo_id = a.lote_padre_id
            )
            SELECT p.codigo_lote
              FROM ancestros a
              JOIN lotes p ON p.id = a.lote_padre_id
             ORDER BY a.nivel DESC
            """,
        nativeQuery = true
    )
    List<String> buscarCodigosAncestros(@Param("codigo") String codigo);

    @Query(
        value = """
            WITH RECURSIVE descendientes AS (
              SELECT lc.lote_padre_id, lc.lote_hijo_id, 1 AS nivel
                FROM lote_composicion lc
                JOIN lotes p ON p.id = lc.lote_padre_id
               WHERE p.codigo_lote = :codigo
              UNION ALL
              SELECT lc.lote_padre_id, lc.lote_hijo_id, d.nivel + 1
                FROM lote_composicion lc
                JOIN descendientes d ON lc.lote_padre_id = d.lote_hijo_id
            )
            SELECT h.codigo_lote
              FROM descendientes d
              JOIN lotes h ON h.id = d.lote_hijo_id
             ORDER BY d.nivel ASC, h.id ASC
            """,
        nativeQuery = true
    )
    List<String> buscarCodigosDescendientes(@Param("codigo") String codigo);
}
