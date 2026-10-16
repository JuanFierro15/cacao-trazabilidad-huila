package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.dominio.Etapa;
import co.edu.usco.cacao.dominio.FincaProductor;
import co.edu.usco.cacao.repositorio.FincaProductorRepository;
import co.edu.usco.cacao.repositorio.LoteRepository;
import co.edu.usco.cacao.web.dto.ProductorDTO;
import co.edu.usco.cacao.web.dto.ReglasConfigDTO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogoServicio {

    private static final ZoneId ZONA_BOGOTA = ZoneId.of("America/Bogota");

    private final FincaProductorRepository fincaProductorRepository;
    private final LoteRepository loteRepository;
    private final BigDecimal umbralMerma;
    private final int rendimientoPlausibleKgHaAnio;

    public CatalogoServicio(
        FincaProductorRepository fincaProductorRepository,
        LoteRepository loteRepository,
        @Value("${app.reglas.umbral-merma:15.0}") BigDecimal umbralMerma,
        @Value("${app.reglas.rendimiento-plausible-kg-ha-anio:600}") int rendimientoPlausibleKgHaAnio
    ) {
        this.fincaProductorRepository = fincaProductorRepository;
        this.loteRepository = loteRepository;
        this.umbralMerma = umbralMerma;
        this.rendimientoPlausibleKgHaAnio = rendimientoPlausibleKgHaAnio;
    }

    public ReglasConfigDTO obtenerReglas() {
        List<ReglasConfigDTO.EtapaItemDTO> etapas = Arrays.stream(Etapa.values())
            .map(e -> new ReglasConfigDTO.EtapaItemDTO(e.name(), e.getNombre()))
            .toList();

        return new ReglasConfigDTO(
            umbralMerma.setScale(1, RoundingMode.HALF_UP),
            rendimientoPlausibleKgHaAnio,
            etapas
        );
    }

    @Transactional(readOnly = true)
    public List<ProductorDTO> listarProductores() {
        int anioActual = LocalDate.now(ZONA_BOGOTA).getYear();
        LocalDate inicioAnio = LocalDate.of(anioActual, 1, 1);
        LocalDate finAnio = LocalDate.of(anioActual, 12, 31);

        List<FincaProductor> productores = fincaProductorRepository.findAllByOrderByIdAsc();
        return productores.stream()
            .map(p -> {
                BigDecimal entregadoAnio = loteRepository.sumarEntregasProductorEnRango(
                    p.getId(),
                    inicioAnio,
                    finAnio
                ).setScale(3, RoundingMode.HALF_UP);

                return new ProductorDTO(
                    p.getId(),
                    p.getCodigoProductor(),
                    p.getNombreProductor(),
                    p.getNombreFinca(),
                    p.getMunicipio(),
                    p.getVereda(),
                    p.getHectareasProductivas(),
                    p.getVariedadCacao(),
                    p.getCuotaMaximaKg(),
                    entregadoAnio
                );
            })
            .toList();
    }
}
