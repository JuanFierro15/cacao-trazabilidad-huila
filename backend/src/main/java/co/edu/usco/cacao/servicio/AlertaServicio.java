package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.repositorio.AlertaRepository;
import co.edu.usco.cacao.web.dto.AlertaDTO;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AlertaServicio {

    private final AlertaRepository alertaRepository;

    public AlertaServicio(AlertaRepository alertaRepository) {
        this.alertaRepository = alertaRepository;
    }

    @Transactional(readOnly = true)
    public List<AlertaDTO> listarAlertas(Boolean activa, String loteCodigo) {
        String filtroLote = (loteCodigo == null || loteCodigo.isBlank()) ? null : loteCodigo.trim();
        return alertaRepository.filtrarAlertas(activa, filtroLote)
            .stream()
            .map(AlertaDTO::de)
            .toList();
    }
}
