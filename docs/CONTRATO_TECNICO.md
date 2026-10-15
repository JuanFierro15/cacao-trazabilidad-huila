# Contrato técnico — Trazabilidad de cacao Asoprocacao

Fuente única de verdad para las tres ramas. Si el código y este documento no coinciden, manda este documento hasta que se acuerde un cambio.

**Cómo se cambia:** se edita en un PR propio hacia `main` con prefijo `docs(contrato):`, se avisa en el grupo y cada rama hace `git pull origin main`. Nadie cambia el contrato en silencio dentro de su rama.

---

## 1. Equipo, ramas y propiedad de carpetas

| Integrante | Rama | Es dueño de |
|---|---|---|
| Miguel Ángel Medina Díaz | `feat/backend-api` | `backend/**` excepto `backend/src/main/resources/db/migration/` |
| Juan Manuel Villalba Rincón | `feat/db-datos` | `backend/src/main/resources/db/migration/`, `datos/**`, `pitch/**` |
| Juan David Fierro Calderón | `feat/frontend-ui` | `frontend/**`; integra `main` y cierra `README.md` y `ENTREGA.md` |

Reglas:
- Nadie edita archivos fuera de su carpeta. Si lo necesita, pide el cambio al dueño.
- Las migraciones aplicadas (`V1`, `V2`, ...) **no se editan nunca**. Flyway guarda un checksum de cada una; si cambia, el backend no arranca. Un cambio de esquema es siempre una migración nueva `V<n+1>__descripcion.sql`, la escribe Juan Manuel y se avisa en el grupo.
- `documentos/` se llena al final desde `main`.

## 2. Stack y versiones

| Capa | Tecnología |
|---|---|
| Base de datos | PostgreSQL 16 (Docker, imagen `postgres:16-alpine`) |
| Migraciones | Flyway (gestionado por Spring Boot) + `flyway-database-postgresql` |
| Backend | Java 21, Spring Boot **3.5.16**, Spring Web, Spring Security, Spring Data JPA, Bean Validation, jjwt 0.12.6 |
| Pruebas backend | JUnit 5, Spring Boot Test, Spring Security Test, Testcontainers (PostgreSQL) |
| Frontend | Node 22 LTS, React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), React Router 7, `qrcode.react` |
| Lenguaje frontend | JavaScript (JSX), sin TypeScript |

Decisiones fijas:
- **Spring Boot 3.5.16 y no 4.x.** Spring Initializr ya solo genera 4.x, pero el `pom.xml` del repositorio fija 3.5.16 (última versión libre de la rama 3, fin de soporte comunitario en junio de 2026). Razón: es la versión que el equipo domina y evita migrar a Jackson 3 y Spring Security 7 durante la hackathon. Limitación declarada en E03.
- **Sin Lombok.** Entidades con getters/setters explícitos y DTOs como `record`. Evita problemas de procesamiento de anotaciones entre IDEs.
- **`spring.jpa.hibernate.ddl-auto=validate`.** El esquema lo crea Flyway; Hibernate solo verifica que las entidades coincidan. Si una entidad no coincide con la tabla, la aplicación no arranca: así el contrato de datos se hace cumplir solo.

## 3. Estructura del repositorio

```
/
├── README.md               instalación limpia, ejecución, pruebas, usuarios demo
├── ENTREGA.md              índice E01–E10, integrantes, etiqueta final, matriz
├── .env.example            variables sin secretos (copiar a .env)
├── docker-compose.yml      PostgreSQL 16 en el puerto 5433
├── docs/CONTRATO_TECNICO.md
├── backend/                Spring Boot (código en src/, pruebas en src/test/)
│   └── src/main/resources/db/migration/   V1, V2, ... (Flyway)
├── frontend/               React + Vite + Tailwind
├── datos/
│   ├── respaldos/          respaldo_demo.dump + instrucciones
│   ├── rendimiento/        carga de 100 registros y medición
│   └── scripts/            respaldo, restauración, verificación de integridad
├── documentos/             E01–E03, E05–E09 (PDF)
└── pitch/                  E09_presentacion
```

El reto pide `src/` y `tests/`; se acepta estructura equivalente si `ENTREGA.md` indica dónde está cada cosa.

## 4. Configuración, puertos y variables

