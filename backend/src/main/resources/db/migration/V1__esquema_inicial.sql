-- =====================================================================
-- V1__esquema_inicial.sql
-- Esquema base de trazabilidad de cacao (Asoprocacao, caso simulado).
-- Regla de oro: este archivo NO se edita después de aplicarse.
-- Cualquier cambio de esquema va en una migración nueva (V3, V4, ...).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Usuarios internos (los crea el DataInitializer con BCrypt)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id               BIGSERIAL    PRIMARY KEY,
    username         VARCHAR(50)  NOT NULL UNIQUE,
    password_hash    VARCHAR(100) NOT NULL,
    nombre_completo  VARCHAR(120) NOT NULL,
    rol              VARCHAR(20)  NOT NULL,
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_usuarios_rol CHECK (rol IN ('OPERADOR', 'ADMINISTRADOR'))
);

-- ---------------------------------------------------------------------
-- Fincas y productores asociados (diferenciador: cuota de plausibilidad)
-- cuota_maxima_kg = acumulado anual plausible de entregas del productor
-- ---------------------------------------------------------------------
CREATE TABLE fincas_productores (
    id                     BIGSERIAL     PRIMARY KEY,
    codigo_productor       VARCHAR(20)   NOT NULL UNIQUE,
    nombre_productor       VARCHAR(120)  NOT NULL,
    nombre_finca           VARCHAR(120)  NOT NULL,
    municipio              VARCHAR(60)   NOT NULL,
    vereda                 VARCHAR(80),
    hectareas_productivas  NUMERIC(8,2)  NOT NULL,
    variedad_cacao         VARCHAR(40)   NOT NULL,
    cuota_maxima_kg        NUMERIC(12,3) NOT NULL,
    CONSTRAINT ck_fincas_hectareas CHECK (hectareas_productivas > 0),
    CONSTRAINT ck_fincas_cuota     CHECK (cuota_maxima_kg > 0)
);

-- ---------------------------------------------------------------------
-- Lotes: de RECEPCION (entran de una finca) o DERIVADO (salen de una
-- transformación). El inventario se valida aquí mismo con CHECK:
-- disponible = recibida - consumida y nunca negativo.
-- ---------------------------------------------------------------------
CREATE TABLE lotes (
    id                   BIGSERIAL     PRIMARY KEY,
    codigo_lote          VARCHAR(30)   NOT NULL UNIQUE,
    tipo_lote            VARCHAR(15)   NOT NULL DEFAULT 'RECEPCION',
    producto             VARCHAR(80)   NOT NULL DEFAULT 'Cacao seco',
    productor_id         BIGINT        NOT NULL REFERENCES fincas_productores (id),
    origen_municipio     VARCHAR(60)   NOT NULL,
    fecha_recepcion      DATE          NOT NULL,
    tipo_grano           VARCHAR(10),
    porcentaje_humedad   NUMERIC(5,2),
    cantidad_recibida    NUMERIC(12,3) NOT NULL,
    cantidad_consumida   NUMERIC(12,3) NOT NULL DEFAULT 0,
    cantidad_disponible  NUMERIC(12,3) NOT NULL,
    unidad               VARCHAR(5)    NOT NULL DEFAULT 'kg',
    estado               VARCHAR(12)   NOT NULL DEFAULT 'PENDIENTE',
    motivo_estado        VARCHAR(300),
    fecha_creacion       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    version_optimista    BIGINT        NOT NULL DEFAULT 0,
    CONSTRAINT ck_lotes_tipo        CHECK (tipo_lote IN ('RECEPCION', 'DERIVADO')),
    CONSTRAINT ck_lotes_grano       CHECK (tipo_grano IS NULL OR tipo_grano IN ('SECO', 'BABA')),
    CONSTRAINT ck_lotes_grano_recep CHECK (tipo_lote = 'DERIVADO' OR tipo_grano IS NOT NULL),
    CONSTRAINT ck_lotes_humedad     CHECK (porcentaje_humedad IS NULL OR porcentaje_humedad BETWEEN 0 AND 100),
    CONSTRAINT ck_lotes_recibida    CHECK (cantidad_recibida > 0),
    CONSTRAINT ck_lotes_consumida   CHECK (cantidad_consumida >= 0),
    CONSTRAINT ck_lotes_inventario  CHECK (cantidad_disponible >= 0
                                           AND cantidad_disponible = cantidad_recibida - cantidad_consumida),
    CONSTRAINT ck_lotes_unidad      CHECK (unidad = 'kg'),
    CONSTRAINT ck_lotes_estado      CHECK (estado IN ('PENDIENTE', 'LIBERADO', 'BLOQUEADO'))
);

