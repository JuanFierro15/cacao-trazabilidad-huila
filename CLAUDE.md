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

**B6. Incidencia hora 12 y exportación (RF09 ajustado, RF11)**
- Objetivo: bloqueo con `propagarADerivados`, `ORIGEN_BLOQUEADO` al liberar, `GET .../recall`, `GET /api/reportes/exportar-csv` (UTF-8 con BOM, `;`, decimales con coma).
- Verificación: bloquear CAC001 deja CAC001 y CAC001-T1 en BLOQUEADO; recall muestra Productor A, Rivera, 100/100/0 y 80 kg afectados; transformaciones y auditoría intactas; el CSV abre bien en Excel.
- Commit: `feat: agregar bloqueo en cascada, reporte de recall y exportación CSV`

**B7. Respaldo, restauración e integridad (RF07, prueba 6 del jurado)**
- Objetivo:
  - `datos/scripts/verificar_integridad.sql`: conteo de lotes, transformaciones y auditoría; suma de kg recibidos, consumidos y disponibles; lista ordenada de códigos.
  - `datos/scripts/respaldar.{ps1,sh}` y `restaurar.{ps1,sh}` que **detectan el modo solos**: si el servicio `db` de docker compose está en ejecución, usan el contenedor (la carpeta `datos/` está montada en `/datos`); si no, usan `psql`, `pg_dump` y `pg_restore` nativos con host, puerto, usuario y base leídos del `.env` (clave por `PGPASSWORD`). Siempre escriben con `-f`, nunca con redirección `>` (en PowerShell corrompe binarios). El respaldo queda en `datos/respaldos/` en los dos modos.
  - Restaurar = detener backend, `DROP DATABASE ... WITH (FORCE)`, crear, `pg_restore --no-owner`, correr la verificación antes y después y comparar.
- Verificación (modo local): respaldar → crear un lote → restaurar → el lote nuevo desaparece y conteos, sumas y códigos coinciden; el backend reinicia sin error de Flyway; no hay usuarios duplicados. El modo Docker lo verifica Juan David en el Checkpoint 3.
- Commit: `feat: agregar scripts de respaldo, restauración y verificación de integridad`

**B8. Pruebas automatizadas (mínimo 5, objetivo 8)** — *infraestructura adelantada en `9f2566d`; faltan los casos*
- Ya hecho (desde el Checkpoint 1): perfil `test` en `backend/src/test/resources/application-test.yml` apuntando a `cacao_test`; `FlywayPruebasConfig` hace `clean()` + `migrate()` al iniciar la suite con un seguro que solo permite limpiar `cacao_test`; la anotación `@PruebaIntegracion` (`@SpringBootTest`, `@AutoConfigureMockMvc`, `@ActiveProfiles("test")`, `@Transactional`). Reglas para toda prueba nueva: usar `@PruebaIntegracion`; si una prueba necesita confirmar datos (por ejemplo, dos hilos para la idempotencia), crea su propio lote y comprueba sobre ese lote, nunca conteos globales; nunca apuntar las pruebas a la base `cacao`.
- Objetivo: además de la unitaria de B4, pruebas de integración con perfil `test` contra la base real `cacao_test` (contrato, sección 4). Flyway la limpia y migra al iniciar la suite (`spring.flyway.clean-disabled=false` solo en `application-test.yml` y una estrategia de migración que haga `clean()` + `migrate()`). Casos: inventario insuficiente, idempotencia (sin doble consumo), 403 del operador al liberar, ficha pública sin campos prohibidos, validación de cantidad negativa, **regresión hora 12** (bloqueo de CAC001 → ficha de CAC001-T1 BLOQUEADO y no disponible, historial conservado).
- Notas: la auditoría es solo inserción; no limpies datos con `deleteAll()` sobre ella (el trigger lo rechaza): usa `@Transactional` en las pruebas. Las dependencias de Testcontainers del `pom.xml` no se usan y se pueden quitar en este bloque.
- Verificación: `mvnw.cmd test` en verde; copia la salida real del resumen (pruebas, fallos, modo usado) para E05.
- Commit: `test: agregar pruebas automatizadas de reglas, permisos y regresión de la hora 12`
- **→ Checkpoint 3: PR a `main`.**

**B9 (opcional, si sobra tiempo).** Swagger UI con springdoc compatible con Boot 3.5 para que el jurado pruebe la API. Commit: `feat: agregar documentación interactiva de la API`

