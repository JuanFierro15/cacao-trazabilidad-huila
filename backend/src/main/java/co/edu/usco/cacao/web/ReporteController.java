package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.ReporteServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
@Tag(name = "6. Alertas, Auditoría y Exportación CSV")
public class ReporteController {

    private static final MediaType TEXT_CSV_UTF8 = MediaType.parseMediaType("text/csv;charset=UTF-8");

    private final ReporteServicio reporteServicio;

    public ReporteController(ReporteServicio reporteServicio) {
        this.reporteServicio = reporteServicio;
    }

    @GetMapping("/exportar-csv")
    @Operation(
        summary = "[Solo ADMINISTRADOR] Exportar inventario y balance de lotes en formato CSV para Excel",
        description = "Genera archivo CSV en UTF-8 con BOM, delimitador punto y coma (;) y decimales con coma (,) compatible con Excel en español."
    )
    public ResponseEntity<byte[]> exportarCsv(
        @RequestParam(required = false) String origen,
        @RequestParam(required = false) String estado
    ) {
        ReporteServicio.ArchivoCsv archivo = reporteServicio.exportarLotesCsv(origen, estado);
        return ResponseEntity.ok()
            .contentType(TEXT_CSV_UTF8)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment().filename(archivo.nombreArchivo()).build().toString())
            .body(archivo.contenido());
    }
}
