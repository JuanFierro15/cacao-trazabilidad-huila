package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.AuditoriaServicio;
import co.edu.usco.cacao.web.dto.AuditoriaCambioDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {

    private final AuditoriaServicio auditoriaServicio;

    public AuditoriaController(AuditoriaServicio auditoriaServicio) {
        this.auditoriaServicio = auditoriaServicio;
    }

    @GetMapping
    public ResponseEntity<List<AuditoriaCambioDTO>> listarAuditoria(
        @RequestParam(required = false) String referencia,
        @RequestParam(required = false) String entidad
    ) {
        return ResponseEntity.ok(auditoriaServicio.listarAuditoria(referencia, entidad));
    }
}
