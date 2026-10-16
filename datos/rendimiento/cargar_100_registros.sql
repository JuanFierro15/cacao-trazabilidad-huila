-- ============================================================================
-- CARGA DE 100 REGISTROS SINTÉTICOS PARA MEDICIÓN DE RENDIMIENTO (BLOQUE I1)
-- ============================================================================
-- Propósito: Cargar 100 cadenas de trazabilidad completas (400 lotes, 300
-- transformaciones y 300 composiciones) para validar la prueba 10 del jurado
-- (tiempo de respuesta de trazabilidad inferior a 3000 ms).
--
-- Características de los datos:
-- - Datos estrictamente sintéticos con prefijo reservado 'PERF'.
-- - Se insertan directamente vía SQL y no por la API, por lo que no generan
--   registros en auditoria_cambios ni en alertas.
-- - Se eliminan completamente con limpiar_registros_rendimiento.sql.
-- - El script es idempotente: al inicio elimina cualquier lote PERF existente
--   para permitir ejecuciones repetidas limpias.
-- - Utiliza un productor sintético propio ('PRD-PERF') para no alterar las cuotas
--   de los productores A, B y C de la demostración.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Limpieza previa de datos sintéticos PERF existentes (mismo orden que limpieza)
-- ----------------------------------------------------------------------------
DELETE FROM alertas
 WHERE lote_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%')
    OR transformacion_id IN (
         SELECT t.id
           FROM transformaciones t
           JOIN lotes l ON l.id = t.lote_origen_id
          WHERE l.codigo_lote LIKE 'PERF%'
       );

DELETE FROM lote_composicion
 WHERE lote_padre_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%')
    OR lote_hijo_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%');

DELETE FROM transformaciones
 WHERE lote_origen_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%')
    OR lote_salida_id IN (SELECT id FROM lotes WHERE codigo_lote LIKE 'PERF%');

DELETE FROM lotes
 WHERE codigo_lote LIKE 'PERF%';

DELETE FROM fincas_productores
 WHERE codigo_productor = 'PRD-PERF'
   AND NOT EXISTS (
       SELECT 1 FROM lotes l WHERE l.productor_id = fincas_productores.id
   );

-- ----------------------------------------------------------------------------
-- 2. Creación del productor sintético aislado
-- ----------------------------------------------------------------------------
INSERT INTO fincas_productores (
    codigo_productor,
    nombre_productor,
    nombre_finca,
    municipio,
    vereda,
    hectareas_productivas,
    variedad_cacao,
    cuota_maxima_kg
) VALUES (
    'PRD-PERF',
    'Productor sintético de rendimiento',
    'Finca sintética de rendimiento',
    'Campoalegre',
    NULL,
    50.00,
    'CCN-51',
    1000000.000
) ON CONFLICT (codigo_productor) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Inserción de las 100 cadenas de trazabilidad (400 lotes, 300 transformaciones)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_productor_id BIGINT;
    v_cod_rec VARCHAR(30);
    v_cod_t1 VARCHAR(30);
    v_cod_t2 VARCHAR(30);
    v_cod_t3 VARCHAR(30);
    v_fecha_rec DATE;
    v_fecha_t1 DATE;
    v_fecha_t2 DATE;
    v_fecha_t3 DATE;
    v_cant_rec NUMERIC(12,3);
    v_cant_t1 NUMERIC(12,3);
    v_cant_t2 NUMERIC(12,3);
    v_cant_t3 NUMERIC(12,3);
    v_merma_t1 NUMERIC(7,2);
    v_merma_t2 NUMERIC(7,2);
    v_merma_t3 NUMERIC(7,2);
    v_id_rec BIGINT;
    v_id_t1 BIGINT;
    v_id_t2 BIGINT;
    v_id_t3 BIGINT;
    v_id_trans_t1 BIGINT;
    v_id_trans_t2 BIGINT;
    v_id_trans_t3 BIGINT;
