package co.edu.usco.cacao.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.usco.cacao.dominio.AuditoriaCambio;
import co.edu.usco.cacao.dominio.FincaProductor;
import co.edu.usco.cacao.repositorio.AuditoriaCambioRepository;
import co.edu.usco.cacao.repositorio.FincaProductorRepository;
import co.edu.usco.cacao.repositorio.LoteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RecepcionCatalogosFiltrosTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private FincaProductorRepository fincaProductorRepository;

    @Autowired
    private AuditoriaCambioRepository auditoriaCambioRepository;

    private String tokenOperador;

    @BeforeEach
    void autenticarOperador() throws Exception {
        String loginCuerpo = """
            { "username": "operador1", "password": "cacao123" }
            """;
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginCuerpo))
            .andExpect(status().isOk())
            .andReturn();

        tokenOperador = objectMapper.readTree(res.getResponse().getContentAsString())
            .get("token")
            .asText();
    }

    @Test
    @DisplayName("GET /api/config/reglas devuelve umbral de merma 15.0, rendimiento 600 y las 6 etapas del contrato")
    void obtenerReglasConfiguracion() throws Exception {
        mockMvc.perform(get("/api/config/reglas")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.umbralMermaPorcentaje").value(15.0))
            .andExpect(jsonPath("$.rendimientoPlausibleKgHaAnio").value(600))
            .andExpect(jsonPath("$.etapas.length()").value(6))
            .andExpect(jsonPath("$.etapas[0].codigo").value("BENEFICIO_FERMENTACION_SECADO"))
            .andExpect(jsonPath("$.etapas[1].codigo").value("LIMPIEZA_CLASIFICACION"))
            .andExpect(jsonPath("$.etapas[5].codigo").value("CONTROL_CALIDAD_EMPAQUE"));
    }

    @Test
    @DisplayName("GET /api/productores devuelve los 3 productores semilla con entregadoAnioKg calculado desde la BD")
    void listarProductoresConEntregadoAnio() throws Exception {
        mockMvc.perform(get("/api/productores")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0].codigoProductor").value("PRD-A"))
            .andExpect(jsonPath("$[0].municipio").value("Rivera"))
            .andExpect(jsonPath("$[0].cuotaMaximaKg").value(1200.0))
            .andExpect(jsonPath("$[0].entregadoAnioKg").value(100.0))
            .andExpect(jsonPath("$[2].codigoProductor").value("PRD-C"))
            .andExpect(jsonPath("$[2].cuotaMaximaKg").value(300.0))
            .andExpect(jsonPath("$[2].entregadoAnioKg").value(80.0));
    }

    @Test
    @DisplayName("POST /api/lotes válido asigna código automático CAC004, devuelve 201, persiste y registra auditoría CREAR")
    void crearLoteValidoAsignaCodigoYRegistraAuditoria() throws Exception {
        FincaProductor prdA = fincaProductorRepository.findByCodigoProductor("PRD-A").orElseThrow();

        String cuerpo = String.format("""
            {
              "codigoLote": null,
              "productorId": %d,
              "fechaRecepcion": "2026-10-15",
              "tipoGrano": "SECO",
              "porcentajeHumedad": 7.5,
              "cantidadRecibida": 120.5
            }
            """, prdA.getId());

        mockMvc.perform(post("/api/lotes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.lote.codigoLote").value("CAC004"))
            .andExpect(jsonPath("$.lote.tipoLote").value("RECEPCION"))
            .andExpect(jsonPath("$.lote.producto").value("Cacao seco"))
            .andExpect(jsonPath("$.lote.origenMunicipio").value("Rivera"))
            .andExpect(jsonPath("$.lote.cantidadRecibida").value(120.5))
            .andExpect(jsonPath("$.lote.cantidadConsumida").value(0))
            .andExpect(jsonPath("$.lote.cantidadDisponible").value(120.5))
            .andExpect(jsonPath("$.lote.estado").value("PENDIENTE"))
            .andExpect(jsonPath("$.lote.alertasActivas").value(0))
            .andExpect(jsonPath("$.alertasGeneradas.length()").value(0));

        mockMvc.perform(get("/api/lotes/CAC004")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigoLote").value("CAC004"))
            .andExpect(jsonPath("$.cantidadDisponible").value(120.5));

        List<AuditoriaCambio> auditorias = auditoriaCambioRepository.filtrarAuditoria("CAC004", "LOTE");
        assertEquals(1, auditorias.size());
        assertEquals("CREAR", auditorias.getFirst().getAccion());
        assertEquals("operador1", auditorias.getFirst().getUsuarioUsername());
        assertEquals("OPERADOR", auditorias.getFirst().getUsuarioRol());
        assertEquals("cantidad_recibida", auditorias.getFirst().getCampoModificado());
        assertEquals("120.5", auditorias.getFirst().getValorNuevo());
    }

    @Test
    @DisplayName("POST /api/lotes con cantidad -5 o campo vacío devuelve 400 VALIDACION por campo y no guarda nada")
    void crearLoteCantidadNegativaOCampoVacioDevuelve400() throws Exception {
        long conteoInicial = loteRepository.count();

        String cuerpoInvalido = """
            {
              "codigoLote": null,
              "productorId": null,
              "fechaRecepcion": "2026-10-15",
              "tipoGrano": "SECO",
              "porcentajeHumedad": 7.5,
              "cantidadRecibida": -5
            }
            """;

        mockMvc.perform(post("/api/lotes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoInvalido))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.codigo").value("VALIDACION"))
            .andExpect(jsonPath("$.errores[?(@.campo == 'cantidadRecibida')].mensaje").value("Debe ser mayor que 0"))
            .andExpect(jsonPath("$.errores[?(@.campo == 'productorId')]").exists());

        assertEquals(conteoInicial, loteRepository.count());
    }

    @Test
    @DisplayName("POST /api/lotes con código repetido CAC001 devuelve 409 LOTE_DUPLICADO")
    void crearLoteCodigoRepetidoDevuelve409() throws Exception {
        FincaProductor prdA = fincaProductorRepository.findByCodigoProductor("PRD-A").orElseThrow();
        long conteoInicial = loteRepository.count();

        String cuerpoRepetido = String.format("""
            {
              "codigoLote": "CAC001",
              "productorId": %d,
              "fechaRecepcion": "2026-10-15",
              "tipoGrano": "SECO",
              "porcentajeHumedad": 7.5,
              "cantidadRecibida": 50
            }
            """, prdA.getId());

        mockMvc.perform(post("/api/lotes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoRepetido))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.codigo").value("LOTE_DUPLICADO"));

        assertEquals(conteoInicial, loteRepository.count());
    }

    @Test
    @DisplayName("POST /api/lotes que supera la cuota anual del Productor C genera alerta CUOTA_EXCEDIDA sin bloquear la recepción")
    void crearLoteSuperandoCuotaGeneraAlertaCuotaExcedida() throws Exception {
        FincaProductor prdC = fincaProductorRepository.findByCodigoProductor("PRD-C").orElseThrow();

        String cuerpoExcesoCuota = String.format("""
            {
              "codigoLote": null,
              "productorId": %d,
              "fechaRecepcion": "2026-10-15",
              "tipoGrano": "SECO",
              "porcentajeHumedad": 7.6,
              "cantidadRecibida": 250
            }
            """, prdC.getId());

        mockMvc.perform(post("/api/lotes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoExcesoCuota))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.lote.codigoLote").value("CAC004"))
            .andExpect(jsonPath("$.lote.alertasActivas").value(1))
            .andExpect(jsonPath("$.alertasGeneradas.length()").value(1))
            .andExpect(jsonPath("$.alertasGeneradas[0].tipoAlerta").value("CUOTA_EXCEDIDA"))
            .andExpect(jsonPath("$.alertasGeneradas[0].valorMedido").value(330.0))
            .andExpect(jsonPath("$.alertasGeneradas[0].umbral").value(300.0))
            .andExpect(jsonPath("$.alertasGeneradas[0].activa").value(true));
    }

    @Test
    @DisplayName("GET /api/lotes sin parámetros devuelve 200 y los 3 lotes semilla")
    void listarLotesSinParametrosDevuelveLosTresLotesSemilla() throws Exception {
        mockMvc.perform(get("/api/lotes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0].codigoLote").value("CAC001"))
            .andExpect(jsonPath("$[1].codigoLote").value("CAC002"))
            .andExpect(jsonPath("$[2].codigoLote").value("CAC003"));
    }

    @Test
    @DisplayName("GET /api/lotes permite filtrar por origen, estado y tipo, y GET /api/lotes/{codigo} devuelve 404 si no existe")
    void filtrarLotesYConsultarPorCodigo() throws Exception {
        mockMvc.perform(get("/api/lotes")
                .param("origen", "Rivera")
                .param("estado", "PENDIENTE")
                .param("tipo", "RECEPCION")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].codigoLote").value("CAC001"))
            .andExpect(jsonPath("$[0].origenMunicipio").value("Rivera"));

        mockMvc.perform(get("/api/lotes/CAC999")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.codigo").value("NO_ENCONTRADO"));
    }
}