| Servicio | Puerto | Nota |
|---|---|---|
| PostgreSQL | **5433** en el host (5432 dentro del contenedor) | 5433 para no chocar con un PostgreSQL local |
| Backend | 8080 | `http://localhost:8080/api` |
| Frontend | 5173 | Vite con `server.host: true` para abrir desde el celular |

- Un solo `.env` en la raíz (copia de `.env.example`). Lo leen Docker Compose, Spring Boot (`spring.config.import`) y Vite (`envDir: '..'`).
- `.env` nunca se sube. `.env.example` sí, sin secretos reales.
- `JWT_SECRET` debe tener al menos 32 caracteres (HS256 exige 256 bits; jjwt lanza `WeakKeyException` si es más corto).
- En desarrollo el frontend llama a `/api/...` y Vite lo redirige a `http://localhost:8080` (proxy). Así no hay CORS en desarrollo. El backend igual permite `APP_CORS_ORIGENES`.
- URL que codifica el QR: `${VITE_PUBLIC_BASE_URL || window.location.origin}/ficha/{codigoLote}`. Para el celular, `VITE_PUBLIC_BASE_URL=http://<IP-del-PC-en-la-red>:5173`.
- Zona horaria: `America/Bogota`. Fechas `YYYY-MM-DD`; marcas de tiempo ISO-8601 con desfase (`2026-10-15T20:10:00-05:00`).

## 5. Modelo de datos

El esquema real está en `V1__esquema_inicial.sql`; los datos base en `V2__datos_semilla.sql`. Resumen:

| Tabla | Propósito | Reglas que se cumplen en la propia BD |
|---|---|---|
| `usuarios` | operador y administrador | `rol` ∈ {OPERADOR, ADMINISTRADOR} |
| `fincas_productores` | origen y cuota de plausibilidad | hectáreas > 0, cuota > 0 |
| `lotes` | lotes de **RECEPCION** y **DERIVADO** | `cantidad_recibida > 0`; `disponible = recibida − consumida` y `≥ 0`; estado ∈ {PENDIENTE, LIBERADO, BLOQUEADO}; código único |
| `transformaciones` | una etapa sobre un lote | `operacion_uuid` único (idempotencia); salida > entrada solo con `insumos_agregados`; si salida = 0 no hay lote derivado |
| `lote_composicion` | genealogía padre → hijo | kg > 0; padre ≠ hijo |
| `alertas` | regla y causa de cada alerta | tipo ∈ {MERMA_ALTA, CUOTA_EXCEDIDA, SOBRECOSTO, REGISTRO_INCOMPLETO} |
| `auditoria_cambios` | quién, cuándo, qué | **solo inserción**: un trigger rechaza UPDATE, DELETE y TRUNCATE |

**Lotes derivados.** La salida de cada transformación es un lote nuevo, así la etapa siguiente consume de él y la trazabilidad va del grano recibido al producto terminado:

- Código: `<código del lote de recepción raíz>-T<n>`, con `n` = cantidad de derivados existentes de esa raíz + 1. Ejemplo: `CAC001` → `CAC001-T1` → `CAC001-T2`.
- Hereda `productor_id` y `origen_municipio` del padre. `tipo_lote = DERIVADO`, `tipo_grano = NULL`, `producto` = el que indique la transformación, `estado = PENDIENTE`, `fecha_recepcion` = fecha de la transformación.
- Se registra una fila en `lote_composicion` (padre, hijo, kg aportados, 100 %).
- Alcance del MVP: **un lote de entrada por operación**. La tabla ya soporta mezclas (varios padres), pero no se implementan salvo que sobre tiempo.

**Consulta de referencia para la genealogía hacia atrás** (validada sobre PostgreSQL 16):

```sql
WITH RECURSIVE ancestros AS (
  SELECT lc.lote_padre_id, lc.lote_hijo_id, 1 AS nivel
    FROM lote_composicion lc
    JOIN lotes h ON h.id = lc.lote_hijo_id
   WHERE h.codigo_lote = :codigo
  UNION ALL
  SELECT lc.lote_padre_id, lc.lote_hijo_id, a.nivel + 1
    FROM lote_composicion lc
    JOIN ancestros a ON lc.lote_hijo_id = a.lote_padre_id
)
SELECT a.nivel, p.codigo_lote AS padre, h.codigo_lote AS hijo
  FROM ancestros a
  JOIN lotes p ON p.id = a.lote_padre_id
  JOIN lotes h ON h.id = a.lote_hijo_id
 ORDER BY a.nivel;
```

