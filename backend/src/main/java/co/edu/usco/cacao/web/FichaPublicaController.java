package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.TrazabilidadServicio;
import co.edu.usco.cacao.web.dto.FichaPublicaDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class FichaPublicaController {

    private final TrazabilidadServicio trazabilidadServicio;

    public FichaPublicaController(TrazabilidadServicio trazabilidadServicio) {
        this.trazabilidadServicio = trazabilidadServicio;
    }

    @GetMapping("/ficha/{codigo}")
    public ResponseEntity<FichaPublicaDTO> obtenerFichaPublica(@PathVariable String codigo) {
        return ResponseEntity.ok(trazabilidadServicio.obtenerFichaPublica(codigo));
    }
}
