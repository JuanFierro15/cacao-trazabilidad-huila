package co.edu.usco.cacao.web;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.usco.cacao.PruebaIntegracion;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@PruebaIntegracion
class IncidenciaRecallCsvTest {

    private static final String MOTIVO_BLOQUEO = "Reclamo del comprador por sabor anómalo";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String tokenOperador;
    private String tokenAdmin;

    @BeforeEach
    void autenticarUsuarios() throws Exception {
        tokenOperador = iniciarSesion("operador1", "cacao123");
        tokenAdmin = iniciarSesion("admin1", "admin123");
    }

    @Test
    @DisplayName("Hora 12: bloquear CAC001 propaga a CAC001-T1, la ficha queda BLOQUEADO y no disponible, y transformaciones y auditoría se conservan")
    void bloquearCac001PropagaADerivadosYConservaHistorial() throws Exception {
        registrarTransformacionCac001();

        // Sin propagarADerivados: por defecto se propaga (sección 6 del contrato).
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoEstado("BLOQUEADO", MOTIVO_BLOQUEO, null)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lote.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.lote.estado").value("BLOQUEADO"))
            .andExpect(jsonPath("$.lotesAfectados.length()").value(2))
            .andExpect(jsonPath("$.lotesAfectados[0].codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.lotesAfectados[0].estadoAnterior").value("PENDIENTE"))
            .andExpect(jsonPath("$.lotesAfectados[0].estadoNuevo").value("BLOQUEADO"))
            .andExpect(jsonPath("$.lotesAfectados[1].codigoLote").value("CAC001-T1"))
            .andExpect(jsonPath("$.lotesAfectados[1].estadoAnterior").value("PENDIENTE"))
            .andExpect(jsonPath("$.lotesAfectados[1].estadoNuevo").value("BLOQUEADO"));

        mockMvc.perform(get("/api/lotes/CAC001-T1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("BLOQUEADO"))
            .andExpect(jsonPath("$.cantidadDisponible").value(80));

        // Ficha pública del derivado: BLOQUEADO, no disponible y con el origen visible.
        mockMvc.perform(get("/api/public/ficha/CAC001-T1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("BLOQUEADO"))
            .andExpect(jsonPath("$.disponibleParaVenta").value(false))
            .andExpect(jsonPath("$.mensajeEstado").value(
                "Producto retenido por control de calidad. No está disponible para la venta."
            ))
            .andExpect(jsonPath("$.origen.finca").value("Finca La Esperanza"))
            .andExpect(jsonPath("$.origen.municipio").value("Rivera"))
            .andExpect(jsonPath("$.recorrido.length()").value(2));

        // El historial no se borra: la transformación sigue y la trazabilidad la muestra.
        mockMvc.perform(get("/api/transformaciones")
                .param("loteCodigo", "CAC001")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].loteSalidaCodigo", Matchers.contains("CAC001-T1")));

        mockMvc.perform(get("/api/lotes/CAC001-T1/trazabilidad")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("BLOQUEADO"))
            .andExpect(jsonPath("$.linea.length()").value(2));

        // Cada lote afectado deja su propio CAMBIO_ESTADO; el del derivado indica de dónde vino el bloqueo.
        mockMvc.perform(get("/api/auditoria")
                .param("referencia", "CAC001-T1")
                .param("entidad", "LOTE")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].accion").value("CAMBIO_ESTADO"))
            .andExpect(jsonPath("$[0].valorAnterior").value("PENDIENTE"))
            .andExpect(jsonPath("$[0].valorNuevo").value("BLOQUEADO"))
            .andExpect(jsonPath("$[0].motivo").value("Bloqueo propagado desde CAC001: " + MOTIVO_BLOQUEO))
            .andExpect(jsonPath("$[*].accion", Matchers.hasItem("CREAR")));

        // Un derivado bloqueado tampoco se puede transformar.
        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoTransformacion("CAC001-T1", 10, 9)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.codigo").value("LOTE_BLOQUEADO"));
    }

    @Test
    @DisplayName("Con propagarADerivados = false solo se bloquea el lote pedido")
    void bloquearSinPropagarSoloAfectaAlLotePedido() throws Exception {
        registrarTransformacionCac001();

        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoEstado("BLOQUEADO", MOTIVO_BLOQUEO, false)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lotesAfectados.length()").value(1))
            .andExpect(jsonPath("$.lotesAfectados[0].codigoLote").value("CAC001"));

        mockMvc.perform(get("/api/lotes/CAC001-T1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("PENDIENTE"));
    }

    @Test
    @DisplayName("Liberar un derivado con el origen bloqueado responde 409 ORIGEN_BLOQUEADO; la liberación no se propaga")
    void liberarDerivadoConOrigenBloqueadoDevuelve409() throws Exception {
        registrarTransformacionCac001();
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoEstado("BLOQUEADO", MOTIVO_BLOQUEO, true)))
            .andExpect(status().isOk());

        String liberar = cuerpoEstado("LIBERADO", "Análisis de laboratorio sin hallazgos", null);

        mockMvc.perform(patch("/api/lotes/CAC001-T1/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(liberar))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.codigo").value("ORIGEN_BLOQUEADO"))
            .andExpect(jsonPath("$.mensaje").value(Matchers.containsString("CAC001")));

        // Liberar la raíz no arrastra al derivado.
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(liberar))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lotesAfectados.length()").value(1));

        mockMvc.perform(get("/api/lotes/CAC001-T1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("BLOQUEADO"));

        // Con el origen ya liberado, el derivado sí se puede liberar.
        mockMvc.perform(patch("/api/lotes/CAC001-T1/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(liberar))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lote.estado").value("LIBERADO"));
    }

    @Test
    @DisplayName("GET /api/lotes/{codigo}/recall muestra Productor A, Rivera, 100/100/0, el derivado y 80 kg afectados; el operador recibe 403")
    void recallDeCac001TrasElBloqueo() throws Exception {
        registrarTransformacionCac001();
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoEstado("BLOQUEADO", MOTIVO_BLOQUEO, true)))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/lotes/CAC001/recall")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.estado").value("BLOQUEADO"))
            .andExpect(jsonPath("$.loteRaiz").value("CAC001"))
            .andExpect(jsonPath("$.origen.productor").value("Productor A"))
            .andExpect(jsonPath("$.origen.finca").value("Finca La Esperanza"))
            .andExpect(jsonPath("$.origen.municipio").value("Rivera"))
            .andExpect(jsonPath("$.origen.variedadCacao").value("CCN-51"))
            .andExpect(jsonPath("$.cantidades.recibidaKg").value(100))
            .andExpect(jsonPath("$.cantidades.consumidaKg").value(100))
            .andExpect(jsonPath("$.cantidades.disponibleKg").value(0))
            .andExpect(jsonPath("$.derivados.length()").value(1))
            .andExpect(jsonPath("$.derivados[0].codigoLote").value("CAC001-T1"))
            .andExpect(jsonPath("$.derivados[0].producto").value("Grano seco seleccionado"))
            .andExpect(jsonPath("$.derivados[0].etapa").value("LIMPIEZA_CLASIFICACION"))
            .andExpect(jsonPath("$.derivados[0].cantidadKg").value(80))
            .andExpect(jsonPath("$.derivados[0].disponibleKg").value(80))
            .andExpect(jsonPath("$.derivados[0].estado").value("BLOQUEADO"))
            .andExpect(jsonPath("$.kgAfectadosEnInventario").value(80))
            .andExpect(jsonPath("$.historialConservado.transformaciones").value(1))
            // CONSUMO y CREAR TRANSFORMACION (CAC001), CREAR (CAC001-T1) y un CAMBIO_ESTADO por cada lote.
            .andExpect(jsonPath("$.historialConservado.registrosAuditoria").value(5));

        // Consultado desde el derivado, la raíz y el origen se resuelven hacia atrás.
        mockMvc.perform(get("/api/lotes/CAC001-T1/recall")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.loteRaiz").value("CAC001"))
            .andExpect(jsonPath("$.origen.productor").value("Productor A"))
            .andExpect(jsonPath("$.derivados.length()").value(0))
            .andExpect(jsonPath("$.kgAfectadosEnInventario").value(80));

        mockMvc.perform(get("/api/lotes/CAC001/recall")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.codigo").value("ACCESO_DENEGADO"));

        mockMvc.perform(get("/api/lotes/CAC999/recall")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.codigo").value("NO_ENCONTRADO"));
    }

    @Test
    @DisplayName("GET /api/reportes/exportar-csv entrega UTF-8 con BOM, separador ';', decimales con coma y los costos del lote derivado")
    void exportarCsvConFormatoParaExcel() throws Exception {
        registrarTransformacionCac001();

        // El frontend pide la descarga con Accept: application/json; el CSV debe salir igual.
        MvcResult res = mockMvc.perform(get("/api/reportes/exportar-csv")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.CONTENT_TYPE, Matchers.startsWith("text/csv")))
            .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                Matchers.matchesPattern("attachment; filename=\"lotes_\\d{8}_\\d{4}\\.csv\"")))
            .andReturn();

        byte[] bytes = res.getResponse().getContentAsByteArray();
        assertArrayEquals(
            new byte[] {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF},
            Arrays.copyOfRange(bytes, 0, 3),
            "El archivo debe empezar con el BOM de UTF-8"
        );

        List<String> lineas = leerLineas(bytes);
        assertEquals(
            "codigo_lote;tipo_lote;producto;municipio_origen;finca;cantidad_recibida_kg;cantidad_consumida_kg;"
                + "cantidad_disponible_kg;estado;costo_etapa_cop;costo_unitario_cop;precio_venta_cop;margen_porcentaje",
            lineas.getFirst()
        );
        assertTrue(lineas.contains("CAC001;RECEPCION;Cacao seco;Rivera;Finca La Esperanza;100;100;0;PENDIENTE;;;;"), String.join("\n", lineas));
        assertTrue(lineas.contains(
            "CAC001-T1;DERIVADO;Grano seco seleccionado;Rivera;Finca La Esperanza;80;0;80;PENDIENTE;1600000,00;20000,00;25000,00;20,00"
        ), String.join("\n", lineas));
        assertTrue(lineas.stream().anyMatch(l -> l.startsWith("CAC002;RECEPCION;")));
        assertTrue(lineas.stream().anyMatch(l -> l.startsWith("CAC003;RECEPCION;")));

        // Filtros: origen sin distinguir mayúsculas y estado.
        List<String> soloRivera = leerLineas(mockMvc.perform(get("/api/reportes/exportar-csv")
                .param("origen", "rivera")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsByteArray());
        assertTrue(soloRivera.stream().skip(1).allMatch(l -> l.split(";")[3].equals("Rivera")), String.join("\n", soloRivera));
        assertTrue(soloRivera.stream().noneMatch(l -> l.startsWith("CAC002;")));

        List<String> soloBloqueados = leerLineas(mockMvc.perform(get("/api/reportes/exportar-csv")
                .param("estado", "BLOQUEADO")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsByteArray());
        assertTrue(soloBloqueados.stream().noneMatch(l -> l.startsWith("CAC001")), String.join("\n", soloBloqueados));

        mockMvc.perform(get("/api/reportes/exportar-csv")
                .param("estado", "VENCIDO")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.codigo").value("VALIDACION"));

        mockMvc.perform(get("/api/reportes/exportar-csv")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.codigo").value("ACCESO_DENEGADO"));
    }

    private static List<String> leerLineas(byte[] bytes) {
        String texto = new String(bytes, StandardCharsets.UTF_8);
        if (texto.startsWith("\uFEFF")) {
            texto = texto.substring(1);
        }
        return Arrays.asList(texto.split("\r\n"));
    }

    private static String cuerpoEstado(String estado, String motivo, Boolean propagar) {
        String propagarJson = propagar == null ? "" : ", \"propagarADerivados\": " + propagar;
        return String.format("{ \"estado\": \"%s\", \"motivo\": \"%s\"%s }", estado, motivo, propagarJson);
    }

    private static String cuerpoTransformacion(String loteOrigen, int entrada, int salida) {
        return String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "%s",
              "etapa": "TOSTADO_ROASTING",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-16",
              "cantidadEntrada": %d,
              "cantidadSalida": %d,
              "productoSalida": "Cacao tostado"
            }
            """, UUID.randomUUID(), loteOrigen, entrada, salida);
    }

    private void registrarTransformacionCac001() throws Exception {
        String cuerpo = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC001",
              "etapa": "LIMPIEZA_CLASIFICACION",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-15",
              "cantidadEntrada": 100,
              "cantidadSalida": 80,
              "productoSalida": "Grano seco seleccionado",
              "justificacionIncidencia": "Impurezas y pasilla superiores a lo normal",
              "humedadSalida": 7.2,
              "costoEtapaCop": 1600000,
              "precioVentaEstimadoCop": 25000,
              "detalleCostosIncluidos": "Materia prima acopiada, mano de obra de planta y energía"
            }
            """, UUID.randomUUID());

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isCreated());
    }

    private String iniciarSesion(String username, String password) throws Exception {
        String loginCuerpo = String.format("""
            { "username": "%s", "password": "%s" }
            """, username, password);
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginCuerpo))
            .andExpect(status().isOk())
            .andReturn();

        return objectMapper.readTree(res.getResponse().getContentAsString())
            .get("token")
            .asText();
    }
}
