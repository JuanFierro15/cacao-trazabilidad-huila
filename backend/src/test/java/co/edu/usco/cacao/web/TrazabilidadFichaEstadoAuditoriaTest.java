package co.edu.usco.cacao.web;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.usco.cacao.PruebaIntegracion;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@PruebaIntegracion
class TrazabilidadFichaEstadoAuditoriaTest {

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
    @DisplayName("GET /api/lotes/{codigo}/trazabilidad devuelve la genealogía recursiva, línea de eventos, derivados, alertas y tiempoConsultaMs sin costos")
    void trazabilidadDeLoteDerivadoYRaizMuestraLineaCompletaYAlertas() throws Exception {
        registrarTransformacionCac001();

        MvcResult resDerivado = mockMvc.perform(get("/api/lotes/CAC001-T1/trazabilidad")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigoLote").value("CAC001-T1"))
            .andExpect(jsonPath("$.producto").value("Grano seco seleccionado"))
            .andExpect(jsonPath("$.estado").value("PENDIENTE"))
            .andExpect(jsonPath("$.loteRaiz.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.loteRaiz.cantidadRecibidaKg").value(100))
            .andExpect(jsonPath("$.loteRaiz.tipoGrano").value("SECO"))
            .andExpect(jsonPath("$.loteRaiz.porcentajeHumedad").value(7.5))
            .andExpect(jsonPath("$.origen.productor").value("Productor A"))
            .andExpect(jsonPath("$.origen.finca").value("Finca La Esperanza"))
            .andExpect(jsonPath("$.origen.municipio").value("Rivera"))
            .andExpect(jsonPath("$.origen.variedadCacao").value("CCN-51"))
            .andExpect(jsonPath("$.origen.hectareasProductivas").value(2.00))
            .andExpect(jsonPath("$.linea.length()").value(2))
            .andExpect(jsonPath("$.linea[0].orden").value(1))
            .andExpect(jsonPath("$.linea[0].tipo").value("RECEPCION"))
            .andExpect(jsonPath("$.linea[0].codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.linea[0].descripcion").value("Recepción de 100 kg de cacao seco (humedad 7,5 %)"))
            .andExpect(jsonPath("$.linea[1].orden").value(2))
            .andExpect(jsonPath("$.linea[1].tipo").value("TRANSFORMACION"))
            .andExpect(jsonPath("$.linea[1].etapa").value("LIMPIEZA_CLASIFICACION"))
            .andExpect(jsonPath("$.linea[1].loteEntrada").value("CAC001"))
            .andExpect(jsonPath("$.linea[1].loteSalida").value("CAC001-T1"))
            .andExpect(jsonPath("$.linea[1].cantidadEntradaKg").value(100))
            .andExpect(jsonPath("$.linea[1].cantidadSalidaKg").value(80))
            .andExpect(jsonPath("$.linea[1].porcentajeMerma").value(20.00))
            .andExpect(jsonPath("$.linea[1].responsable").value("Operario de planta 1"))
            .andExpect(jsonPath("$.linea[1].incidencia").value("Impurezas y pasilla superiores a lo normal"))
            .andExpect(jsonPath("$.derivados.length()").value(0))
            .andExpect(jsonPath("$.alertas.length()").value(1))
            .andExpect(jsonPath("$.alertas[0].tipoAlerta").value("MERMA_ALTA"))
            .andExpect(jsonPath("$.tiempoConsultaMs").isNumber())
            .andReturn();

        String jsonDerivado = resDerivado.getResponse().getContentAsString();
        assertFalse(jsonDerivado.contains("costoEtapaCop"));
        assertFalse(jsonDerivado.contains("costoUnitarioCop"));
        assertFalse(jsonDerivado.contains("precioVenta"));

        // Al consultar la raíz CAC001, derivados incluye CAC001-T1
        mockMvc.perform(get("/api/lotes/CAC001/trazabilidad")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.derivados.length()").value(1))
            .andExpect(jsonPath("$.derivados[0].codigoLote").value("CAC001-T1"))
            .andExpect(jsonPath("$.derivados[0].etapa").value("LIMPIEZA_CLASIFICACION"))
            .andExpect(jsonPath("$.derivados[0].cantidadKg").value(80))
            .andExpect(jsonPath("$.derivados[0].disponibleKg").value(80));
    }

    @Test
    @DisplayName("GET /api/public/ficha/{codigo} responde sin autenticación con DTO de lista blanca y no expone ningún campo prohibido en el JSON crudo")
    void fichaPublicaSinAutenticacionUsaListaBlancaSinNingunCampoProhibido() throws Exception {
        registrarTransformacionCac001();

        MvcResult resFicha = mockMvc.perform(get("/api/public/ficha/CAC001-T1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigoLote").value("CAC001-T1"))
            .andExpect(jsonPath("$.producto").value("Grano seco seleccionado"))
            .andExpect(jsonPath("$.estado").value("PENDIENTE"))
            .andExpect(jsonPath("$.disponibleParaVenta").value(false))
            .andExpect(jsonPath("$.mensajeEstado").value(
                "Producto en proceso de verificación. Aún no está disponible para la venta."
            ))
            .andExpect(jsonPath("$.origen.finca").value("Finca La Esperanza"))
            .andExpect(jsonPath("$.origen.municipio").value("Rivera"))
            .andExpect(jsonPath("$.origen.departamento").value("Huila"))
            .andExpect(jsonPath("$.origen.variedadCacao").value("CCN-51"))
            .andExpect(jsonPath("$.fechaRecepcionOrigen").value("2026-10-14"))
            .andExpect(jsonPath("$.recorrido.length()").value(2))
            .andExpect(jsonPath("$.recorrido[0].orden").value(1))
            .andExpect(jsonPath("$.recorrido[0].etapa").value("RECEPCION"))
            .andExpect(jsonPath("$.recorrido[0].nombre").value("Recepción en acopio"))
            .andExpect(jsonPath("$.recorrido[1].orden").value(2))
            .andExpect(jsonPath("$.recorrido[1].etapa").value("LIMPIEZA_CLASIFICACION"))
            .andExpect(jsonPath("$.recorrido[1].nombre").value("Limpieza y clasificación"))
            .andExpect(jsonPath("$.consultadoEn").isNotEmpty())
            .andReturn();

        String jsonCrudo = resFicha.getResponse().getContentAsString();
        String jsonMinusculas = jsonCrudo.toLowerCase(Locale.ROOT);

        // Lista prohibida de la sección 8.7: costos, precios, márgenes, cantidades, merma,
        // responsable, nombre del productor, hectáreas, cuota, motivo del estado, alertas e ids internos.
        List<String> terminosProhibidos = List.of(
            "costo",
            "precio",
            "margen",
            "cantidad",
            "merma",
            "responsable",
            "operario de planta",
            "nombreproductor",
            "productor a",
            "prd-a",
            "hectarea",
            "cuota",
            "motivoestado",
            "alerta",
            "\"id\":"
        );

        for (String prohibido : terminosProhibidos) {
            assertFalse(
                jsonMinusculas.contains(prohibido),
                "El JSON crudo de la ficha pública no debe contener '" + prohibido + "': " + jsonCrudo
            );
        }
        assertTrue(jsonCrudo.contains("Finca La Esperanza"));
    }

    @Test
    @DisplayName("Operador recibe 403 al cambiar estado; Administrador libera CAC001, habilita venta en ficha pública y deja rastro en GET /api/auditoria")
    void operadorRecibe403YAdminCambiaEstadoConRegistroEnAuditoria() throws Exception {
        String cuerpoLiberar = """
            {
              "estado": "LIBERADO",
              "motivo": "Control de calidad aprobado para despacho"
            }
            """;

        // Operador recibe 403
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoLiberar))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.status").value(403))
            .andExpect(jsonPath("$.codigo").value("ACCESO_DENEGADO"))
            .andExpect(jsonPath("$.mensaje").value("Solo el Administrador puede liberar o bloquear lotes."));

        // Motivo menor a 10 caracteres → 400 VALIDACION
        String cuerpoMotivoCorto = """
            {
              "estado": "LIBERADO",
              "motivo": "Corto"
            }
            """;
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoMotivoCorto))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.codigo").value("VALIDACION"))
            .andExpect(jsonPath("$.errores[?(@.campo == 'motivo')]").exists());

        // Administrador libera CAC001 → 200 OK
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoLiberar))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lote.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.lote.estado").value("LIBERADO"))
            .andExpect(jsonPath("$.lote.motivoEstado").value("Control de calidad aprobado para despacho"))
            .andExpect(jsonPath("$.lotesAfectados.length()").value(1))
            .andExpect(jsonPath("$.lotesAfectados[0].codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.lotesAfectados[0].estadoAnterior").value("PENDIENTE"))
            .andExpect(jsonPath("$.lotesAfectados[0].estadoNuevo").value("LIBERADO"));

        // Ficha pública de CAC001 refleja LIBERADO y disponibleParaVenta = true (sin exponer motivoEstado)
        MvcResult fichaLiberada = mockMvc.perform(get("/api/public/ficha/CAC001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("LIBERADO"))
            .andExpect(jsonPath("$.disponibleParaVenta").value(true))
            .andExpect(jsonPath("$.mensajeEstado").value("Producto verificado y disponible para la venta."))
            .andReturn();
        assertFalse(fichaLiberada.getResponse().getContentAsString().contains("Control de calidad aprobado para despacho"));

        // Pedir el mismo estado LIBERADO → 409 ESTADO_SIN_CAMBIO
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoLiberar))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.codigo").value("ESTADO_SIN_CAMBIO"));

        // El cambio aparece en GET /api/auditoria
        mockMvc.perform(get("/api/auditoria")
                .param("referencia", "CAC001")
                .param("entidad", "LOTE")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].usuarioUsername").value("admin1"))
            .andExpect(jsonPath("$[0].usuarioRol").value("ADMINISTRADOR"))
            .andExpect(jsonPath("$[0].accion").value("CAMBIO_ESTADO"))
            .andExpect(jsonPath("$[0].entidadAfectada").value("LOTE"))
            .andExpect(jsonPath("$[0].registroReferencia").value("CAC001"))
            .andExpect(jsonPath("$[0].campoModificado").value("estado"))
            .andExpect(jsonPath("$[0].valorAnterior").value("PENDIENTE"))
            .andExpect(jsonPath("$[0].valorNuevo").value("LIBERADO"))
            .andExpect(jsonPath("$[0].motivo").value("Control de calidad aprobado para despacho"));
    }

    @Test
    @DisplayName("GET /api/alertas y GET /api/auditoria son exclusivos de ADMINISTRADOR y permiten filtrar por activa y loteCodigo")
    void consultarAlertasYAuditoriaConPermisosDeAdministrador() throws Exception {
        registrarTransformacionCac001();

        mockMvc.perform(get("/api/alertas")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.codigo").value("ACCESO_DENEGADO"));

        mockMvc.perform(get("/api/auditoria")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.codigo").value("ACCESO_DENEGADO"));

        mockMvc.perform(get("/api/alertas")
                .param("activa", "true")
                .param("loteCodigo", "CAC001")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].tipoAlerta").value("MERMA_ALTA"))
            .andExpect(jsonPath("$[0].loteCodigo").value("CAC001"))
            .andExpect(jsonPath("$[0].valorMedido").value(20.00));
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
