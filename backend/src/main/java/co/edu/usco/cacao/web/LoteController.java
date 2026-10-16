package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.LoteServicio;
import co.edu.usco.cacao.web.dto.LoteCreacionRespuestaDTO;
import co.edu.usco.cacao.web.dto.LoteCreacionSolicitudDTO;
import co.edu.usco.cacao.web.dto.LoteDTO;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/lotes")
public class LoteController {

    private final LoteServicio loteServicio;

    public LoteController(LoteServicio loteServicio) {
        this.loteServicio = loteServicio;
    }

    @PostMapping
    public ResponseEntity<LoteCreacionRespuestaDTO> crearLote(
        @Valid @RequestBody LoteCreacionSolicitudDTO solicitud
    ) {
        LoteCreacionRespuestaDTO respuesta = loteServicio.crearLote(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @GetMapping
    public ResponseEntity<List<LoteDTO>> listarLotes(
        @RequestParam(required = false) String origen,
        @RequestParam(required = false) String estado,
        @RequestParam(required = false) String tipo
    ) {
        return ResponseEntity.ok(loteServicio.listarLotes(origen, estado, tipo));
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<LoteDTO> obtenerLotePorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(loteServicio.obtenerPorCodigo(codigo));
    }
}