**Migraciones adicionales (a pedido, en cualquier momento).** Si el frontend necesita un cambio de esquema: `V<n>__descripcion.sql`, probarla sobre una base restaurada, avisar en el grupo. Commit: `feat: agregar migración V<n> para <cambio>`

### 4.2 `feat/integracion` — Juan David Fierro Calderón (después del Checkpoint 3, MODO DOCKER)

Rama creada desde `main` cuando ya están integrados backend y frontend. Se trabaja en el PC de la demostración.

**I1. Rendimiento sobre 100 registros (E05)**
- Objetivo: `datos/rendimiento/cargar_100_registros.sql` (lotes `PERF001`–`PERF100`, cada uno con una cadena de 3 transformaciones y su composición, insertados por SQL y declarados como sintéticos), `limpiar_registros_rendimiento.sql` y `medir_trazabilidad.{ps1,sh}`: 5 llamadas de calentamiento y 30 medidas a `GET /api/lotes/PERF050-T3/trazabilidad` con `curl -w "%{time_total}"`, reportando mínimo, promedio, p95 y máximo. Añadir `EXPLAIN ANALYZE` de la consulta recursiva.
- Verificación: resultados reales guardados en `datos/rendimiento/resultados/medicion_<fecha>.txt` con CPU, RAM, sistema operativo y método. Meta: < 3000 ms.
- Commit: `test: agregar carga de 100 registros sintéticos y medición de trazabilidad`

**I2. Respaldo de demostración**
- Objetivo: con todo integrado y la base limpia (V1 + V2 + usuarios), generar con los scripts de B7 `datos/respaldos/respaldo_demo.dump` y `datos/respaldos/LEEME.md` con pasos de restauración y la salida esperada de la verificación.
- Verificación: restauración desde cero reproduce los conteos del LEEME.
- Commit: `chore: agregar respaldo de demostración verificado`

**I3. Cierre**
- Objetivo: README final con instalación limpia en los dos modos, `ENTREGA.md` con índice y matriz, y subir a `pitch/` los archivos que entrega Juan Manuel.
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

**F5. Trazabilidad, ficha pública y QR (RF03, RF06)** — *terminado (commit `478b078`, subido a `feat/frontend-ui`, entra a `main` en el PR del Checkpoint 3); falta escanear el QR con un celular*
- Objetivo: línea de tiempo interna (`/lotes/:codigo/trazabilidad`); **Pasaporte Digital** público en `/ficha/:codigoLote` sin login, con estado destacado (BLOQUEADO en rojo con advertencia, nunca como disponible), origen y recorrido; QR con `qrcode.react` apuntando a la URL del contrato (sección 4).
- Verificación: el QR escaneado desde un celular en la misma red abre la ficha; la ficha no muestra ningún dato interno.
- Commit: `feat: agregar línea de trazabilidad, ficha pública y código QR`

**F6. Estado, recall y auditoría (RF09, RF10, hora 12)**
- Objetivo: botones Bloquear/Liberar con motivo obligatorio en la vista de trazabilidad. **Visibles también para el operador**: el backend responde 403 y la UI muestra "Solo el Administrador puede liberar o bloquear lotes" (así se demuestra que el control está en el servidor). Vista de recall y visor de auditoría (solo lectura).
- Verificación: operador → mensaje 403; admin bloquea CAC001 → ficha de CAC001-T1 en BLOQUEADO; la auditoría muestra quién, cuándo, valor anterior y nuevo.
- Commit: `feat: agregar control de estado, reporte de recall y visor de auditoría`
- **→ Checkpoint 3: PR a `main`.**

**F7. Accesibilidad y mejora por usabilidad (E06)**
- Objetivo: `label` en cada campo, foco visible y navegación con teclado, contraste legible (revisar la insignia "Pendiente"), vista móvil a 360 px, y la mejora concreta que salga de la prueba con la persona externa (capturas antes/después).
- Commit: `fix: aplicar mejoras de la prueba de usabilidad`

### 4.4 Juan Manuel Villalba Rincón — documentación, verificación y pitch (sin agente de código)

No tiene bloques de código ni usa agy para programar. Sus tareas, en orden:
- **Hasta el Checkpoint 2:** leer `docs/CONTRATO_TECNICO.md`, este archivo y cada documento E01–E10 a medida que se generen, y anotar toda diferencia entre lo documentado y lo construido.
- **Desde el Checkpoint 2:** ejecutar en el PC de Juan David los casos de prueba manuales (contrato, sección 10) y registrar esperado, obtenido, estado y evidencia **reales**.
- **Mañana temprano:** conseguir a la persona externa y conducir la prueba de usabilidad (E06): dos tareas sin guía, tiempos, dificultades.
- **Cierre:** instalación limpia desde cero en su PC siguiendo el README (bloque I3).
- **Pitch (E09):** prepara la presentación y el guion, los entrega a Juan David, que los sube a `pitch/` en I3. No tiene rama ni hace commits.

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

