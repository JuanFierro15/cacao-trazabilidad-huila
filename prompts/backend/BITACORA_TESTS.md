# Bitácora de Pruebas por Bloque — Backend (`feat/backend-api`)

Registro real de compilación, verificación contra PostgreSQL local (MODO LOCAL, PostgreSQL 17.4 en `localhost:5432`) y pruebas automatizadas ejecutadas por bloque en la rama `feat/backend-api`.

## Resumen Acumulado por Bloque

| Bloque | Fecha y hora | Comando ejecutado | Verificación / Suite de prueba | Tests / Migraciones | Exitosos | Fallos | Errores | Tiempo | Estado |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| B1 — Dominio y persistencia (Unitaria) | 2026-10-15 19:23 | `.\mvnw.cmd test -Dtest=DominioEsquemaContratoTest` | `co.edu.usco.cacao.dominio.DominioEsquemaContratoTest` | 6 tests | 6 | 0 | 0 | 0.282 s | `BUILD SUCCESS` |
| B1 — Dominio y persistencia (PostgreSQL Local) | 2026-10-15 20:28 | `.\mvnw.cmd -DskipTests spring-boot:run` | Flyway (`V1` + `V2`) + Hibernate `ddl-auto=validate` sobre PostgreSQL 17.4 | 2 migraciones + 7 entidades JPA | 2 / 7 | 0 | 0 | 8.27 s | `Started CacaoTrazabilidadApplication` |

---

## Detalle del Bloque B1 — Dominio y persistencia

### 1. Verificación contra PostgreSQL 17.4 Local (`ddl-auto=validate` + Flyway)

- **Fecha y hora:** `2026-10-15T20:28:39-05:00`
- **Comando:** `.\mvnw.cmd -DskipTests spring-boot:run`
- **Salida real:**

```text
2026-10-15T20:28:34.402-05:00  INFO 28600 --- [cacao-trazabilidad] [           main] org.flywaydb.core.FlywayExecutor         : Database: jdbc:postgresql://localhost:5432/cacao (PostgreSQL 17.4)
2026-10-15T20:28:34.551-05:00  INFO 28600 --- [cacao-trazabilidad] [           main] o.f.c.i.s.JdbcTableSchemaHistory         : Creating Schema History table "public"."flyway_schema_history" ...
2026-10-15T20:28:34.741-05:00  INFO 28600 --- [cacao-trazabilidad] [           main] o.f.core.internal.command.DbMigrate      : Migrating schema "public" to version "1 - esquema inicial"
2026-10-15T20:28:35.001-05:00  INFO 28600 --- [cacao-trazabilidad] [           main] o.f.core.internal.command.DbMigrate      : Migrating schema "public" to version "2 - datos semilla"
2026-10-15T20:28:35.034-05:00  INFO 28600 --- [cacao-trazabilidad] [           main] o.f.core.internal.command.DbMigrate      : Successfully applied 2 migrations to schema "public", now at version v2 (execution time 00:00.257s)
2026-10-15T20:28:35.264-05:00  INFO 28600 --- [cacao-trazabilidad] [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.6.53.Final
2026-10-15T20:28:39.529-05:00  INFO 28600 --- [cacao-trazabilidad] [           main] c.e.u.c.CacaoTrazabilidadApplication     : Started CacaoTrazabilidadApplication in 8.27 seconds (process running for 8.707)
```

- **Integridad de configuración y migraciones:** `git diff origin/main -- backend/pom.xml backend/src/main/resources/` → vacío (sin modificaciones).

### 2. Pruebas Unitarias de Mapeo (`DominioEsquemaContratoTest`)

- **Fecha y hora:** `2026-10-15T19:23:57-05:00`
- **Comando:** `.\mvnw.cmd test -Dtest=DominioEsquemaContratoTest`
- **Salida real de Surefire:**

```text
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.282 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```
