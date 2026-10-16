package co.edu.usco.cacao.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Entity
@Table(name = "transformaciones")
public class Transformacion {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "operacion_uuid", nullable = false, unique = true)
    private UUID operacionUuid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_origen_id", nullable = false)
    private Lote loteOrigen;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_salida_id", unique = true)
    private Lote loteSalida;

    @Enumerated(EnumType.STRING)
    @Column(name = "etapa", length = 40, nullable = false)
    private Etapa etapa;

    @Column(name = "responsable", length = 120, nullable = false)
    private String responsable;

    @Column(name = "registrado_por", length = 50, nullable = false)
    private String registradoPor;

    @Column(name = "fecha_transformacion", nullable = false)
    private LocalDate fechaTransformacion;

    @Column(name = "cantidad_entrada", precision = 12, scale = 3, nullable = false)
    private BigDecimal cantidadEntrada;

    @Column(name = "cantidad_salida", precision = 12, scale = 3, nullable = false)
    private BigDecimal cantidadSalida;

    @Column(name = "porcentaje_merma", precision = 7, scale = 2, nullable = false)
    private BigDecimal porcentajeMerma;

    @Column(name = "justificacion_incidencia", length = 500)
    private String justificacionIncidencia;

    @Column(name = "insumos_agregados", length = 300)
    private String insumosAgregados;

    @Column(name = "temperatura_proceso", precision = 5, scale = 2)
    private BigDecimal temperaturaProceso;

    @Column(name = "humedad_salida", precision = 5, scale = 2)
    private BigDecimal humedadSalida;

    @Column(name = "costo_etapa_cop", precision = 14, scale = 2)
    private BigDecimal costoEtapaCop;

    @Column(name = "precio_venta_estimado_cop", precision = 14, scale = 2)
    private BigDecimal precioVentaEstimadoCop;

    @Column(name = "costo_unitario_cop", precision = 14, scale = 2)
    private BigDecimal costoUnitarioCop;

    @Column(name = "margen_porcentaje", precision = 7, scale = 2)
    private BigDecimal margenPorcentaje;

    @Column(name = "detalle_costos_incluidos", length = 500)
    private String detalleCostosIncluidos;

    @Column(name = "fecha_registro", nullable = false)
    private OffsetDateTime fechaRegistro;

    public Transformacion() {
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = OffsetDateTime.now(ZONA_BOGOTA);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getOperacionUuid() {
        return operacionUuid;
    }

    public void setOperacionUuid(UUID operacionUuid) {
        this.operacionUuid = operacionUuid;
    }

    public Lote getLoteOrigen() {
        return loteOrigen;
    }

    public void setLoteOrigen(Lote loteOrigen) {
        this.loteOrigen = loteOrigen;
    }

    public Lote getLoteSalida() {
        return loteSalida;
    }

    public void setLoteSalida(Lote loteSalida) {
        this.loteSalida = loteSalida;
    }

    public Etapa getEtapa() {
        return etapa;
    }

    public void setEtapa(Etapa etapa) {
        this.etapa = etapa;
    }

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }

    public String getRegistradoPor() {
        return registradoPor;
    }

    public void setRegistradoPor(String registradoPor) {
        this.registradoPor = registradoPor;
    }

    public LocalDate getFechaTransformacion() {
        return fechaTransformacion;
    }

    public void setFechaTransformacion(LocalDate fechaTransformacion) {
        this.fechaTransformacion = fechaTransformacion;
    }

    public BigDecimal getCantidadEntrada() {
        return cantidadEntrada;
    }

    public void setCantidadEntrada(BigDecimal cantidadEntrada) {
        this.cantidadEntrada = cantidadEntrada;
    }

    public BigDecimal getCantidadSalida() {
        return cantidadSalida;
    }

    public void setCantidadSalida(BigDecimal cantidadSalida) {
        this.cantidadSalida = cantidadSalida;
    }

    public BigDecimal getPorcentajeMerma() {
        return porcentajeMerma;
    }

    public void setPorcentajeMerma(BigDecimal porcentajeMerma) {
        this.porcentajeMerma = porcentajeMerma;
    }

    public String getJustificacionIncidencia() {
        return justificacionIncidencia;
    }

    public void setJustificacionIncidencia(String justificacionIncidencia) {
        this.justificacionIncidencia = justificacionIncidencia;
    }

    public String getInsumosAgregados() {
        return insumosAgregados;
    }

    public void setInsumosAgregados(String insumosAgregados) {
        this.insumosAgregados = insumosAgregados;
    }

    public BigDecimal getTemperaturaProceso() {
        return temperaturaProceso;
    }

    public void setTemperaturaProceso(BigDecimal temperaturaProceso) {
        this.temperaturaProceso = temperaturaProceso;
    }

    public BigDecimal getHumedadSalida() {
        return humedadSalida;
    }

    public void setHumedadSalida(BigDecimal humedadSalida) {
        this.humedadSalida = humedadSalida;
    }

    public BigDecimal getCostoEtapaCop() {
        return costoEtapaCop;
    }

    public void setCostoEtapaCop(BigDecimal costoEtapaCop) {
        this.costoEtapaCop = costoEtapaCop;
    }

    public BigDecimal getPrecioVentaEstimadoCop() {
        return precioVentaEstimadoCop;
    }

    public void setPrecioVentaEstimadoCop(BigDecimal precioVentaEstimadoCop) {
        this.precioVentaEstimadoCop = precioVentaEstimadoCop;
    }

    public BigDecimal getCostoUnitarioCop() {
        return costoUnitarioCop;
    }

    public void setCostoUnitarioCop(BigDecimal costoUnitarioCop) {
        this.costoUnitarioCop = costoUnitarioCop;
    }

    public BigDecimal getMargenPorcentaje() {
        return margenPorcentaje;
    }

    public void setMargenPorcentaje(BigDecimal margenPorcentaje) {
        this.margenPorcentaje = margenPorcentaje;
    }

    public String getDetalleCostosIncluidos() {
        return detalleCostosIncluidos;
    }

    public void setDetalleCostosIncluidos(String detalleCostosIncluidos) {
        this.detalleCostosIncluidos = detalleCostosIncluidos;
    }

    public OffsetDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(OffsetDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}
