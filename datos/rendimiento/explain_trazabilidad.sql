-- ============================================================================
-- EXPLAIN ANALYZE DE CONSULTAS RECURSIVAS DE TRAZABILIDAD (BLOQUE I1)
-- ============================================================================
-- Este script ejecuta el análisis de rendimiento a nivel de motor de base de
-- datos (PostgreSQL 16) con tiempos reales de ejecución y uso de buffers para
-- las dos consultas nativas recursivas de TrazabilidadServicio:
-- 1. Consulta de ancestros (hacia atrás) para el lote derivado 'PERF050-T3'.
-- 2. Consulta de descendientes (hacia adelante) para el lote raíz 'PERF050'.
-- ============================================================================

\echo '=== 1. EXPLAIN (ANALYZE, BUFFERS) - ANCESTROS HACIA ATRÁS: PERF050-T3 ==='
EXPLAIN (ANALYZE, BUFFERS)
WITH RECURSIVE ancestros AS (
  SELECT lc.lote_padre_id, lc.lote_hijo_id, 1 AS nivel
    FROM lote_composicion lc
    JOIN lotes h ON h.id = lc.lote_hijo_id
   WHERE h.codigo_lote = 'PERF050-T3'
  UNION ALL
  SELECT lc.lote_padre_id, lc.lote_hijo_id, a.nivel + 1
    FROM lote_composicion lc
    JOIN ancestros a ON lc.lote_hijo_id = a.lote_padre_id
)
SELECT p.codigo_lote
  FROM ancestros a
  JOIN lotes p ON p.id = a.lote_padre_id
 ORDER BY a.nivel DESC;

\echo ''
\echo '=== 2. EXPLAIN (ANALYZE, BUFFERS) - DESCENDIENTES HACIA ADELANTE: PERF050 ==='
EXPLAIN (ANALYZE, BUFFERS)
WITH RECURSIVE descendientes AS (
  SELECT lc.lote_padre_id, lc.lote_hijo_id, 1 AS nivel
    FROM lote_composicion lc
    JOIN lotes p ON p.id = lc.lote_padre_id
   WHERE p.codigo_lote = 'PERF050'
  UNION ALL
  SELECT lc.lote_padre_id, lc.lote_hijo_id, d.nivel + 1
    FROM lote_composicion lc
    JOIN descendientes d ON lc.lote_padre_id = d.lote_hijo_id
)
SELECT h.codigo_lote
  FROM descendientes d
  JOIN lotes h ON h.id = d.lote_hijo_id
 ORDER BY d.nivel ASC, h.id ASC;
