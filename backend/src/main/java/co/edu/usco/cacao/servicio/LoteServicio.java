package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.dominio.Alerta;
import co.edu.usco.cacao.dominio.EstadoLote;
import co.edu.usco.cacao.dominio.FincaProductor;
import co.edu.usco.cacao.dominio.Lote;
import co.edu.usco.cacao.dominio.TipoAlerta;
import co.edu.usco.cacao.dominio.TipoGrano;
import co.edu.usco.cacao.dominio.TipoLote;
import co.edu.usco.cacao.excepcion.ReglaNegocioException;
import co.edu.usco.cacao.repositorio.AlertaRepository;
import co.edu.usco.cacao.repositorio.FincaProductorRepository;
import co.edu.usco.cacao.repositorio.LoteComposicionRepository;
import co.edu.usco.cacao.repositorio.LoteRepository;
import co.edu.usco.cacao.web.dto.AlertaDTO;
import co.edu.usco.cacao.web.dto.CambioEstadoRespuestaDTO;
import co.edu.usco.cacao.web.dto.CambioEstadoSolicitudDTO;
import co.edu.usco.cacao.web.dto.LoteAfectadoEstadoDTO;
import co.edu.usco.cacao.web.dto.LoteCreacionRespuestaDTO;
import co.edu.usco.cacao.web.dto.LoteCreacionSolicitudDTO;
import co.edu.usco.cacao.web.dto.LoteDTO;
import co.edu.usco.cacao.web.dto.ProductorResumenDTO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoteServicio {

    private static final Pattern PATRON_CAC_NUMERICO = Pattern.compile("^CAC(\\d+)$");

    private final LoteRepository loteRepository;
    private final FincaProductorRepository fincaProductorRepository;
    private final LoteComposicionRepository loteComposicionRepository;
    private final AlertaRepository alertaRepository;
    private final AuditoriaServicio auditoriaServicio;

    public LoteServicio(
        LoteRepository loteRepository,
        FincaProductorRepository fincaProductorRepository,
        LoteComposicionRepository loteComposicionRepository,
        AlertaRepository alertaRepository,
        AuditoriaServicio auditoriaServicio
    ) {
        this.loteRepository = loteRepository;
        this.fincaProductorRepository = fincaProductorRepository;
        this.loteComposicionRepository = loteComposicionRepository;
        this.alertaRepository = alertaRepository;
        this.auditoriaServicio = auditoriaServicio;
    }

    @Transactional
    public LoteCreacionRespuestaDTO crearLote(LoteCreacionSolicitudDTO solicitud) {
        FincaProductor productor = fincaProductorRepository.findById(solicitud.productorId())
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No existe un productor registrado con el identificador " + solicitud.productorId() + "."
            ));

        String codigoAsignado = resolverCodigoLote(solicitud.codigoLote());

        int anio = solicitud.fechaRecepcion().getYear();
        LocalDate inicioAnio = LocalDate.of(anio, 1, 1);
        LocalDate finAnio = LocalDate.of(anio, 12, 31);
        BigDecimal entregadoPrevioAnioKg = loteRepository.sumarEntregasProductorEnRango(
            productor.getId(),
            inicioAnio,
            finAnio
        );

        BigDecimal cantidadRecibida = solicitud.cantidadRecibida().setScale(3, RoundingMode.HALF_UP);
        BigDecimal humedad = solicitud.porcentajeHumedad() != null
            ? solicitud.porcentajeHumedad().setScale(2, RoundingMode.HALF_UP)
            : null;

        Lote lote = new Lote();
        lote.setCodigoLote(codigoAsignado);
        lote.setTipoLote(TipoLote.RECEPCION);
        lote.setProducto(solicitud.tipoGrano() == TipoGrano.BABA ? "Cacao en baba" : "Cacao seco");
        lote.setProductor(productor);
        lote.setOrigenMunicipio(productor.getMunicipio());
        lote.setFechaRecepcion(solicitud.fechaRecepcion());
        lote.setTipoGrano(solicitud.tipoGrano());
        lote.setPorcentajeHumedad(humedad);
        lote.setCantidadRecibida(cantidadRecibida);
        lote.setCantidadConsumida(BigDecimal.ZERO.setScale(3, RoundingMode.HALF_UP));
        lote.setCantidadDisponible(cantidadRecibida);
        lote.setUnidad("kg");
        lote.setEstado(EstadoLote.PENDIENTE);

        Lote loteGuardado = loteRepository.save(lote);

        List<AlertaDTO> alertasGeneradas = new ArrayList<>();
        BigDecimal nuevoAcumuladoAnioKg = entregadoPrevioAnioKg.add(cantidadRecibida);
        if (nuevoAcumuladoAnioKg.compareTo(productor.getCuotaMaximaKg()) > 0) {
            Alerta alertaCuota = new Alerta();
            alertaCuota.setLote(loteGuardado);
            alertaCuota.setTransformacion(null);
            alertaCuota.setTipoAlerta(TipoAlerta.CUOTA_EXCEDIDA);
            alertaCuota.setReglaAplicada(
                String.format(
                    "Acumulado anual del productor mayor a su cuota máxima plausible (%s kg para %s ha)",
                    formatearEsCo(productor.getCuotaMaximaKg()),
                    formatearEsCo(productor.getHectareasProductivas())
                )
            );
            alertaCuota.setCausa(
                String.format(
                    "Con la recepción de %s kg en el lote %s, %s (%s) acumula %s kg en %d, superando su cuota máxima plausible de %s kg.",
                    formatearEsCo(cantidadRecibida),
                    loteGuardado.getCodigoLote(),
                    productor.getNombreProductor(),
                    productor.getNombreFinca(),
                    formatearEsCo(nuevoAcumuladoAnioKg),
                    anio,
                    formatearEsCo(productor.getCuotaMaximaKg())
                )
            );
            alertaCuota.setValorMedido(nuevoAcumuladoAnioKg.setScale(2, RoundingMode.HALF_UP));
            alertaCuota.setUmbral(productor.getCuotaMaximaKg().setScale(2, RoundingMode.HALF_UP));
            alertaCuota.setActiva(true);

            Alerta alertaGuardada = alertaRepository.save(alertaCuota);
            alertasGeneradas.add(AlertaDTO.de(alertaGuardada));
        }

        auditoriaServicio.registrar(
            "CREAR",
            "LOTE",
            loteGuardado.getCodigoLote(),
            "cantidad_recibida",
            null,
            normalizarNumero(cantidadRecibida).toPlainString(),
            "Recepción de lote en acopio"
        );

        return new LoteCreacionRespuestaDTO(mapearADto(loteGuardado), alertasGeneradas);
    }

    @Transactional(readOnly = true)
    public List<LoteDTO> listarLotes(String origen, String estado, String tipo) {
        String origenFiltro = (origen == null || origen.isBlank())
            ? null
            : origen.trim().toLowerCase(Locale.ROOT);
        EstadoLote estadoFiltro = parsearEstado(estado);
        TipoLote tipoFiltro = parsearTipoLote(tipo);

        return loteRepository.filtrarLotes(origenFiltro, estadoFiltro, tipoFiltro)
            .stream()
            .map(this::mapearADto)
            .toList();
    }

    @Transactional(readOnly = true)
    public LoteDTO obtenerPorCodigo(String codigo) {
        Lote lote = loteRepository.findByCodigoLoteConProductor(codigo)
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No se encontró el lote con código " + codigo + "."
            ));
        return mapearADto(lote);
    }

    @Transactional
    public CambioEstadoRespuestaDTO cambiarEstado(String codigo, CambioEstadoSolicitudDTO solicitud) {
        String codigoLimpio = codigo.trim();
        Lote lote = loteRepository.findByCodigoLoteForUpdate(codigoLimpio)
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No se encontró el lote con código " + codigoLimpio + "."
            ));

        if (lote.getEstado() == solicitud.estado()) {
            throw ReglaNegocioException.estadoSinCambio(lote.getCodigoLote(), solicitud.estado().name());
        }

        String estadoAnterior = lote.getEstado().name();
        String estadoNuevo = solicitud.estado().name();
        String motivoLimpio = solicitud.motivo().trim();

        lote.setEstado(solicitud.estado());
        lote.setMotivoEstado(motivoLimpio);
        Lote loteGuardado = loteRepository.save(lote);

        auditoriaServicio.registrar(
            "CAMBIO_ESTADO",
            "LOTE",
            loteGuardado.getCodigoLote(),
            "estado",
            estadoAnterior,
            estadoNuevo,
            motivoLimpio
        );

        List<LoteAfectadoEstadoDTO> afectados = List.of(
            new LoteAfectadoEstadoDTO(loteGuardado.getCodigoLote(), estadoAnterior, estadoNuevo)
        );

        return new CambioEstadoRespuestaDTO(mapearADto(loteGuardado), afectados);
    }


    public LoteDTO mapearADto(Lote lote) {
        List<String> lotesPadre = loteComposicionRepository.findCodigosPadresByLoteHijoId(lote.getId());
        long alertasActivas = alertaRepository.countByLoteIdAndActivaTrue(lote.getId());

        return new LoteDTO(
            lote.getId(),
            lote.getCodigoLote(),
            lote.getTipoLote().name(),
            lote.getProducto(),
            ProductorResumenDTO.de(lote.getProductor()),
            lote.getOrigenMunicipio(),
            lote.getFechaRecepcion(),
            lote.getTipoGrano() != null ? lote.getTipoGrano().name() : null,
            normalizarNumero(lote.getPorcentajeHumedad()),
            normalizarNumero(lote.getCantidadRecibida()),
            normalizarNumero(lote.getCantidadConsumida()),
            normalizarNumero(lote.getCantidadDisponible()),
            lote.getUnidad(),
            lote.getEstado().name(),
            lote.getMotivoEstado(),
            lotesPadre,
            alertasActivas
        );
    }

    private String resolverCodigoLote(String codigoSolicitado) {
        if (codigoSolicitado != null && !codigoSolicitado.isBlank()) {
            String limpio = codigoSolicitado.trim();
            if (loteRepository.existsByCodigoLote(limpio)) {
                throw ReglaNegocioException.loteDuplicado(limpio);
            }
            return limpio;
        }

        List<String> codigosCac = loteRepository.findCodigosRecepcionCac();
        int maxConsecutivo = 0;
        for (String cod : codigosCac) {
            Matcher matcher = PATRON_CAC_NUMERICO.matcher(cod);
            if (matcher.matches()) {
                int num = Integer.parseInt(matcher.group(1));
                if (num > maxConsecutivo) {
                    maxConsecutivo = num;
                }
            }
        }

        int siguiente = maxConsecutivo + 1;
        String candidato = String.format("CAC%03d", siguiente);
        while (loteRepository.existsByCodigoLote(candidato)) {
            siguiente++;
            candidato = String.format("CAC%03d", siguiente);
        }
        return candidato;
    }

    private EstadoLote parsearEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            return null;
        }
        try {
            return EstadoLote.valueOf(estado.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw ReglaNegocioException.validacion(
                "estado",
                "Estado inválido. Valores permitidos: PENDIENTE, LIBERADO, BLOQUEADO",
                "El filtro de estado proporcionado no es válido."
            );
        }
    }

    private TipoLote parsearTipoLote(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return null;
        }
        try {
            return TipoLote.valueOf(tipo.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw ReglaNegocioException.validacion(
                "tipo",
                "Tipo de lote inválido. Valores permitidos: RECEPCION, DERIVADO",
                "El filtro de tipo de lote proporcionado no es válido."
            );
        }
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

    private static String formatearEsCo(BigDecimal valor) {
        DecimalFormatSymbols simbolos = new DecimalFormatSymbols(Locale.forLanguageTag("es-CO"));
        simbolos.setDecimalSeparator(',');
        simbolos.setGroupingSeparator('.');
        DecimalFormat df = new DecimalFormat("#,##0.##", simbolos);
        return df.format(valor);
    }
}
