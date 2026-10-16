# CLAUDE.md — Hackathon "Cacao con historia, calidad y valor"

> Archivo **versionado** en el repositorio como registro del uso de herramientas, exigido por el reto.
> - **Claude Code** lo lee directamente como `CLAUDE.md`.
> - **agy (Antigravity CLI)** lo lee a través de `GEMINI.md`, que solo contiene `@./CLAUDE.md`.
> Todos los integrantes trabajan con este mismo archivo. Se cambia solo por PR a `main`.

@./docs/CONTRATO_TECNICO.md

---

## 0. Antes de cualquier tarea

1. Lee `docs/CONTRATO_TECNICO.md` completo. Es la fuente de verdad de API, base de datos, reglas de negocio, permisos y propiedad de carpetas. Si este archivo y el contrato se contradicen, manda el contrato.
2. Detecta el modo de base de datos (sección 7): ejecuta `docker --version`. Si responde → **MODO DOCKER**. Si no → **MODO LOCAL**. Nunca instales Docker ni PostgreSQL, ni cambies puertos, usuarios o configuración del servidor por tu cuenta: si algo falta, detente y avisa.
3. Ejecuta `git branch --show-current`. **Tu rama define tu rol** (sección 4). Si estás en `main` y la tarea no es una integración pedida explícitamente, detente y pregunta.
4. Identifica qué herramienta eres y aplica tu sección: Claude Code → 5A; agy → 5B.
5. Ejecuta solo el bloque que te indiquen. No adelantes bloques ni "mejores" cosas fuera de tu carpeta.

## 1. Contexto

- Evento: II Hackathon de Programación, II Feria Universitaria de CTeI del Huila (USCO, Semillero DEVURITY), 15 y 16 de octubre de 2026. 24 horas de construcción.
- Cliente simulado: Asociación de Productores de Cacao **Asoprocacao** (Campoalegre, Huila). Caso, organizaciones y datos son **sintéticos**.
- Producto: MVP que conecta recepción, transformación y comercialización de cacao con trazabilidad, inventario, alertas, balance económico, ficha pública con QR, auditoría y respaldo. Requisitos RF01–RF12.
- Equipo y roles:
  - **Miguel Ángel Medina Díaz:** base de datos y backend (`feat/backend-api`).
  - **Juan David Fierro Calderón:** frontend (`feat/frontend-ui`) e integración final (`feat/integracion`).
  - **Juan Manuel Villalba Rincón:** revisa la documentación contra lo construido, ejecuta los casos manuales, coordina la usabilidad, hace la instalación limpia final y prepara el pitch. No tiene rama: entrega los archivos del pitch a Juan David, que los sube en I3.
- Plazos (16 de octubre): congelación de funciones a las **11:00**, etiqueta `v1.0-entrega` a las **12:00**, documentos a Classroom a la **1:00 p. m.**, registro oficial del commit a las **2:00 p. m.**
- Diferenciadores: (1) control de plausibilidad por cuota de finca; (2) semáforo de merma en tiempo real + chips de incidencia en 1 clic para el operador, simulador de margen y reporte de recall para el administrador.

Cómo se califica (pesa en cada decisión): funcionamiento real RF01–RF12 = 25 pts; diseño y calidad técnica = 15; pruebas y confiabilidad = 15. Una pantalla con cifras fijas **no cuenta** como cumplimiento: el jurado cambia los valores. Son fallas críticas: perder registros, consumir más de lo disponible, exponer costos al público y permitir una liberación sin autorización.

## 2. Restricciones no negociables

- Las reglas de inventario, costos, estados y permisos se aplican en el **backend** (y en la BD cuando el esquema lo permite). El frontend nunca es la única barrera.
- Nada de resultados fijos en pantalla: todo número sale de la API.
- `ddl-auto=validate` contra **PostgreSQL real**. Prohibido H2, prohibido `create`/`update`, prohibido desactivar Flyway. Si una entidad no calza con el esquema, se corrige la entidad. El esquema solo cambia con una migración nueva (`V3`, `V4`...). **Nunca** se edita una migración ya aplicada.
- **Un bloque solo está terminado si su verificación se ejecutó de verdad.** Si no se pudo ejecutar (falta la base, falta un servicio), el bloque queda "pendiente de verificación" y se dice así.
- La ficha pública usa un DTO de lista blanca (contrato 8.7). Nunca se serializa una entidad JPA hacia afuera.
- Cero secretos en el repositorio: credenciales solo en `.env` (ignorado). `.env.example` sin valores reales.
- Solo datos sintéticos. No inventes productores reales, entrevistas, resultados de pruebas, métricas ni capturas. Falsificar evidencia es causal de descalificación: si una prueba falla, se reporta como fallida.
- Cada integrante toca solo sus carpetas (contrato, sección 1).
- No crees ni edites archivos de `documentos/` (E01–E09): esa documentación se redacta aparte.
- Mensajes de error para el usuario en español claro: qué pasó y qué hacer.

## 3. Reglas de git (siempre, sin excepción)

