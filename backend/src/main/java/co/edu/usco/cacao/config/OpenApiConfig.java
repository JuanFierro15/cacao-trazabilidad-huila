package co.edu.usco.cacao.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String ESQUEMA_SEGURIDAD_JWT = "bearerAuth";

    @Bean
    public OpenAPI cacaoOpenAPI() {
        String descripcion = """
            API RESTful para la gestión de recepción, transformación, inventario, trazabilidad recursiva, \
            alertas de control, balance económico, ficha pública (Pasaporte Digital) y auditoría inmutable \
            de lotes de cacao para la Asociación de Productores de Cacao (Asoprocacao — Campoalegre, Huila).

            ### Cómo probar los endpoints protegidos
            1. Ejecute `POST /api/auth/login` con alguna de las cuentas de demostración:
               - **Administrador (`ADMINISTRADOR`):** usuario `admin1`, contraseña `admin123`
               - **Operador (`OPERADOR`):** usuario `operador1`, contraseña `cacao123`
            2. Copie el valor del campo `token` de la respuesta.
            3. Haga clic en el botón **Authorize** (arriba a la derecha), pegue el token y confirme.
            """;

        return new OpenAPI()
            .info(new Info()
                .title("API de Trazabilidad, Inventario y Balance Económico de Cacao — Asoprocacao")
                .version("1.0.0")
                .description(descripcion)
                .contact(new Contact()
                    .name("Asoprocacao — Trazabilidad Huila")
                )
            )
            .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_SEGURIDAD_JWT))
            .components(new Components()
                .addSecuritySchemes(ESQUEMA_SEGURIDAD_JWT, new SecurityScheme()
                    .name(ESQUEMA_SEGURIDAD_JWT)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Token JWT obtenido en POST /api/auth/login")
                )
            );
    }
}
