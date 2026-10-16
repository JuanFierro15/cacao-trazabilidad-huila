package co.edu.usco.cacao;

import java.sql.SQLException;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("test")
class FlywayPruebasConfig {

    @Bean
    FlywayMigrationStrategy limpiarYMigrar() {
        return flyway -> {
            try (var conexion = flyway.getConfiguration().getDataSource().getConnection()) {
                String base = conexion.getCatalog();
                if (!"cacao_test".equals(base)) {
                    throw new IllegalStateException("Las pruebas solo pueden limpiar cacao_test, no " + base);
                }
            } catch (SQLException e) {
                throw new IllegalStateException("No se pudo verificar la base de pruebas", e);
            }
            flyway.clean();
            flyway.migrate();
        };
    }
}
