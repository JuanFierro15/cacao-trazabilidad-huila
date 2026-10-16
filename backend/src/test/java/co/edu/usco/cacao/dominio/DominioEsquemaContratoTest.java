package co.edu.usco.cacao.dominio;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import co.edu.usco.cacao.repositorio.LoteRepository;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.LockModeType;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.ZoneOffset;
import java.util.Arrays;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Lock;

class DominioEsquemaContratoTest {

    @Test
    @DisplayName("Las 7 entidades JPA declaran @Entity y @Table con los nombres exactos de V1__esquema_inicial.sql")
    void entidadesDeclaranTablasDeV1() {
        verificarTabla(Usuario.class, "usuarios");
        verificarTabla(FincaProductor.class, "fincas_productores");
        verificarTabla(Lote.class, "lotes");
        verificarTabla(Transformacion.class, "transformaciones");
        verificarTabla(LoteComposicion.class, "lote_composicion");
        verificarTabla(Alerta.class, "alertas");
        verificarTabla(AuditoriaCambio.class, "auditoria_cambios");
    }

    @Test
    @DisplayName("Lote.versionOptimista tiene @Version y mapea a version_optimista")
    void loteTieneVersionOptimista() throws NoSuchFieldException {
        Field campo = Lote.class.getDeclaredField("versionOptimista");
        assertNotNull(campo.getAnnotation(Version.class), "Lote.versionOptimista debe tener @Version");
        Column col = campo.getAnnotation(Column.class);
        assertNotNull(col);
        assertEquals("version_optimista", col.name());
        assertFalse(col.nullable());
    }

    @Test
    @DisplayName("Los campos enum usan @Enumerated(EnumType.STRING) y sus valores coinciden con los CHECK de V1")
    void enumsUsanEnumTypeStringYValoresDeV1() throws NoSuchFieldException {
        verificarEnumString(Usuario.class, "rol");
        verificarEnumString(Lote.class, "tipoLote");
        verificarEnumString(Lote.class, "tipoGrano");
        verificarEnumString(Lote.class, "estado");
        verificarEnumString(Transformacion.class, "etapa");
        verificarEnumString(Alerta.class, "tipoAlerta");

        assertArrayEquals(
            new String[]{"OPERADOR", "ADMINISTRADOR"},
            nombresEnum(Rol.values())
        );
        assertArrayEquals(
            new String[]{"RECEPCION", "DERIVADO"},
            nombresEnum(TipoLote.values())
        );
        assertArrayEquals(
            new String[]{"SECO", "BABA"},
            nombresEnum(TipoGrano.values())
        );
        assertArrayEquals(
            new String[]{"PENDIENTE", "LIBERADO", "BLOQUEADO"},
            nombresEnum(EstadoLote.values())
        );
        assertArrayEquals(
            new String[]{
                "BENEFICIO_FERMENTACION_SECADO",
                "LIMPIEZA_CLASIFICACION",
                "TOSTADO_ROASTING",
                "DESCASCARILLADO_WINNOWING",
                "MOLIENDA_LICOR_CACAO",
                "CONTROL_CALIDAD_EMPAQUE"
            },
            nombresEnum(Etapa.values())
        );
        assertEquals("Limpieza y clasificación", Etapa.LIMPIEZA_CLASIFICACION.getNombre());
        assertArrayEquals(
            new String[]{"MERMA_ALTA", "CUOTA_EXCEDIDA", "SOBRECOSTO", "REGISTRO_INCOMPLETO"},
            nombresEnum(TipoAlerta.values())
        );
    }

    @Test
    @DisplayName("Columnas NUMERIC y llaves foráneas coinciden en precisión, escala y nombre con V1__esquema_inicial.sql")
    void columnasNumericYForaneasCoincidenConV1() throws NoSuchFieldException {
        verificarPrecisionEscala(FincaProductor.class, "hectareasProductivas", "hectareas_productivas", 8, 2, false);
        verificarPrecisionEscala(FincaProductor.class, "cuotaMaximaKg", "cuota_maxima_kg", 12, 3, false);

        verificarPrecisionEscala(Lote.class, "porcentajeHumedad", "porcentaje_humedad", 5, 2, true);
        verificarPrecisionEscala(Lote.class, "cantidadRecibida", "cantidad_recibida", 12, 3, false);
        verificarPrecisionEscala(Lote.class, "cantidadConsumida", "cantidad_consumida", 12, 3, false);
        verificarPrecisionEscala(Lote.class, "cantidadDisponible", "cantidad_disponible", 12, 3, false);

        verificarPrecisionEscala(Transformacion.class, "cantidadEntrada", "cantidad_entrada", 12, 3, false);
        verificarPrecisionEscala(Transformacion.class, "cantidadSalida", "cantidad_salida", 12, 3, false);
        verificarPrecisionEscala(Transformacion.class, "porcentajeMerma", "porcentaje_merma", 7, 2, false);
        verificarPrecisionEscala(Transformacion.class, "temperaturaProceso", "temperatura_proceso", 5, 2, true);
        verificarPrecisionEscala(Transformacion.class, "humedadSalida", "humedad_salida", 5, 2, true);
        verificarPrecisionEscala(Transformacion.class, "costoEtapaCop", "costo_etapa_cop", 14, 2, true);
        verificarPrecisionEscala(Transformacion.class, "precioVentaEstimadoCop", "precio_venta_estimado_cop", 14, 2, true);
        verificarPrecisionEscala(Transformacion.class, "costoUnitarioCop", "costo_unitario_cop", 14, 2, true);
        verificarPrecisionEscala(Transformacion.class, "margenPorcentaje", "margen_porcentaje", 7, 2, true);

        verificarPrecisionEscala(LoteComposicion.class, "kgAportados", "kg_aportados", 12, 3, false);
        verificarPrecisionEscala(LoteComposicion.class, "porcentajeParticipacion", "porcentaje_participacion", 5, 2, false);

        verificarPrecisionEscala(Alerta.class, "valorMedido", "valor_medido", 14, 2, true);
        verificarPrecisionEscala(Alerta.class, "umbral", "umbral", 14, 2, true);

        verificarJoinColumn(Lote.class, "productor", "productor_id", false);
        verificarJoinColumn(Transformacion.class, "loteOrigen", "lote_origen_id", false);
        verificarJoinColumn(Transformacion.class, "loteSalida", "lote_salida_id", true);
        verificarJoinColumn(LoteComposicion.class, "transformacion", "transformacion_id", false);
        verificarJoinColumn(LoteComposicion.class, "lotePadre", "lote_padre_id", false);
        verificarJoinColumn(LoteComposicion.class, "loteHijo", "lote_hijo_id", false);
        verificarJoinColumn(Alerta.class, "lote", "lote_id", false);
        verificarJoinColumn(Alerta.class, "transformacion", "transformacion_id", true);
    }

