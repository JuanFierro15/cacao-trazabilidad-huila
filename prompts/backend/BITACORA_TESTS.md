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
| B5 — Trazabilidad, ficha pública, estado, alertas y auditoría | 2026-10-15 23:31 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) + `CalculadoraTransformacionTest` (7) + `RecepcionCatalogosFiltrosTest` (8) + `TransformacionIntegracionTest` (6) + `TrazabilidadFichaEstadoAuditoriaTest` (4) sobre `cacao_test` | 37 tests | 37 | 0 | 0 | 32.678 s | `BUILD SUCCESS` |
| B6 — Incidencia hora 12 y exportación | 2026-10-16 01:12 | `.\mvnw.cmd test` | `DominioEsquemaContratoTest` (6) + `SeguridadJwtErroresTest` (6) + `CalculadoraTransformacionTest` (7) + `IncidenciaRecallCsvTest` (5) + `RecepcionCatalogosFiltrosTest` (8) + `TransformacionIntegracionTest` (6) + `TrazabilidadFichaEstadoAuditoriaTest` (4) sobre `cacao_test` | 42 tests | 42 | 0 | 0 | 23.488 s | `BUILD SUCCESS` |
| B7 — Respaldo, restauración e integridad | 2026-10-16 01:28 | `.\mvnw.cmd test` | Suite de 42 pruebas + ciclo real `respaldar.ps1` / `restaurar.ps1` | 42 tests | 42 | 0 | 0 | 26.880 s | `BUILD SUCCESS` |
| B8 — Pruebas automatizadas (reglas, permisos y regresión hora 12) | 2026-10-16 01:41 | `.\mvnw.cmd test` | Suite previa (42) + `ReglasPermisosRegresionTest` (8) sobre `cacao_test` | 50 tests | 50 | 0 | 0 | 25.308 s | `BUILD SUCCESS` |
| B9 — Documentación interactiva de la API (Swagger UI / OpenAPI) | 2026-10-16 05:14 | `.\mvnw.cmd test` | Suite previa (50) + `OpenApiDocumentacionTest` (2) sobre `cacao_test` | 52 tests | 52 | 0 | 0 | 32.817 s | `BUILD SUCCESS` |

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

---

## Detalle del Bloque B5 — Trazabilidad, ficha pública, estado, alertas y auditoría

- **Fecha y hora:** `2026-10-15T23:31:36-05:00`
- **Comando:** `.\mvnw.cmd test`
- **Salida real de Surefire:**

```text
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.165 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Running co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 15.86 s -- in co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Running co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.051 s -- in co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Running co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.107 s -- in co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Running co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.558 s -- in co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Running co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.990 s -- in co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 37, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  32.678 s
[INFO] Finished at: 2026-10-15T23:31:36-05:00
[INFO] ------------------------------------------------------------------------
```

- **Casos verificados en `TrazabilidadFichaEstadoAuditoriaTest` (4 pruebas de integración sobre `cacao_test`):**
  1. `trazabilidadYFichaPublicaSinCamposProhibidos`: tras transformar `CAC001` (`100 → 80 kg`, `CAC001-T1`) y `CAC001-T1` (`80 → 75 kg`, `CAC001-T1-T1`), verifica que `GET /api/lotes/CAC001/trazabilidad` y `GET /api/lotes/CAC001-T1/trazabilidad` devuelven la genealogía completa (`loteRaiz`, `origen`, `linea` con `RECEPCION` y `TRANSFORMACION`, `derivados`, `alertas`, `tiempoConsultaMs` y sin costos), y que `GET /api/public/ficha/CAC001` (sin JWT) responde `200 OK` sin contener ninguno de los campos prohibidos en el JSON crudo (`costo`, `precio`, `margen`, `cantidad`, `merma`, `responsable`, `productorNombre`, `hectareas`, `cuota`, `motivoEstado`, `alertas`, `"id":`, `transformacionId`, `operacionUuid`).
  2. `operadorRecibe403YAdminCambiaEstadoConAuditoria`: verifica que `operador1` recibe `403 ACCESO_DENEGADO` al invocar `PATCH /api/lotes/CAC001/estado`, que `admin1` recibe `400 VALIDACION` si el motivo tiene menos de 10 caracteres, `200 OK` al liberar `CAC001` con motivo válido (`totalAfectados = 1`), `409 ESTADO_SIN_CAMBIO` al repetir el mismo estado, y que `GET /api/auditoria?referencia=CAC001&entidad=LOTE` registra la acción `CAMBIO_ESTADO` con el motivo y el cambio `PENDIENTE -> LIBERADO`.
  3. `listarAlertasConFiltrosActivaYLoteCodigo`: verifica `GET /api/alertas` con filtros `activa=true` y `loteCodigo=CAC001` para `admin1`, y `403 ACCESO_DENEGADO` para `operador1`.
  4. `trazabilidadYFichaDeLoteInexistenteDevuelven404`: verifica que `GET /api/lotes/CAC999/trazabilidad`, `GET /api/public/ficha/CAC999` y `PATCH /api/lotes/CAC999/estado` devuelven `404 NO_ENCONTRADO`.