-- ---------------------------------------------------------------------
-- Transformaciones: una etapa sobre un lote de origen.
-- operacion_uuid UNIQUE = idempotencia (reenvío no consume dos veces).
-- Si la salida supera la entrada, debe registrarse qué insumos se agregaron.
-- ---------------------------------------------------------------------
CREATE TABLE transformaciones (
    id                         BIGSERIAL     PRIMARY KEY,
    operacion_uuid             UUID          NOT NULL UNIQUE,
    lote_origen_id             BIGINT        NOT NULL REFERENCES lotes (id),
    lote_salida_id             BIGINT        UNIQUE REFERENCES lotes (id),
    etapa                      VARCHAR(40)   NOT NULL,
    responsable                VARCHAR(120)  NOT NULL,
    registrado_por             VARCHAR(50)   NOT NULL,
    fecha_transformacion       DATE          NOT NULL,
    cantidad_entrada           NUMERIC(12,3) NOT NULL,
    cantidad_salida            NUMERIC(12,3) NOT NULL,
    porcentaje_merma           NUMERIC(7,2)  NOT NULL,
    justificacion_incidencia   VARCHAR(500),
    insumos_agregados          VARCHAR(300),
    temperatura_proceso        NUMERIC(5,2),
    humedad_salida             NUMERIC(5,2),
    costo_etapa_cop            NUMERIC(14,2),
    precio_venta_estimado_cop  NUMERIC(14,2),
    costo_unitario_cop         NUMERIC(14,2),
    margen_porcentaje          NUMERIC(7,2),
    detalle_costos_incluidos   VARCHAR(500),
    fecha_registro             TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT ck_trans_etapa CHECK (etapa IN (
        'BENEFICIO_FERMENTACION_SECADO',
        'LIMPIEZA_CLASIFICACION',
        'TOSTADO_ROASTING',
        'DESCASCARILLADO_WINNOWING',
        'MOLIENDA_LICOR_CACAO',
        'CONTROL_CALIDAD_EMPAQUE')),
    CONSTRAINT ck_trans_entrada CHECK (cantidad_entrada > 0),
    CONSTRAINT ck_trans_salida  CHECK (cantidad_salida >= 0),
    CONSTRAINT ck_trans_salida_mayor CHECK (
        cantidad_salida <= cantidad_entrada
        OR (insumos_agregados IS NOT NULL AND length(trim(insumos_agregados)) > 0)),
    CONSTRAINT ck_trans_costo  CHECK (costo_etapa_cop IS NULL OR costo_etapa_cop >= 0),
    CONSTRAINT ck_trans_precio CHECK (precio_venta_estimado_cop IS NULL OR precio_venta_estimado_cop >= 0),
    CONSTRAINT ck_trans_salida_lote CHECK (cantidad_salida > 0 OR lote_salida_id IS NULL)
);

