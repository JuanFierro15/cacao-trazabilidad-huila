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
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "alertas")
public class Alerta {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transformacion_id")
    private Transformacion transformacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alerta", length = 30, nullable = false)
    private TipoAlerta tipoAlerta;

    @Column(name = "regla_aplicada", length = 300, nullable = false)
    private String reglaAplicada;

    @Column(name = "causa", length = 500, nullable = false)
    private String causa;

    @Column(name = "valor_medido", precision = 14, scale = 2)
    private BigDecimal valorMedido;

    @Column(name = "umbral", precision = 14, scale = 2)
    private BigDecimal umbral;

    @Column(name = "fecha_generacion", nullable = false)
    private OffsetDateTime fechaGeneracion;

    @Column(name = "activa", nullable = false)
    private boolean activa = true;

    public Alerta() {
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaGeneracion == null) {
            this.fechaGeneracion = OffsetDateTime.now(ZONA_BOGOTA);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Lote getLote() {
        return lote;
    }

    public void setLote(Lote lote) {
        this.lote = lote;
    }

    public Transformacion getTransformacion() {
        return transformacion;
    }

    public void setTransformacion(Transformacion transformacion) {
        this.transformacion = transformacion;
    }

    public TipoAlerta getTipoAlerta() {
        return tipoAlerta;
    }

    public void setTipoAlerta(TipoAlerta tipoAlerta) {
        this.tipoAlerta = tipoAlerta;
    }

    public String getReglaAplicada() {
        return reglaAplicada;
    }

    public void setReglaAplicada(String reglaAplicada) {
        this.reglaAplicada = reglaAplicada;
    }

    public String getCausa() {
        return causa;
    }

    public void setCausa(String causa) {
        this.causa = causa;
    }

    public BigDecimal getValorMedido() {
        return valorMedido;
    }

    public void setValorMedido(BigDecimal valorMedido) {
        this.valorMedido = valorMedido;
    }

    public BigDecimal getUmbral() {
        return umbral;
    }

    public void setUmbral(BigDecimal umbral) {
        this.umbral = umbral;
    }

    public OffsetDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }

    public void setFechaGeneracion(OffsetDateTime fechaGeneracion) {
        this.fechaGeneracion = fechaGeneracion;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