    @Test
    @DisplayName("LoteRepository.findByCodigoLoteForUpdate usa bloqueo pesimista PESSIMISTIC_WRITE")
    void loteRepositoryTieneBloqueoPesimista() throws NoSuchMethodException {
        Method metodo = LoteRepository.class.getMethod("findByCodigoLoteForUpdate", String.class);
        Lock lock = metodo.getAnnotation(Lock.class);
        assertNotNull(lock, "findByCodigoLoteForUpdate debe tener @Lock");
        assertEquals(LockModeType.PESSIMISTIC_WRITE, lock.value());
    }

    @Test
    @DisplayName("Valores por defecto y prePersist de las entidades usan zona America/Bogota (-05:00)")
    void prePersistYValoresPorDefecto() {
        Lote lote = new Lote();
        lote.prePersist();

        assertEquals(TipoLote.RECEPCION, lote.getTipoLote());
        assertEquals("Cacao seco", lote.getProducto());
        assertEquals(BigDecimal.ZERO, lote.getCantidadConsumida());
        assertEquals("kg", lote.getUnidad());
        assertEquals(EstadoLote.PENDIENTE, lote.getEstado());
        assertEquals(0L, lote.getVersionOptimista());
        assertNotNull(lote.getFechaCreacion());
        assertEquals(ZoneOffset.ofHours(-5), lote.getFechaCreacion().getOffset());

        Alerta alerta = new Alerta();
        alerta.prePersist();
        assertTrue(alerta.isActiva());
        assertNotNull(alerta.getFechaGeneracion());
        assertEquals(ZoneOffset.ofHours(-5), alerta.getFechaGeneracion().getOffset());
    }

    private void verificarTabla(Class<?> claseEntidad, String nombreTablaEsperado) {
        assertNotNull(claseEntidad.getAnnotation(Entity.class), claseEntidad.getSimpleName() + " debe tener @Entity");
        Table tabla = claseEntidad.getAnnotation(Table.class);
        assertNotNull(tabla, claseEntidad.getSimpleName() + " debe tener @Table");
        assertEquals(nombreTablaEsperado, tabla.name());
    }

    private void verificarEnumString(Class<?> claseEntidad, String nombreCampo) throws NoSuchFieldException {
        Field campo = claseEntidad.getDeclaredField(nombreCampo);
        Enumerated enumerated = campo.getAnnotation(Enumerated.class);
        assertNotNull(enumerated, claseEntidad.getSimpleName() + "." + nombreCampo + " debe tener @Enumerated");
        assertEquals(EnumType.STRING, enumerated.value());
    }

    private void verificarPrecisionEscala(
        Class<?> claseEntidad,
        String nombreCampo,
        String nombreColumna,
        int precision,
        int scale,
        boolean nullable
    ) throws NoSuchFieldException {
        Field campo = claseEntidad.getDeclaredField(nombreCampo);
        Column col = campo.getAnnotation(Column.class);
        assertNotNull(col, claseEntidad.getSimpleName() + "." + nombreCampo + " debe tener @Column");
        assertEquals(nombreColumna, col.name());
        assertEquals(precision, col.precision());
        assertEquals(scale, col.scale());
        assertEquals(nullable, col.nullable());
    }

    private void verificarJoinColumn(
        Class<?> claseEntidad,
        String nombreCampo,
        String nombreColumna,
        boolean nullable
    ) throws NoSuchFieldException {
        Field campo = claseEntidad.getDeclaredField(nombreCampo);
        JoinColumn join = campo.getAnnotation(JoinColumn.class);
        assertNotNull(join, claseEntidad.getSimpleName() + "." + nombreCampo + " debe tener @JoinColumn");
        assertEquals(nombreColumna, join.name());
        assertEquals(nullable, join.nullable());
    }

    private String[] nombresEnum(Enum<?>[] valores) {
        return Arrays.stream(valores).map(Enum::name).toArray(String[]::new);
    }
}
