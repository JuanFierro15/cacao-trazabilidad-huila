package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.TransformacionServicio;
import co.edu.usco.cacao.web.dto.BalanceTransformacionDTO;
import co.edu.usco.cacao.web.dto.TransformacionDTO;
import co.edu.usco.cacao.web.dto.TransformacionRespuestaDTO;
import co.edu.usco.cacao.web.dto.TransformacionSolicitudDTO;
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
public class TransformacionController {

    private final TransformacionServicio transformacionServicio;

    public TransformacionController(TransformacionServicio transformacionServicio) {
        this.transformacionServicio = transformacionServicio;
    }

    @PostMapping
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
    public ResponseEntity<List<TransformacionDTO>> listarTransformaciones(
        @RequestParam(name = "loteCodigo", required = false) String loteCodigo
    ) {
        return ResponseEntity.ok(transformacionServicio.listarTransformaciones(loteCodigo));
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<BalanceTransformacionDTO> obtenerBalance(
        @PathVariable("id") Long id,
        @RequestParam(name = "precioVentaCop", required = false) BigDecimal precioVentaCop
    ) {
        return ResponseEntity.ok(transformacionServicio.obtenerBalance(id, precioVentaCop));
    }
}
