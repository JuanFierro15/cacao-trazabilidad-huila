-- ============================================================================
-- VERIFICACIÓN DE INTEGRIDAD DE LA BASE DE DATOS
-- Hackathon Cacao con Historia, Calidad y Valor (Asoprocacao)
-- ============================================================================
-- Este script verifica:
-- 1. Conteos principales: lotes, transformaciones, alertas, auditoría, usuarios.
-- 2. Balance general de masa en inventario (recibido, consumido, disponible).
-- 3. Consistencia de inventario (recibido - consumido = disponible) y reglas clave.
-- 4. Lista ordenada de códigos de lotes para comparar estados antes y después.
-- ============================================================================

\echo '=== 1. CONTEOS PRINCIPALES ==='
SELECT
    (SELECT COUNT(*) FROM lotes) AS total_lotes,
    (SELECT COUNT(*) FROM lotes WHERE tipo_lote = 'RECEPCION') AS lotes_recepcion,
    (SELECT COUNT(*) FROM lotes WHERE tipo_lote = 'DERIVADO') AS lotes_derivados,
    (SELECT COUNT(*) FROM transformaciones) AS total_transformaciones,
    (SELECT COUNT(*) FROM lote_composicion) AS total_composiciones,
    (SELECT COUNT(*) FROM alertas) AS total_alertas,
    (SELECT COUNT(*) FROM auditoria_cambios) AS total_auditoria,
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios;

\echo '=== 2. BALANCE DE MASA EN INVENTARIO (KG) ==='
SELECT
    COALESCE(SUM(cantidad_recibida), 0) AS suma_recibida_kg,
    COALESCE(SUM(cantidad_consumida), 0) AS suma_consumida_kg,
    COALESCE(SUM(cantidad_disponible), 0) AS suma_disponible_kg,
    COALESCE(SUM(cantidad_recibida - cantidad_consumida - cantidad_disponible), 0) AS discrepancia_kg
FROM lotes;

\echo '=== 3. INCONSISTENCIAS DE INVENTARIO (DEBE SER 0 FILAS) ==='
SELECT codigo_lote, cantidad_recibida, cantidad_consumida, cantidad_disponible
  FROM lotes
 WHERE cantidad_disponible <> (cantidad_recibida - cantidad_consumida)
    OR cantidad_disponible < 0
    OR cantidad_consumida < 0;

\echo '=== 4. LISTA ORDENADA DE CÓDIGOS DE LOTES ==='
SELECT
    codigo_lote,
    tipo_lote,
    producto,
    origen_municipio,
    cantidad_recibida AS recibida_kg,
    cantidad_consumida AS consumida_kg,
    cantidad_disponible AS disponible_kg,
    estado
FROM lotes
ORDER BY codigo_lote ASC;