Para los descendientes se invierte la unión (`lc.lote_padre_id = a.lote_hijo_id`).

## 6. Reglas de negocio

Todas se calculan en el **backend**. El frontend puede mostrar una vista previa (semáforo de merma), pero el valor que se guarda y se muestra como oficial es el que devuelve la API.

**Aritmética:** `BigDecimal`, `RoundingMode.HALF_UP`. Porcentajes y COP con 2 decimales; kg con 3.

| Regla | Fórmula / condición | Caso del jurado |
|---|---|---|
| Merma | `(entrada − salida) ÷ entrada × 100` | 100 → 80 = **20,00 %** |
| Rendimiento | `salida ÷ entrada × 100` | 80,00 % |
| Alerta MERMA_ALTA | merma **>** `APP_UMBRAL_MERMA` (15,0) | 20 > 15 → alerta |
| Alerta REGISTRO_INCOMPLETO | merma > umbral **y** justificación vacía | — |
| Costo unitario | `costo_etapa_cop ÷ cantidad_salida` | 1.600.000 ÷ 80 = **20.000 COP/kg** |
| Margen sobre venta | `(precio − costo unitario) ÷ precio × 100` | (25.000 − 20.000) ÷ 25.000 × 100 = **20,00 %** |
| Alerta SOBRECOSTO | margen calculado < 0 | — |
| División entre cero | salida = 0 → costo unitario y margen = `null`, `calculable = false` con motivo; precio = 0 → margen = `null` | prueba "costos con salida cero" |
| Inventario | entrada > disponible → rechazo 422, sin cambios | 120 kg sobre 100 → rechazo |
| Idempotencia | mismo `operacionUuid` → 409, sin segundo consumo | reenvío → rechazo |
| Salida > entrada | solo con `insumosAgregados` no vacío; la merma queda negativa y se muestra como "balance con insumos" | — |
| Lote bloqueado | no se puede transformar → 409 | — |
| Cuota de plausibilidad | si (kg entregados por el productor en el año + kg nuevos) > `cuota_maxima_kg` → alerta CUOTA_EXCEDIDA. **Alerta, no bloquea** la recepción | Productor C (0,5 ha, cuota 300 kg) |
| Bloqueo | solo ADMINISTRADOR, motivo obligatorio (10–300 caracteres). Por defecto **se propaga a todos los derivados** | Hora 12: CAC001 y CAC001-T1 quedan BLOQUEADO |
| Liberación | solo ADMINISTRADOR, motivo obligatorio. No se propaga. Si algún ancestro está BLOQUEADO → 409 ORIGEN_BLOQUEADO | — |
| Mismo estado | pedir el estado que ya tiene → 409 ESTADO_SIN_CAMBIO, sin auditoría | — |

Los textos de regla y causa de cada alerta los arma el backend con los valores reales, por ejemplo:
- Regla: `Merma de una etapa mayor a 15,0 %`
- Causa: `Merma calculada de 20,00 % (100 kg → 80 kg) en LIMPIEZA_CLASIFICACION. Causa registrada por el operador: Impurezas y pasilla superiores a lo normal.`

**Orden dentro de la transacción de una transformación** (todo o nada, `@Transactional`):
1. Validar el cuerpo (Bean Validation) → 400.
2. Si ya existe ese `operacionUuid` → 409 OPERACION_DUPLICADA (devuelve el id existente).
3. Cargar el lote de origen con bloqueo pesimista (`@Lock(PESSIMISTIC_WRITE)`) → 404 si no existe.
4. Si está BLOQUEADO → 409. Si la entrada supera lo disponible → 422. Si salida > entrada sin insumos → 422.
5. Calcular merma, rendimiento, costo unitario y margen.
6. Actualizar consumido/disponible del origen; crear el lote derivado (si salida > 0), la transformación y la composición.
7. Generar alertas y registrar auditoría.
8. Si la BD rechaza el `operacionUuid` por duplicado (dos envíos simultáneos), capturar `DataIntegrityViolationException` y responder 409 OPERACION_DUPLICADA.

## 7. Seguridad y permisos

