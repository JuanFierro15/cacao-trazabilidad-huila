package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.LoteServicio;
import co.edu.usco.cacao.servicio.TrazabilidadServicio;
import co.edu.usco.cacao.web.dto.CambioEstadoRespuestaDTO;
import co.edu.usco.cacao.web.dto.CambioEstadoSolicitudDTO;
import co.edu.usco.cacao.web.dto.LoteCreacionRespuestaDTO;
import co.edu.usco.cacao.web.dto.LoteCreacionSolicitudDTO;
import co.edu.usco.cacao.web.dto.LoteDTO;
import co.edu.usco.cacao.web.dto.RecallRespuestaDTO;
import co.edu.usco.cacao.web.dto.TrazabilidadRespuestaDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lotes")
@Tag(name = "4. Lotes, Trazabilidad, Estado y Recall", description = "Recepción de lotes, filtros de inventario, trazabilidad recursiva de 2 vías, bloqueo en cascada y reporte de recall")
public class LoteController {

    private final LoteServicio loteServicio;
    private final TrazabilidadServicio trazabilidadServicio;

    public LoteController(
        LoteServicio loteServicio,
        TrazabilidadServicio trazabilidadServicio
    ) {
        this.loteServicio = loteServicio;
        this.trazabilidadServicio = trazabilidadServicio;
    }

    @PostMapping
    @Operation(
        summary = "[OPERADOR / ADMINISTRADOR] Registrar recepción de lote de cacao",
        description = "Crea un lote de recepción con código automático CACnnn (o validado), evalúa plausibilidad de cuota anual de la finca y registra auditoría CREAR."
    )
    public ResponseEntity<LoteCreacionRespuestaDTO> crearLote(
        @Valid @RequestBody LoteCreacionSolicitudDTO solicitud
    ) {
        LoteCreacionRespuestaDTO respuesta = loteServicio.crearLote(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @GetMapping
    @Operation(
        summary = "[OPERADOR / ADMINISTRADOR] Consultar inventario de lotes con filtros opcionales",
        description = "Permite filtrar lotes combinando municipio de origen, estado (PENDIENTE, LIBERADO, BLOQUEADO) y tipo de lote (RECEPCION, DERIVADO)."
    )
    public ResponseEntity<List<LoteDTO>> listarLotes(
        @RequestParam(required = false) String origen,
        @RequestParam(required = false) String estado,
        @RequestParam(required = false) String tipo
    ) {
        return ResponseEntity.ok(loteServicio.listarLotes(origen, estado, tipo));
    }

    @GetMapping("/{codigo}")
    @Operation(
        summary = "[OPERADOR / ADMINISTRADOR] Consultar detalle de un lote por su código"
    )
    public ResponseEntity<LoteDTO> obtenerLotePorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(loteServicio.obtenerPorCodigo(codigo));
    }

    @GetMapping("/{codigo}/trazabilidad")
    @Operation(
        summary = "[OPERADOR / ADMINISTRADOR] Obtener trazabilidad recursiva hacia atrás y hacia adelante",
        description = "Resuelve el árbol genealógico completo del lote (ancestros hasta la recepción raíz, línea cronológica de etapas, lotes derivados, alertas y tiempo de consulta en ms)."
    )
    public ResponseEntity<TrazabilidadRespuestaDTO> obtenerTrazabilidad(@PathVariable String codigo) {
        return ResponseEntity.ok(trazabilidadServicio.obtenerTrazabilidad(codigo));
    }

    @GetMapping("/{codigo}/recall")
    @Operation(
        summary = "[Solo ADMINISTRADOR] Emitir reporte de retiro o recall por incidencia de lote",
        description = "Identifica el lote raíz, productor, finca, derivados afectados, kilogramos retenidos en inventario e historial conservado."
    )
    public ResponseEntity<RecallRespuestaDTO> obtenerRecall(@PathVariable String codigo) {
        return ResponseEntity.ok(trazabilidadServicio.obtenerRecall(codigo));
    }

    @PatchMapping("/{codigo}/estado")
    @Operation(
        summary = "[Solo ADMINISTRADOR] Cambiar estado de lote (LIBERADO o BLOQUEADO) con auditoría",
        description = "Actualiza el estado exigiendo motivo obligatorio (10-300 caracteres). El bloqueo propaga en cascada a los derivados por defecto; la liberación verifica que ningún ancestro permanezca bloqueado (409 ORIGEN_BLOQUEADO)."
    )
    public ResponseEntity<CambioEstadoRespuestaDTO> cambiarEstado(
        @PathVariable String codigo,
        @Valid @RequestBody CambioEstadoSolicitudDTO solicitud
    ) {
        return ResponseEntity.ok(loteServicio.cambiarEstado(codigo, solicitud));
    }
}

