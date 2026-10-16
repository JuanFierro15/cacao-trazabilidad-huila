package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.TransformacionServicio;
import co.edu.usco.cacao.web.dto.BalanceTransformacionDTO;
import co.edu.usco.cacao.web.dto.TransformacionDTO;
import co.edu.usco.cacao.web.dto.TransformacionRespuestaDTO;
import co.edu.usco.cacao.web.dto.TransformacionSolicitudDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transformaciones")
@Tag(name = "5. Transformaciones y Balance Económico", description = "Registro transaccional de etapas con idempotencia, descuento de inventario, lote derivado y simulador de margen")
public class TransformacionController {

    private final TransformacionServicio transformacionServicio;

    public TransformacionController(TransformacionServicio transformacionServicio) {
        this.transformacionServicio = transformacionServicio;
    }

    @PostMapping
    @Operation(
        summary = "[OPERADOR / ADMINISTRADOR] Registrar etapa de transformación sobre un lote",
        description = "Ejecuta la transformación con idempotencia por operacionUuid, bloqueo pesimista sobre el lote origen, cálculo de merma/rendimiento, generación de lote derivado (-Tn), alertas y auditoría."
    )
    public ResponseEntity<TransformacionRespuestaDTO> crearTransformacion(
        @Valid @RequestBody TransformacionSolicitudDTO solicitud
    ) {
        try {
            TransformacionRespuestaDTO respuesta = transformacionServicio.registrarTransformacion(solicitud);
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (DataIntegrityViolationException ex) {
            throw transformacionServicio.traducirViolacionIntegridad(solicitud.operacionUuid(), ex);
        }
    }

    @GetMapping
    @Operation(
        summary = "[OPERADOR / ADMINISTRADOR] Listar transformaciones registradas",
        description = "Lista las transformaciones sin exponer costos internos, con filtro opcional por código de lote de origen."
    )
    public ResponseEntity<List<TransformacionDTO>> listarTransformaciones(
        @RequestParam(name = "loteCodigo", required = false) String loteCodigo
    ) {
        return ResponseEntity.ok(transformacionServicio.listarTransformaciones(loteCodigo));
    }

    @GetMapping("/{id}/balance")
    @Operation(
        summary = "[Solo ADMINISTRADOR] Consultar o simular el balance económico de una transformación",
        description = "Calcula costo unitario, margen porcentual, fórmulas explícitas y supuestos. Si se envía precioVentaCop en la URL, ejecuta una simulación sin alterar la base de datos."
    )
    public ResponseEntity<BalanceTransformacionDTO> obtenerBalance(
        @PathVariable("id") Long id,
        @RequestParam(name = "precioVentaCop", required = false) BigDecimal precioVentaCop
    ) {
        return ResponseEntity.ok(transformacionServicio.obtenerBalance(id, precioVentaCop));
    }
}
