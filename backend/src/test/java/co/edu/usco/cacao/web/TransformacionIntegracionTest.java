package co.edu.usco.cacao.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.usco.cacao.PruebaIntegracion;
import co.edu.usco.cacao.dominio.AuditoriaCambio;
import co.edu.usco.cacao.dominio.EstadoLote;
import co.edu.usco.cacao.dominio.Lote;
import co.edu.usco.cacao.repositorio.AuditoriaCambioRepository;
import co.edu.usco.cacao.repositorio.LoteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
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
class TransformacionIntegracionTest {

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

    @Test
    @DisplayName("CAC001 100 → 80 genera merma 20,00 %, alerta MERMA_ALTA, lote derivado CAC001-T1, auditoría y balance 20.000 COP/kg y 20,00 %")
    void transformarCac001GeneraDerivadoAlertaAuditoriasYBalance() throws Exception {
        String uuid = "3f6c2a9e-5b1d-4c8e-9f0a-1b2c3d4e5f60";
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
              "insumosAgregados": null,
              "temperaturaProceso": null,
              "humedadSalida": 7.2,
              "costoEtapaCop": 1600000,
              "precioVentaEstimadoCop": 25000,
              "detalleCostosIncluidos": "Materia prima acopiada, mano de obra de planta y energía"
            }
            """, uuid);

        MvcResult res = mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.transformacion.operacionUuid").value(uuid))
            .andExpect(jsonPath("$.transformacion.loteOrigenCodigo").value("CAC001"))
            .andExpect(jsonPath("$.transformacion.loteSalidaCodigo").value("CAC001-T1"))
            .andExpect(jsonPath("$.transformacion.etapa").value("LIMPIEZA_CLASIFICACION"))
            .andExpect(jsonPath("$.transformacion.cantidadEntrada").value(100))
            .andExpect(jsonPath("$.transformacion.cantidadSalida").value(80))
            .andExpect(jsonPath("$.transformacion.porcentajeMerma").value(20.00))
            .andExpect(jsonPath("$.transformacion.porcentajeRendimiento").value(80.00))
            .andExpect(jsonPath("$.transformacion.costoEtapaCop").doesNotExist())
            .andExpect(jsonPath("$.inventarioOrigen.codigoLote").value("CAC001"))
            .andExpect(jsonPath("$.inventarioOrigen.cantidadRecibida").value(100))
            .andExpect(jsonPath("$.inventarioOrigen.cantidadConsumida").value(100))
            .andExpect(jsonPath("$.inventarioOrigen.cantidadDisponible").value(0))
            .andExpect(jsonPath("$.alertasGeneradas.length()").value(1))
            .andExpect(jsonPath("$.alertasGeneradas[0].tipoAlerta").value("MERMA_ALTA"))
            .andExpect(jsonPath("$.alertasGeneradas[0].loteCodigo").value("CAC001"))
            .andExpect(jsonPath("$.alertasGeneradas[0].reglaAplicada").value("Merma de una etapa mayor a 15,0 %"))
            .andExpect(jsonPath("$.alertasGeneradas[0].causa").value(
                "Merma calculada de 20,00 % (100 kg → 80 kg) en LIMPIEZA_CLASIFICACION. Causa registrada por el operador: Impurezas y pasilla superiores a lo normal."
            ))
            .andExpect(jsonPath("$.alertasGeneradas[0].valorMedido").value(20.00))
            .andExpect(jsonPath("$.alertasGeneradas[0].umbral").value(15.00))
            .andExpect(jsonPath("$.alertasGeneradas[0].activa").value(true))
            .andReturn();

        JsonNode json = objectMapper.readTree(res.getResponse().getContentAsString());
        long transformacionId = json.get("transformacion").get("id").asLong();

        // Verificar que el lote derivado CAC001-T1 existe con 80 kg disponibles y padre CAC001
        mockMvc.perform(get("/api/lotes/CAC001-T1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigoLote").value("CAC001-T1"))
            .andExpect(jsonPath("$.tipoLote").value("DERIVADO"))
            .andExpect(jsonPath("$.producto").value("Grano seco seleccionado"))
            .andExpect(jsonPath("$.cantidadRecibida").value(80))
            .andExpect(jsonPath("$.cantidadDisponible").value(80))
            .andExpect(jsonPath("$.lotesPadre[0]").value("CAC001"));

        // Verificar auditoría CONSUMO y CREAR
        List<AuditoriaCambio> auditoriasLote = auditoriaCambioRepository.filtrarAuditoria("CAC001", "LOTE");
        assertEquals(1, auditoriasLote.size());
        assertEquals("CONSUMO", auditoriasLote.getFirst().getAccion());
        assertEquals("100", auditoriasLote.getFirst().getValorAnterior());
        assertEquals("0", auditoriasLote.getFirst().getValorNuevo());

        List<AuditoriaCambio> auditoriasTrans = auditoriaCambioRepository.filtrarAuditoria("CAC001", "TRANSFORMACION");
        assertEquals(1, auditoriasTrans.size());
        assertEquals("CREAR", auditoriasTrans.getFirst().getAccion());
        assertEquals(uuid, auditoriasTrans.getFirst().getValorNuevo());

        // Verificar balance como ADMINISTRADOR (20.000 COP/kg y 20,00 %)
        mockMvc.perform(get("/api/transformaciones/" + transformacionId + "/balance")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.transformacionId").value(transformacionId))
            .andExpect(jsonPath("$.loteSalidaCodigo").value("CAC001-T1"))
            .andExpect(jsonPath("$.costoEtapaCop").value(1600000.00))
            .andExpect(jsonPath("$.cantidadSalidaKg").value(80.000))
            .andExpect(jsonPath("$.costoUnitarioCop").value(20000.00))
            .andExpect(jsonPath("$.precioVentaCop").value(25000.00))
            .andExpect(jsonPath("$.margenPorcentaje").value(20.00))
            .andExpect(jsonPath("$.esSimulacion").value(false))
            .andExpect(jsonPath("$.calculable").value(true))
            .andExpect(jsonPath("$.formulas.costoUnitario").value(
                "Costo unitario = costo total de la etapa ÷ kg de salida vendible = 1.600.000 ÷ 80 = 20.000 COP/kg"
            ))
            .andExpect(jsonPath("$.formulas.margen").value(
                "Margen = (precio − costo unitario) ÷ precio × 100 = (25.000 − 20.000) ÷ 25.000 × 100 = 20,00 %"
            ))
            .andExpect(jsonPath("$.supuestos[0]").value("Salida vendible = cantidad de salida registrada (80 kg)."));

        // Verificar simulación con ?precioVentaCop=40000 (margen 50,00 %, esSimulacion = true, sin persistir)
        mockMvc.perform(get("/api/transformaciones/" + transformacionId + "/balance")
                .param("precioVentaCop", "40000")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.esSimulacion").value(true))
            .andExpect(jsonPath("$.precioVentaCop").value(40000.00))
            .andExpect(jsonPath("$.margenPorcentaje").value(50.00));

        // El operador recibe 403 en /balance
        mockMvc.perform(get("/api/transformaciones/" + transformacionId + "/balance")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.codigo").value("ACCESO_DENEGADO"));
    }

    @Test
    @DisplayName("Reenviar el mismo operacionUuid devuelve 409 OPERACION_DUPLICADA con transformacionId y no consume inventario dos veces")
    void reenvioMismoOperacionUuidDevuelve409YNoDescuentaDoble() throws Exception {
        String uuid = UUID.randomUUID().toString();
        String cuerpo = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC002",
              "etapa": "LIMPIEZA_CLASIFICACION",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-15",
              "cantidadEntrada": 50,
              "cantidadSalida": 45,
              "productoSalida": "Grano clasificado"
            }
            """, uuid);

        MvcResult primera = mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.inventarioOrigen.cantidadDisponible").value(100))
            .andReturn();

        long idCreado = objectMapper.readTree(primera.getResponse().getContentAsString())
            .get("transformacion")
            .get("id")
            .asLong();

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.codigo").value("OPERACION_DUPLICADA"))
            .andExpect(jsonPath("$.transformacionId").value(idCreado));

        Lote cac002 = loteRepository.findByCodigoLote("CAC002").orElseThrow();
        assertEquals(0, new BigDecimal("50").compareTo(cac002.getCantidadConsumida()));
        assertEquals(0, new BigDecimal("100").compareTo(cac002.getCantidadDisponible()));
    }

    @Test
    @DisplayName("Pedir 120 kg sobre CAC001 (100 kg disponibles) devuelve 422 INVENTARIO_INSUFICIENTE y no altera el lote")
    void pedirMasDeLoDisponibleDevuelve422InventarioInsuficiente() throws Exception {
        String cuerpo = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC001",
              "etapa": "LIMPIEZA_CLASIFICACION",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-15",
              "cantidadEntrada": 120,
              "cantidadSalida": 100,
              "productoSalida": "Grano seco seleccionado"
            }
            """, UUID.randomUUID());

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.status").value(422))
            .andExpect(jsonPath("$.codigo").value("INVENTARIO_INSUFICIENTE"))
            .andExpect(jsonPath("$.mensaje").value(
                "El lote CAC001 tiene 100 kg disponibles y la operación pide 120 kg. No se registró ningún cambio."
            ));

        Lote cac001 = loteRepository.findByCodigoLote("CAC001").orElseThrow();
        assertEquals(0, new BigDecimal("100").compareTo(cac001.getCantidadDisponible()));
        assertTrue(loteRepository.findByCodigoLote("CAC001-T1").isEmpty());
    }

    @Test
    @DisplayName("Transformación con salida 0 kg no crea lote derivado y el balance responde calculable=false con motivo de división entre cero")
    void transformacionConSalidaCeroRespondeCalculableFalse() throws Exception {
        String cuerpo = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC003",
              "etapa": "TOSTADO_ROASTING",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-15",
              "cantidadEntrada": 80,
              "cantidadSalida": 0,
              "productoSalida": null,
              "justificacionIncidencia": "Pérdida total por falla térmica en tostador",
              "costoEtapaCop": 900000,
              "precioVentaEstimadoCop": 25000
            }
            """, UUID.randomUUID());

        MvcResult res = mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.transformacion.loteSalidaCodigo").isEmpty())
            .andExpect(jsonPath("$.transformacion.porcentajeMerma").value(100.00))
            .andExpect(jsonPath("$.transformacion.porcentajeRendimiento").value(0.00))
            .andExpect(jsonPath("$.inventarioOrigen.cantidadDisponible").value(0))
            .andReturn();

        long id = objectMapper.readTree(res.getResponse().getContentAsString())
            .get("transformacion")
            .get("id")
            .asLong();

        assertTrue(loteRepository.findByCodigoLote("CAC003-T1").isEmpty());

        mockMvc.perform(get("/api/transformaciones/" + id + "/balance")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.calculable").value(false))
            .andExpect(jsonPath("$.costoUnitarioCop").isEmpty())
            .andExpect(jsonPath("$.margenPorcentaje").isEmpty())
            .andExpect(jsonPath("$.motivoNoCalculable").value(
                "No se puede calcular: la salida vendible es 0 kg (división entre cero)."
            ));
    }

    @Test
    @DisplayName("Salida mayor a entrada sin insumos devuelve 422 SALIDA_SIN_JUSTIFICACION, y lote BLOQUEADO devuelve 409 LOTE_BLOQUEADO")
    void validarSalidaMayorSinInsumosYLoteBloqueado() throws Exception {
        String cuerpoSinInsumos = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC001",
              "etapa": "MOLIENDA_LICOR_CACAO",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-15",
              "cantidadEntrada": 50,
              "cantidadSalida": 55,
              "productoSalida": "Licor con aditivos",
              "insumosAgregados": null
            }
            """, UUID.randomUUID());

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoSinInsumos))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.status").value(422))
            .andExpect(jsonPath("$.codigo").value("SALIDA_SIN_JUSTIFICACION"));

        // Marcar CAC003 como BLOQUEADO y verificar rechazo 409 LOTE_BLOQUEADO
        Lote cac003 = loteRepository.findByCodigoLote("CAC003").orElseThrow();
        cac003.setEstado(EstadoLote.BLOQUEADO);
        cac003.setMotivoEstado("Bloqueo preventivo de prueba");
        loteRepository.saveAndFlush(cac003);

        String cuerpoSobreBloqueado = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC003",
              "etapa": "LIMPIEZA_CLASIFICACION",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-15",
              "cantidadEntrada": 20,
              "cantidadSalida": 18,
              "productoSalida": "Grano limpio"
            }
            """, UUID.randomUUID());

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoSobreBloqueado))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.codigo").value("LOTE_BLOQUEADO"));
    }

    @Test
    @DisplayName("Merma alta sin justificación y margen negativo generan alertas MERMA_ALTA, REGISTRO_INCOMPLETO y SOBRECOSTO")
    void generarAlertasRegistroIncompletoYSobrecosto() throws Exception {
        String cuerpo = String.format("""
            {
              "operacionUuid": "%s",
              "loteOrigenCodigo": "CAC002",
              "etapa": "TOSTADO_ROASTING",
              "responsable": "Operario de planta 1",
              "fechaTransformacion": "2026-10-15",
              "cantidadEntrada": 100,
              "cantidadSalida": 80,
              "productoSalida": "Cacao tostado",
              "justificacionIncidencia": null,
              "costoEtapaCop": 2400000,
              "precioVentaEstimadoCop": 25000
            }
            """, UUID.randomUUID());

        mockMvc.perform(post("/api/transformaciones")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.alertasGeneradas.length()").value(3))
            .andExpect(jsonPath("$.alertasGeneradas[0].tipoAlerta").value("MERMA_ALTA"))
            .andExpect(jsonPath("$.alertasGeneradas[1].tipoAlerta").value("REGISTRO_INCOMPLETO"))
            .andExpect(jsonPath("$.alertasGeneradas[2].tipoAlerta").value("SOBRECOSTO"))
            .andExpect(jsonPath("$.alertasGeneradas[2].valorMedido").value(-20.00));
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
