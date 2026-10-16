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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "lotes")
public class Lote {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "codigo_lote", length = 30, nullable = false, unique = true)
    private String codigoLote;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_lote", length = 15, nullable = false)
    private TipoLote tipoLote = TipoLote.RECEPCION;

    @Column(name = "producto", length = 80, nullable = false)
    private String producto = "Cacao seco";

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "productor_id", nullable = false)
    private FincaProductor productor;

    @Column(name = "origen_municipio", length = 60, nullable = false)
    private String origenMunicipio;

    @Column(name = "fecha_recepcion", nullable = false)
    private LocalDate fechaRecepcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_grano", length = 10)
    private TipoGrano tipoGrano;

    @Column(name = "porcentaje_humedad", precision = 5, scale = 2)
    private BigDecimal porcentajeHumedad;

    @Column(name = "cantidad_recibida", precision = 12, scale = 3, nullable = false)
    private BigDecimal cantidadRecibida;

    @Column(name = "cantidad_consumida", precision = 12, scale = 3, nullable = false)
    private BigDecimal cantidadConsumida = BigDecimal.ZERO;

    @Column(name = "cantidad_disponible", precision = 12, scale = 3, nullable = false)
    private BigDecimal cantidadDisponible;

    @Column(name = "unidad", length = 5, nullable = false)
    private String unidad = "kg";

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 12, nullable = false)
    private EstadoLote estado = EstadoLote.PENDIENTE;

    @Column(name = "motivo_estado", length = 300)
    private String motivoEstado;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    @Version
    @Column(name = "version_optimista", nullable = false)
    private Long versionOptimista = 0L;

    public Lote() {
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = OffsetDateTime.now(ZONA_BOGOTA);
        }
        if (this.tipoLote == null) {
            this.tipoLote = TipoLote.RECEPCION;
        }
        if (this.producto == null) {
            this.producto = "Cacao seco";
        }
        if (this.cantidadConsumida == null) {
            this.cantidadConsumida = BigDecimal.ZERO;
        }
        if (this.unidad == null) {
            this.unidad = "kg";
        }
        if (this.estado == null) {
            this.estado = EstadoLote.PENDIENTE;
        }
        if (this.versionOptimista == null) {
            this.versionOptimista = 0L;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoLote() {
        return codigoLote;
    }

    public void setCodigoLote(String codigoLote) {
        this.codigoLote = codigoLote;
    }

    public TipoLote getTipoLote() {
        return tipoLote;
    }

    public void setTipoLote(TipoLote tipoLote) {
        this.tipoLote = tipoLote;
    }

    public String getProducto() {
        return producto;
    }

    public void setProducto(String producto) {
        this.producto = producto;
    }

    public FincaProductor getProductor() {
        return productor;
    }

    public void setProductor(FincaProductor productor) {
        this.productor = productor;
    }

    public String getOrigenMunicipio() {
        return origenMunicipio;
    }

    public void setOrigenMunicipio(String origenMunicipio) {
        this.origenMunicipio = origenMunicipio;
    }

    public LocalDate getFechaRecepcion() {
        return fechaRecepcion;
    }

    public void setFechaRecepcion(LocalDate fechaRecepcion) {
        this.fechaRecepcion = fechaRecepcion;
    }

    public TipoGrano getTipoGrano() {
        return tipoGrano;
    }

    public void setTipoGrano(TipoGrano tipoGrano) {
        this.tipoGrano = tipoGrano;
    }

    public BigDecimal getPorcentajeHumedad() {
        return porcentajeHumedad;
    }

    public void setPorcentajeHumedad(BigDecimal porcentajeHumedad) {
        this.porcentajeHumedad = porcentajeHumedad;
    }

    public BigDecimal getCantidadRecibida() {
        return cantidadRecibida;
    }

    public void setCantidadRecibida(BigDecimal cantidadRecibida) {
        this.cantidadRecibida = cantidadRecibida;
    }

    public BigDecimal getCantidadConsumida() {
        return cantidadConsumida;
    }

    public void setCantidadConsumida(BigDecimal cantidadConsumida) {
        this.cantidadConsumida = cantidadConsumida;
    }

    public BigDecimal getCantidadDisponible() {
        return cantidadDisponible;
    }

    public void setCantidadDisponible(BigDecimal cantidadDisponible) {
        this.cantidadDisponible = cantidadDisponible;
    }

    public String getUnidad() {
        return unidad;
    }

    public void setUnidad(String unidad) {
        this.unidad = unidad;
    }

    public EstadoLote getEstado() {
        return estado;
    }

    public void setEstado(EstadoLote estado) {
        this.estado = estado;
    }

    public String getMotivoEstado() {
        return motivoEstado;
    }

    public void setMotivoEstado(String motivoEstado) {
        this.motivoEstado = motivoEstado;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(OffsetDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Long getVersionOptimista() {
        return versionOptimista;
    }

    public void setVersionOptimista(Long versionOptimista) {
        this.versionOptimista = versionOptimista;
    }
}
