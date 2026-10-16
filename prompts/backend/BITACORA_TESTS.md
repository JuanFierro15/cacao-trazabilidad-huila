# Bitácora de Pruebas por Bloque — Backend (`feat/backend-api`)

Registro real de compilación, verificación contra PostgreSQL local (MODO LOCAL, PostgreSQL 17.4 en `localhost:5432`) y pruebas automatizadas ejecutadas por bloque en la rama `feat/backend-api`.

## Resumen Acumulado por Bloque

| Bloque | Fecha y hora | Comando ejecutado | Verificación / Suite de prueba | Tests / Migraciones | Exitosos | Fallos | Errores | Tiempo | Estado |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| B1 — Dominio y persistencia (Unitaria) | 2026-10-15 19:23 | `.\mvnw.cmd test -Dtest=DominioEsquemaContratoTest` | `co.edu.usco.cacao.dominio.DominioEsquemaContratoTest` | 6 tests | 6 | 0 | 0 | 0.282 s | `BUILD SUCCESS` |
| B1 — Dominio y persistencia (PostgreSQL Local) | 2026-10-15 20:28 | `.\mvnw.cmd -DskipTests spring-boot:run` | Flyway (`V1` + `V2`) + Hibernate `ddl-auto=validate` sobre PostgreSQL 17.4 | 2 migraciones + 7 entidades JPA | 2 / 7 | 0 | 0 | 8.27 s | `Started CacaoTrazabilidadApplication` |
| B2 — Seguridad JWT y errores | 2026-10-15 20:46 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) sobre PostgreSQL 17.4 | 12 tests | 12 | 0 | 0 | 18.280 s | `BUILD SUCCESS` |
| B3 — Recepción, catálogos y filtros | 2026-10-15 21:07 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) + `RecepcionCatalogosFiltrosTest` (7) sobre PostgreSQL 17.4 | 19 tests | 19 | 0 | 0 | 25.523 s | `BUILD SUCCESS` |
| B3 (fix) — `GET /api/lotes` sin parámetros | 2026-10-15 21:39 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) + `RecepcionCatalogosFiltrosTest` (8) sobre PostgreSQL 17.4 | 20 tests | 20 | 0 | 0 | 24.473 s | `BUILD SUCCESS` |
| B3 (test) — `cacao_test` y `@PruebaIntegracion` (Corrida 1) | 2026-10-15 22:01 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) + `RecepcionCatalogosFiltrosTest` (8) sobre `cacao_test` | 20 tests | 20 | 0 | 0 | 20.057 s | `BUILD SUCCESS` |
| B3 (test) — `cacao_test` y `@PruebaIntegracion` (Corrida 2) | 2026-10-15 22:01 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) + `RecepcionCatalogosFiltrosTest` (8) sobre `cacao_test` | 20 tests | 20 | 0 | 0 | 19.637 s | `BUILD SUCCESS` |
| B4 — Transformaciones (Unitaria + Integración) | 2026-10-15 23:14 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) + `CalculadoraTransformacionTest` (7) + `RecepcionCatalogosFiltrosTest` (8) + `TransformacionIntegracionTest` (6) sobre `cacao_test` | 33 tests | 33 | 0 | 0 | 26.426 s | `BUILD SUCCESS` |

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

### 2. Pruebas Unitarias de Mapeo (`DominioEsquemaContratoTest`)

- **Fecha y hora:** `2026-10-15T19:23:57-05:00`
- **Comando:** `.\mvnw.cmd test -Dtest=DominioEsquemaContratoTest`
- **Resultado:** `Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.282 s — BUILD SUCCESS`

---

## Detalle del Bloque B2 — Seguridad JWT y errores

- **Fecha y hora:** `2026-10-15T20:46:45-05:00`
- **Comando:** `.\mvnw.cmd test`
- **Resultado:** `Tests run: 12, Failures: 0, Errors: 0, Skipped: 0, Total time: 18.280 s — BUILD SUCCESS`

---

## Detalle del Bloque B3 — Recepción, catálogos y filtros (incluye corrección `GET /api/lotes`)

- **Fecha y hora:** `2026-10-15T21:39:33-05:00`
- **Comando:** `.\mvnw.cmd test`
- **Salida real de Surefire:**

```text
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.172 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Running co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 11.79 s -- in co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Running co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.077 s -- in co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 20, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  24.473 s
[INFO] Finished at: 2026-10-15T21:39:33-05:00
[INFO] ------------------------------------------------------------------------
```