---

## Detalle del Bloque B6 — Incidencia hora 12 y exportación

- **Fecha y hora:** `2026-10-16T01:12:59-05:00`
- **Comando:** `.\mvnw.cmd test`
- **Salida real de Surefire:**

```text
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.172 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Running co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 12.47 s -- in co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Running co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.115 s -- in co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Running co.edu.usco.cacao.web.IncidenciaRecallCsvTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.637 s -- in co.edu.usco.cacao.web.IncidenciaRecallCsvTest
[INFO] Running co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.852 s -- in co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Running co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.069 s -- in co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Running co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.742 s -- in co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 42, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  23.488 s
[INFO] Finished at: 2026-10-16T01:12:59-05:00
[INFO] ------------------------------------------------------------------------
```

- **Casos verificados en `IncidenciaRecallCsvTest` (5 pruebas de integración sobre `cacao_test`):**
  1. `bloquearCac001PropagaADerivadosYConservaHistorial`: tras transformar `CAC001` (100 → 80 kg, derivado `CAC001-T1`), invocar `PATCH /api/lotes/CAC001/estado` con `BLOQUEADO` propaga por defecto a `CAC001-T1` (`lotesAfectados` con 2 elementos); la ficha pública de `CAC001-T1` queda en `BLOQUEADO` y `disponibleParaVenta = false` manteniendo origen visible; la trazabilidad y las transformaciones se conservan intactas; la auditoría registra un `CAMBIO_ESTADO` por cada lote (el del derivado indicando el origen de la propagación); y transformar un derivado bloqueado responde `409 LOTE_BLOQUEADO`.
  2. `bloquearSinPropagarSoloAfectaAlLotePedido`: con `propagarADerivados = false` solo `CAC001` pasa a `BLOQUEADO` y `CAC001-T1` permanece `PENDIENTE`.
  3. `liberarDerivadoConOrigenBloqueadoDevuelve409`: intentar liberar un derivado cuando su lote raíz está `BLOQUEADO` responde `409 ORIGEN_BLOQUEADO`; liberar la raíz no se propaga automáticamente a los hijos; y tras liberar la raíz, el derivado sí se puede liberar individualmente.
  4. `recallDeCac001TrasElBloqueo`: `GET /api/lotes/CAC001/recall` devuelve Productor A, Rivera, cantidades 100/100/0, derivado `CAC001-T1`, `kgAfectadosEnInventario = 80`, `historialConservado` con 1 transformación y 5 registros de auditoría; la consulta desde el derivado resuelve raíz y origen hacia atrás; `operador1` recibe `403 ACCESO_DENEGADO`; y un código inexistente devuelve `404 NO_ENCONTRADO`.
  5. `exportarCsvConFormatoParaExcel`: `GET /api/reportes/exportar-csv` (con o sin `Accept: application/json`) responde con `text/csv;charset=UTF-8`, `Content-Disposition: attachment; filename="lotes_YYYYMMDD_HHmm.csv"`, BOM UTF-8 (`EF BB BF`), separador `;`, 13 columnas del contrato, valores decimales con coma (`,`), costos calculados de la transformación productora (`1600000,00;20000,00;25000,00;20,00` en `CAC001-T1`), filtrado por municipio (`origen=rivera`) y estado, rechazo con `400 VALIDACION` para estados inválidos, y `403 ACCESO_DENEGADO` para operadores.


---

## Detalle del Bloque B7 — Respaldo, restauración e integridad

