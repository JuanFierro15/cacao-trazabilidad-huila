-- ============================================================================
-- LIMPIEZA DE REGISTROS SINTÉTICOS DE RENDIMIENTO (BLOQUE I1)
-- ============================================================================
-- Propósito: Eliminar todos los datos sintéticos de prueba de rendimiento
-- (lotes PERF, sus transformaciones asociadas y genealogía de composición).
--
-- Orden de eliminación por restricciones de llave foránea:
-- 1. Alertas asociadas a lotes o transformaciones PERF.
-- 2. Filas de lote_composicion donde el padre o hijo sea un lote PERF.
-- 3. Transformaciones cuyo lote de origen o de salida sea PERF.
-- 4. Lotes con codigo_lote con prefijo 'PERF%'.
-- 5. Productor sintético 'PRD-PERF' solo si ningún otro lote lo referencia.
--
-- REGLA DE AUDITORÍA:
-- La tabla auditoria_cambios es de solo inserción por diseño institucional
-- (los triggers trg_auditoria_sin_update_delete y trg_auditoria_sin_truncate
-- rechazan cualquier operación de DELETE, UPDATE o TRUNCATE). Si algún usuario
-- u operador ejecutó operaciones sobre lotes PERF desde la aplicación web,
-- esas filas de auditoría se conservan intactas en el registro histórico.
-- ============================================================================

BEGIN;

-- 1. Eliminar alertas asociadas a lotes PERF o transformaciones sobre lotes PERF
DELETE FROM alertas
 WHERE lote_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%')
    OR transformacion_id IN (
         SELECT t.id
           FROM transformaciones t
           JOIN lotes l ON l.id = t.lote_origen_id
          WHERE l.codigo_lote LIKE 'PERF%'
       );

-- 2. Eliminar composiciones genealógicas de lotes PERF
DELETE FROM lote_composicion
 WHERE lote_padre_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%')
    OR lote_hijo_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%');

-- 3. Eliminar transformaciones sobre lotes PERF (origen o salida)
DELETE FROM transformaciones
 WHERE lote_origen_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%')
    OR lote_salida_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%');

-- 4. Eliminar lotes con prefijo sintético PERF
DELETE FROM lotes
 WHERE codigo_lote LIKE 'PERF%';

-- 5. Eliminar productor sintético PRD-PERF únicamente si no tiene lotes asociados
DO $$
DECLARE
    v_lotes_asociados INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_lotes_asociados
      FROM lotes l
      JOIN fincas_productores fp ON fp.id = l.productor_id
     WHERE fp.codigo_productor = 'PRD-PERF';

    IF v_lotes_asociados = 0 THEN
        DELETE FROM fincas_productores WHERE codigo_productor = 'PRD-PERF';
        RAISE NOTICE 'Productor sintético PRD-PERF eliminado exitosamente.';
    ELSE
        RAISE NOTICE 'AVISO: El productor PRD-PERF no fue eliminado porque aún tiene % lote(s) asociado(s).', v_lotes_asociados;
    END IF;
END $$;

COMMIT;

\echo '=== RESUMEN TRAS LIMPIEZA DE REGISTROS PERF ==='
SELECT
    (SELECT COUNT(*) FROM lotes WHERE codigo_lote LIKE 'PERF%') AS lotes_perf_restantes,
    (SELECT COUNT(*) FROM transformaciones t JOIN lotes l ON l.id = t.lote_origen_id WHERE l.codigo_lote LIKE 'PERF%') AS transformaciones_perf_restantes,
    (SELECT CASE WHEN EXISTS (SELECT 1 FROM fincas_productores WHERE codigo_productor = 'PRD-PERF')
                 THEN 'Conservado (referenciado por otros lotes)'
                 ELSE 'Eliminado' END) AS estado_productor_prd_perf;