- JWT HS256 en `Authorization: Bearer <token>`, expiración `JWT_EXPIRACION_MINUTOS` (480). Claims: `sub` = username, `rol`.
- API sin estado (`SessionCreationPolicy.STATELESS`), CSRF deshabilitado (no hay cookies de sesión).
- Autoridades `ROLE_OPERADOR` y `ROLE_ADMINISTRADOR`; en la configuración se usa `hasRole("ADMINISTRADOR")` (Spring agrega el prefijo `ROLE_`; es el error más común).
- Las reglas viven en `SecurityFilterChain` con `requestMatchers` (un solo lugar, fácil de mostrar al jurado). Ocultar botones en el frontend no cuenta como control.
- 401 y 403 responden con el mismo formato de error JSON (sección 8) mediante `AuthenticationEntryPoint` y `AccessDeniedHandler` propios.

| Endpoint | Público | OPERADOR | ADMINISTRADOR |
|---|:-:|:-:|:-:|
| `POST /api/auth/login` | ✔ | ✔ | ✔ |
| `GET /api/public/ficha/{codigo}` | ✔ | ✔ | ✔ |
| `GET /api/config/reglas` |  | ✔ | ✔ |
| `GET /api/productores` |  | ✔ | ✔ |
| `POST /api/lotes` |  | ✔ | ✔ |
| `GET /api/lotes`, `GET /api/lotes/{codigo}` |  | ✔ | ✔ |
| `GET /api/lotes/{codigo}/trazabilidad` |  | ✔ | ✔ |
| `POST /api/transformaciones`, `GET /api/transformaciones` |  | ✔ | ✔ |
| `PATCH /api/lotes/{codigo}/estado` |  | **403** | ✔ |
| `GET /api/lotes/{codigo}/recall` |  | 403 | ✔ |
| `GET /api/transformaciones/{id}/balance` |  | 403 | ✔ |
| `GET /api/alertas` |  | 403 | ✔ |
| `GET /api/auditoria` |  | 403 | ✔ |
| `GET /api/reportes/exportar-csv` |  | 403 | ✔ |

Usuarios de demostración (los crea el `DataInitializer` solo si no existen, para no duplicar al reiniciar):

| Usuario | Contraseña | Rol | Nombre |
|---|---|---|---|
| `operador1` | `cacao123` | OPERADOR | Operador Demo |
| `admin1` | `admin123` | ADMINISTRADOR | Administrador Demo |

Son credenciales de demostración publicadas a propósito en el README, no secretos.

## 8. Contrato de la API

Base: `/api`. JSON en camelCase. Números como números (no como texto).

### 8.1 Formato único de error

```json
{
  "timestamp": "2026-10-15T20:10:00-05:00",
  "status": 422,
  "codigo": "INVENTARIO_INSUFICIENTE",
  "mensaje": "El lote CAC001 tiene 100 kg disponibles y la operación pide 120 kg. No se registró ningún cambio.",
  "errores": []
}
```

En validación, `errores` trae cada campo: `[{"campo": "cantidadRecibida", "mensaje": "Debe ser mayor que 0"}]`.

| Código | HTTP | Cuándo |
|---|---|---|
| `VALIDACION` | 400 | campos vacíos, negativos o mal formados |
| `CREDENCIALES_INVALIDAS` | 401 | login fallido |
| `NO_AUTENTICADO` | 401 | sin token o token vencido |
| `ACCESO_DENEGADO` | 403 | rol sin permiso |
| `NO_ENCONTRADO` | 404 | código o id inexistente |
| `LOTE_DUPLICADO` | 409 | `codigoLote` ya existe |
| `OPERACION_DUPLICADA` | 409 | `operacionUuid` repetido |
| `LOTE_BLOQUEADO` | 409 | transformar un lote bloqueado |
| `ORIGEN_BLOQUEADO` | 409 | liberar un derivado con ancestro bloqueado |
| `ESTADO_SIN_CAMBIO` | 409 | pedir el estado actual |
| `INVENTARIO_INSUFICIENTE` | 422 | entrada > disponible |
| `SALIDA_SIN_JUSTIFICACION` | 422 | salida > entrada sin insumos |
| `ERROR_INTERNO` | 500 | inesperado (sin trazas de pila en la respuesta) |

### 8.2 Autenticación

`POST /api/auth/login`
```json
{ "username": "admin1", "password": "admin123" }
```
200:
```json
{ "token": "eyJ...", "username": "admin1", "nombreCompleto": "Administrador Demo",
  "rol": "ADMINISTRADOR", "expiraEn": "2026-10-16T04:10:00-05:00" }
```

### 8.3 Configuración y catálogos

