package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.AlertaServicio;
import co.edu.usco.cacao.web.dto.AlertaDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alertas")
@Tag(name = "6. Alertas, Auditoría y Exportación CSV", description = "Consultas exclusivas del Administrador para control de alertas, bitácora de auditoría inmutable y reporte CSV")
public class AlertaController {

    private final AlertaServicio alertaServicio;

    public AlertaController(AlertaServicio alertaServicio) {
        this.alertaServicio = alertaServicio;
    }

    @GetMapping
    @Operation(
        summary = "[Solo ADMINISTRADOR] Consultar alertas generadas por reglas de negocio",
        description = "Lista las alertas (MERMA_ALTA, CUOTA_EXCEDIDA, SOBRECOSTO, REGISTRO_INCOMPLETO) con la regla aplicada y causa detallada."
    )
    public ResponseEntity<List<AlertaDTO>> listarAlertas(
        @RequestParam(required = false) Boolean activa,
        @RequestParam(required = false) String loteCodigo
    ) {
        return ResponseEntity.ok(alertaServicio.listarAlertas(activa, loteCodigo));
    }
}
