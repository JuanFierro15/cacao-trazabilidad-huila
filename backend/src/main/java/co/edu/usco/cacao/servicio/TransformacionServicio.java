package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.dominio.Alerta;
import co.edu.usco.cacao.dominio.EstadoLote;
import co.edu.usco.cacao.dominio.Lote;
import co.edu.usco.cacao.dominio.LoteComposicion;
import co.edu.usco.cacao.dominio.TipoAlerta;
import co.edu.usco.cacao.dominio.TipoLote;
import co.edu.usco.cacao.dominio.Transformacion;
import co.edu.usco.cacao.excepcion.ReglaNegocioException;
import co.edu.usco.cacao.repositorio.AlertaRepository;
import co.edu.usco.cacao.repositorio.LoteComposicionRepository;
import co.edu.usco.cacao.repositorio.LoteRepository;
import co.edu.usco.cacao.repositorio.TransformacionRepository;
import co.edu.usco.cacao.seguridad.ContextoAutenticacion;
import co.edu.usco.cacao.web.dto.AlertaDTO;
import co.edu.usco.cacao.web.dto.BalanceTransformacionDTO;
import co.edu.usco.cacao.web.dto.InventarioOrigenDTO;
import co.edu.usco.cacao.web.dto.TransformacionDTO;
import co.edu.usco.cacao.web.dto.TransformacionRespuestaDTO;
import co.edu.usco.cacao.web.dto.TransformacionSolicitudDTO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransformacionServicio {

    private final TransformacionRepository transformacionRepository;
    private final LoteRepository loteRepository;
    private final LoteComposicionRepository loteComposicionRepository;
    private final AlertaRepository alertaRepository;
    private final AuditoriaServicio auditoriaServicio;
    private final ContextoAutenticacion contextoAutenticacion;
    private final BigDecimal umbralMerma;

    public TransformacionServicio(
        TransformacionRepository transformacionRepository,
        LoteRepository loteRepository,
        LoteComposicionRepository loteComposicionRepository,
        AlertaRepository alertaRepository,
        AuditoriaServicio auditoriaServicio,
        ContextoAutenticacion contextoAutenticacion,
        @Value("${app.reglas.umbral-merma:15.0}") BigDecimal umbralMerma
    ) {
        this.transformacionRepository = transformacionRepository;
        this.loteRepository = loteRepository;
        this.loteComposicionRepository = loteComposicionRepository;
        this.alertaRepository = alertaRepository;
        this.auditoriaServicio = auditoriaServicio;
        this.contextoAutenticacion = contextoAutenticacion;
        this.umbralMerma = umbralMerma;
    }

    /**
     * Registra una transformación siguiendo el orden transaccional estricto de la sección 6 del contrato.
     */
    @Transactional
    public TransformacionRespuestaDTO registrarTransformacion(TransformacionSolicitudDTO solicitud) {
        // 1. Validación condicional de productoSalida cuando cantidadSalida > 0
        if (solicitud.cantidadSalida().compareTo(BigDecimal.ZERO) > 0
            && (solicitud.productoSalida() == null || solicitud.productoSalida().isBlank())) {
            throw ReglaNegocioException.validacion(
                "productoSalida",
                "El producto de salida es obligatorio cuando la cantidad de salida es mayor que 0",
                "Los datos enviados contienen errores de validación. Corrija los campos indicados e intente nuevamente."
            );
        }

        // 2. Idempotencia previa por operacionUuid → 409 OPERACION_DUPLICADA
        Optional<Transformacion> existente = transformacionRepository.findByOperacionUuid(solicitud.operacionUuid());
        if (existente.isPresent()) {
            throw ReglaNegocioException.operacionDuplicada(
                solicitud.operacionUuid().toString(),
                existente.get().getId()
            );
        }

        // 3. Cargar lote de origen con bloqueo pesimista (@Lock(PESSIMISTIC_WRITE)) → 404 si no existe
        String codigoOrigen = solicitud.loteOrigenCodigo().trim();
        Lote loteOrigen = loteRepository.findByCodigoLoteForUpdate(codigoOrigen)
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No se encontró el lote de origen con código " + codigoOrigen + "."
            ));

        // 4. Reglas de bloqueo, inventario disponible y salida mayor a entrada sin insumos
        if (loteOrigen.getEstado() == EstadoLote.BLOQUEADO) {
            throw ReglaNegocioException.loteBloqueado(loteOrigen.getCodigoLote());
        }

        BigDecimal cantidadEntrada = solicitud.cantidadEntrada().setScale(3, RoundingMode.HALF_UP);
        BigDecimal cantidadSalida = solicitud.cantidadSalida().setScale(3, RoundingMode.HALF_UP);

        if (cantidadEntrada.compareTo(loteOrigen.getCantidadDisponible()) > 0) {
            String mensaje = String.format(
                "El lote %s tiene %s kg disponibles y la operación pide %s kg. No se registró ningún cambio.",
                loteOrigen.getCodigoLote(),
                CalculadoraTransformacion.formatearFlexibleEsCo(loteOrigen.getCantidadDisponible()),
                CalculadoraTransformacion.formatearFlexibleEsCo(cantidadEntrada)
            );
            throw ReglaNegocioException.inventarioInsuficiente(mensaje);
        }

        String insumosLimpios = normalizarTextoOpcional(solicitud.insumosAgregados());
        if (cantidadSalida.compareTo(cantidadEntrada) > 0 && insumosLimpios == null) {
            throw ReglaNegocioException.salidaSinJustificacion();
        }

        // 5. Calcular merma, rendimiento, costo unitario y margen con CalculadoraTransformacion
        BigDecimal porcentajeMerma = CalculadoraTransformacion.calcularPorcentajeMerma(cantidadEntrada, cantidadSalida);
        BigDecimal costoEtapaCop = solicitud.costoEtapaCop() != null
            ? solicitud.costoEtapaCop().setScale(2, RoundingMode.HALF_UP)
            : null;
        BigDecimal precioVentaCop = solicitud.precioVentaEstimadoCop() != null
            ? solicitud.precioVentaEstimadoCop().setScale(2, RoundingMode.HALF_UP)
            : null;
        BigDecimal costoUnitarioCop = CalculadoraTransformacion.calcularCostoUnitario(costoEtapaCop, cantidadSalida);
        BigDecimal margenPorcentaje = CalculadoraTransformacion.calcularMargenPorcentaje(costoUnitarioCop, precioVentaCop);

        // 6. Actualizar inventario del lote de origen; crear lote derivado (si salida > 0), transformación y composición
        BigDecimal disponibleAntes = loteOrigen.getCantidadDisponible();
        BigDecimal nuevoConsumido = loteOrigen.getCantidadConsumida().add(cantidadEntrada).setScale(3, RoundingMode.HALF_UP);
        BigDecimal nuevoDisponible = loteOrigen.getCantidadRecibida().subtract(nuevoConsumido).setScale(3, RoundingMode.HALF_UP);
        loteOrigen.setCantidadConsumida(nuevoConsumido);
        loteOrigen.setCantidadDisponible(nuevoDisponible);
        loteRepository.save(loteOrigen);

        Lote loteSalidaGuardado = null;
        if (cantidadSalida.compareTo(BigDecimal.ZERO) > 0) {
            String codigoRaiz = resolverCodigoRaiz(loteOrigen);
            String codigoDerivado = generarSiguienteCodigoDerivado(codigoRaiz);

            Lote loteDerivado = new Lote();
            loteDerivado.setCodigoLote(codigoDerivado);
            loteDerivado.setTipoLote(TipoLote.DERIVADO);
            loteDerivado.setProducto(solicitud.productoSalida().trim());
            loteDerivado.setProductor(loteOrigen.getProductor());
            loteDerivado.setOrigenMunicipio(loteOrigen.getOrigenMunicipio());
            loteDerivado.setFechaRecepcion(solicitud.fechaTransformacion());
            loteDerivado.setTipoGrano(null);
            loteDerivado.setPorcentajeHumedad(
                solicitud.humedadSalida() != null
                    ? solicitud.humedadSalida().setScale(2, RoundingMode.HALF_UP)
                    : null
            );
            loteDerivado.setCantidadRecibida(cantidadSalida);
            loteDerivado.setCantidadConsumida(BigDecimal.ZERO.setScale(3, RoundingMode.HALF_UP));
            loteDerivado.setCantidadDisponible(cantidadSalida);
            loteDerivado.setUnidad("kg");
            loteDerivado.setEstado(EstadoLote.PENDIENTE);
            loteSalidaGuardado = loteRepository.save(loteDerivado);
        }

        String justificacionLimpia = normalizarTextoOpcional(solicitud.justificacionIncidencia());
        String detalleCostosLimpio = normalizarTextoOpcional(solicitud.detalleCostosIncluidos());

        Transformacion transformacion = new Transformacion();
        transformacion.setOperacionUuid(solicitud.operacionUuid());
        transformacion.setLoteOrigen(loteOrigen);
        transformacion.setLoteSalida(loteSalidaGuardado);
        transformacion.setEtapa(solicitud.etapa());
        transformacion.setResponsable(solicitud.responsable().trim());
        transformacion.setRegistradoPor(contextoAutenticacion.obtenerUsernameActual());
        transformacion.setFechaTransformacion(solicitud.fechaTransformacion());
        transformacion.setCantidadEntrada(cantidadEntrada);
        transformacion.setCantidadSalida(cantidadSalida);
        transformacion.setPorcentajeMerma(porcentajeMerma);
        transformacion.setJustificacionIncidencia(justificacionLimpia);
        transformacion.setInsumosAgregados(insumosLimpios);
        transformacion.setTemperaturaProceso(
            solicitud.temperaturaProceso() != null
                ? solicitud.temperaturaProceso().setScale(2, RoundingMode.HALF_UP)
                : null
        );
        transformacion.setHumedadSalida(
            solicitud.humedadSalida() != null
                ? solicitud.humedadSalida().setScale(2, RoundingMode.HALF_UP)
                : null
        );
        transformacion.setCostoEtapaCop(costoEtapaCop);
        transformacion.setPrecioVentaEstimadoCop(precioVentaCop);
        transformacion.setCostoUnitarioCop(costoUnitarioCop);
        transformacion.setMargenPorcentaje(margenPorcentaje);
        transformacion.setDetalleCostosIncluidos(detalleCostosLimpio);

        Transformacion transformacionGuardada = transformacionRepository.saveAndFlush(transformacion);

        if (loteSalidaGuardado != null) {
            LoteComposicion composicion = new LoteComposicion();
            composicion.setTransformacion(transformacionGuardada);
            composicion.setLotePadre(loteOrigen);
            composicion.setLoteHijo(loteSalidaGuardado);
            composicion.setKgAportados(cantidadEntrada);
            composicion.setPorcentajeParticipacion(new BigDecimal("100.00"));
            loteComposicionRepository.save(composicion);
        }

        // 7. Generar alertas (MERMA_ALTA, REGISTRO_INCOMPLETO, SOBRECOSTO) y registrar auditoría (CONSUMO y CREAR)
        List<AlertaDTO> alertasGeneradas = generarAlertasTransformacion(
            loteOrigen,
            transformacionGuardada,
            cantidadEntrada,
            cantidadSalida,
            porcentajeMerma,
            justificacionLimpia,
            costoUnitarioCop,
            precioVentaCop,
            margenPorcentaje
        );

        auditoriaServicio.registrar(
            "CONSUMO",
            "LOTE",
            loteOrigen.getCodigoLote(),
            "cantidad_disponible",
            normalizarNumero(disponibleAntes).toPlainString(),
            normalizarNumero(nuevoDisponible).toPlainString(),
            "Consumo en etapa " + solicitud.etapa().name()
        );

        if (loteSalidaGuardado != null) {
            auditoriaServicio.registrar(
                "CREAR",
                "LOTE",
                loteSalidaGuardado.getCodigoLote(),
                "cantidad_recibida",
                null,
                normalizarNumero(cantidadSalida).toPlainString(),
                "Creación de lote derivado en etapa " + solicitud.etapa().name()
            );
        }

        auditoriaServicio.registrar(
            "CREAR",
            "TRANSFORMACION",
            loteOrigen.getCodigoLote(),
            "operacion_uuid",
            null,
            solicitud.operacionUuid().toString(),
            "Registro de transformación en etapa " + solicitud.etapa().name()
        );

        return new TransformacionRespuestaDTO(
            TransformacionDTO.de(transformacionGuardada),
            InventarioOrigenDTO.de(loteOrigen),
            alertasGeneradas
        );
    }

    /**
     * Paso 8 del orden transaccional: traduce colisiones concurrentes de operacion_uuid a 409 OPERACION_DUPLICADA.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public ReglaNegocioException traducirViolacionIntegridad(UUID operacionUuid, DataIntegrityViolationException ex) {
        if (operacionUuid != null) {
            Optional<Transformacion> existente = transformacionRepository.findByOperacionUuid(operacionUuid);
            if (existente.isPresent()) {
                return ReglaNegocioException.operacionDuplicada(
                    operacionUuid.toString(),
                    existente.get().getId()
                );
            }
        }
        throw ex;
    }

    @Transactional(readOnly = true)
    public List<TransformacionDTO> listarTransformaciones(String loteCodigo) {
        String filtro = (loteCodigo == null || loteCodigo.isBlank()) ? null : loteCodigo.trim();
        return transformacionRepository.listarPorLoteOrigen(filtro)
            .stream()
            .map(TransformacionDTO::de)
            .toList();
    }

    @Transactional(readOnly = true)
    public BalanceTransformacionDTO obtenerBalance(Long id, BigDecimal precioVentaSimuladoCop) {
        if (precioVentaSimuladoCop != null && precioVentaSimuladoCop.compareTo(BigDecimal.ZERO) < 0) {
            throw ReglaNegocioException.validacion(
                "precioVentaCop",
                "El precio de venta no puede ser negativo",
                "El precio de venta simulado no puede ser negativo."
            );
        }

        Transformacion transformacion = transformacionRepository.findByIdConLotes(id)
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No existe una transformación con el identificador " + id + "."
            ));

        String loteSalidaCod = transformacion.getLoteSalida() != null
            ? transformacion.getLoteSalida().getCodigoLote()
            : null;

        return CalculadoraTransformacion.construirBalance(
            transformacion.getId(),
            loteSalidaCod,
            transformacion.getCostoEtapaCop(),
            transformacion.getCantidadSalida(),
            transformacion.getPrecioVentaEstimadoCop(),
            precioVentaSimuladoCop,
            transformacion.getDetalleCostosIncluidos()
        );
    }

    private List<AlertaDTO> generarAlertasTransformacion(
        Lote loteOrigen,
        Transformacion transformacion,
        BigDecimal cantidadEntrada,
        BigDecimal cantidadSalida,
        BigDecimal porcentajeMerma,
        String justificacionLimpia,
        BigDecimal costoUnitarioCop,
        BigDecimal precioVentaCop,
        BigDecimal margenPorcentaje
    ) {
        List<AlertaDTO> alertas = new ArrayList<>();
        BigDecimal umbralEscala = umbralMerma.setScale(2, RoundingMode.HALF_UP);

        if (CalculadoraTransformacion.superaUmbralMerma(porcentajeMerma, umbralMerma)) {
            Alerta alertaMerma = new Alerta();
            alertaMerma.setLote(loteOrigen);
            alertaMerma.setTransformacion(transformacion);
            alertaMerma.setTipoAlerta(TipoAlerta.MERMA_ALTA);
            alertaMerma.setReglaAplicada(
                "Merma de una etapa mayor a " + CalculadoraTransformacion.formatearUnDecimalEsCo(umbralMerma) + " %"
            );

            String detalleCausaOperador = justificacionLimpia != null
                ? "Causa registrada por el operador: "
                    + justificacionLimpia
                    + (justificacionLimpia.endsWith(".") ? "" : ".")
                : "Sin justificación registrada por el operador.";

            alertaMerma.setCausa(
                String.format(
                    "Merma calculada de %s %% (%s kg → %s kg) en %s. %s",
                    CalculadoraTransformacion.formatearDosDecimalesEsCo(porcentajeMerma),
                    CalculadoraTransformacion.formatearFlexibleEsCo(cantidadEntrada),
                    CalculadoraTransformacion.formatearFlexibleEsCo(cantidadSalida),
                    transformacion.getEtapa().name(),
                    detalleCausaOperador
                )
            );
            alertaMerma.setValorMedido(porcentajeMerma);
            alertaMerma.setUmbral(umbralEscala);
            alertaMerma.setActiva(true);
            alertas.add(AlertaDTO.de(alertaRepository.save(alertaMerma)));
        }

        if (CalculadoraTransformacion.esRegistroIncompleto(porcentajeMerma, umbralMerma, justificacionLimpia)) {
            Alerta alertaIncompleto = new Alerta();
            alertaIncompleto.setLote(loteOrigen);
            alertaIncompleto.setTransformacion(transformacion);
            alertaIncompleto.setTipoAlerta(TipoAlerta.REGISTRO_INCOMPLETO);
            alertaIncompleto.setReglaAplicada(
                "Toda merma superior a "
                    + CalculadoraTransformacion.formatearUnDecimalEsCo(umbralMerma)
                    + " % requiere justificación de incidencia"
            );
            alertaIncompleto.setCausa(
                String.format(
                    "La transformación en %s presentó una merma de %s %% (%s kg → %s kg) sin justificación de incidencia registrada.",
                    transformacion.getEtapa().name(),
                    CalculadoraTransformacion.formatearDosDecimalesEsCo(porcentajeMerma),
                    CalculadoraTransformacion.formatearFlexibleEsCo(cantidadEntrada),
                    CalculadoraTransformacion.formatearFlexibleEsCo(cantidadSalida)
                )
            );
            alertaIncompleto.setValorMedido(porcentajeMerma);
            alertaIncompleto.setUmbral(umbralEscala);
            alertaIncompleto.setActiva(true);
            alertas.add(AlertaDTO.de(alertaRepository.save(alertaIncompleto)));
        }

        if (CalculadoraTransformacion.haySobrecosto(margenPorcentaje)) {
            Alerta alertaSobrecosto = new Alerta();
            alertaSobrecosto.setLote(loteOrigen);
            alertaSobrecosto.setTransformacion(transformacion);
            alertaSobrecosto.setTipoAlerta(TipoAlerta.SOBRECOSTO);
            alertaSobrecosto.setReglaAplicada("Margen estimado sobre precio de venta menor a 0,00 %");
            alertaSobrecosto.setCausa(
                String.format(
                    "Costo unitario de %s COP/kg supera el precio de venta estimado de %s COP/kg (margen %s %%).",
                    CalculadoraTransformacion.formatearFlexibleEsCo(costoUnitarioCop),
                    CalculadoraTransformacion.formatearFlexibleEsCo(precioVentaCop),
                    CalculadoraTransformacion.formatearDosDecimalesEsCo(margenPorcentaje)
                )
            );
            alertaSobrecosto.setValorMedido(margenPorcentaje);
            alertaSobrecosto.setUmbral(new BigDecimal("0.00"));
            alertaSobrecosto.setActiva(true);
            alertas.add(AlertaDTO.de(alertaRepository.save(alertaSobrecosto)));
        }

        return alertas;
    }

    private String resolverCodigoRaiz(Lote loteOrigen) {
        if (loteOrigen.getTipoLote() == TipoLote.RECEPCION) {
            return loteOrigen.getCodigoLote();
        }
        List<String> ancestros = loteComposicionRepository.buscarCodigosAncestros(loteOrigen.getCodigoLote());
        if (!ancestros.isEmpty()) {
            return ancestros.getFirst();
        }
        int indiceSufijo = loteOrigen.getCodigoLote().indexOf("-T");
        return indiceSufijo > 0
            ? loteOrigen.getCodigoLote().substring(0, indiceSufijo)
            : loteOrigen.getCodigoLote();
    }

    private String generarSiguienteCodigoDerivado(String codigoRaiz) {
        long existentes = loteRepository.countDerivadosPorRaiz(codigoRaiz);
        long siguiente = existentes + 1;
        String candidato = codigoRaiz + "-T" + siguiente;
        while (loteRepository.existsByCodigoLote(candidato)) {
            siguiente++;
            candidato = codigoRaiz + "-T" + siguiente;
        }
        return candidato;
    }

    private static String normalizarTextoOpcional(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
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
