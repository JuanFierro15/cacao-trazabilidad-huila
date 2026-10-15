# CLAUDE.md — Hackathon "Cacao con historia, calidad y valor"

> Archivo de contexto para agentes, **versionado** como registro de uso de herramientas exigido por el reglamento del reto.
> - **Claude Code** lo lee directamente como `CLAUDE.md`.
> - **agy (Antigravity CLI)** lo lee a través de `GEMINI.md`, que lo importa con `@./CLAUDE.md`.
> Los tres integrantes usan este mismo archivo. Si cambia, el cambio entra a `main` por PR y cada rama hace `git fetch origin && git merge origin/main`.

@./docs/CONTRATO_TECNICO.md

---

## 0. Antes de cualquier tarea

1. Lee `docs/CONTRATO_TECNICO.md` completo. Es la fuente de verdad de API, base de datos, reglas de negocio, permisos y propiedad de carpetas. Si este archivo y el contrato se contradicen, manda el contrato.
2. Ejecuta `git branch --show-current`. **Tu rama define tu rol** (sección 4). Si estás en `main` y la tarea no es el Bloque 0 o una integración pedida explícitamente, detente y pregunta.
3. Identifica qué herramienta eres y aplica tu sección: Claude Code → 5A; agy → 5B.
4. Ejecuta solo el bloque que te indiquen. No adelantes bloques ni "mejores" cosas fuera de tu carpeta.

## 1. Contexto

- Evento: II Hackathon de Programación, II Feria Universitaria de CTeI del Huila (USCO, Semillero DEVURITY), 15 y 16 de octubre de 2026. 24 horas de construcción.
- Cliente simulado: Asociación de Productores de Cacao **Asoprocacao** (Campoalegre, Huila). Caso, organizaciones y datos son **sintéticos**.
- Producto: MVP que conecta recepción, transformación y comercialización de cacao con trazabilidad, inventario, alertas, balance económico, ficha pública con QR, auditoría y respaldo. Requisitos RF01–RF12.
- Equipo: Miguel Ángel Medina Díaz (backend), Juan Manuel Villalba Rincón (BD, datos y pitch), Juan David Fierro Calderón (frontend e integración).
- Plazos (16 de octubre): congelación interna y etiqueta `v1.0-entrega` a las **12:00**; documentos a Classroom a la **1:00 p. m.**; registro oficial del commit a las **2:00 p. m.**
- Diferenciadores: (1) control de plausibilidad por cuota de finca; (2) semáforo de merma en tiempo real + chips de incidencia en 1 clic para el operador, simulador de margen y reporte de recall para el administrador.

Cómo se califica (pesa en cada decisión): funcionamiento real RF01–RF12 = 25 pts; diseño y calidad técnica = 15; pruebas y confiabilidad = 15. Una pantalla con cifras fijas **no cuenta** como cumplimiento: el jurado cambia los valores. Son fallas críticas: perder registros, consumir más de lo disponible, exponer costos al público y permitir una liberación sin autorización.

## 2. Restricciones no negociables

- Las reglas de inventario, costos, estados y permisos se aplican en el **backend** (y en la BD cuando el esquema lo permite). El frontend nunca es la única barrera.
- Nada de resultados fijos en pantalla: todo número sale de la API.
- `ddl-auto=validate`. El esquema solo cambia con una migración Flyway nueva (`V3`, `V4`...) escrita por Juan Manuel. **Nunca** se edita una migración ya aplicada.
- La ficha pública usa un DTO de lista blanca (contrato 8.7). Nunca se serializa una entidad JPA hacia afuera.
- Cero secretos en el repositorio: credenciales solo en `.env` (ignorado). `.env.example` sin valores reales.
- Solo datos sintéticos. No inventes productores reales, entrevistas, resultados de pruebas, métricas ni capturas. Falsificar evidencia es causal de descalificación: si una prueba falla, se reporta como fallida.
- Cada integrante toca solo su carpeta (contrato, sección 1).
- No crees ni edites archivos de `documentos/` (E01–E09): esa documentación se redacta aparte.
- Mensajes de error para el usuario en español claro: qué pasó y qué hacer.

## 3. Reglas de git (siempre, sin excepción)