- **Fecha y hora:** `2026-10-16T01:28:29-05:00`
- **Comandos:**
  1. `powershell.exe -ExecutionPolicy Bypass -File .\datos\scripts\respaldar.ps1`
  2. Inserción de lote de prueba temporal `TEMP-TEST-001` (50 kg) en `cacao`
  3. `powershell.exe -ExecutionPolicy Bypass -File .\datos\scripts\restaurar.ps1`
  4. `.\mvnw.cmd test`
- **Salida real de Surefire (`mvnw.cmd test`):**

```text
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.168 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Running co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 13.38 s -- in co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Running co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.043 s -- in co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Running co.edu.usco.cacao.web.IncidenciaRecallCsvTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.684 s -- in co.edu.usco.cacao.web.IncidenciaRecallCsvTest
[INFO] Running co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.793 s -- in co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Running co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.011 s -- in co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Running co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.756 s -- in co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 42, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  26.880 s
[INFO] Finished at: 2026-10-16T01:28:29-05:00
[INFO] ------------------------------------------------------------------------
```

- **Verificaciones del ciclo de respaldo y restauración:**
  1. **Generación de respaldo (`respaldar.ps1`):** detección de modo local desde `.env`, extracción de binarios PostgreSQL nativos y ejecución de `pg_dump -Fc -f` sin redirección `>`, generando `datos/respaldos/respaldo_20261016_012538.dump` (33,416 bytes).
  2. **Verificación de integridad (`verificar_integridad.sql`):** valida 8 conteos de entidades principales, balance de masa global (`recibida = consumida + disponible`, discrepancia 0.000 kg), 0 filas en inconsistencias individuales, y lista ordenada de códigos (`CAC001`, `CAC002`, `CAC003`).
  3. **Simulación de alteración:** inserción del lote temporal `TEMP-TEST-001` (50 kg) en la base `cacao`.
  4. **Restauración completa (`restaurar.ps1`):**
     - Muestra el estado previo con 4 lotes (380.000 kg).
     - Ejecuta `DROP DATABASE IF EXISTS cacao WITH (FORCE); CREATE DATABASE cacao;`.
     - Aplica `pg_restore --no-owner`.
     - Muestra el estado posterior: exactamente 3 lotes originales (330.000 kg), 0 inconsistencias, y confirmación de que el lote temporal desapareció por completo.
  5. **Estabilidad del backend:** los 42 tests de integración siguen pasando en verde sobre `cacao_test`, y `DataInitializer` inicializa usuarios sin errores de duplicidad ni fallos de migración en Flyway.

---

## Detalle del Bloque B8 — Pruebas automatizadas (reglas, permisos y regresión hora 12)

- **Fecha y hora:** `2026-10-16T01:41:48-05:00`
- **Comando:** `.\mvnw.cmd test`
- **Salida real de Surefire:**

```text
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.170 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Running co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 13.28 s -- in co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Running co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.040 s -- in co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Running co.edu.usco.cacao.web.IncidenciaRecallCsvTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.628 s -- in co.edu.usco.cacao.web.IncidenciaRecallCsvTest
[INFO] Running co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.767 s -- in co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Running co.edu.usco.cacao.web.ReglasPermisosRegresionTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.397 s -- in co.edu.usco.cacao.web.ReglasPermisosRegresionTest
[INFO] Running co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.997 s -- in co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Running co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.713 s -- in co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 50, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  25.308 s
[INFO] Finished at: 2026-10-16T01:41:48-05:00
[INFO] ------------------------------------------------------------------------
```

