package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.dominio.EstadoLote;
import co.edu.usco.cacao.dominio.Lote;
import co.edu.usco.cacao.dominio.TipoGrano;
import co.edu.usco.cacao.dominio.TipoLote;
import co.edu.usco.cacao.dominio.Transformacion;
import co.edu.usco.cacao.excepcion.ReglaNegocioException;
import co.edu.usco.cacao.repositorio.AlertaRepository;
import co.edu.usco.cacao.repositorio.LoteComposicionRepository;
import co.edu.usco.cacao.repositorio.LoteRepository;
import co.edu.usco.cacao.repositorio.TransformacionRepository;
import co.edu.usco.cacao.web.dto.AlertaDTO;
import co.edu.usco.cacao.web.dto.DerivadoResumenDTO;
import co.edu.usco.cacao.web.dto.EventoLineaTrazabilidadDTO;
import co.edu.usco.cacao.web.dto.FichaPublicaDTO;
import co.edu.usco.cacao.web.dto.LoteRaizTrazabilidadDTO;
import co.edu.usco.cacao.web.dto.OrigenPublicoDTO;
import co.edu.usco.cacao.web.dto.OrigenTrazabilidadDTO;
import co.edu.usco.cacao.web.dto.PasoRecorridoPublicoDTO;
import co.edu.usco.cacao.web.dto.TrazabilidadRespuestaDTO;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrazabilidadServicio {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");
    private static final String DEPARTAMENTO_ORIGEN = "Huila";

    public static final String MENSAJE_ESTADO_LIBERADO =
        "Producto verificado y disponible para la venta.";
    public static final String MENSAJE_ESTADO_PENDIENTE =
        "Producto en proceso de verificación. Aún no está disponible para la venta.";
    public static final String MENSAJE_ESTADO_BLOQUEADO =
        "Producto retenido por control de calidad. No está disponible para la venta.";

    private final LoteRepository loteRepository;
    private final LoteComposicionRepository loteComposicionRepository;
    private final TransformacionRepository transformacionRepository;
    private final AlertaRepository alertaRepository;

    public TrazabilidadServicio(
        LoteRepository loteRepository,
        LoteComposicionRepository loteComposicionRepository,
        TransformacionRepository transformacionRepository,
        AlertaRepository alertaRepository
    ) {
        this.loteRepository = loteRepository;
        this.loteComposicionRepository = loteComposicionRepository;
        this.transformacionRepository = transformacionRepository;
        this.alertaRepository = alertaRepository;
    }

    @Transactional(readOnly = true)
    public TrazabilidadRespuestaDTO obtenerTrazabilidad(String codigo) {
        long inicioNs = System.nanoTime();
        String codigoLimpio = codigo.trim();

        Lote lote = loteRepository.findByCodigoLoteConProductor(codigoLimpio)
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No se encontró el lote con código " + codigoLimpio + "."
            ));

        List<String> codigosAncestros = loteComposicionRepository.buscarCodigosAncestros(lote.getCodigoLote());
        List<String> codigosDescendientes = loteComposicionRepository.buscarCodigosDescendientes(lote.getCodigoLote());

        Lote loteRaiz = codigosAncestros.isEmpty()
            ? lote
            : loteRepository.findByCodigoLoteConProductor(codigosAncestros.getFirst()).orElse(lote);

        Set<String> codigosInvolucrados = new LinkedHashSet<>(codigosAncestros);
        codigosInvolucrados.add(lote.getCodigoLote());
        codigosInvolucrados.addAll(codigosDescendientes);

        List<Transformacion> transformacionesInvolucradas =
            transformacionRepository.findByCodigosLoteInvolucrados(codigosInvolucrados);

        List<Transformacion> transformacionesLinea = filtrarTransformacionesParaLinea(
            lote,
            codigosAncestros,
            codigosDescendientes,
            transformacionesInvolucradas
        );

        List<EventoLineaTrazabilidadDTO> linea = new ArrayList<>();
        int orden = 1;
        linea.add(
            EventoLineaTrazabilidadDTO.Recepcion.crear(
                orden++,
                loteRaiz.getFechaRecepcion(),
                loteRaiz.getCodigoLote(),
                construirDescripcionRecepcion(loteRaiz)
            )
        );

        for (Transformacion t : transformacionesLinea) {
            String loteSalidaCod = t.getLoteSalida() != null ? t.getLoteSalida().getCodigoLote() : null;
            linea.add(
                EventoLineaTrazabilidadDTO.TransformacionEvento.crear(
                    orden++,
                    t.getFechaTransformacion(),
                    t.getEtapa().name(),
                    t.getLoteOrigen().getCodigoLote(),
                    loteSalidaCod,
                    normalizarNumero(t.getCantidadEntrada()),
                    normalizarNumero(t.getCantidadSalida()),
                    t.getPorcentajeMerma(),
                    t.getResponsable(),
                    t.getJustificacionIncidencia()
                )
            );
        }

        List<DerivadoResumenDTO> derivados = construirDerivadosResumen(
            codigosDescendientes,
            transformacionesInvolucradas
        );

        List<AlertaDTO> alertas = alertaRepository.findByLoteCodigos(codigosInvolucrados)
            .stream()
            .map(AlertaDTO::de)
            .toList();

        long tiempoConsultaMs = Math.max(0L, (System.nanoTime() - inicioNs) / 1_000_000L);

        return new TrazabilidadRespuestaDTO(
            lote.getCodigoLote(),
            lote.getProducto(),
            lote.getEstado().name(),
            LoteRaizTrazabilidadDTO.de(loteRaiz),
            OrigenTrazabilidadDTO.de(loteRaiz.getProductor()),
            linea,
            derivados,
            alertas,
            tiempoConsultaMs
        );
    }

    /**
     * Construye la ficha pública usando exclusivamente un DTO de lista blanca (sección 8.7 del contrato).
     */
    @Transactional(readOnly = true)
    public FichaPublicaDTO obtenerFichaPublica(String codigo) {
        String codigoLimpio = codigo.trim();
        Lote lote = loteRepository.findByCodigoLoteConProductor(codigoLimpio)
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No se encontró el lote con código " + codigoLimpio + "."
            ));

        List<String> codigosAncestros = loteComposicionRepository.buscarCodigosAncestros(lote.getCodigoLote());
        List<String> codigosDescendientes = loteComposicionRepository.buscarCodigosDescendientes(lote.getCodigoLote());

        Lote loteRaiz = codigosAncestros.isEmpty()
            ? lote
            : loteRepository.findByCodigoLoteConProductor(codigosAncestros.getFirst()).orElse(lote);

        Set<String> codigosInvolucrados = new LinkedHashSet<>(codigosAncestros);
        codigosInvolucrados.add(lote.getCodigoLote());
        codigosInvolucrados.addAll(codigosDescendientes);

        List<Transformacion> transformacionesInvolucradas =
            transformacionRepository.findByCodigosLoteInvolucrados(codigosInvolucrados);

        List<Transformacion> transformacionesRecorrido = filtrarTransformacionesParaLinea(
            lote,
            codigosAncestros,
            codigosDescendientes,
            transformacionesInvolucradas
        );

        List<PasoRecorridoPublicoDTO> recorrido = new ArrayList<>();
        int orden = 1;
        recorrido.add(new PasoRecorridoPublicoDTO(
            orden++,
            "RECEPCION",
            "Recepción en acopio",
            loteRaiz.getFechaRecepcion()
        ));

        for (Transformacion t : transformacionesRecorrido) {
            recorrido.add(new PasoRecorridoPublicoDTO(
                orden++,
                t.getEtapa().name(),
                t.getEtapa().getNombre(),
                t.getFechaTransformacion()
            ));
        }

        boolean disponibleParaVenta = lote.getEstado() == EstadoLote.LIBERADO
            && lote.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0;

        String mensajeEstado = switch (lote.getEstado()) {
            case LIBERADO -> MENSAJE_ESTADO_LIBERADO;
            case PENDIENTE -> MENSAJE_ESTADO_PENDIENTE;
            case BLOQUEADO -> MENSAJE_ESTADO_BLOQUEADO;
        };

        OrigenPublicoDTO origenPublico = new OrigenPublicoDTO(
            loteRaiz.getProductor().getNombreFinca(),
            loteRaiz.getOrigenMunicipio(),
            DEPARTAMENTO_ORIGEN,
            loteRaiz.getProductor().getVariedadCacao()
        );

        String consultadoEn = OffsetDateTime.now(ZONA_BOGOTA)
            .truncatedTo(ChronoUnit.SECONDS)
            .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        return new FichaPublicaDTO(
            lote.getCodigoLote(),
            lote.getProducto(),
            lote.getEstado().name(),
            disponibleParaVenta,
            mensajeEstado,
            origenPublico,
            loteRaiz.getFechaRecepcion(),
            recorrido,
            consultadoEn
        );
    }

    private List<Transformacion> filtrarTransformacionesParaLinea(
        Lote lote,
        List<String> codigosAncestros,
        List<String> codigosDescendientes,
        List<Transformacion> transformacionesInvolucradas
    ) {
        if (lote.getTipoLote() == TipoLote.RECEPCION) {
            Set<String> arbol = new LinkedHashSet<>();
            arbol.add(lote.getCodigoLote());
            arbol.addAll(codigosDescendientes);
            return transformacionesInvolucradas.stream()
                .filter(t -> arbol.contains(t.getLoteOrigen().getCodigoLote()))
                .toList();
        }

        Set<String> linaje = new LinkedHashSet<>(codigosAncestros);
        linaje.add(lote.getCodigoLote());

        return transformacionesInvolucradas.stream()
            .filter(t ->
                (t.getLoteSalida() != null && linaje.contains(t.getLoteSalida().getCodigoLote()))
                    || (t.getLoteSalida() == null && t.getLoteOrigen().getCodigoLote().equals(lote.getCodigoLote()))
            )
            .toList();
    }

    private List<DerivadoResumenDTO> construirDerivadosResumen(
        List<String> codigosDescendientes,
        List<Transformacion> transformacionesInvolucradas
    ) {
        if (codigosDescendientes.isEmpty()) {
            return List.of();
        }

        Map<String, String> etapaPorLoteSalida = new HashMap<>();
        for (Transformacion t : transformacionesInvolucradas) {
            if (t.getLoteSalida() != null) {
                etapaPorLoteSalida.put(t.getLoteSalida().getCodigoLote(), t.getEtapa().name());
            }
        }

        Map<String, Lote> lotesDescendientesMap = new HashMap<>();
        for (Lote d : loteRepository.findByCodigoLoteInConProductor(codigosDescendientes)) {
            lotesDescendientesMap.put(d.getCodigoLote(), d);
        }

        List<DerivadoResumenDTO> resultado = new ArrayList<>();
        for (String cod : codigosDescendientes) {
            Lote d = lotesDescendientesMap.get(cod);
            if (d != null) {
                resultado.add(DerivadoResumenDTO.de(d, etapaPorLoteSalida.get(cod)));
            }
        }
        return resultado;
    }

    private static String construirDescripcionRecepcion(Lote loteRaiz) {
        String tipoGranoTexto = loteRaiz.getTipoGrano() == TipoGrano.BABA ? "cacao en baba" : "cacao seco";
        String kgTexto = CalculadoraTransformacion.formatearFlexibleEsCo(loteRaiz.getCantidadRecibida());
        if (loteRaiz.getPorcentajeHumedad() != null) {
            String humedadTexto = CalculadoraTransformacion.formatearFlexibleEsCo(loteRaiz.getPorcentajeHumedad());
            return String.format("Recepción de %s kg de %s (humedad %s %%)", kgTexto, tipoGranoTexto, humedadTexto);
        }
        return String.format("Recepción de %s kg de %s", kgTexto, tipoGranoTexto);
    }

    private static BigDecimal normalizarNumero(BigDecimal valor) {
        if (valor == null) {
            return null;
        }
        if (valor.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return valor.stripTrailingZeros();
    }
}