`GET /api/config/reglas`
```json
{
  "umbralMermaPorcentaje": 15.0,
  "rendimientoPlausibleKgHaAnio": 600,
  "etapas": [
    { "codigo": "BENEFICIO_FERMENTACION_SECADO", "nombre": "Beneficio: fermentación y secado" },
    { "codigo": "LIMPIEZA_CLASIFICACION",        "nombre": "Limpieza y clasificación" },
    { "codigo": "TOSTADO_ROASTING",              "nombre": "Tostado" },
    { "codigo": "DESCASCARILLADO_WINNOWING",     "nombre": "Descascarillado (nibs)" },
    { "codigo": "MOLIENDA_LICOR_CACAO",          "nombre": "Molienda a licor de cacao" },
    { "codigo": "CONTROL_CALIDAD_EMPAQUE",       "nombre": "Control de calidad y empaque" }
  ]
}
```
El frontend toma el umbral y las etapas de aquí; no los escribe a mano.

`GET /api/productores`
```json
[{ "id": 1, "codigoProductor": "PRD-A", "nombreProductor": "Productor A",
   "nombreFinca": "Finca La Esperanza", "municipio": "Rivera", "vereda": null,
   "hectareasProductivas": 2.00, "variedadCacao": "CCN-51",
   "cuotaMaximaKg": 1200.000, "entregadoAnioKg": 100.000 }]
```

### 8.4 Lotes

`POST /api/lotes`
```json
{ "codigoLote": null, "productorId": 1, "fechaRecepcion": "2026-10-15",
  "tipoGrano": "SECO", "porcentajeHumedad": 7.5, "cantidadRecibida": 120.5 }
```
- `codigoLote` opcional. Si viene vacío, el backend asigna el siguiente `CACnnn`. Si viene, debe cumplir `^[A-Z0-9-]{3,30}$` y no existir (409 LOTE_DUPLICADO).
- `origenMunicipio` lo toma el backend del productor; la unidad siempre es `kg`.
- Obligatorios: `productorId`, `fechaRecepcion`, `tipoGrano`, `cantidadRecibida > 0`.

201:
```json
{ "lote": { ...LoteDTO }, "alertasGeneradas": [ ...AlertaDTO ] }
```

**LoteDTO**
```json
{ "id": 4, "codigoLote": "CAC004", "tipoLote": "RECEPCION", "producto": "Cacao seco",
  "productor": { "id": 1, "codigoProductor": "PRD-A", "nombreProductor": "Productor A",
                 "nombreFinca": "Finca La Esperanza" },
  "origenMunicipio": "Rivera", "fechaRecepcion": "2026-10-15", "tipoGrano": "SECO",
  "porcentajeHumedad": 7.5, "cantidadRecibida": 120.5, "cantidadConsumida": 0,
  "cantidadDisponible": 120.5, "unidad": "kg", "estado": "PENDIENTE", "motivoEstado": null,
  "lotesPadre": [], "alertasActivas": 0 }
```

`GET /api/lotes?origen=Rivera&estado=BLOQUEADO&tipo=RECEPCION` → `[LoteDTO]` (filtros opcionales y combinables).
`GET /api/lotes/{codigo}` → `LoteDTO`.

### 8.5 Transformaciones

`POST /api/transformaciones`
```json
{ "operacionUuid": "3f6c2a9e-5b1d-4c8e-9f0a-1b2c3d4e5f60",
  "loteOrigenCodigo": "CAC001", "etapa": "LIMPIEZA_CLASIFICACION",
  "responsable": "Operario de planta 1", "fechaTransformacion": "2026-10-15",
  "cantidadEntrada": 100, "cantidadSalida": 80, "productoSalida": "Grano seco seleccionado",
  "justificacionIncidencia": "Impurezas y pasilla superiores a lo normal",
  "insumosAgregados": null, "temperaturaProceso": null, "humedadSalida": 7.2,
  "costoEtapaCop": 1600000, "precioVentaEstimadoCop": 25000,
  "detalleCostosIncluidos": "Materia prima acopiada, mano de obra de planta y energía" }
```
- `operacionUuid` lo genera el frontend (`crypto.randomUUID()`) al abrir el formulario y se conserva en reintentos; solo cambia cuando el registro se completa y el formulario se limpia.
- Obligatorios: `operacionUuid`, `loteOrigenCodigo`, `etapa`, `responsable`, `fechaTransformacion`, `cantidadEntrada > 0`, `cantidadSalida ≥ 0`, `productoSalida` (si salida > 0). Costos y precio son opcionales (≥ 0).