-- ---------------------------------------------------------------------
-- Genealogía padre -> hijo. Con un lote por operación habrá una fila al
-- 100 %; la tabla ya soporta mezclas (varios padres para un hijo).
-- ---------------------------------------------------------------------
CREATE TABLE lote_composicion (
    id                        BIGSERIAL     PRIMARY KEY,
    transformacion_id         BIGINT        NOT NULL REFERENCES transformaciones (id),
    lote_padre_id             BIGINT        NOT NULL REFERENCES lotes (id),
    lote_hijo_id              BIGINT        NOT NULL REFERENCES lotes (id),
    kg_aportados              NUMERIC(12,3) NOT NULL,
    porcentaje_participacion  NUMERIC(5,2)  NOT NULL,
    CONSTRAINT uq_composicion UNIQUE (transformacion_id, lote_padre_id),
    CONSTRAINT ck_comp_kg     CHECK (kg_aportados > 0),
    CONSTRAINT ck_comp_pct    CHECK (porcentaje_participacion > 0 AND porcentaje_participacion <= 100),
    CONSTRAINT ck_comp_ciclo  CHECK (lote_padre_id <> lote_hijo_id)
);

-- ---------------------------------------------------------------------
-- Alertas para decidir (RF04): regla y causa siempre explícitas.
-- ---------------------------------------------------------------------
CREATE TABLE alertas (
    id                 BIGSERIAL     PRIMARY KEY,
    lote_id            BIGINT        NOT NULL REFERENCES lotes (id),
    transformacion_id  BIGINT        REFERENCES transformaciones (id),
    tipo_alerta        VARCHAR(30)   NOT NULL,
    regla_aplicada     VARCHAR(300)  NOT NULL,
    causa              VARCHAR(500)  NOT NULL,
    valor_medido       NUMERIC(14,2),
    umbral             NUMERIC(14,2),
    fecha_generacion   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    activa             BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_alertas_tipo CHECK (tipo_alerta IN (
        'MERMA_ALTA', 'CUOTA_EXCEDIDA', 'SOBRECOSTO', 'REGISTRO_INCOMPLETO'))
);

-- ---------------------------------------------------------------------
-- Auditoría mínima (RF10). Solo inserción: un trigger bloquea UPDATE,
-- DELETE y TRUNCATE para que el historial no se pueda ocultar.
-- ---------------------------------------------------------------------
CREATE TABLE auditoria_cambios (
    id                   BIGSERIAL     PRIMARY KEY,
    fecha_hora           TIMESTAMPTZ   NOT NULL DEFAULT now(),
    usuario_username     VARCHAR(50)   NOT NULL,
    usuario_rol          VARCHAR(20)   NOT NULL,
    accion               VARCHAR(40)   NOT NULL,
    entidad_afectada     VARCHAR(40)   NOT NULL,
    registro_referencia  VARCHAR(60)   NOT NULL,
    campo_modificado     VARCHAR(60),
    valor_anterior       VARCHAR(500),
    valor_nuevo          VARCHAR(500),
    motivo               VARCHAR(500)
);

CREATE FUNCTION fn_auditoria_solo_insercion() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'auditoria_cambios es de solo inserción: % no permitido', TG_OP
        USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auditoria_sin_update_delete
    BEFORE UPDATE OR DELETE ON auditoria_cambios
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_solo_insercion();

CREATE TRIGGER trg_auditoria_sin_truncate
    BEFORE TRUNCATE ON auditoria_cambios
    FOR EACH STATEMENT EXECUTE FUNCTION fn_auditoria_solo_insercion();

-- ---------------------------------------------------------------------
-- Índices para filtros (RF11) y trazabilidad (RF03, prueba de 100 registros)
-- ---------------------------------------------------------------------
CREATE INDEX ix_lotes_origen          ON lotes (origen_municipio);
CREATE INDEX ix_lotes_estado          ON lotes (estado);
CREATE INDEX ix_lotes_productor       ON lotes (productor_id);
CREATE INDEX ix_trans_lote_origen     ON transformaciones (lote_origen_id);
CREATE INDEX ix_comp_padre            ON lote_composicion (lote_padre_id);
CREATE INDEX ix_comp_hijo             ON lote_composicion (lote_hijo_id);
CREATE INDEX ix_alertas_lote          ON alertas (lote_id);
CREATE INDEX ix_auditoria_referencia  ON auditoria_cambios (registro_referencia);
