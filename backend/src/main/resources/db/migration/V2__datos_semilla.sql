-- =====================================================================
-- V2__datos_semilla.sql
-- Datos sintéticos obligatorios del reto. Productores y fincas ficticios;
-- los municipios son referencias de ubicación del caso.
-- cuota_maxima_kg = hectáreas x 600 kg/ha/año (supuesto del ejercicio,
-- no es un estándar agronómico).
-- IMPORTANTE: CAC001 queda con 100 kg disponibles y SIN transformaciones,
-- porque el jurado registra en vivo la transformación 100 kg -> 80 kg.
-- Los usuarios NO se crean aquí: los crea el DataInitializer (BCrypt).
-- =====================================================================

INSERT INTO fincas_productores
    (codigo_productor, nombre_productor, nombre_finca, municipio, vereda,
     hectareas_productivas, variedad_cacao, cuota_maxima_kg)
VALUES
    ('PRD-A', 'Productor A', 'Finca La Esperanza', 'Rivera',      NULL, 2.00, 'CCN-51',     1200),
    ('PRD-B', 'Productor B', 'Finca El Vergel',    'Campoalegre', NULL, 3.50, 'Trinitario', 2100),
    ('PRD-C', 'Productor C', 'Finca Los Cámbulos', 'Algeciras',   NULL, 0.50, 'Criollo',     300);

INSERT INTO lotes
    (codigo_lote, tipo_lote, producto, productor_id, origen_municipio, fecha_recepcion,
     tipo_grano, porcentaje_humedad, cantidad_recibida, cantidad_consumida, cantidad_disponible,
     unidad, estado)
VALUES
    ('CAC001', 'RECEPCION', 'Cacao seco', (SELECT id FROM fincas_productores WHERE codigo_productor = 'PRD-A'),
     'Rivera',      DATE '2026-10-14', 'SECO', 7.50, 100, 0, 100, 'kg', 'PENDIENTE'),
    ('CAC002', 'RECEPCION', 'Cacao seco', (SELECT id FROM fincas_productores WHERE codigo_productor = 'PRD-B'),
     'Campoalegre', DATE '2026-10-14', 'SECO', 7.20, 150, 0, 150, 'kg', 'PENDIENTE'),
    ('CAC003', 'RECEPCION', 'Cacao seco', (SELECT id FROM fincas_productores WHERE codigo_productor = 'PRD-C'),
     'Algeciras',   DATE '2026-10-14', 'SECO', 7.80,  80, 0,  80, 'kg', 'PENDIENTE');