201 (sin costos: el operador también usa este endpoint):
```json
{ "transformacion": { "id": 1, "operacionUuid": "3f6c...", "loteOrigenCodigo": "CAC001",
    "loteSalidaCodigo": "CAC001-T1", "etapa": "LIMPIEZA_CLASIFICACION",
    "responsable": "Operario de planta 1", "fechaTransformacion": "2026-10-15",
    "cantidadEntrada": 100, "cantidadSalida": 80, "porcentajeMerma": 20.00,
    "porcentajeRendimiento": 80.00, "justificacionIncidencia": "...", "insumosAgregados": null },
  "inventarioOrigen": { "codigoLote": "CAC001", "cantidadRecibida": 100,
    "cantidadConsumida": 100, "cantidadDisponible": 0 },
  "alertasGeneradas": [ ...AlertaDTO ] }
```
409 por duplicado: el error trae además `"transformacionId": 1`.

`GET /api/transformaciones?loteCodigo=CAC001` → lista con los mismos campos de `transformacion` (sin costos).

`GET /api/transformaciones/{id}/balance` y `GET /api/transformaciones/{id}/balance?precioVentaCop=27000` (simulación, **no guarda nada**):
```json
{ "transformacionId": 1, "loteSalidaCodigo": "CAC001-T1",
  "costoEtapaCop": 1600000.00, "cantidadSalidaKg": 80.000,
  "costoUnitarioCop": 20000.00, "precioVentaCop": 25000.00, "margenPorcentaje": 20.00,
  "esSimulacion": false, "calculable": true, "motivoNoCalculable": null,
  "formulas": {
    "costoUnitario": "Costo unitario = costo total de la etapa ÷ kg de salida vendible = 1.600.000 ÷ 80 = 20.000 COP/kg",
    "margen": "Margen = (precio − costo unitario) ÷ precio × 100 = (25.000 − 20.000) ÷ 25.000 × 100 = 20,00 %" },
  "costosIncluidos": "Materia prima acopiada, mano de obra de planta y energía",
  "supuestos": [
    "Salida vendible = cantidad de salida registrada (80 kg).",
    "Precio de venta hipotético del ejercicio.",
    "Valores del caso simulado; no son estándares agronómicos ni de mercado." ] }
```
Las fórmulas las arma el backend con los números reales: así se ve que no son cifras fijas. Con salida 0: `calculable: false`, `motivoNoCalculable: "No se puede calcular: la salida vendible es 0 kg (división entre cero)."`.

### 8.6 Estado, recall y trazabilidad

`PATCH /api/lotes/{codigo}/estado` (solo ADMINISTRADOR)
```json
{ "estado": "BLOQUEADO", "motivo": "Reclamo del comprador por sabor anómalo", "propagarADerivados": true }
```
200:
```json
{ "lote": { ...LoteDTO },
  "lotesAfectados": [
    { "codigoLote": "CAC001",    "estadoAnterior": "PENDIENTE", "estadoNuevo": "BLOQUEADO" },
    { "codigoLote": "CAC001-T1", "estadoAnterior": "PENDIENTE", "estadoNuevo": "BLOQUEADO" } ] }
```
Con OPERADOR → 403 `ACCESO_DENEGADO`, mensaje `"Solo el Administrador puede liberar o bloquear lotes."`.

`GET /api/lotes/{codigo}/recall` (solo ADMINISTRADOR; sirve para la incidencia de la hora 12):
```json
{ "codigoLote": "CAC001", "estado": "BLOQUEADO", "loteRaiz": "CAC001",
  "origen": { "productor": "Productor A", "finca": "Finca La Esperanza",
              "municipio": "Rivera", "variedadCacao": "CCN-51" },
  "cantidades": { "recibidaKg": 100, "consumidaKg": 100, "disponibleKg": 0 },
  "derivados": [ { "codigoLote": "CAC001-T1", "producto": "Grano seco seleccionado",
                   "etapa": "LIMPIEZA_CLASIFICACION", "cantidadKg": 80, "disponibleKg": 80,
                   "estado": "BLOQUEADO" } ],
  "kgAfectadosEnInventario": 80,
  "historialConservado": { "transformaciones": 1, "registrosAuditoria": 5 } }
```
`kgAfectadosEnInventario` = suma de `cantidad_disponible` del lote y de todos sus derivados. Si se consulta un derivado, `loteRaiz` y `origen` se resuelven hacia atrás.

