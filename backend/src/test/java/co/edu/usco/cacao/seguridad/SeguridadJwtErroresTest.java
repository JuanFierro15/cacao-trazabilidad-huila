package co.edu.usco.cacao.seguridad;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.usco.cacao.config.DataInitializer;
import co.edu.usco.cacao.repositorio.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class SeguridadJwtErroresTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private DataInitializer dataInitializer;

    @Test
    @DisplayName("DataInitializer es idempotente: ejecutarlo varias veces mantiene exactamente 2 usuarios demo")
    void dataInitializerNoDuplicaUsuariosAlReiniciar() {
        assertEquals(2L, usuarioRepository.count());
        dataInitializer.run();
        dataInitializer.run();
        assertEquals(2L, usuarioRepository.count());
    }

    @Test
    @DisplayName("POST /api/auth/login con admin1 devuelve 200 y token JWT con rol ADMINISTRADOR")
    void loginAdminExitoso() throws Exception {
        String cuerpo = """
            { "username": "admin1", "password": "admin123" }
            """;

        MvcResult resultado = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.username").value("admin1"))
            .andExpect(jsonPath("$.nombreCompleto").value("Administrador Demo"))
            .andExpect(jsonPath("$.rol").value("ADMINISTRADOR"))
            .andExpect(jsonPath("$.expiraEn").isNotEmpty())
            .andReturn();

        JsonNode json = objectMapper.readTree(resultado.getResponse().getContentAsString());
        assertTrue(json.get("expiraEn").asText().endsWith("-05:00"));
    }

    @Test
    @DisplayName("POST /api/auth/login con contraseña incorrecta devuelve 401 CREDENCIALES_INVALIDAS en formato único JSON")
    void loginCredencialesInvalidasDevuelve401Json() throws Exception {
        String cuerpo = """
            { "username": "admin1", "password": "clave_incorrecta" }
            """;

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.codigo").value("CREDENCIALES_INVALIDAS"))
            .andExpect(jsonPath("$.mensaje").isNotEmpty())
            .andExpect(jsonPath("$.timestamp").isNotEmpty())
            .andExpect(jsonPath("$.errores").isArray());
    }

    @Test
    @DisplayName("POST /api/auth/login con campos vacíos devuelve 400 VALIDACION con errores por campo")
    void loginCamposVaciosDevuelve400Validacion() throws Exception {
        String cuerpo = """
            { "username": "", "password": "" }
            """;

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.codigo").value("VALIDACION"))
            .andExpect(jsonPath("$.errores.length()").value(2));
    }

    @Test
    @DisplayName("GET /api/lotes sin token devuelve 401 NO_AUTENTICADO en formato único JSON")
    void getLotesSinTokenDevuelve401Json() throws Exception {
        mockMvc.perform(get("/api/lotes"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"))
            .andExpect(jsonPath("$.mensaje").isNotEmpty())
            .andExpect(jsonPath("$.timestamp").isNotEmpty())
            .andExpect(jsonPath("$.errores").isArray());
    }

    @Test
    @DisplayName("PATCH /api/lotes/CAC001/estado con token de operador1 devuelve 403 ACCESO_DENEGADO en formato único JSON")
    void patchEstadoComoOperadorDevuelve403Json() throws Exception {
        String loginOperador = """
            { "username": "operador1", "password": "cacao123" }
            """;

        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginOperador))
            .andExpect(status().isOk())
            .andReturn();

        String tokenOperador = objectMapper.readTree(loginRes.getResponse().getContentAsString())
            .get("token")
            .asText();
        assertNotNull(tokenOperador);

        String cuerpoEstado = """
            { "estado": "LIBERADO", "motivo": "Intento de liberación por operador" }
            """;

        mockMvc.perform(patch("/api/lotes/CAC001/estado")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOperador)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoEstado))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.status").value(403))
            .andExpect(jsonPath("$.codigo").value("ACCESO_DENEGADO"))
            .andExpect(jsonPath("$.mensaje").value("Solo el Administrador puede liberar o bloquear lotes."))
            .andExpect(jsonPath("$.timestamp").isNotEmpty())
            .andExpect(jsonPath("$.errores").isArray());
    }
}