**Estado al 16/10, 04:05**
- **Checkpoint 1 cerrado** el 15/10 a las 23:07 sobre `main` `493571e` (PR #1 B1–B3, PR #2 F1–F3, PR #3 corrección de lotes y pruebas en `cacao_test`).
- **Checkpoint 2 cerrado** a la 01:01 sobre `main` `7c281cc` (PR #40 B4–B5, PR #41 F4 y F3 validado contra la API real). Validado en el PC de Juan David sin simulaciones: `mvnw test` 37/37 contra `cacao_test`; pruebas 3, 4, 5, 7 y 9 del contrato por API (34 comprobaciones, 0 fallidas) más la regresión del Checkpoint 1; inventario, alertas y balance en el navegador.
- La evidencia de cada checkpoint (historial de git y salida real de la validación) se guarda fuera del repositorio, en la carpeta hermana `evidencias_para_juan_manuel/`, para la documentación (E02 y E05).
- **Tablero (E02):** GitHub Projects "KGB — Asoprocacao (Hackathon USCO)", un issue por bloque (#4 a #38). Al integrar cada PR, sus issues pasan a Done y se cierran con un comentario que cita commits, PR y verificación real.
- **Después del Checkpoint 2:** F5 terminado y subido (`478b078`, trazabilidad interna, ficha pública sin sesión, consulta por código y QR; el QR se decodificó en el navegador con la URL de la red). Para escanearlo desde un celular: `VITE_PUBLIC_BASE_URL=http://<IP-del-PC>:5173` en el `.env` (hoy la IP es `192.168.1.222`) y el puerto 5173 permitido en el firewall de Windows.
- **B6, B7 y B8:** ya están en `feat/backend-api`, sin PR: B6 `13e29d8` (bloqueo en cascada, recall y CSV), B7 `0912a5c` (respaldo, restauración e integridad) y B8 `5ae4c56` (pruebas automatizadas y regresión de la hora 12). Falta validarlos en el PC de Juan David (modo Docker) y abrir el PR del Checkpoint 3. F6 se construye sobre B6.
- **Entregables:** el 16/10 a la 01:50 se prepararon los insumos de E02, E03 y E05 (historias, tablero exportado, relación con commits y pruebas, diagramas Mermaid generados del código, 12 capturas reales, 28 casos ejecutados y las 37 pruebas JUnit) en `evidencias_para_juan_manuel/entregables/`, fuera del repositorio. Los PDF los redacta el equipo; E08 también. Faltan E01, E06, E07, E09 y E10, y completar lo que dependa de B6, B7, I1 y la hora 12. Registro en `prompts/integracion/insumos-entregables.md` (commit `0f928d9`).
- Siguiente: validar B6–B8 y F6 (Juan David); Juan Manuel con los casos manuales y la redacción. **Incidencia de la hora 12:** anotar la hora real, quién la recibió y qué se pidió en el issue #38. **Checkpoint 3 a las 06:00.**
- **Material visual en `frontend/public/assets/`** (logo de Asoprocacao y video de fondo del login): lo está subiendo Juan David para una mejora visual que se hará **después** de terminar todos los bloques de frontend y backend. Hasta que él lo pida, ningún agente lo usa, lo modifica, lo borra ni lo agrega a un commit (queda sin versionar).
- La base de desarrollo de Juan David tiene, además de la semilla, los lotes de prueba CAC004 a CAC008 y sus derivados (CAC004-T1, CAC006-T1, CAC007-T1, CAC008-T1), con alertas y auditoría; CAC007-T1 quedó BLOQUEADO y CAC008-T1 LIBERADO por pruebas. CAC001 sigue sin transformaciones. Antes de la demostración se restaura el respaldo limpio (I2). La base `cacao_test` ya existe en su Docker.
- **Cuota de agy:** los modelos Claude de agy agotaron su cuota el 15/10 hacia las 20:33 (se reinicia en unas 135 h). Las delegaciones siguen con `gemini-3.8-flash-high`; su resultado se revisa con más cuidado (F2 y F3 necesitaron correcciones a mano en la revisión).

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