- Commits en español, formato Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`, `style:`.
- Un commit atómico por bloque, con el mensaje sugerido del bloque.
- Los **mensajes de commit, los nombres de rama y los comentarios del código** no mencionan IA, Claude, Anthropic, Gemini, Antigravity ni agy, y ningún commit lleva líneas `Co-authored-by`.
- Los archivos de contexto de agentes **sí se versionan** como registro de uso: `CLAUDE.md`, `GEMINI.md`, `PLAN_BLOQUES.md`, `prompts/` y `.claude/settings.json`. La declaración formal es `documentos/E08_IA_y_fuentes.md` (la redacta el equipo; ningún agente la crea ni la edita).
- Solo se ignoran localmente `.env`, `CLAUDE.local.md` y `.claude/settings.local.json`. Antes de cada commit, revisa que los archivos de agentes no tengan tokens, contraseñas reales ni rutas personales.
- **Bitácora por integrante.** Cada prompt de arranque de bloque o de delegación a agy se guarda antes de ejecutarlo en `prompts/<area>/<id-bloque>.md`, y se agrega una fila en la bitácora de esa área con fecha y hora, integrante, herramienta, bloque, archivos generados y revisión humana. Áreas (solo tres): `backend` (Miguel), `frontend` (Juan David) e `integracion` (Juan David en `main` y `feat/integracion`; incluye el registro del pitch si se usaron herramientas para prepararlo). Cada quien escribe **solo** en su archivo. `prompts/BITACORA.md` es solo un índice: nunca se le agregan filas.
- **Conflicto en la bitácora durante un merge:** se conserva la versión de `main` de `prompts/BITACORA.md` (el índice) y las filas que traía la rama se mueven a la bitácora de su área. Ninguna fila se pierde ni se duplica.
- Antes de `git add`, revisa `git status` y agrega solo archivos de tus carpetas y tu bitácora. Nunca `git add -A` a ciegas.
- Nunca `git push --force` sobre ramas compartidas. Nunca push directo a `main`: todo entra por PR.
- Para traer cambios de `main` a tu rama: `git fetch origin && git merge origin/main` (merge, no rebase).
- Quién hace commit: **agy nunca hace commit ni push**. Con agy directo (Miguel), el integrante revisa `git diff` y hace el commit. Con Claude Code (Juan David), Claude Code hace el commit tras revisar el diff y Juan David hace el push.

## 4. Rol según la rama

Cada bloque: objetivo → archivos → verificación → commit. No se pasa al siguiente sin verificación real.

### 4.1 `feat/backend-api` — Miguel Ángel Medina Díaz (base de datos y backend, MODO LOCAL)

**B1. Dominio y persistencia** — *terminado (commit `5b2f465`, en `main` desde el Checkpoint 1)*
- Objetivo: entidades JPA y repositorios que calcen exactamente con `V1`.
- Archivos: `backend/src/main/java/co/edu/usco/cacao/{dominio,repositorio}/**`. Enums: `Rol`, `TipoLote`, `TipoGrano`, `EstadoLote`, `Etapa`, `TipoAlerta` con `@Enumerated(EnumType.STRING)`. `@Version` en `Lote.versionOptimista`. Sin Lombok.
- Verificación: con PostgreSQL local corriendo, `mvnw.cmd -DskipTests spring-boot:run` muestra que Flyway aplicó V1 y V2 y la aplicación arranca **sin errores de validación de esquema**. Además: `git diff origin/main -- backend/pom.xml backend/src/main/resources/` vacío (no se tocó configuración ni migraciones para "probar sin base").
- Commit si hubo correcciones: `fix: ajustar entidades al esquema V1`

**B2. Seguridad JWT y errores** — *terminado (commit `41312f0`)*
- Objetivo: login, filtro JWT, matriz de permisos del contrato (sección 7), `DataInitializer` idempotente, CORS, `@RestControllerAdvice` con el formato único de error (8.1), 401/403 en JSON.
- Archivos: `config/`, `seguridad/`, `excepcion/`, `web/AuthController`. jjwt 0.12.6.
- Verificación: login de `admin1` devuelve token; `GET /api/lotes` sin token → 401 JSON; `PATCH /api/lotes/CAC001/estado` con token de `operador1` → 403 JSON (aunque el endpoint aún sea mínimo). Reiniciar no duplica usuarios (`select count(*) from usuarios` = 2).
- Commit: `feat: agregar autenticación JWT, roles y formato único de errores`

**B3. Recepción, catálogos y filtros (RF01, RF11-filtro, cuota)** — *terminado (commit `8651a50`; corrección de `GET /api/lotes` sin filtros en `18b6a4d`)*
- Objetivo: `GET /api/config/reglas`, `GET /api/productores`, `POST /api/lotes` (código automático `CACnnn`, 409 duplicado, alerta CUOTA_EXCEDIDA, auditoría CREAR), `GET /api/lotes` con filtros, `GET /api/lotes/{codigo}`.
- Verificación: lote válido 201 y persiste tras reiniciar; cantidad −5 o campo vacío → 400 con `errores` por campo y nada guardado; código repetido → 409.
- Commit: `feat: agregar recepción y consulta de lotes con alerta de cuota`
- **→ Checkpoint 1: PR a `main`.**

**B4. Transformaciones (RF02, RF04, RF05, RF08, RF10, RF12)** — *terminado (commit `c124c83`, en `main` desde el Checkpoint 2)*
- Objetivo: `POST/GET /api/transformaciones` y `GET /api/transformaciones/{id}/balance` siguiendo **al pie de la letra** el orden transaccional de la sección 6 del contrato: idempotencia por `operacionUuid`, bloqueo pesimista, lote derivado `-Tn`, composición, alertas MERMA_ALTA / REGISTRO_INCOMPLETO / SOBRECOSTO, auditoría CONSUMO y CREAR. Cálculos en una clase pura `CalculadoraTransformacion` (sin Spring) con su prueba unitaria.
- Verificación: CAC001 100 → 80 da merma 20,00 %, alerta activa, `CAC001-T1` con 80 kg; balance 20.000 COP/kg y 20,00 %; reenvío con mismo UUID → 409 y el inventario no cambia; 120 kg sobre 100 → 422; salida 0 → `calculable: false`.
- Commit: `feat: agregar transformaciones con inventario, idempotencia, alertas y balance`

**B5. Trazabilidad, ficha pública, estado, alertas y auditoría (RF03, RF06, RF09, RF10)** — *terminado (commit `8f4e479`, en `main` desde el Checkpoint 2)*
- Objetivo: `GET .../trazabilidad` (consulta recursiva del contrato), `GET /api/public/ficha/{codigo}` con DTO de lista blanca, `PATCH .../estado` (motivo obligatorio, solo un lote por ahora), `GET /api/alertas`, `GET /api/auditoria`.
- Verificación: la ficha no contiene ningún campo prohibido (revisar el JSON crudo); operador recibe 403 al liberar; el cambio de admin aparece en auditoría.
- Commit: `feat: agregar trazabilidad, ficha pública, cambio de estado y consulta de auditoría`
- **→ Checkpoint 2: PR a `main`.**

**B6. Incidencia hora 12 y exportación (RF09 ajustado, RF11)** — *terminado (commit `13e29d8`, en `main` desde el Checkpoint 3)*
- Objetivo: bloqueo con `propagarADerivados`, `ORIGEN_BLOQUEADO` al liberar, `GET .../recall`, `GET /api/reportes/exportar-csv` (UTF-8 con BOM, `;`, decimales con coma).
- Verificación: bloquear CAC001 deja CAC001 y CAC001-T1 en BLOQUEADO; recall muestra Productor A, Rivera, 100/100/0 y 80 kg afectados; transformaciones y auditoría intactas; el CSV abre bien en Excel.
- Commit: `feat: agregar bloqueo en cascada, reporte de recall y exportación CSV`

**B7. Respaldo, restauración e integridad (RF07, prueba 6 del jurado)** — *terminado (commits `0912a5c` y `d6d7046`, en `main` desde el Checkpoint 3; modo Docker verificado por Juan David)*
- Objetivo:
  - `datos/scripts/verificar_integridad.sql`: conteo de lotes, transformaciones y auditoría; suma de kg recibidos, consumidos y disponibles; lista ordenada de códigos.
  - `datos/scripts/respaldar.{ps1,sh}` y `restaurar.{ps1,sh}` que **detectan el modo solos**: si el servicio `db` de docker compose está en ejecución, usan el contenedor (la carpeta `datos/` está montada en `/datos`); si no, usan `psql`, `pg_dump` y `pg_restore` nativos con host, puerto, usuario y base leídos del `.env` (clave por `PGPASSWORD`). Siempre escriben con `-f`, nunca con redirección `>` (en PowerShell corrompe binarios). El respaldo queda en `datos/respaldos/` en los dos modos.
  - Restaurar = detener backend, `DROP DATABASE ... WITH (FORCE)`, crear, `pg_restore --no-owner`, correr la verificación antes y después y comparar.
- Verificación (modo local): respaldar → crear un lote → restaurar → el lote nuevo desaparece y conteos, sumas y códigos coinciden; el backend reinicia sin error de Flyway; no hay usuarios duplicados. El modo Docker lo verifica Juan David en el Checkpoint 3.
- Commit: `feat: agregar scripts de respaldo, restauración y verificación de integridad`

**B8. Pruebas automatizadas (mínimo 5, objetivo 8)** — *terminado (commit `5ae4c56`, en `main` desde el Checkpoint 3; 50 pruebas en verde)*
- Ya hecho (desde el Checkpoint 1): perfil `test` en `backend/src/test/resources/application-test.yml` apuntando a `cacao_test`; `FlywayPruebasConfig` hace `clean()` + `migrate()` al iniciar la suite con un seguro que solo permite limpiar `cacao_test`; la anotación `@PruebaIntegracion` (`@SpringBootTest`, `@AutoConfigureMockMvc`, `@ActiveProfiles("test")`, `@Transactional`). Reglas para toda prueba nueva: usar `@PruebaIntegracion`; si una prueba necesita confirmar datos (por ejemplo, dos hilos para la idempotencia), crea su propio lote y comprueba sobre ese lote, nunca conteos globales; nunca apuntar las pruebas a la base `cacao`.
- Objetivo: además de la unitaria de B4, pruebas de integración con perfil `test` contra la base real `cacao_test` (contrato, sección 4). Flyway la limpia y migra al iniciar la suite (`spring.flyway.clean-disabled=false` solo en `application-test.yml` y una estrategia de migración que haga `clean()` + `migrate()`). Casos: inventario insuficiente, idempotencia (sin doble consumo), 403 del operador al liberar, ficha pública sin campos prohibidos, validación de cantidad negativa, **regresión hora 12** (bloqueo de CAC001 → ficha de CAC001-T1 BLOQUEADO y no disponible, historial conservado).
- Notas: la auditoría es solo inserción; no limpies datos con `deleteAll()` sobre ella (el trigger lo rechaza): usa `@Transactional` en las pruebas. Las dependencias de Testcontainers del `pom.xml` no se usan y se pueden quitar en este bloque.
- Verificación: `mvnw.cmd test` en verde; copia la salida real del resumen (pruebas, fallos, modo usado) para E05.
- Commit: `test: agregar pruebas automatizadas de reglas, permisos y regresión de la hora 12`
- **→ Checkpoint 3: PR a `main`.**

**B9 (opcional, si sobra tiempo).** — *terminado (commit `98f7201`, en `main` por #44; Swagger UI en `http://localhost:8080/swagger-ui/index.html`)* Swagger UI con springdoc compatible con Boot 3.5 para que el jurado pruebe la API. Commit: `feat: agregar documentación interactiva de la API`

**Migraciones adicionales (a pedido, en cualquier momento).** Si el frontend necesita un cambio de esquema: `V<n>__descripcion.sql`, probarla sobre una base restaurada, avisar en el grupo. Commit: `feat: agregar migración V<n> para <cambio>`

### 4.2 `feat/integracion` — Juan David Fierro Calderón (después del Checkpoint 3, MODO DOCKER)

Rama creada desde `main` cuando ya están integrados backend y frontend. Se trabaja en el PC de la demostración.

**I1. Rendimiento sobre 100 registros (E05)** — *terminado (commit `8d3bf6a`, en `main` por #45; p95 de 22,27 ms con 400 lotes)*
- Objetivo: `datos/rendimiento/cargar_100_registros.sql` (lotes `PERF001`–`PERF100`, cada uno con una cadena de 3 transformaciones y su composición, insertados por SQL y declarados como sintéticos), `limpiar_registros_rendimiento.sql` y `medir_trazabilidad.{ps1,sh}`: 5 llamadas de calentamiento y 30 medidas a `GET /api/lotes/PERF050-T3/trazabilidad` con `curl -w "%{time_total}"`, reportando mínimo, promedio, p95 y máximo. Añadir `EXPLAIN ANALYZE` de la consulta recursiva.
- Verificación: resultados reales guardados en `datos/rendimiento/resultados/medicion_<fecha>.txt` con CPU, RAM, sistema operativo y método. Meta: < 3000 ms.
- Commit: `test: agregar carga de 100 registros sintéticos y medición de trazabilidad`

**I2. Respaldo de demostración** — *terminado (commits `a11efcb` y `ec0f4f9`, en `main` por #45)*
- Objetivo: con todo integrado y la base limpia (V1 + V2 + usuarios), generar con los scripts de B7 `datos/respaldos/respaldo_demo.dump` y `datos/respaldos/LEEME.md` con pasos de restauración y la salida esperada de la verificación.
- Verificación: restauración desde cero reproduce los conteos del LEEME.
- Commit: `chore: agregar respaldo de demostración verificado`

**I3. Cierre** — *en curso: README, `ENTREGA.md` y `pitch/` en `main` por #45; faltan la instalación limpia de Juan Manuel y el hash final*
- Objetivo: README final con instalación limpia en los dos modos, `ENTREGA.md` con índice y matriz, y `pitch/` con la presentación y el guion (los preparó Claude Code a pedido de Juan David; Juan Manuel los ensaya y presenta).
- Verificación: Juan Manuel clona desde cero en su PC y sigue el README al pie de la letra; lo que falle se corrige en el README.
- Commit: `docs: completar README e índice de entrega`

### 4.3 `feat/frontend-ui` — Juan David Fierro Calderón (frontend, MODO DOCKER)

Paleta: Café Cacao `#3E2723`, Ámbar Mazorca `#D97706`, Verde Origen `#15803D`, Fondo Crema `#FDFBF7` (como tokens en `@theme` de Tailwind v4). Mobile-first para operador y ficha pública; escritorio para administrador.

**F1. Base, sesión y cliente de API** — *terminado (commit b34b14e)*

**F2. Recepción de lotes (RF01)** — *terminado (commit `90ee174`; validado contra la API real en el Checkpoint 1)*
- Objetivo: formulario con productor (muestra finca, municipio, cuota y entregado en el año), fecha, tipo de grano, humedad y cantidad; errores por campo devueltos por la API junto a cada input; al guardar, muestra el código asignado, la alerta de cuota si la hubo y enlace a la trazabilidad.
- Verificación: en 360 px de ancho es usable; cantidad −5 muestra el mensaje del backend (o de la simulación) y no navega.
- Commit: `feat: agregar formulario de recepción de lotes`
- **→ Checkpoint 1: PR a `main`.** Desde aquí, login y lotes contra la API real.

**F3. Transformación + diferenciador (RF02, RF08)** — *terminado (commit `9e2d9a6`); verificado contra la API real de B4 el 16/10 (100 → 80, 409 del reenvío y 422)*
- Objetivo: selector de lote (solo con disponible > 0 y no BLOQUEADO, mostrando el disponible), etapas desde `/api/config/reglas`, **semáforo de merma en vivo** (verde < 10 %, ámbar 10 %–umbral, rojo > umbral; el umbral viene de la API y el texto dice "vista previa"), **chips de incidencia en 1 clic** que agregan texto a la justificación (el chip "Adición de insumos" abre el campo `insumosAgregados`), costos opcionales. Ciclo de `operacionUuid` del contrato 8.5. Tras un registro exitoso, botón **"Reenviar la misma operación"** que reenvía el mismo cuerpo y UUID para demostrar la idempotencia (muestra el 409 de forma amigable).
- Verificación: con simulaciones antes de B4 y contra la API real después: 100 → 80 muestra merma oficial 20,00 % y la alerta; 120 sobre 100 muestra el 422; el reenvío muestra el 409 y el inventario sigue igual.
- Commit: `feat: agregar registro de transformación con semáforo de merma y chips de incidencia`

**F4. Panel del administrador (RF04, RF05, RF11, RF12)** — *terminado (commit `d4a2a20`); verificado contra la API real de B4 y B5; el CSV, solo con simulaciones hasta que entre B6*
- Objetivo: inventario (recibido, consumido, disponible) con filtros por origen y estado; alertas con regla y causa; balance de cada transformación con las fórmulas tal como llegan de la API y **simulador de precio** (llama a `balance?precioVentaCop=`, no calcula en el navegador); descarga CSV.
- Verificación: cambiar el precio a 30.000 cambia el margen calculado por el backend; el CSV descarga.
- Commit: `feat: agregar panel del administrador con inventario, alertas, balance y CSV`
- **→ Checkpoint 2: PR a `main`.**

**F5. Trazabilidad, ficha pública y QR (RF03, RF06)** — *terminado (commit `478b078`, en `main` desde el Checkpoint 3; QR escaneado con un celular el 16/10 a las 05:15)*
- Objetivo: línea de tiempo interna (`/lotes/:codigo/trazabilidad`); **Pasaporte Digital** público en `/ficha/:codigoLote` sin login, con estado destacado (BLOQUEADO en rojo con advertencia, nunca como disponible), origen y recorrido; QR con `qrcode.react` apuntando a la URL del contrato (sección 4).
- Verificación: el QR escaneado desde un celular en la misma red abre la ficha; la ficha no muestra ningún dato interno.
- Commit: `feat: agregar línea de trazabilidad, ficha pública y código QR`

**F6. Estado, recall y auditoría (RF09, RF10, hora 12)** — *terminado (commit `915f515`, en `main` desde el Checkpoint 3)*
- Objetivo: botones Bloquear/Liberar con motivo obligatorio en la vista de trazabilidad. **Visibles también para el operador**: el backend responde 403 y la UI muestra "Solo el Administrador puede liberar o bloquear lotes" (así se demuestra que el control está en el servidor). Vista de recall y visor de auditoría (solo lectura).
- Verificación: operador → mensaje 403; admin bloquea CAC001 → ficha de CAC001-T1 en BLOQUEADO; la auditoría muestra quién, cuándo, valor anterior y nuevo.
- Commit: `feat: agregar control de estado, reporte de recall y visor de auditoría`
- **→ Checkpoint 3: PR a `main`.**

**F7. Accesibilidad y mejora por usabilidad (E06)** — *contraste terminado (commit `3891452`); falta la mejora que salga de la prueba con la persona externa*
- Objetivo: `label` en cada campo, foco visible y navegación con teclado, contraste legible (revisar la insignia "Pendiente"), vista móvil a 360 px, y la mejora concreta que salga de la prueba con la persona externa (capturas antes/después).
- Hecho: textos naranjas a `mazorca-oscuro`, secundarios a `cacao/70` y placeholders al 70 % (de 2,41–4,18:1 a 4,79–5,78:1, medidos en el navegador). Tabla y capturas en `prompts/frontend/F7.md` y `evidencias_para_juan_manuel/E06/`.
- Commit: `fix: aplicar mejoras de la prueba de usabilidad`

**F8A–F8C. Identidad visual** — *terminados (commits `c7fa4e7` preparación, `000e8f1` F8A, `50588ef` F8B y `ecaa41e` F8C)*
- Guía en `frontend/DISENO.md`; prompts y revisión en `prompts/frontend/F8A.md`, `F8B.md` y `F8C.md`. Recursos optimizados en `frontend/public/assets/` (los originales pesados quedaron fuera del repositorio).
- F8A: tokens, Barlow y Barlow Condensed, logo en el marco y login con video (botón de pausa y movimiento reducido). F8B: página de inicio pública en `/` sin sesión, con la consulta de lotes. F8C: la traza animada en la trazabilidad y la ficha, y el sello del estado.
- Sin `viewTransition`: `BrowserRouter` no la aplica y cambiar a `createBrowserRouter` tocaría las rutas.

### 4.4 Juan Manuel Villalba Rincón — documentación, verificación y pitch (sin agente de código)

No tiene bloques de código ni usa agy para programar. Sus tareas, en orden:
- **Hasta el Checkpoint 2:** leer `docs/CONTRATO_TECNICO.md`, este archivo y cada documento E01–E10 a medida que se generen, y anotar toda diferencia entre lo documentado y lo construido.
- **Desde el Checkpoint 2:** ejecutar en el PC de Juan David los casos de prueba manuales (contrato, sección 10) y registrar esperado, obtenido, estado y evidencia **reales**.
- **Mañana temprano:** conseguir a la persona externa y conducir la prueba de usabilidad (E06): dos tareas sin guía, tiempos, dificultades.
- **Cierre:** instalación limpia desde cero en su PC siguiendo el README (bloque I3).
- **Pitch (E09):** presenta el pitch. La presentación (`pitch/E09_presentacion.pdf`) y el guion (`pitch/E09_guion.md`) ya están en `main`; los preparó Claude Code porque él no tenía los archivos. Le toca ensayarlos al menos 3 veces con cronómetro. No tiene rama ni hace commits.

## 5. Flujo según la herramienta

### 5A. Si eres Claude Code (Juan David, `feat/frontend-ui`, `feat/integracion` y ajustes en `main`)

## Flujo de trabajo por defecto

1. Para cualquier tarea nueva, piensa y diseña toda la lógica de 
   implementación antes de proponer tocar código.
2. Una vez el plan esté aprobado, NO implementes el código tú mismo. 
   Delega la implementación a Antigravity (agy) vía `agy -p "..."`, 
   sin importar si la tarea es pesada o liviana, para no consumir 
   el cupo de uso de Claude. No uses subagentes en modelo Haiku.
3. Solo si la tarea es muy corta/trivial (pocos pasos, edición 
   mínima), hazla tú mismo directamente sin pasar por agy.
4. Dale a cada delegación a agy una instrucción completa y 
   autocontenida, ya que no comparte el contexto de esta conversación.
5. Tú coordinas y revisas el resultado al final.
6. Ejecuta agy con el modelo de mayor capacidad disponible para la 
   cuenta (confirmado vía `agy models`) y con 
   `--dangerously-skip-permissions` — sin restricción de sandbox 
   ni de accept-edits.
7. agy nunca hace commit ni push — eso queda para ti, siguiendo 
   las reglas de cada proyecto. Después de cada delegación, revisa 
   `git status` y el diff antes de aceptar el resultado.

Complemento para este proyecto: en cada delegación a agy incluye la ruta del contrato (`docs/CONTRATO_TECNICO.md`), el bloque exacto, la lista de archivos permitidos y la verificación esperada. Los cambios de documentación y configuración en `main` son triviales: hazlos tú directamente.

### 5B. Si eres agy (Miguel en `feat/backend-api`)

- Implementa tú mismo el bloque indicado; no delegues a otras herramientas.
- No hagas commit ni push. Al terminar, deja el árbol listo para que el integrante revise `git diff`.
- Si el bloque exige un cambio fuera de tus carpetas o en el contrato, detente y descríbelo en vez de hacerlo.
- Si no hay base de datos disponible, no busques atajos (H2, desactivar Flyway, cambiar `ddl-auto`): detente y avisa.

## 6. Ritmo de trabajo

- Un bloque a la vez. Al terminarlo: ejecuta su verificación, y responde en la terminal con este formato y **detente** hasta que el integrante confirme:

```
Bloque <id> terminado.
Qué cambió: <archivos y propósito, breve>
Cómo lo verifiqué: <comando exacto> → <resultado real obtenido>
Limitaciones o pendientes: <o "ninguna">
Commit sugerido: <mensaje>
```

- Explica el **porqué** de las decisiones técnicas no obvias (bloqueo pesimista, DTO de lista blanca, BigDecimal, etc.): el equipo debe defender el código ante el jurado.
- Si la verificación falla o no se pudo ejecutar, dilo tal cual y propone la corrección; no marques el bloque como terminado.
- Antes de cada checkpoint: `git fetch origin && git merge origin/main`, vuelve a verificar y luego abre el PR.

## 7. Entorno por integrante y modo de base de datos

| Integrante | Modo | Base de datos |
|---|---|---|
| Miguel | **MODO LOCAL** | PostgreSQL ya instalado en su PC; usuario, clave y puerto en su `.env` |
| Juan David | **MODO DOCKER** | `docker compose up -d` (puerto 5433). Es el PC de la demostración |
| Juan Manuel | — | Usa el PC de Juan David para pruebas manuales; para la instalación limpia, el modo que tenga su PC |

- **MODO DOCKER:** los comandos de base de datos van por `docker compose exec -T db psql -U cacao -d cacao ...` y la carpeta `datos/` está en `/datos` dentro del contenedor.
- **MODO LOCAL:** los mismos comandos con las herramientas nativas: `psql -h localhost -p %DB_PORT% -U cacao -d cacao -f datos\scripts\<archivo>.sql`, con la clave en la variable de entorno `PGPASSWORD` (tomada del `.env`, nunca escrita en un archivo versionado). `pg_dump` debe ser de la misma versión mayor que el servidor. Si Flyway advierte que la versión del servidor es más nueva que la soportada, se reporta pero no bloquea.
- Base de pruebas `cacao_test`: se crea una vez en cada modo (contrato, sección 4).
- Ningún agente instala ni reconfigura PostgreSQL o Docker. Si algo no está, se detiene y avisa.

## 8. Estado actual y aprendizajes (se actualiza en cada checkpoint)

**Estado al 16/10, 06:45**
- **Checkpoints cerrados:**
  - **CP1:** 15/10 a las 23:07, `main` `493571e` (PR #1–#3).
  - **CP2:** 01:01, `main` `7c281cc` (PR #40 y #41; 37/37 pruebas y 34 comprobaciones por API).
  - **CP3:** 05:01, `main` `e183fca` (PR #42 B6–B8 con la corrección `d6d7046`, PR #43 F5–F6; 50/50 pruebas, B6 57/57 por API, regresión 34/34, prueba 6 en PowerShell y bash, CSV abierto en Excel).
- **Después del CP3:**
  - **PR #44 (B9, Swagger):** `main` `18d9d40`, 52/52 pruebas.
  - **PR #45 (integración):** `main` `e22780b`, con I1, I2 y la parte hecha de I3.
    - I1: p95 de 22,27 ms (PowerShell) y 21,64 ms (bash) con 400 lotes.
    - I2: `respaldo_demo.dump` verificado, y `restaurar.*` acepta el reporte con o sin BOM (`a11efcb`).
    - I3: README, `ENTREGA.md`, `pitch/E09_presentacion.pdf` y `pitch/E09_guion.md`.
- **16/10, 07:37–08:20, en `feat/frontend-ui` (pendiente de push y PR):** F8A, F7 (contraste), F8B y F8C, con build, lint, los tres grep, revisión en el navegador a 1280 y 360 px, movimiento reducido emulado y el recorrido de la demo del pitch por la interfaz; después se restauró `respaldo_demo.dump` con "INTEGRIDAD CONFIRMADA".
- **Ramas:** `feat/backend-api` `98f7201` (todo en `main`); `feat/frontend-ui` `48a8b78` (sus registros de `CLAUDE.md` entran a `main` con el PR de este cierre); `feat/integracion` es la rama de trabajo actual.
- **Tablero:**
  - Done: Bloque 0, B1–B9, F1–F6, I1, I2 y la hora 12 (#38).
  - In Progress: I3 (#23), JM5 pitch (#28), E07 (#34), E09 (#36) y E10 (#37).
  - Todo: F7 (#20), JM1–JM4 (#24–#27), E01–E03, E05, E06 y E08.
  - Regla: al integrar cada PR, sus issues pasan a Done con un comentario de evidencia.
- **Pendiente antes de la congelación de las 11:00:**
  - F7: el contraste ya está; falta la mejora que salga de la prueba de usabilidad de Juan Manuel (#26).
  - Push de `feat/frontend-ui` y PR a `main` con F8A–F8C y F7 (Juan David), antes de las 10:30.
  - Instalación limpia de Juan Manuel siguiendo el README (#27), corrigiendo el README con lo que falle.
  - Ensayos del pitch: presenta Juan Manuel y opera la aplicación Juan David. La demo usa el Productor C (250 kg) y **nunca CAC001**.
  - Los PDF de `documentos/` (E01–E03, E05–E08 y `E09_piloto.pdf`), que redacta el equipo (máximo 15 páginas en total).
- **Después:**
  - A las 12:00, etiqueta `v1.0-entrega` sobre `main` y su hash en `ENTREGA.md`.
  - Classroom a la 1:00 p. m.; registro del commit a las 2:00 p. m.
  - Antes de la evaluación: restaurar `respaldo_demo.dump` y cambiar la clave y el `JWT_SECRET` del `.env` del PC de la demostración.
- **Base de desarrollo de Juan David:** en el estado limpio de la demo (3 lotes, 0 auditoría, 2 usuarios). Los lotes de prueba anteriores (CAC004–CAC008) están en un respaldo de seguridad fuera del repositorio. La base `cacao_test` existe en su Docker.
- **QR:** `VITE_PUBLIC_BASE_URL=http://192.168.1.222:5173` en el `.env`. Funcionó con la Wi-Fi de la universidad sin tocar el firewall, porque la regla de Node permite el perfil Público.
- **Hora 12 (issue #38, cerrado):** a las 02:00 la organización pidió a Juan Manuel un entregable de documentación para Classroom, sin cambios en el software. Se subió la carpeta `Evidencia2am` (en `Hackaton_II/`, fuera del repositorio; sus archivos son exactamente los subidos). RF09 no cambió.
- **Evidencia fuera del repositorio:** `Hackaton_II/evidencias_para_juan_manuel/` guarda el historial y la validación de los checkpoints 1–3, la validación del backend del CP3 y los insumos de E02, E03 y E05. El estado para redactar la documentación está en `prompts/integracion/estado-para-documentacion.md`.
- **Pitch:** la presentación original está en claude.ai, es privada y hay que compartirla con Juan Manuel (tiene las notas del orador). Los costos son supuestos con fuente: servidor de 2 vCPU y 4 GB a ≈ 24 USD al mes, TRM ≈ 3.200 COP.
- **Material visual en `frontend/public/assets/`:** desde F8 se versionan los 18 recursos optimizados (con `binary` en su `.gitattributes`). Los originales pesados (logo, videos y fotos de 3–5 MB) están fuera del repositorio, en `Hackaton_II/F8/originales/`. Para E08: Miguel usó agy con Gemini 4 Argon, Claude Opus 5.5 y Gemini 3.8 Flash, con esfuerzo máximo (informado por Juan David el 16/10; detalle en `prompts/integracion/estado-para-documentacion.md`, sección 10); imágenes y videos generados con IA (falta anotar la herramienta y el modelo); skills `frontend-design` (Anthropic) y `web-design-guidelines` (Vercel) en `.claude/skills/` y `.agents/skills/`, y fuentes Barlow y Barlow Condensed (SIL OFL 1.1).
- **Cuota de agy:** los modelos Claude de agy agotaron su cuota el 15/10 hacia las 20:33, y el 16/10 a las 07:41 `claude-opus-5-5-high` seguía sin cuota (se restablece en unas 124 horas). Desde F8 las delegaciones usan `gemini-4-argon-high`, el modelo de más capacidad disponible, y su resultado se revisa con más cuidado.

**Aprendizajes del frontend (aplican de F4 en adelante)**
- Nunca reemplazar una página por "Cargando…" o por un error si ya hay datos: el estado de carga se muestra solo con `cargando && !datos`, para que una recarga en segundo plano no oculte la confirmación ni le quite el foco.
- Para enfocar un campo dentro de una sección que se acaba de abrir (`<details>`) o tras cambiar de vista, hacerlo en el siguiente ciclo (`setTimeout(..., 0)`).
- Cada endpoint nuevo se implementa también en `api/simulaciones.js` con las formas exactas del contrato antes de que exista en el backend. Las simulaciones se cargan con import dinámico y nunca entran al build normal; se comprueba con `grep` sobre `dist/`.
- Ningún comentario de código nombra archivos de agentes ni herramientas (incluido este archivo). Revisar con `grep -rniE '\b(IA|AI|claude|anthropic|gemini|antigravity|agy)\b' frontend/src` antes de cada commit.
- Entradas numéricas: `leerDecimal` para kg y porcentajes ("120,5") y `leerMonto` para pesos ("1.600.000"). Identificadores de operación con `utilidades/uuid.js` (`crypto.randomUUID` no existe por http desde el celular).
- Los textos de las alertas los arma el backend y no coinciden palabra por palabra con los de la simulación: la interfaz muestra siempre lo que llega de la API.
- Verificación en el navegador: Chrome no deja la ventana por debajo de 502 px; los 360 px se prueban cargando la ruta dentro de un `iframe` de 360 px en la misma pestaña.
- Si una página depende de un parámetro de ruta (código de lote), su contenido se monta con `key={codigo}`: así, al pasar de un lote a otro o volver atrás, nunca se ven los datos del anterior bajo el código nuevo. La regla `cargando && !datos` es solo para recargas del mismo recurso.
- La ficha pública llama con `api.getPublico` (sin token y sin cerrar sesión ante un 401).
- Antes de delegar un bloque, revisar el código real del backend que va a consumir (DTO, textos y casos borde) y ajustar el diseño y las simulaciones a eso, no solo al contrato: en F4 el balance tenía casos no calculables que el contrato no describía.
- Con B4 o B5 recién subidos, el frontend se puede probar contra la rama del backend levantándola en una copia temporal (`git worktree`) sobre la base de desarrollo, sin esperar al PR.

**Entorno Windows**
- `core.autocrlf=true`: la copia de trabajo queda en CRLF y el repositorio en LF. Los scripts que editan archivos deben aceptar `\r\n`.
- No usar `python` en la terminal (abre el instalador de Microsoft Store); para scripts, `node`.
- Al detener Vite o el backend lanzados en segundo plano, cerrar también el proceso `node` o `java` que escucha en 5173 u 8080; detener la tarea no basta.
- Las copias temporales con `git worktree` dejan `target/` con rutas muy largas: borrarlas con el prefijo `\\?\` en PowerShell.
- **PowerShell 5.1 y `curl.exe`:** al pasar un JSON como argumento, PowerShell 5.1 le quita las comillas internas y el backend responde 400. Para las peticiones que no se miden, usar `Invoke-RestMethod`. Tampoco acepta `if` como expresión dentro de un argumento: hay que asignarlo antes a una variable.
- **Git Bash y `curl`:** el `curl` de Git Bash es un programa de Windows. Con `MSYS_NO_PATHCONV=1` (necesario para las rutas `/datos` del contenedor) no entiende `/tmp/...` ni `/dev/null` en `-o`: pasarle las rutas con `cygpath -w`.
- **BOM:** `Set-Content -Encoding utf8` de PowerShell 5.1 escribe BOM, y `Get-Content` sin `-Encoding UTF8` lee mal los acentos de un archivo sin BOM. Los reportes de integridad se comparan quitando el BOM y leyendo siempre como UTF-8.
- **Binarios en git:** los `.dump` llevan `binary` en `datos/respaldos/.gitattributes`. Después del commit se comprueba que el archivo en git sea idéntico al generado (`git show HEAD:<ruta> | sha256sum`).
- **Excel:** el CSV se verifica abriéndolo por COM con la configuración regional (`Workbooks.Open`, con `Local` en el parámetro 14).
- **Navegador:** la extensión de Chrome no abre archivos `file://`; un PDF local se revisa con node (encabezado y conteo de páginas). Las descargas de la aplicación se prueban interceptando el enlace en la página, sin guardar archivos.
- **Navegador sin ventana por CDP:** el 16/10 la extensión de Chrome dejó de entregar clics y teclas a la página. La alternativa es Edge con `--headless=new --remote-debugging-port` y un perfil temporal, manejado desde node (WebSocket nativo, sin dependencias): clics y teclas reales (`Input.dispatchMouseEvent`, `Input.dispatchKeyEvent`, `Input.insertText`), anchos exactos (`Emulation.setDeviceMetricsOverride`), movimiento reducido (`Emulation.setEmulatedMedia` con `prefers-reduced-motion: reduce`) y capturas (`Page.captureScreenshot`). La sesión se pone en `sessionStorage` (`cacao.sesion`) o se entra por la interfaz. No toca la configuración del sistema.
- **CSS y animación:** una regla de movimiento reducido debe tener al menos la especificidad de la regla animada (a `lg`, `ol.traza.traza-horizontal::before` le ganaba). Una animación que escala por encima de 1 una tarjeta de ancho completo deja scroll horizontal a 360 px aunque termine en 1: se comprueba `scrollWidth` después de la animación. En Tailwind v4, un placeholder sin clase hereda el 50 % del color del texto (3,14:1 sobre blanco); la regla base de `index.css` lo sube al 70 %.
- **Registros:** las horas de los archivos de `prompts/` se toman con `date` en el momento, nunca aproximadas.
