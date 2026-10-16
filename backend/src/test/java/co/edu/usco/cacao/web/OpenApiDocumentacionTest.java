package co.edu.usco.cacao.web;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.usco.cacao.PruebaIntegracion;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

@PruebaIntegracion
class OpenApiDocumentacionTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /v3/api-docs es público, devuelve 200 y expone la especificación OpenAPI 3 con esquema JWT y rutas del contrato")
    void apiDocsExponeEspecificacionOpenApi3ConSeguridadJwtYRutasContrato() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.openapi").isNotEmpty())
            .andExpect(jsonPath("$.info.title").value(
                "API de Trazabilidad, Inventario y Balance Económico de Cacao — Asoprocacao"
            ))
            .andExpect(jsonPath("$.info.version").value("1.0.0"))
            .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
            .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
            .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"))
            .andExpect(jsonPath("$.paths['/api/auth/login']").exists())
            .andExpect(jsonPath("$.paths['/api/public/ficha/{codigo}']").exists())
            .andExpect(jsonPath("$.paths['/api/config/reglas']").exists())
            .andExpect(jsonPath("$.paths['/api/productores']").exists())
            .andExpect(jsonPath("$.paths['/api/lotes']").exists())
            .andExpect(jsonPath("$.paths['/api/lotes/{codigo}']").exists())
            .andExpect(jsonPath("$.paths['/api/lotes/{codigo}/trazabilidad']").exists())
            .andExpect(jsonPath("$.paths['/api/lotes/{codigo}/recall']").exists())
            .andExpect(jsonPath("$.paths['/api/lotes/{codigo}/estado']").exists())
            .andExpect(jsonPath("$.paths['/api/transformaciones']").exists())
            .andExpect(jsonPath("$.paths['/api/transformaciones/{id}/balance']").exists())
            .andExpect(jsonPath("$.paths['/api/alertas']").exists())
            .andExpect(jsonPath("$.paths['/api/auditoria']").exists())
            .andExpect(jsonPath("$.paths['/api/reportes/exportar-csv']").exists());
    }

    @Test
    @DisplayName("GET /swagger-ui/index.html es público y carga la interfaz interactiva de Swagger UI (200 OK)")
    void swaggerUiIndexCargaSinAutenticacion() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("swagger-ui")));
    }
}
