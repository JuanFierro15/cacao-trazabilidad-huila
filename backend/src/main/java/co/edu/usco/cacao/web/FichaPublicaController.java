package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.TrazabilidadServicio;
import co.edu.usco.cacao.web.dto.FichaPublicaDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@Tag(name = "2. Ficha Pública (Pasaporte Digital)", description = "Consulta pública del comprador mediante código QR sin datos internos confidenciales (RF06)")
public class FichaPublicaController {

    private final TrazabilidadServicio trazabilidadServicio;

    public FichaPublicaController(TrazabilidadServicio trazabilidadServicio) {
        this.trazabilidadServicio = trazabilidadServicio;
    }

    @GetMapping("/ficha/{codigo}")
    @SecurityRequirements
    @Operation(
        summary = "[Público] Consultar ficha pública de un lote por código",
        description = "Devuelve el Pasaporte Digital del lote con lista blanca estricta (sin costos, márgenes, cantidades internas ni datos personales del productor)."
    )
    public ResponseEntity<FichaPublicaDTO> obtenerFichaPublica(@PathVariable String codigo) {
        return ResponseEntity.ok(trazabilidadServicio.obtenerFichaPublica(codigo));
    }
}
