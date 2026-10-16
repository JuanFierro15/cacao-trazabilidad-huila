# Bitácora de Pruebas por Bloque — Backend (`feat/backend-api`)

Registro real de compilación, verificación contra PostgreSQL local (MODO LOCAL, PostgreSQL 17.4 en `localhost:5432`) y pruebas automatizadas ejecutadas por bloque en la rama `feat/backend-api`.

## Resumen Acumulado por Bloque

| Bloque | Fecha y hora | Comando ejecutado | Verificación / Suite de prueba | Tests / Migraciones | Exitosos | Fallos | Errores | Tiempo | Estado |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| B1 — Dominio y persistencia (Unitaria) | 2026-10-15 19:23 | `.\mvnw.cmd test -Dtest=DominioEsquemaContratoTest` | `co.edu.usco.cacao.dominio.DominioEsquemaContratoTest` | 6 tests | 6 | 0 | 0 | 0.282 s | `BUILD SUCCESS` |
| B1 — Dominio y persistencia (PostgreSQL Local) | 2026-10-15 20:28 | `.\mvnw.cmd -DskipTests spring-boot:run` | Flyway (`V1` + `V2`) + Hibernate `ddl-auto=validate` sobre PostgreSQL 17.4 | 2 migraciones + 7 entidades JPA | 2 / 7 | 0 | 0 | 8.27 s | `Started CacaoTrazabilidadApplication` |
| B2 — Seguridad JWT y errores | 2026-10-15 20:46 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) sobre PostgreSQL 17.4 | 12 tests | 12 | 0 | 0 | 18.280 s | `BUILD SUCCESS` |

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

---

## Detalle del Bloque B2 — Seguridad JWT y errores

- **Fecha y hora:** `2026-10-15T20:46:45-05:00`
- **Comando:** `.\mvnw.cmd test`
- **Salida real de Surefire:**

```text
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.192 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Running co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 11.78 s -- in co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  18.280 s
[INFO] Finished at: 2026-10-15T20:46:45-05:00
[INFO] ------------------------------------------------------------------------
```

- **Casos verificados en `SeguridadJwtErroresTest` (contra PostgreSQL 17.4 local):**
  1. `dataInitializerNoDuplicaUsuariosAlReiniciar`: Verifica que `usuarioRepository.count()` es `2` (`operador1` y `admin1`) y sigue siendo `2` tras múltiples ejecuciones de `DataInitializer`.
  2. `loginAdminExitoso`: `POST /api/auth/login` con `admin1` / `admin123` devuelve `200 OK`, token JWT HS256, `nombreCompleto = "Administrador Demo"`, `rol = "ADMINISTRADOR"` y `expiraEn` con desfase `-05:00`.
  3. `loginCredencialesInvalidasDevuelve401Json`: `POST /api/auth/login` con contraseña errónea devuelve `401` con `codigo = "CREDENCIALES_INVALIDAS"`.
  4. `loginCamposVaciosDevuelve400Validacion`: `POST /api/auth/login` con campos vacíos devuelve `400` con `codigo = "VALIDACION"` y arreglo `errores` por campo.
  5. `getLotesSinTokenDevuelve401Json`: `GET /api/lotes` sin encabezado `Authorization` devuelve `401` con `codigo = "NO_AUTENTICADO"` en formato único JSON.
  6. `patchEstadoComoOperadorDevuelve403Json`: `PATCH /api/lotes/CAC001/estado` con token de `operador1` devuelve `403` con `codigo = "ACCESO_DENEGADO"` y mensaje `"Solo el Administrador puede liberar o bloquear lotes."`.
