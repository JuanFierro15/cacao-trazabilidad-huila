package co.edu.usco.cacao.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.usco.cacao.PruebaIntegracion;
import co.edu.usco.cacao.dominio.AuditoriaCambio;
import co.edu.usco.cacao.dominio.Lote;
import co.edu.usco.cacao.repositorio.AuditoriaCambioRepository;
import co.edu.usco.cacao.repositorio.LoteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
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

/**
 * Suite de pruebas automatizadas de reglas de negocio, matriz de permisos
 * y regresión de la hora 12 (Bloque B8, contrato secciones 4, 6, 7 y 8).
 */
@PruebaIntegracion
class ReglasPermisosRegresionTest {

    private static final String MOTIVO_INCIDENCIA = "Contaminación cruzada detectada en inspección";
    private static final String MOTIVO_LIBERACION = "Segunda prueba de laboratorio negativa y conforme";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private AuditoriaCambioRepository auditoriaCambioRepository;

    private String tokenOperador;
    private String tokenAdmin;

    @BeforeEach
    void autenticarUsuarios() throws Exception {
        tokenOperador = iniciarSesion("operador1", "cacao123");
        tokenAdmin = iniciarSesion("admin1", "admin123");
    }

    // ========================================================================
    // CASO 1: Regla de inventario insuficiente (RF02)
    // ========================================================================
    @Test
    @DisplayName("Caso 1: Pedir entrada mayor a la disponible devuelve 422 INVENTARIO_INSUFICIENTE sin alterar el lote")
    void caso1_inventarioInsuficienteResponde422() throws Exception {
        // CAC001 tiene 100 kg disponibles en semilla. Se piden 120 kg.
        String cuerpo = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC001",
              "etapa": "LIMPIEZA_CLASIFICACION",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-16",
              "cantidadEntrada": 120,
              "cantidadSalida": 100,
              "productoSalida": "Grano clasificado"
            }
            """, UUID.randomUUID());

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.status").value(422))
            .andExpect(jsonPath("$.codigo").value("INVENTARIO_INSUFICIENTE"))
            .andExpect(jsonPath("$.mensaje").value(Matchers.containsString("CAC001")))
            .andExpect(jsonPath("$.mensaje").value(Matchers.containsString("100")))
            .andExpect(jsonPath("$.mensaje").value(Matchers.containsString("120")));

        // Verificar que el inventario no fue alterado
        Lote lote = loteRepository.findByCodigoLote("CAC001").orElseThrow();
        assertEquals(0, new BigDecimal("100.000").compareTo(lote.getCantidadDisponible()));
        assertEquals(0, BigDecimal.ZERO.compareTo(lote.getCantidadConsumida()));
    }

    // ========================================================================
    // CASO 2: Regla de balance físico sin insumos (RF02)
    // ========================================================================
    @Test
    @DisplayName("Caso 2: Salida mayor a entrada sin insumos agregados devuelve 422 SALIDA_SIN_JUSTIFICACION")
    void caso2_salidaMayorQueEntradaSinInsumosResponde422() throws Exception {
        String cuerpo = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC001",
              "etapa": "LIMPIEZA_CLASIFICACION",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-16",
              "cantidadEntrada": 80,
              "cantidadSalida": 95,
              "productoSalida": "Grano clasificado",
              "insumosAgregados": null
            }
            """, UUID.randomUUID());

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.status").value(422))
            .andExpect(jsonPath("$.codigo").value("SALIDA_SIN_JUSTIFICACION"))
            .andExpect(jsonPath("$.mensaje").value(Matchers.containsString("insumos")));
    }

    // ========================================================================
    // CASO 3: Idempotencia sin doble consumo (RF08)
    // ========================================================================
    @Test
    @DisplayName("Caso 3: Reenviar la misma operacionUuid devuelve 409 OPERACION_DUPLICADA y no consume inventario dos veces")
    void caso3_idempotenciaSinDobleConsumoResponde409() throws Exception {
        String uuid = UUID.randomUUID().toString();
        String cuerpo = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC002",
              "etapa": "LIMPIEZA_CLASIFICACION",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-16",
              "cantidadEntrada": 50,
              "cantidadSalida": 45,
              "productoSalida": "Grano clasificado"
            }
            """, uuid);

        // Primer envío: 201 Created y descuenta 50 kg (quedan 100 de 150)
        MvcResult primera = mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.inventarioOrigen.cantidadDisponible").value(100))
            .andReturn();

        long transformacionId = objectMapper.readTree(primera.getResponse().getContentAsString())
            .get("transformacion")
            .get("id")
            .asLong();

        // Segundo envío (idempotencia): 409 OPERACION_DUPLICADA con el id existente
        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.codigo").value("OPERACION_DUPLICADA"))
            .andExpect(jsonPath("$.transformacionId").value(transformacionId));

        // Verificar que el disponible sigue en 100 kg (no 50 kg)
        Lote cac002 = loteRepository.findByCodigoLote("CAC002").orElseThrow();
        assertEquals(0, new BigDecimal("50.000").compareTo(cac002.getCantidadConsumida()));
        assertEquals(0, new BigDecimal("100.000").compareTo(cac002.getCantidadDisponible()));
    }

    // ========================================================================
    // CASO 4: Validación de cantidad negativa o cero (RF01)
    // ========================================================================
    @Test
    @DisplayName("Caso 4: POST /api/lotes con cantidad negativa o cero devuelve 400 VALIDACION por campo")
    void caso4_validacionCantidadNegativaOZeroResponde400() throws Exception {
        String cuerpoNegativo = """
            {
              "codigoLote": "CAC999",
              "productorId": 1,
              "fechaRecepcion": "2026-10-16",
              "tipoGrano": "SECO",
              "porcentajeHumedad": 7.0,
              "cantidadRecibida": -10.0
            }
            """;

        mockMvc.perform(post("/api/lotes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoNegativo))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.codigo").value("VALIDACION"))
            .andExpect(jsonPath("$.errores[?(@.campo == 'cantidadRecibida')]").exists());

        String cuerpoCero = """
            {
              "codigoLote": "CAC998",
              "productorId": 1,
              "fechaRecepcion": "2026-10-16",
              "tipoGrano": "SECO",
              "porcentajeHumedad": 7.0,
              "cantidadRecibida": 0.0
            }
            """;

        mockMvc.perform(post("/api/lotes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoCero))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.codigo").value("VALIDACION"))
            .andExpect(jsonPath("$.errores[?(@.campo == 'cantidadRecibida')]").exists());
    }

    // ========================================================================
    // CASO 5: Permisos y matriz de seguridad - 403 del operador (RF09, RF10)
    // ========================================================================
    @Test
    @DisplayName("Caso 5: El rol OPERADOR recibe 403 ACCESO_DENEGADO al intentar liberar o bloquear lotes")
    void caso5_operadorRecibe403AlCambiarEstado() throws Exception {
        String cuerpoEstado = String.format("""
            {
              "estado": "BLOQUEADO",
              "motivo": "%s",
              "propagarADerivados": true
            }
            """, MOTIVO_INCIDENCIA);

        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoEstado))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.status").value(403))
            .andExpect(jsonPath("$.codigo").value("ACCESO_DENEGADO"));

        // El estado de CAC001 permanece inalterado
        Lote lote = loteRepository.findByCodigoLote("CAC001").orElseThrow();
        assertEquals("PENDIENTE", lote.getEstado().name());
    }

    // ========================================================================
    // CASO 6: Ficha pública sin campos prohibidos / Pasaporte QR (RF03, RF06)
    // ========================================================================
    @Test
    @DisplayName("Caso 6: GET /api/public/ficha/{codigo} es pública y no expone ninguno de los 14 campos internos prohibidos")
    void caso6_fichaPublicaSinCamposProhibidos() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/public/ficha/CAC001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.producto").value("Cacao seco"))
            .andExpect(jsonPath("$.origen.municipio").value("Rivera"))
            .andExpect(jsonPath("$.estado").value("PENDIENTE"))
            .andExpect(jsonPath("$.disponibleParaVenta").value(false))
            .andReturn();

        String jsonCrudo = res.getResponse().getContentAsString().toLowerCase();

        // 14 campos prohibidos según contrato técnico (sección 8.7)
        List<String> camposProhibidos = List.of(
            "costo",
            "precio",
            "margen",
            "cantidad",
            "merma",
            "responsable",
            "productornombre",
            "hectareas",
            "cuota",
            "motivoestado",
            "alertas",
            "\"id\":",
            "transformacionid",
            "operacionuuid"
        );

        for (String prohibido : camposProhibidos) {
            assertFalse(jsonCrudo.contains(prohibido),
                "El JSON de la ficha pública expone indebidamente el campo o token: " + prohibido);
        }
    }

    // ========================================================================
    // CASO 7: Regresión hora 12 - Cascada de bloqueo y trazabilidad histórica
    // ========================================================================
    @Test
    @DisplayName("Caso 7: Regresión hora 12: Bloquear CAC001 propaga a CAC001-T1, ficha BLOQUEADO y conserva historial")
    void caso7_regresionHora12BloqueoCascadaYHistorialConservado() throws Exception {
        // 1. Crear derivado CAC001-T1 (100 -> 80 kg)
        registrarTransformacionCac001();

        // 2. Bloquear CAC001 con propagación (por defecto true)
        String cuerpoBloqueo = String.format("""
            {
              "estado": "BLOQUEADO",
              "motivo": "%s",
              "propagarADerivados": true
            }
            """, MOTIVO_INCIDENCIA);

        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoBloqueo))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lote.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.lote.estado").value("BLOQUEADO"))
            .andExpect(jsonPath("$.lotesAfectados.length()").value(2))
            .andExpect(jsonPath("$.lotesAfectados[0].codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.lotesAfectados[1].codigoLote").value("CAC001-T1"));

        // 3. Ficha pública de CAC001-T1: estado BLOQUEADO y disponibleParaVenta = false
        mockMvc.perform(get("/api/public/ficha/CAC001-T1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("BLOQUEADO"))
            .andExpect(jsonPath("$.disponibleParaVenta").value(false))
            .andExpect(jsonPath("$.origen.municipio").value("Rivera"));

        // 4. Trazabilidad completa intacta
        mockMvc.perform(get("/api/lotes/CAC001/trazabilidad")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.loteRaiz.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.linea.length()").value(2))
            .andExpect(jsonPath("$.derivados.length()").value(1))
            .andExpect(jsonPath("$.derivados[0].codigoLote").value("CAC001-T1"))
            .andExpect(jsonPath("$.derivados[0].estado").value("BLOQUEADO"));

        // 5. Auditoría registra ambos cambios
        List<AuditoriaCambio> auditoriasCac001 = auditoriaCambioRepository.filtrarAuditoria("CAC001", "LOTE");
        assertTrue(auditoriasCac001.stream().anyMatch(a ->
            "CAMBIO_ESTADO".equals(a.getAccion()) && "BLOQUEADO".equals(a.getValorNuevo())));

        List<AuditoriaCambio> auditoriasCac001T1 = auditoriaCambioRepository.filtrarAuditoria("CAC001-T1", "LOTE");
        assertTrue(auditoriasCac001T1.stream().anyMatch(a ->
            "CAMBIO_ESTADO".equals(a.getAccion()) && "BLOQUEADO".equals(a.getValorNuevo())));

        // 6. Intentar transformar un derivado bloqueado responde 409 LOTE_BLOQUEADO
        String cuerpoTransformarBloqueado = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC001-T1",
              "etapa": "TOSTADO_ROASTING",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-16",
              "cantidadEntrada": 40,
              "cantidadSalida": 35,
              "productoSalida": "Cacao tostado"
            }
            """, UUID.randomUUID());

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoTransformarBloqueado))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.codigo").value("LOTE_BLOQUEADO"));
    }

    // ========================================================================
    // CASO 8: Regresión hora 12 - Liberación con origen bloqueado (RF09)
    // ========================================================================
    @Test
    @DisplayName("Caso 8: Intentar liberar derivado con raíz BLOQUEADO devuelve 409 ORIGEN_BLOQUEADO; tras liberar raíz sí se puede")
    void caso8_regresionHora12LiberarDerivadoConOrigenBloqueadoResponde409() throws Exception {
        registrarTransformacionCac001();

        // Bloquear CAC001 y CAC001-T1
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                    { "estado": "BLOQUEADO", "motivo": "%s", "propagarADerivados": true }
                    """, MOTIVO_INCIDENCIA)))
            .andExpect(status().isOk());

        // Intentar liberar CAC001-T1 estando CAC001 bloqueado -> 409 ORIGEN_BLOQUEADO
        mockMvc.perform(patch("/api/lotes/CAC001-T1/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                    { "estado": "LIBERADO", "motivo": "%s" }
                    """, MOTIVO_LIBERACION)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.codigo").value("ORIGEN_BLOQUEADO"))
            .andExpect(jsonPath("$.mensaje").value(Matchers.containsString("CAC001")));

        // Liberar la raíz CAC001 primero -> 200 OK
        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                    { "estado": "LIBERADO", "motivo": "%s" }
                    """, MOTIVO_LIBERACION)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lote.estado").value("LIBERADO"));

        // Ahora liberar el derivado CAC001-T1 -> 200 OK
        mockMvc.perform(patch("/api/lotes/CAC001-T1/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                    { "estado": "LIBERADO", "motivo": "%s" }
                    """, MOTIVO_LIBERACION)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lote.estado").value("LIBERADO"))
            .andExpect(jsonPath("$.lotesAfectados.length()").value(1));
    }

    // ========================================================================
    // MÉTODOS AUXILIARES
    // ========================================================================

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
