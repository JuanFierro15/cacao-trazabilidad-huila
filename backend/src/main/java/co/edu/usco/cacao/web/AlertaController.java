package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.AlertaServicio;
import co.edu.usco.cacao.web.dto.AlertaDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alertas")
public class AlertaController {

    private final AlertaServicio alertaServicio;

    public AlertaController(AlertaServicio alertaServicio) {
        this.alertaServicio = alertaServicio;
    }

    @GetMapping
    public ResponseEntity<List<AlertaDTO>> listarAlertas(
        @RequestParam(required = false) Boolean activa,
        @RequestParam(required = false) String loteCodigo
    ) {
        return ResponseEntity.ok(alertaServicio.listarAlertas(activa, loteCodigo));
    }
}
