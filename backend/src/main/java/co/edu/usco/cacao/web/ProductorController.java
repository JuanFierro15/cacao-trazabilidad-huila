package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.CatalogoServicio;
import co.edu.usco.cacao.web.dto.ProductorDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/productores")
public class ProductorController {

    private final CatalogoServicio catalogoServicio;

    public ProductorController(CatalogoServicio catalogoServicio) {
        this.catalogoServicio = catalogoServicio;
    }

    @GetMapping
    public ResponseEntity<List<ProductorDTO>> listarProductores() {
        return ResponseEntity.ok(catalogoServicio.listarProductores());
    }
}
