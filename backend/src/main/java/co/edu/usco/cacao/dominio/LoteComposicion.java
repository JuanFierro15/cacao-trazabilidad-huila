package co.edu.usco.cacao.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;

@Entity
@Table(
    name = "lote_composicion",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_composicion",
        columnNames = {"transformacion_id", "lote_padre_id"}
    )
)
public class LoteComposicion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transformacion_id", nullable = false)
    private Transformacion transformacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_padre_id", nullable = false)
    private Lote lotePadre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_hijo_id", nullable = false)
    private Lote loteHijo;

    @Column(name = "kg_aportados", precision = 12, scale = 3, nullable = false)
    private BigDecimal kgAportados;

    @Column(name = "porcentaje_participacion", precision = 5, scale = 2, nullable = false)
    private BigDecimal porcentajeParticipacion;

    public LoteComposicion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Transformacion getTransformacion() {
        return transformacion;
    }

    public void setTransformacion(Transformacion transformacion) {
        this.transformacion = transformacion;
    }

    public Lote getLotePadre() {
        return lotePadre;
    }

    public void setLotePadre(Lote lotePadre) {
        this.lotePadre = lotePadre;
    }

    public Lote getLoteHijo() {
        return loteHijo;
    }

    public void setLoteHijo(Lote loteHijo) {
        this.loteHijo = loteHijo;
    }

    public BigDecimal getKgAportados() {
        return kgAportados;
    }

    public void setKgAportados(BigDecimal kgAportados) {
        this.kgAportados = kgAportados;
    }

    public BigDecimal getPorcentajeParticipacion() {
        return porcentajeParticipacion;
    }

    public void setPorcentajeParticipacion(BigDecimal porcentajeParticipacion) {
        this.porcentajeParticipacion = porcentajeParticipacion;
    }
}