`GET /api/lotes/{codigo}/trazabilidad` (OPERADOR y ADMINISTRADOR; sin costos)
```json
{ "codigoLote": "CAC001-T1", "producto": "Grano seco seleccionado", "estado": "PENDIENTE",
  "loteRaiz": { "codigoLote": "CAC001", "fechaRecepcion": "2026-10-14",
                "cantidadRecibidaKg": 100, "tipoGrano": "SECO", "porcentajeHumedad": 7.5 },
  "origen": { "productor": "Productor A", "finca": "Finca La Esperanza", "municipio": "Rivera",
              "vereda": null, "variedadCacao": "CCN-51", "hectareasProductivas": 2.00 },
  "linea": [
    { "orden": 1, "tipo": "RECEPCION", "fecha": "2026-10-14", "codigoLote": "CAC001",
      "descripcion": "Recepción de 100 kg de cacao seco (humedad 7,5 %)" },
    { "orden": 2, "tipo": "TRANSFORMACION", "fecha": "2026-10-15",
      "etapa": "LIMPIEZA_CLASIFICACION", "loteEntrada": "CAC001", "loteSalida": "CAC001-T1",
      "cantidadEntradaKg": 100, "cantidadSalidaKg": 80, "porcentajeMerma": 20.00,
      "responsable": "Operario de planta 1", "incidencia": "Impurezas y pasilla superiores a lo normal" } ],
  "derivados": [],
  "alertas": [ ...AlertaDTO ],
  "tiempoConsultaMs": 12 }
```

### 8.7 Ficha pública (comprador, sin autenticación)

`GET /api/public/ficha/{codigo}`
```json
{ "codigoLote": "CAC001-T1", "producto": "Grano seco seleccionado",
  "estado": "BLOQUEADO", "disponibleParaVenta": false,
  "mensajeEstado": "Producto retenido por control de calidad. No está disponible para la venta.",
  "origen": { "finca": "Finca La Esperanza", "municipio": "Rivera",
              "departamento": "Huila", "variedadCacao": "CCN-51" },
  "fechaRecepcionOrigen": "2026-10-14",
  "recorrido": [
    { "orden": 1, "etapa": "RECEPCION", "nombre": "Recepción en acopio", "fecha": "2026-10-14" },
    { "orden": 2, "etapa": "LIMPIEZA_CLASIFICACION", "nombre": "Limpieza y clasificación", "fecha": "2026-10-15" } ],
  "consultadoEn": "2026-10-15T21:00:00-05:00" }
```
- `disponibleParaVenta = estado == LIBERADO && cantidadDisponible > 0`.
- Mensajes: LIBERADO → "Producto verificado y disponible para la venta."; PENDIENTE → "Producto en proceso de verificación. Aún no está disponible para la venta."; BLOQUEADO → el del ejemplo.
- **Lista blanca.** Se construye con un DTO propio, nunca serializando la entidad. Prohibido incluir: costos, precios, márgenes, cantidades, merma, responsable, nombre del productor, hectáreas, cuota, motivo del estado, alertas e ids internos. El nombre de la persona productora se omite por ser dato personal (Ley 1581 de 2012); el origen se muestra por finca y municipio.

### 8.8 Alertas, auditoría y CSV (solo ADMINISTRADOR)

`GET /api/alertas?activa=true&loteCodigo=CAC001` → `[AlertaDTO]`
```json
{ "id": 1, "tipoAlerta": "MERMA_ALTA", "loteCodigo": "CAC001", "transformacionId": 1,
  "reglaAplicada": "Merma de una etapa mayor a 15,0 %",
  "causa": "Merma calculada de 20,00 % (100 kg → 80 kg) en LIMPIEZA_CLASIFICACION. Causa registrada por el operador: Impurezas y pasilla superiores a lo normal.",
  "valorMedido": 20.00, "umbral": 15.00, "fechaGeneracion": "2026-10-15T20:15:00-05:00", "activa": true }
```

`GET /api/auditoria?referencia=CAC001&entidad=LOTE` → más reciente primero:
```json
[{ "id": 7, "fechaHora": "2026-10-16T02:05:00-05:00", "usuarioUsername": "admin1",
   "usuarioRol": "ADMINISTRADOR", "accion": "CAMBIO_ESTADO", "entidadAfectada": "LOTE",
   "registroReferencia": "CAC001", "campoModificado": "estado",
   "valorAnterior": "PENDIENTE", "valorNuevo": "BLOQUEADO",
   "motivo": "Reclamo del comprador por sabor anómalo" }]
```
Qué se audita, en la misma transacción del cambio:

