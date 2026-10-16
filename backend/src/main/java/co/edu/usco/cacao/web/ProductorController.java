package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.CatalogoServicio;
import co.edu.usco.cacao.web.dto.ProductorDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/productores")
@Tag(name = "3. Configuración y Catálogos")
public class ProductorController {

    private final CatalogoServicio catalogoServicio;

    public ProductorController(CatalogoServicio catalogoServicio) {
        this.catalogoServicio = catalogoServicio;
    }

    @GetMapping
    @Operation(
        summary = "[OPERADOR / ADMINISTRADOR] Listar fincas y productores activos",
        description = "Devuelve los productores registrados junto con su cuota máxima anual y el acumulado entregado en el año."
    )
    public ResponseEntity<List<ProductorDTO>> listarProductores() {
        return ResponseEntity.ok(catalogoServicio.listarProductores());
    }
}
