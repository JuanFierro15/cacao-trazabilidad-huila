package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.CatalogoServicio;
import co.edu.usco.cacao.web.dto.ReglasConfigDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final CatalogoServicio catalogoServicio;

    public ConfigController(CatalogoServicio catalogoServicio) {
        this.catalogoServicio = catalogoServicio;
    }

    @GetMapping("/reglas")
    public ResponseEntity<ReglasConfigDTO> obtenerReglas() {
        return ResponseEntity.ok(catalogoServicio.obtenerReglas());
    }
}