| Acción | Entidad | Campo | Ejemplo |
|---|---|---|---|
| `CREAR` | LOTE | `cantidad_recibida` | null → 100 |
| `CONSUMO` | LOTE | `cantidad_disponible` | 100 → 0 |
| `CREAR` | TRANSFORMACION | `operacion_uuid` | null → 3f6c... |
| `CAMBIO_ESTADO` | LOTE | `estado` | PENDIENTE → BLOQUEADO (con motivo) |

`GET /api/reportes/exportar-csv?origen=&estado=` → archivo `lotes_YYYYMMDD_HHmm.csv`
- UTF-8 con BOM, separador `;`, decimales con coma. Así abre bien con doble clic en Excel en español (Colombia).
- Columnas: `codigo_lote;tipo_lote;producto;municipio_origen;finca;cantidad_recibida_kg;cantidad_consumida_kg;cantidad_disponible_kg;estado;costo_etapa_cop;costo_unitario_cop;precio_venta_cop;margen_porcentaje`
- Los costos de un lote son los de la transformación que lo produjo; en lotes de recepción van vacíos.

## 9. Datos de demostración

- `V2` carga productores PRD-A, PRD-B, PRD-C y lotes **CAC001 (100 kg, Rivera)**, **CAC002 (150 kg, Campoalegre)**, **CAC003 (80 kg, Algeciras)**, todos SECO y PENDIENTE.
- CAC001 arranca **sin transformaciones**: el jurado registra en vivo 100 kg → 80 kg. Para ensayar se trabaja sobre otro lote o se restaura `respaldo_demo.dump` antes de la evaluación.
- Datos de rendimiento: prefijo `PERF`, se cargan con un script aparte en `datos/rendimiento/` y nunca van en una migración Flyway.

## 10. Pruebas del jurado → comportamiento esperado

| # | Prueba | Llamada | Resultado esperado |
|---|---|---|---|
| 1 | Crear lote válido | `POST /api/lotes` | 201, código único, persiste tras reiniciar |
| 2 | Cantidad negativa o campo vacío | `POST /api/lotes` | 400 VALIDACION con mensaje por campo; nada guardado |
| 3 | Transformar 100 → 80 | `POST /api/transformaciones` | 201, merma 20,00 %, alerta MERMA_ALTA, aparece en trazabilidad |
| 4 | Costo y margen | `GET .../balance` | 20.000 COP/kg y 20,00 %, fórmulas y supuestos en la respuesta |
| 5 | Ficha como comprador | `GET /api/public/ficha/{codigo}` | sin ningún campo de la lista prohibida |
| 6 | Reiniciar y restaurar | scripts de `datos/scripts/` | mismos conteos, sumas e identificadores antes y después |
| 7 | Consumir de más y reenviar | `POST /api/transformaciones` ×2 | 422 INVENTARIO_INSUFICIENTE; reenvío → 409 OPERACION_DUPLICADA, inventario intacto |
| 8 | Bloquear CAC001 | `PATCH .../estado` + ficha | ficha BLOQUEADO, `disponibleParaVenta: false`, origen visible, historial intacto |
| 9 | Liberar como operador | `PATCH .../estado` con token de operador | 403; el cambio hecho por admin1 aparece en `GET /api/auditoria` |
| 10 | Rendimiento | trazabilidad sobre 100 registros | < 3000 ms; se reporta método, equipo y resultado |

## 11. Convenciones de código

- Dominio en español y consistente con la BD: `Lote`, `Transformacion`, `FincaProductor`, `Alerta`, `AuditoriaCambio`.
- Backend: paquete base `co.edu.usco.cacao`, por capas: `config`, `seguridad`, `dominio`, `repositorio`, `servicio`, `web`, `web.dto`, `excepcion`. Las reglas de negocio viven en `servicio`; los controladores solo traducen HTTP.
- Frontend: `src/api` (cliente y simulaciones), `src/auth`, `src/paginas/{login,operador,admin,publico}`, `src/componentes`, `src/utilidades`. Números con `Intl.NumberFormat('es-CO')`.
- Commits en español con Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`, `style:`.
