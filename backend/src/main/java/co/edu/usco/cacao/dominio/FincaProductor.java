package co.edu.usco.cacao.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "fincas_productores")
public class FincaProductor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "codigo_productor", length = 20, nullable = false, unique = true)
    private String codigoProductor;

    @Column(name = "nombre_productor", length = 120, nullable = false)
    private String nombreProductor;

    @Column(name = "nombre_finca", length = 120, nullable = false)
    private String nombreFinca;

    @Column(name = "municipio", length = 60, nullable = false)
    private String municipio;

    @Column(name = "vereda", length = 80)
    private String vereda;

    @Column(name = "hectareas_productivas", precision = 8, scale = 2, nullable = false)
    private BigDecimal hectareasProductivas;

    @Column(name = "variedad_cacao", length = 40, nullable = false)
    private String variedadCacao;

    @Column(name = "cuota_maxima_kg", precision = 12, scale = 3, nullable = false)
    private BigDecimal cuotaMaximaKg;

    public FincaProductor() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoProductor() {
        return codigoProductor;
    }

    public void setCodigoProductor(String codigoProductor) {
        this.codigoProductor = codigoProductor;
    }

    public String getNombreProductor() {
        return nombreProductor;
    }

    public void setNombreProductor(String nombreProductor) {
        this.nombreProductor = nombreProductor;
    }

    public String getNombreFinca() {
        return nombreFinca;
    }

    public void setNombreFinca(String nombreFinca) {
        this.nombreFinca = nombreFinca;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getVereda() {
        return vereda;
    }

    public void setVereda(String vereda) {
        this.vereda = vereda;
    }

    public BigDecimal getHectareasProductivas() {
        return hectareasProductivas;
    }

    public void setHectareasProductivas(BigDecimal hectareasProductivas) {
        this.hectareasProductivas = hectareasProductivas;
    }

    public String getVariedadCacao() {
        return variedadCacao;
    }

    public void setVariedadCacao(String variedadCacao) {
        this.variedadCacao = variedadCacao;
    }

    public BigDecimal getCuotaMaximaKg() {
        return cuotaMaximaKg;
    }

    public void setCuotaMaximaKg(BigDecimal cuotaMaximaKg) {
        this.cuotaMaximaKg = cuotaMaximaKg;
    }
}