- **Casos verificados en `ReglasPermisosRegresionTest` (8 pruebas de integración sobre `cacao_test`):**
  1. `caso1_inventarioInsuficienteResponde422`: entrada (120 kg) > disponible (100 kg en `CAC001`) responde `422 INVENTARIO_INSUFICIENTE` sin alterar el disponible de `CAC001` (100.000 kg intactos).
  2. `caso2_salidaMayorQueEntradaSinInsumosResponde422`: salida (95 kg) > entrada (80 kg) sin insumos responde `422 SALIDA_SIN_JUSTIFICACION`.
  3. `caso3_idempotenciaSinDobleConsumoResponde409`: reenvío con mismo `operacionUuid` responde `409 OPERACION_DUPLICADA` con `transformacionId` y mantiene el inventario en 100 kg (no 50 kg).
  4. `caso4_validacionCantidadNegativaOZeroResponde400`: `cantidadRecibida` <= 0 (`-10` y `0`) en `POST /api/lotes` devuelve `400 VALIDACION` con campo identificado.
  5. `caso5_operadorRecibe403AlCambiarEstado`: `operador1` recibe `403 ACCESO_DENEGADO` al intentar modificar estado en `PATCH /api/lotes/{codigo}/estado`.
  6. `caso6_fichaPublicaSinCamposProhibidos`: `GET /api/public/ficha/CAC001` sin JWT responde 200 OK y su JSON crudo no expone ninguno de los 14 campos internos prohibidos (`costo`, `precio`, `margen`, `cantidad`, `merma`, `responsable`, `productorNombre`, `hectareas`, `cuota`, `motivoEstado`, `alertas`, `"id":`, `transformacionId`, `operacionUuid`).
  7. `caso7_regresionHora12BloqueoCascadaYHistorialConservado`: el bloqueo de `CAC001` propaga en cascada a `CAC001-T1`, su ficha pública queda en `BLOQUEADO` (`disponibleParaVenta = false`), la línea de tiempo conserva 2 eventos y 1 derivado, la auditoría registra `CAMBIO_ESTADO` por lote y transformar el derivado bloqueado responde `409 LOTE_BLOQUEADO`.
  8. `caso8_regresionHora12LiberarDerivadoConOrigenBloqueadoResponde409`: intentar liberar `CAC001-T1` con ancestro bloqueado responde `409 ORIGEN_BLOQUEADO`; al liberar la raíz primero, la posterior liberación del derivado tiene éxito con `200 OK`.

---

## Detalle del Bloque B9 — Documentación interactiva de la API (Swagger UI / OpenAPI)

- **Fecha y hora:** `2026-10-16T05:14:57-05:00`
- **Comando:** `.\mvnw.cmd test`
- **Salida real de Surefire:**

```text
[INFO] Running co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.165 s -- in co.edu.usco.cacao.dominio.DominioEsquemaContratoTest
[INFO] Running co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 14.11 s -- in co.edu.usco.cacao.seguridad.SeguridadJwtErroresTest
[INFO] Running co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.044 s -- in co.edu.usco.cacao.servicio.CalculadoraTransformacionTest
[INFO] Running co.edu.usco.cacao.web.IncidenciaRecallCsvTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.627 s -- in co.edu.usco.cacao.web.IncidenciaRecallCsvTest
[INFO] Running co.edu.usco.cacao.web.OpenApiDocumentacionTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.026 s -- in co.edu.usco.cacao.web.OpenApiDocumentacionTest
[INFO] Running co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.836 s -- in co.edu.usco.cacao.web.RecepcionCatalogosFiltrosTest
[INFO] Running co.edu.usco.cacao.web.ReglasPermisosRegresionTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.331 s -- in co.edu.usco.cacao.web.ReglasPermisosRegresionTest
[INFO] Running co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.981 s -- in co.edu.usco.cacao.web.TransformacionIntegracionTest
[INFO] Running co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.725 s -- in co.edu.usco.cacao.web.TrazabilidadFichaEstadoAuditoriaTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 52, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  32.817 s
[INFO] Finished at: 2026-10-16T05:14:57-05:00
[INFO] ------------------------------------------------------------------------
```

- **Casos verificados en `OpenApiDocumentacionTest` (2 pruebas de integración sobre `cacao_test`):**
  1. `apiDocsExponeEspecificacionOpenApi3ConSeguridadJwtYRutasContrato`: `GET /v3/api-docs` (sin token) devuelve `200 OK` con especificación OpenAPI 3, esquema de seguridad `bearerAuth` (`HTTP Bearer JWT`) y todas las rutas del contrato técnico (`/api/auth/login`, `/api/public/ficha/{codigo}`, `/api/config/reglas`, `/api/productores`, `/api/lotes`, `/api/lotes/{codigo}`, `/api/lotes/{codigo}/trazabilidad`, `/api/lotes/{codigo}/recall`, `/api/lotes/{codigo}/estado`, `/api/transformaciones`, `/api/transformaciones/{id}/balance`, `/api/alertas`, `/api/auditoria`, `/api/reportes/exportar-csv`).
  2. `swaggerUiIndexCargaSinAutenticacion`: `GET /swagger-ui/index.html` (sin token) devuelve `200 OK` y carga la interfaz interactiva de Swagger UI.