BEGIN
    SELECT id INTO STRICT v_productor_id
      FROM fincas_productores
     WHERE codigo_productor = 'PRD-PERF';

    FOR n IN 1..100 LOOP
        v_cod_rec := 'PERF' || lpad(n::text, 3, '0');
        v_cod_t1 := v_cod_rec || '-T1';
        v_cod_t2 := v_cod_rec || '-T2';
        v_cod_t3 := v_cod_rec || '-T3';

        -- Fechas crecientes dentro de septiembre de 2026
        v_fecha_rec := DATE '2026-09-01' + (n % 30);
        v_fecha_t1 := v_fecha_rec + 1;
        v_fecha_t2 := v_fecha_rec + 2;
        v_fecha_t3 := v_fecha_rec + 3;

        -- Cantidades con merma controlada (8 %, 5 % y 12 %, todas bajo el umbral de 15 %)
        v_cant_rec := (100 + (n % 50))::numeric(12,3);
        v_cant_t1 := round(v_cant_rec * 0.92, 3);
        v_cant_t2 := round(v_cant_t1 * 0.95, 3);
        v_cant_t3 := round(v_cant_t2 * 0.88, 3);

        v_merma_t1 := round(((v_cant_rec - v_cant_t1) / v_cant_rec) * 100.0, 2);
        v_merma_t2 := round(((v_cant_t1 - v_cant_t2) / v_cant_t1) * 100.0, 2);
        v_merma_t3 := round(((v_cant_t2 - v_cant_t3) / v_cant_t2) * 100.0, 2);

        -- Lote de recepción: consumido en su totalidad por T1
        INSERT INTO lotes (
            codigo_lote, tipo_lote, producto, productor_id, origen_municipio,
            fecha_recepcion, tipo_grano, porcentaje_humedad, cantidad_recibida,
            cantidad_consumida, cantidad_disponible, unidad, estado
        ) VALUES (
            v_cod_rec, 'RECEPCION', 'Cacao seco', v_productor_id, 'Campoalegre',
            v_fecha_rec, 'SECO', 7.00, v_cant_rec,
            v_cant_rec, 0, 'kg', 'PENDIENTE'
        ) RETURNING id INTO v_id_rec;

        -- Lote derivado T1: consumido en su totalidad por T2
        INSERT INTO lotes (
            codigo_lote, tipo_lote, producto, productor_id, origen_municipio,
            fecha_recepcion, tipo_grano, porcentaje_humedad, cantidad_recibida,
            cantidad_consumida, cantidad_disponible, unidad, estado
        ) VALUES (
            v_cod_t1, 'DERIVADO', 'Grano seco seleccionado', v_productor_id, 'Campoalegre',
            v_fecha_t1, NULL, NULL, v_cant_t1,
            v_cant_t1, 0, 'kg', 'PENDIENTE'
        ) RETURNING id INTO v_id_t1;

        -- Lote derivado T2: consumido en su totalidad por T3
        INSERT INTO lotes (
            codigo_lote, tipo_lote, producto, productor_id, origen_municipio,
            fecha_recepcion, tipo_grano, porcentaje_humedad, cantidad_recibida,
            cantidad_consumida, cantidad_disponible, unidad, estado
        ) VALUES (
            v_cod_t2, 'DERIVADO', 'Grano tostado', v_productor_id, 'Campoalegre',
            v_fecha_t2, NULL, NULL, v_cant_t2,
            v_cant_t2, 0, 'kg', 'PENDIENTE'
        ) RETURNING id INTO v_id_t2;

        -- Lote derivado T3: producto final con todo el inventario disponible
        INSERT INTO lotes (
            codigo_lote, tipo_lote, producto, productor_id, origen_municipio,
            fecha_recepcion, tipo_grano, porcentaje_humedad, cantidad_recibida,
            cantidad_consumida, cantidad_disponible, unidad, estado
        ) VALUES (
            v_cod_t3, 'DERIVADO', 'Nibs de cacao', v_productor_id, 'Campoalegre',
            v_fecha_t3, NULL, NULL, v_cant_t3,
            0, v_cant_t3, 'kg', 'PENDIENTE'
        ) RETURNING id INTO v_id_t3;

        -- Transformación 1: LIMPIEZA_CLASIFICACION
        INSERT INTO transformaciones (
            operacion_uuid, lote_origen_id, lote_salida_id, etapa, responsable,
            registrado_por, fecha_transformacion, cantidad_entrada, cantidad_salida,
            porcentaje_merma, costo_etapa_cop, precio_venta_estimado_cop,
            costo_unitario_cop, margen_porcentaje, detalle_costos_incluidos
        ) VALUES (
            gen_random_uuid(), v_id_rec, v_id_t1, 'LIMPIEZA_CLASIFICACION',
            'Carga sintética de rendimiento', 'carga_sintetica', v_fecha_t1,
            v_cant_rec, v_cant_t1, v_merma_t1, NULL, NULL, NULL, NULL, NULL
        ) RETURNING id INTO v_id_trans_t1;

        -- Composición genealógica 1 (Rec -> T1)
        INSERT INTO lote_composicion (
            transformacion_id, lote_padre_id, lote_hijo_id, kg_aportados, porcentaje_participacion
        ) VALUES (
            v_id_trans_t1, v_id_rec, v_id_t1, v_cant_rec, 100.00
        );

        -- Transformación 2: TOSTADO_ROASTING
        INSERT INTO transformaciones (
            operacion_uuid, lote_origen_id, lote_salida_id, etapa, responsable,
            registrado_por, fecha_transformacion, cantidad_entrada, cantidad_salida,
            porcentaje_merma, costo_etapa_cop, precio_venta_estimado_cop,
            costo_unitario_cop, margen_porcentaje, detalle_costos_incluidos
        ) VALUES (
            gen_random_uuid(), v_id_t1, v_id_t2, 'TOSTADO_ROASTING',
            'Carga sintética de rendimiento', 'carga_sintetica', v_fecha_t2,
            v_cant_t1, v_cant_t2, v_merma_t2, NULL, NULL, NULL, NULL, NULL
        ) RETURNING id INTO v_id_trans_t2;

        -- Composición genealógica 2 (T1 -> T2)
        INSERT INTO lote_composicion (
            transformacion_id, lote_padre_id, lote_hijo_id, kg_aportados, porcentaje_participacion
        ) VALUES (
            v_id_trans_t2, v_id_t1, v_id_t2, v_cant_t1, 100.00
        );

        -- Transformación 3: DESCASCARILLADO_WINNOWING
        INSERT INTO transformaciones (
            operacion_uuid, lote_origen_id, lote_salida_id, etapa, responsable,
            registrado_por, fecha_transformacion, cantidad_entrada, cantidad_salida,
            porcentaje_merma, costo_etapa_cop, precio_venta_estimado_cop,
            costo_unitario_cop, margen_porcentaje, detalle_costos_incluidos
        ) VALUES (
            gen_random_uuid(), v_id_t2, v_id_t3, 'DESCASCARILLADO_WINNOWING',
            'Carga sintética de rendimiento', 'carga_sintetica', v_fecha_t3,
            v_cant_t2, v_cant_t3, v_merma_t3, NULL, NULL, NULL, NULL, NULL
        ) RETURNING id INTO v_id_trans_t3;

        -- Composición genealógica 3 (T2 -> T3)
        INSERT INTO lote_composicion (
            transformacion_id, lote_padre_id, lote_hijo_id, kg_aportados, porcentaje_participacion
        ) VALUES (
            v_id_trans_t3, v_id_t2, v_id_t3, v_cant_t2, 100.00
        );

    END LOOP;
END $$;

COMMIT;

\echo '=== RESUMEN DE REGISTROS SINTÉTICOS CARGADOS ==='
SELECT
    (SELECT COUNT(*) FROM lotes WHERE codigo_lote LIKE 'PERF%') AS total_lotes_perf,
    (SELECT COUNT(*) FROM lotes WHERE codigo_lote LIKE 'PERF%' AND tipo_lote = 'RECEPCION') AS lotes_recepcion_perf,
    (SELECT COUNT(*) FROM lotes WHERE codigo_lote LIKE 'PERF%' AND tipo_lote = 'DERIVADO') AS lotes_derivados_perf,
    (SELECT COUNT(*) FROM transformaciones t JOIN lotes l ON l.id = t.lote_origen_id WHERE l.codigo_lote LIKE 'PERF%') AS transformaciones_perf,
    (SELECT COUNT(*) FROM lote_composicion lc JOIN lotes l ON l.id = lc.lote_padre_id WHERE l.codigo_lote LIKE 'PERF%') AS composiciones_perf;