- Commits en español, formato Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`, `style:`.
- Un commit atómico por bloque, con el mensaje sugerido del bloque.
- Los mensajes de commit, los nombres de rama y los comentarios del código **no mencionan** IA, Claude, Anthropic, Gemini, Antigravity ni agy, y ningún commit lleva líneas `Co-authored-by`.
  - Los archivos de agentes (`CLAUDE.md`, `GEMINI.md`, `PLAN_BLOQUES.md`, `prompts/`, `.claude/settings.json`) **sí se versionan**, como registro de uso exigido por el reglamento del reto.
  - La declaración formal es `documentos/E08_IA_y_fuentes.md`, que declara las herramientas usadas **como herramientas, no como autores**. La redacta el equipo; ningún agente la crea ni la edita.
- **Registro de prompts.** Cada prompt de arranque de bloque o de delegación a agy se guarda, **antes de ejecutarlo**, en `prompts/<frontend|backend|datos>/<id-bloque>.md`, y se agrega una fila a `prompts/BITACORA.md` con fecha y hora, integrante, herramienta, bloque, archivos generados y revisión humana. El prompt y la fila de la bitácora se incluyen en el commit del bloque. Si un bloque tiene varias delegaciones, se acumulan en el mismo archivo, separadas por un encabezado con la hora.
- Segunda capa: `.claude/settings.json` (versionado, llega con el clon) fija `{"attribution": {"commit": "", "pr": ""}}` para que Claude Code no agregue co-autoría.
- Antes de `git add`, revisa `git status` y agrega solo archivos de tu carpeta. Nunca `git add -A` a ciegas.
- Nunca `git push --force` sobre ramas compartidas. Nunca push directo a `main` (salvo el Bloque 0): todo entra por PR.
- Para traer cambios de `main` a tu rama: `git fetch origin && git merge origin/main` (merge, no rebase, para no reescribir historia compartida).
- Quién hace commit: **agy nunca hace commit ni push**. Con agy directo (Miguel, Juan Manuel), el integrante revisa `git diff` y hace el commit. Con Claude Code (Juan David), Claude Code hace el commit tras revisar el diff y Juan David hace el push.

## 4. Rol según la rama

Cada bloque: objetivo → archivos → verificación → commit. No se pasa al siguiente sin verificación.

### 4.1 `feat/backend-api` — Miguel Ángel Medina Díaz

**B1. Dominio y persistencia**
- Objetivo: entidades JPA y repositorios que calcen exactamente con `V1` (validate pasa).
- Archivos: `backend/src/main/java/co/edu/usco/cacao/{dominio,repositorio}/**`. Enums: `Rol`, `TipoLote`, `TipoGrano`, `EstadoLote`, `Etapa`, `TipoAlerta` con `@Enumerated(EnumType.STRING)`. `@Version` en `Lote.versionOptimista`. Sin Lombok.
- Verificación: `docker compose up -d` y `./mvnw spring-boot:run` arrancan sin errores de validación de esquema.
- Commit: `feat: agregar entidades JPA y repositorios del dominio`

**B2. Seguridad JWT y errores**
- Objetivo: login, filtro JWT, matriz de permisos del contrato (sección 7), `DataInitializer` idempotente, CORS, `@RestControllerAdvice` con el formato único de error (8.1), 401/403 en JSON.
- Archivos: `config/`, `seguridad/`, `excepcion/`, `web/AuthController`. jjwt 0.12.6.
- Verificación: login de `admin1` devuelve token; `GET /api/lotes` sin token → 401 JSON; `PATCH /api/lotes/CAC001/estado` con token de `operador1` → 403 JSON (aunque el endpoint aún sea mínimo). Reiniciar no duplica usuarios.
- Commit: `feat: agregar autenticación JWT, roles y formato único de errores`

**B3. Recepción, catálogos y filtros (RF01, RF11-filtro, cuota)**
- Objetivo: `GET /api/config/reglas`, `GET /api/productores`, `POST /api/lotes` (código automático `CACnnn`, 409 duplicado, alerta CUOTA_EXCEDIDA, auditoría CREAR), `GET /api/lotes` con filtros, `GET /api/lotes/{codigo}`.
- Verificación: lote válido 201 y persiste tras reiniciar; cantidad −5 o campo vacío → 400 con `errores` por campo y nada guardado; código repetido → 409.
- Commit: `feat: agregar recepción y consulta de lotes con alerta de cuota`
- **→ Checkpoint 1: PR a `main`.**

**B4. Transformaciones (RF02, RF04, RF05, RF08, RF10, RF12)**
- Objetivo: `POST/GET /api/transformaciones` y `GET /api/transformaciones/{id}/balance` siguiendo **al pie de la letra** el orden transaccional de la sección 6 del contrato: idempotencia por `operacionUuid`, bloqueo pesimista, lote derivado `-Tn`, composición, alertas MERMA_ALTA / REGISTRO_INCOMPLETO / SOBRECOSTO, auditoría CONSUMO y CREAR. Cálculos en una clase pura `CalculadoraTransformacion` (sin Spring) con su prueba unitaria.
- Verificación: CAC001 100 → 80 da merma 20,00 %, alerta activa, `CAC001-T1` con 80 kg; balance 20.000 COP/kg y 20,00 %; reenvío con mismo UUID → 409 y el inventario no cambia; 120 kg sobre 100 → 422; salida 0 → `calculable: false`.
- Commit: `feat: agregar transformaciones con inventario, idempotencia, alertas y balance`

**B5. Trazabilidad, ficha pública, estado, alertas y auditoría (RF03, RF06, RF09, RF10)**
- Objetivo: `GET .../trazabilidad` (consulta recursiva del contrato), `GET /api/public/ficha/{codigo}` con DTO de lista blanca, `PATCH .../estado` (motivo obligatorio, solo un lote por ahora), `GET /api/alertas`, `GET /api/auditoria`.
- Verificación: la ficha no contiene ningún campo prohibido (revisar el JSON crudo); operador recibe 403 al liberar; el cambio de admin aparece en auditoría.
- Commit: `feat: agregar trazabilidad, ficha pública, cambio de estado y consulta de auditoría`
- **→ Checkpoint 2: PR a `main`.**

**B6. Incidencia hora 12 y exportación (RF09 ajustado, RF11)**
- Objetivo: bloqueo con `propagarADerivados`, `ORIGEN_BLOQUEADO` al liberar, `GET .../recall`, `GET /api/reportes/exportar-csv` (UTF-8 con BOM, `;`, decimales con coma).
- Verificación: bloquear CAC001 deja CAC001 y CAC001-T1 en BLOQUEADO; recall muestra Productor A, Rivera, 100/100/0 y 80 kg afectados; transformaciones y auditoría intactas; CSV abre bien en Excel.
- Commit: `feat: agregar bloqueo en cascada, reporte de recall y exportación CSV`

**B7. Pruebas automatizadas (mínimo 5, objetivo 8)**
- Objetivo: además de la unitaria de B4, pruebas de integración con Testcontainers (`@ServiceConnection`): inventario insuficiente, idempotencia (sin doble consumo), 403 del operador al liberar, ficha pública sin campos prohibidos, validación de cantidad negativa, **regresión hora 12** (bloqueo de CAC001 → ficha de CAC001-T1 BLOQUEADO y no disponible, historial conservado).
- Notas: la auditoría es solo inserción; no limpies datos con `deleteAll()` sobre ella (el trigger lo rechaza): usa `@Transactional` en las pruebas o un contenedor nuevo. Si Testcontainers falla con Docker Desktop, plan B: perfil `test` contra una base `cacao_test` del mismo contenedor y avisar.
- Verificación: `./mvnw test` en verde; copia la salida real del resumen (pruebas, fallos) para E05.
- Commit: `test: agregar pruebas automatizadas de reglas, permisos y regresión de la hora 12`

**B8 (opcional, si sobra tiempo).** Swagger UI con springdoc compatible con Boot 3.5 para que el jurado pruebe la API. Commit: `feat: agregar documentación interactiva de la API`

### 4.2 `feat/db-datos` — Juan Manuel Villalba Rincón

**D1. Entorno y verificación de integridad**
- Objetivo: levantar PostgreSQL con `docker compose up -d`, confirmar `V1` y `V2` aplicadas (`flyway_schema_history`), y escribir `datos/scripts/verificar_integridad.sql`: conteo de lotes, transformaciones y auditoría; suma de kg recibidos, consumidos y disponibles; lista ordenada de códigos.
- Verificación: `docker compose exec -T db psql -U cacao -d cacao -f /datos/scripts/verificar_integridad.sql` (la carpeta `datos/` está montada en `/datos` del contenedor) da 3 lotes y 330 kg recibidos en la base limpia.
- Commit: `chore: agregar consulta de verificación de integridad`

**D2. Respaldo y restauración (RF07, prueba 6 del jurado)**
- Objetivo: `datos/scripts/respaldar.{ps1,sh}` y `restaurar.{ps1,sh}`. El respaldo se escribe **dentro del contenedor** en `/datos/respaldos` (montado desde `datos/`) con `pg_dump -Fc -f`, nunca con redirección `>` (en PowerShell corrompe binarios). Restaurar = detener backend, `DROP DATABASE ... WITH (FORCE)`, crear, `pg_restore --no-owner`, correr verificación de integridad antes y después y comparar.
- Verificación: respaldar → crear un lote → restaurar → el lote nuevo desaparece y los conteos/sumas/códigos coinciden con los de antes; el backend reinicia sin error de Flyway; no hay usuarios duplicados.
- Commit: `feat: agregar scripts de respaldo, restauración y verificación de integridad`
- **→ Checkpoint 1: PR a `main`.**

**D3. Rendimiento sobre 100 registros (E05)**
- Objetivo: `datos/rendimiento/cargar_100_registros.sql` (lotes `PERF001`–`PERF100`, cada uno con una cadena de 3 transformaciones y su composición, insertados por SQL y declarados como sintéticos), `limpiar_registros_rendimiento.sql`, y `medir_trazabilidad.{ps1,sh}`: 5 llamadas de calentamiento y 30 medidas a `GET /api/lotes/PERF050-T3/trazabilidad` con `curl -w "%{time_total}"`, reportando mínimo, promedio, p95 y máximo. Añadir `EXPLAIN ANALYZE` de la consulta recursiva.
- Verificación: resultados reales guardados en `datos/rendimiento/resultados/medicion_<fecha>.txt` con CPU, RAM, sistema operativo y método. Meta: < 3000 ms.
- Commit: `feat: agregar carga de 100 registros sintéticos y medición de trazabilidad`

**D4. Respaldo de demostración**
- Objetivo: desde `main` con todo integrado, base limpia (V1 + V2 + usuarios), generar `datos/respaldos/respaldo_demo.dump` y `datos/respaldos/LEEME.md` con pasos de restauración y la salida esperada de la verificación.
- Verificación: restauración desde cero en una máquina distinta reproduce los conteos del LEEME.
- Commit: `chore: agregar respaldo de demostración verificado`

**D5. Migraciones adicionales (solo a pedido).** Si backend o frontend necesitan un cambio de esquema: `V<n>__descripcion.sql`, probarla sobre una base restaurada, avisar en el grupo. Commit: `feat: agregar migración V<n> para <cambio>`

**D6. Pitch (E09).** Archivos en `pitch/`. Commit: `docs: agregar presentación del pitch`

### 4.3 `feat/frontend-ui` — Juan David Fierro Calderón

Paleta: Café Cacao `#3E2723`, Ámbar Mazorca `#D97706`, Verde Origen `#15803D`, Fondo Crema `#FDFBF7` (como tokens en `@theme` de Tailwind v4). Mobile-first para operador y ficha pública; escritorio para administrador.

**F1. Base, sesión y cliente de API**
- Objetivo: React Router con rutas por rol, `AuthContext` (token en `sessionStorage`), cliente `fetch` que agrega `Authorization`, interpreta el formato de error del contrato y redirige a login en 401. Simulaciones en `src/api/simulaciones.js` con las formas JSON exactas del contrato, activadas con `VITE_USE_MOCKS=true` para avanzar antes del Checkpoint 1. Login con botones "Autocompletar demo operador" y "Autocompletar demo admin".
- Verificación: `npm run build` sin errores; con simulaciones, cada rol entra a su panel.
- Commit: `feat: agregar base del frontend con login, rutas por rol y cliente de API`

**F2. Recepción de lotes (RF01)**
- Objetivo: formulario con productor (muestra finca, municipio, cuota y entregado en el año), fecha, tipo de grano, humedad y cantidad; errores por campo devueltos por la API junto a cada input; al guardar, muestra el código asignado, la alerta de cuota si la hubo y enlace a la trazabilidad.
- Verificación: en 360 px de ancho es usable; cantidad −5 muestra el mensaje del backend y no navega.
- Commit: `feat: agregar formulario de recepción de lotes`

**F3. Transformación + diferenciador (RF02, RF08)**
- Objetivo: selector de lote (solo con disponible > 0 y no BLOQUEADO, mostrando el disponible), etapas desde `/api/config/reglas`, **semáforo de merma en vivo** (verde < 10 %, ámbar 10 %–umbral, rojo > umbral; el umbral viene de la API y el texto dice "vista previa"), **chips de incidencia en 1 clic** que agregan texto a la justificación (el chip "Adición de insumos" abre el campo `insumosAgregados`), costos opcionales. Ciclo de `operacionUuid` del contrato 8.5. Tras un registro exitoso, botón **"Reenviar la misma operación"** que reenvía el mismo cuerpo y UUID para demostrar la idempotencia (muestra el 409 de forma amigable).
- Verificación: contra la API real, 100 → 80 muestra merma oficial 20,00 % y la alerta; 120 sobre 100 muestra el 422; el reenvío muestra el 409 y el inventario sigue igual.
- Commit: `feat: agregar registro de transformación con semáforo de merma y chips de incidencia`

**F4. Panel del administrador (RF04, RF05, RF11, RF12)**
- Objetivo: inventario (recibido, consumido, disponible) con filtros por origen y estado; alertas con regla y causa; balance de cada transformación con las fórmulas tal como llegan de la API y **simulador de precio** (llama a `balance?precioVentaCop=`, no calcula en el navegador); descarga CSV.
- Verificación: cambiar el precio a 30.000 cambia el margen calculado por el backend; el CSV descarga.
- Commit: `feat: agregar panel del administrador con inventario, alertas, balance y CSV`

**F5. Trazabilidad, ficha pública y QR (RF03, RF06)**
- Objetivo: línea de tiempo interna (`/lotes/:codigo/trazabilidad`); **Pasaporte Digital** público en `/ficha/:codigoLote` sin login, con estado destacado (BLOQUEADO en rojo con advertencia, nunca como disponible), origen y recorrido; QR con `qrcode.react` apuntando a la URL del contrato (sección 4).
- Verificación: el QR escaneado desde un celular en la misma red abre la ficha; la ficha no muestra ningún dato interno.
- Commit: `feat: agregar línea de trazabilidad, ficha pública y código QR`

**F6. Estado, recall y auditoría (RF09, RF10, hora 12)**
- Objetivo: botones Bloquear/Liberar con motivo obligatorio en la vista de trazabilidad. **Visibles también para el operador**: el backend responde 403 y la UI muestra "Solo el Administrador puede liberar o bloquear lotes" (así se demuestra que el control está en el servidor). Vista de recall y visor de auditoría (solo lectura).
- Verificación: operador → mensaje 403; admin bloquea CAC001 → ficha de CAC001-T1 en BLOQUEADO; la auditoría muestra quién, cuándo, valor anterior y nuevo.
- Commit: `feat: agregar control de estado, reporte de recall y visor de auditoría`

**F7. Accesibilidad y mejora por usabilidad (E06)**
- Objetivo: `label` en cada campo, foco visible y navegación con teclado, contraste legible, vista móvil revisada, y la mejora concreta que salga de la prueba con la persona externa (capturas antes/después).
- Commit: `fix: aplicar mejoras de la prueba de usabilidad`

## 5. Flujo según la herramienta

### 5A. Si eres Claude Code (Juan David, `feat/frontend-ui`, y el Bloque 0 en `main`)

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

Complemento para este proyecto: en cada delegación a agy incluye la ruta del contrato (`docs/CONTRATO_TECNICO.md`), el bloque exacto, la lista de archivos permitidos (solo `frontend/**`) y la verificación esperada. El Bloque 0 es mayormente generadores y copia de archivos: hazlo tú directamente.

### 5B. Si eres agy (Miguel en `feat/backend-api`, Juan Manuel en `feat/db-datos`)

- Implementa tú mismo el bloque indicado; no delegues a otras herramientas.
- No hagas commit ni push. Al terminar, deja el árbol listo para que el integrante revise `git diff`.
- Si el bloque exige un cambio fuera de tu carpeta o en el contrato, detente y descríbelo en vez de hacerlo.

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
- Si la verificación falla, dilo tal cual y propone la corrección; no marques el bloque como terminado.
- Antes de cada checkpoint: `git fetch origin && git merge origin/main`, vuelve a verificar y luego abre el PR.
