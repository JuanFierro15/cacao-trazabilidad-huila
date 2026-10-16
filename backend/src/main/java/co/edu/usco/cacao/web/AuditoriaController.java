package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.AuditoriaServicio;
import co.edu.usco.cacao.web.dto.AuditoriaCambioDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auditoria")
@Tag(name = "6. Alertas, Auditoría y Exportación CSV")
public class AuditoriaController {

    private final AuditoriaServicio auditoriaServicio;

    public AuditoriaController(AuditoriaServicio auditoriaServicio) {
        this.auditoriaServicio = auditoriaServicio;
    }

    @GetMapping
    @Operation(
        summary = "[Solo ADMINISTRADOR] Consultar registros de auditoría inmutable",
        description = "Devuelve los eventos auditados (CREAR, CONSUMO, CAMBIO_ESTADO) ordenados del más reciente al más antiguo, filtrables por referencia y entidad."
    )
    public ResponseEntity<List<AuditoriaCambioDTO>> listarAuditoria(
        @RequestParam(required = false) String referencia,
        @RequestParam(required = false) String entidad
    ) {
        return ResponseEntity.ok(auditoriaServicio.listarAuditoria(referencia, entidad));
    }
}
