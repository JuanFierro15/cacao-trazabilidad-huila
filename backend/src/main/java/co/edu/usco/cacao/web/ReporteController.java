package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.ReporteServicio;
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
public class ReporteController {

    private static final MediaType TEXT_CSV_UTF8 = MediaType.parseMediaType("text/csv;charset=UTF-8");

    private final ReporteServicio reporteServicio;

    public ReporteController(ReporteServicio reporteServicio) {
        this.reporteServicio = reporteServicio;
    }

    @GetMapping("/exportar-csv")
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
