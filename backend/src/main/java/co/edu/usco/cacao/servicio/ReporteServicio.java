package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.dominio.EstadoLote;
import co.edu.usco.cacao.dominio.Lote;
import co.edu.usco.cacao.dominio.Transformacion;
import co.edu.usco.cacao.repositorio.LoteRepository;
import co.edu.usco.cacao.repositorio.TransformacionRepository;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Exportación CSV del inventario de lotes (sección 8.8 del contrato).
 * UTF-8 con BOM, separador ';' y decimales con coma: así abre con doble clic en Excel en español (Colombia).
 */
@Service
public class ReporteServicio {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");
    private static final DateTimeFormatter FORMATO_NOMBRE_ARCHIVO = DateTimeFormatter.ofPattern("yyyyMMdd_HHmm");
    private static final byte[] BOM_UTF8 = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
    private static final String SEPARADOR = ";";
    private static final String FIN_LINEA = "\r\n";

    public static final String CABECERA_CSV = String.join(SEPARADOR,
        "codigo_lote",
        "tipo_lote",
        "producto",
        "municipio_origen",
        "finca",
        "cantidad_recibida_kg",
        "cantidad_consumida_kg",
        "cantidad_disponible_kg",
        "estado",
        "costo_etapa_cop",
        "costo_unitario_cop",
        "precio_venta_cop",
        "margen_porcentaje"
    );

    private final LoteRepository loteRepository;
    private final TransformacionRepository transformacionRepository;

    public ReporteServicio(LoteRepository loteRepository, TransformacionRepository transformacionRepository) {
        this.loteRepository = loteRepository;
        this.transformacionRepository = transformacionRepository;
    }

    public record ArchivoCsv(String nombreArchivo, byte[] contenido) {
    }

    @Transactional(readOnly = true)
    public ArchivoCsv exportarLotesCsv(String origen, String estado) {
        String origenFiltro = (origen == null || origen.isBlank())
            ? null
            : origen.trim().toLowerCase(Locale.ROOT);
        EstadoLote estadoFiltro = LoteServicio.parsearEstado(estado);

        List<Lote> lotes = loteRepository.filtrarLotes(origenFiltro, estadoFiltro, null)
            .stream()
            .sorted(Comparator.comparing(Lote::getCodigoLote))
            .toList();

        // Los costos de un lote son los de la transformación que lo produjo; se cargan en una sola consulta.
        Map<String, Transformacion> transformacionPorLoteSalida = new HashMap<>();
        if (!lotes.isEmpty()) {
            List<String> codigos = lotes.stream().map(Lote::getCodigoLote).toList();
            for (Transformacion t : transformacionRepository.findByCodigosLoteInvolucrados(codigos)) {
                if (t.getLoteSalida() != null) {
                    transformacionPorLoteSalida.put(t.getLoteSalida().getCodigoLote(), t);
                }
            }
        }

        StringBuilder csv = new StringBuilder(CABECERA_CSV).append(FIN_LINEA);
        for (Lote lote : lotes) {
            Transformacion productora = transformacionPorLoteSalida.get(lote.getCodigoLote());
            csv.append(String.join(SEPARADOR,
                texto(lote.getCodigoLote()),
                texto(lote.getTipoLote().name()),
                texto(lote.getProducto()),
                texto(lote.getOrigenMunicipio()),
                texto(lote.getProductor() != null ? lote.getProductor().getNombreFinca() : null),
                kg(lote.getCantidadRecibida()),
                kg(lote.getCantidadConsumida()),
                kg(lote.getCantidadDisponible()),
                texto(lote.getEstado().name()),
                dosDecimales(productora != null ? productora.getCostoEtapaCop() : null),
                dosDecimales(productora != null ? productora.getCostoUnitarioCop() : null),
                dosDecimales(productora != null ? productora.getPrecioVentaEstimadoCop() : null),
                dosDecimales(productora != null ? productora.getMargenPorcentaje() : null)
            )).append(FIN_LINEA);
        }

        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        salida.writeBytes(BOM_UTF8);
        salida.writeBytes(csv.toString().getBytes(StandardCharsets.UTF_8));

        String nombreArchivo = "lotes_" + OffsetDateTime.now(ZONA_BOGOTA).format(FORMATO_NOMBRE_ARCHIVO) + ".csv";
        return new ArchivoCsv(nombreArchivo, salida.toByteArray());
    }

    /**
     * Campo de texto: se encierra en comillas si trae separador, comillas o saltos de línea, y se neutraliza
     * si empieza por =, +, - o @ para que Excel no lo interprete como fórmula (inyección CSV).
     */
    static String texto(String valor) {
        if (valor == null) {
            return "";
        }
        String limpio = valor;
        if (!limpio.isEmpty() && "=+-@".indexOf(limpio.charAt(0)) >= 0) {
            limpio = "'" + limpio;
        }
        if (limpio.contains(SEPARADOR) || limpio.contains("\"") || limpio.contains("\n") || limpio.contains("\r")) {
            return "\"" + limpio.replace("\"", "\"\"") + "\"";
        }
        return limpio;
    }

    /** Kilogramos sin ceros sobrantes y con coma decimal: 100, 80,5, 0. */
    static String kg(BigDecimal valor) {
        if (valor == null) {
            return "";
        }
        BigDecimal normalizado = valor.compareTo(BigDecimal.ZERO) == 0
            ? BigDecimal.ZERO
            : valor.setScale(3, RoundingMode.HALF_UP).stripTrailingZeros();
        return normalizado.toPlainString().replace('.', ',');
    }

    /** Pesos y porcentajes con dos decimales fijos y coma decimal, sin separador de miles: 1600000,00. */
    static String dosDecimales(BigDecimal valor) {
        if (valor == null) {
            return "";
        }
        return valor.setScale(2, RoundingMode.HALF_UP).toPlainString().replace('.', ',');
    }
}