- **Casos verificados en `RecepcionCatalogosFiltrosTest` (contra PostgreSQL 17.4 local):**
  1. `obtenerReglasConfiguracion`: `GET /api/config/reglas` devuelve `umbralMermaPorcentaje = 15.0`, `rendimientoPlausibleKgHaAnio = 600` y las 6 etapas.
  2. `listarProductoresConEntregadoAnio`: `GET /api/productores` devuelve `PRD-A`, `PRD-B` y `PRD-C` con `entregadoAnioKg` calculado desde la BD (`100.0`, `150.0`, `80.0`).
  3. `crearLoteValidoAsignaCodigoYRegistraAuditoria`: `POST /api/lotes` válido asigna código `CAC004`, devuelve `201`, persiste (`GET /api/lotes/CAC004`) y registra fila `CREAR` en `auditoria_cambios`.
  4. `crearLoteCantidadNegativaOCampoVacioDevuelve400`: `POST /api/lotes` con `cantidadRecibida = -5` y `productorId = null` devuelve `400 VALIDACION` con `errores` por campo y no guarda nada.
  5. `crearLoteCodigoRepetidoDevuelve409`: `POST /api/lotes` con `codigoLote = "CAC001"` devuelve `409 LOTE_DUPLICADO`.
  6. `crearLoteSuperandoCuotaGeneraAlertaCuotaExcedida`: `POST /api/lotes` que supera la cuota anual de `PRD-C` (`330 kg > 300 kg`) devuelve `201` con alerta `CUOTA_EXCEDIDA` activa sin bloquear la recepción.
  7. `filtrarLotesYConsultarPorCodigo`: `GET /api/lotes?origen=Rivera&estado=PENDIENTE&tipo=RECEPCION` devuelve `CAC001`, y `GET /api/lotes/CAC999` devuelve `404 NO_ENCONTRADO`.
  8. `listarLotesSinParametrosDevuelveLosTresLotesSemilla`: `GET /api/lotes` sin parámetros devuelve `200 OK` y los 3 lotes semilla (`CAC001`, `CAC002`, `CAC003`), validando que `:origen = null` en PostgreSQL no dispare `ERROR: function lower(bytea) does not exist`.

---

## Detalle del Bloque B4 — Transformaciones

- **Fecha y hora:** `2026-10-15T23:14:22-05:00`
- **Comando:** `.\mvnw.cmd test`
- **Salida real de Surefire:**

```text
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.168 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Running co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 13.22 s -- in co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Running co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.037 s -- in co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Running co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.078 s -- in co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Running co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.260 s -- in co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 33, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  26.426 s
[INFO] Finished at: 2026-10-15T23:14:22-05:00
[INFO] ------------------------------------------------------------------------
```

- **Casos verificados en `CalculadoraTransformacionTest` (7 pruebas unitarias puras sin Spring):**
  1. `calcularMermaYRendimientoCasoJurado`: `100 kg → 80 kg` calcula merma `20.00` y rendimiento `80.00`.
  2. `calcularMermaNegativaConInsumos`: `100 kg → 105.5 kg` calcula merma `-5.50` y rendimiento `105.50`.
  3. `calcularCostoUnitarioYMargenCasoJurado`: `1.600.000 ÷ 80 = 20000.00` y margen sobre `25.000 = 20.00`.
  4. `divisionEntreCeroDevuelveNull`: salida `0` o precio `0` devuelven `null`.
  5. `evaluarCondicionesDeAlerta`: verifica umbrales de `MERMA_ALTA`, `REGISTRO_INCOMPLETO` y `SOBRECOSTO`.
  6. `construirBalanceConFormulasYConSalidaCero`: verifica fórmulas exactas y `calculable = false` cuando `salida = 0`.
  7. `validarArgumentosInvalidos`: verifica `IllegalArgumentException` ante entradas inválidas.
- **Casos verificados en `TransformacionIntegracionTest` (6 pruebas de integración sobre `cacao_test`):**
  1. `transformarCac001GeneraDerivadoAlertaAuditoriasYBalance`: `CAC001` `100 → 80` devuelve `201 Created`, merma `20.00 %`, alerta `MERMA_ALTA`, lote derivado `CAC001-T1` (`80 kg`), auditoría `CONSUMO` y `CREAR`, balance `20.000 COP/kg` y `20,00 %`, simulación `?precioVentaCop=40000` (`esSimulacion = true`) y `403` para operador en `/balance`.
  2. `reenvioMismoOperacionUuidDevuelve409YNoDescuentaDoble`: reenvío con el mismo `operacionUuid` devuelve `409 OPERACION_DUPLICADA` con `transformacionId` y el inventario no cambia.
  3. `pedirMasDeLoDisponibleDevuelve422InventarioInsuficiente`: pedir `120 kg` sobre `CAC001` (`100 kg`) devuelve `422 INVENTARIO_INSUFICIENTE` sin cambios.
  4. `transformacionConSalidaCeroRespondeCalculableFalse`: salida `0 kg` no crea lote derivado y el balance responde `calculable = false`.
  5. `validarSalidaMayorSinInsumosYLoteBloqueado`: salida > entrada sin insumos devuelve `422 SALIDA_SIN_JUSTIFICACION`, y lote `BLOQUEADO` devuelve `409 LOTE_BLOQUEADO`.
  6. `generarAlertasRegistroIncompletoYSobrecosto`: merma alta sin justificación y margen negativo generan `MERMA_ALTA`, `REGISTRO_INCOMPLETO` y `SOBRECOSTO`.

