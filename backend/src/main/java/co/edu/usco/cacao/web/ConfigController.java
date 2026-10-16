package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.CatalogoServicio;
import co.edu.usco.cacao.web.dto.ReglasConfigDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
@Tag(name = "3. Configuración y Catálogos", description = "Parámetros de reglas de negocio, etapas de proceso y catálogo de productores")
public class ConfigController {

    private final CatalogoServicio catalogoServicio;

    public ConfigController(CatalogoServicio catalogoServicio) {
        this.catalogoServicio = catalogoServicio;
    }

    @GetMapping("/reglas")
    @Operation(
        summary = "[OPERADOR / ADMINISTRADOR] Consultar reglas de negocio y catálogo de etapas",
        description = "Devuelve el umbral oficial de merma, el rendimiento plausible por hectárea/año y las etapas de transformación habilitadas."
    )
    public ResponseEntity<ReglasConfigDTO> obtenerReglas() {
        return ResponseEntity.ok(catalogoServicio.obtenerReglas());
    }
}
