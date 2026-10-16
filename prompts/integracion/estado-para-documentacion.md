# Estado del proyecto para redactar la documentación (E01–E10)

Corte: **16/10/2026, 08:40 (hora de Colombia)**. `main` = `83c8dc0` (PR #47), más el PR que actualiza este archivo.
Repositorio: https://github.com/JuanFierro15/cacao-trazabilidad-huila · Tablero: https://github.com/users/JuanFierro15/projects/1

Este archivo resume, con datos verificados, lo construido y lo medido, para que el equipo y su asistente de documentación redacten los PDF de `documentos/`. Reemplaza el corte de las 06:45. Registro de cada actualización en `prompts/integracion/BITACORA.md`.

## 0. Cómo usar este archivo

1. Leer primero las reglas de la sección 1.
2. Para cada entregable, la tabla de la sección 1.1 dice qué pide el reto, de qué secciones de este archivo salen los datos y qué falta.
3. Los archivos citados con ruta relativa están en el repositorio. Los que empiezan por `evidencias_para_juan_manuel/` o `Hackaton_II/` están fuera del repositorio, en el PC de Juan David: hay que pedírselos para adjuntar capturas o copiar tablas.
4. Si un dato no está aquí ni en los archivos citados, se escribe "pendiente" y se pregunta al equipo.

## 1. Reglas para redactar

1. **No inventar nada.** Toda cifra, prueba, resultado o captura sale de este archivo o de los archivos que cita. Si algo no se ejecutó, se escribe "pendiente". El reto lo exige: «No se aceptan entrevistas, pruebas, métricas o resultados inventados».
2. **Las metas del piloto son hipótesis.** Lo único medido son las pruebas, el rendimiento, la restauración, el contraste y las validaciones de los checkpoints.
3. **Los datos son sintéticos** (los del reto). Asoprocacao es un cliente simulado y **el equipo no hizo consultas reales** a la asociación: en E01 todo lo que no venga del caso es supuesto.
4. **Límite:** E01–E03 y E05–E09 juntos, máximo 15 páginas (sin contar la presentación ni las salidas de pruebas). Se pueden reunir en un solo PDF con apartados identificados.
5. **Declarar las funciones parciales** (sección 4) en E02, E05 y E10.
6. **E06:** la mejora derivada de la prueba de usabilidad tiene que salir de la prueba con la persona externa. Ni el contraste (F7) ni la identidad visual (F8) se presentan como resultado de esa prueba.
7. **Plazos (16/10):** congelación de funciones a las 11:00; etiqueta `v1.0-entrega` a las 12:00; documentos a Classroom a la 1:00 p. m.; registro del commit a las 2:00 p. m.

### 1.1 Mapa de entregables

| Entregable | Lo que pide el reto (resumen) | Datos en este archivo | Estado y lo que falta |
|---|---|---|---|
| **E01** `documentos/E01_problema.pdf` (1–2 pág.) | Asociación, usuarios, registros actuales, dificultad prioritaria, consecuencias, objetivo del MVP, alcance, exclusiones, 2 restricciones y 2 indicadores con su medición; distinguir caso, supuestos y consultas reales | Secciones 2, 4 (alcance y exclusiones) y 9 (indicadores) | Por redactar (#29). El problema sale del reto oficial y de `Hackaton_II/Contexto_Hackaton/` |
| **E02** `documentos/E02_requisitos.pdf` + tablero | Mínimo 12 historias de RF01–RF12 con ID, rol, necesidad, beneficio, prioridad y aceptación; requisitos de calidad; responsables y estado final; funciones incompletas; historia → tarea → commit → prueba; cambio de la hora 12 | Secciones 3, 4 y 6, y la matriz de `ENTREGA.md` | Por redactar (#30). Historias con Dado/Cuando/Entonces en `evidencias_para_juan_manuel/entregables/E02_insumos.md` (usar los estados de la sección 4) |
| **E03** `documentos/E03_diseno.pdf` | Flujo de usuario, arquitectura, modelo de datos, estados, inventario, control de acceso, dónde viven las reglas, 2 decisiones técnicas, esquema de pantallas; el diseño debe coincidir con la aplicación y documentar diferencias | Sección 7 | En curso (#31). Diagramas en `evidencias_para_juan_manuel/entregables/E03_insumos.md`; capturas actuales en `evidencias_para_juan_manuel/E03/despues/` |
| **E04** código | Código, dependencias, datos de demostración, usuarios, etiqueta final y hash | Secciones 3 y 8 | Etiqueta `v1.0-entrega` a las 12:00 |
| **E05** `documentos/E05_pruebas.pdf` | Mínimo 15 casos ejecutados y 5 automatizadas, cada caso con ID, requisito, datos, pasos, esperado, obtenido, estado y evidencia; corrección o limitación de cada fallo; regresión de la hora 12; medición sobre 100 registros | Sección 5 | Por redactar (#32). Casos en `evidencias_para_juan_manuel/entregables/E05_insumos.md`; faltan los casos manuales de Juan Manuel (#25) |
| **E06** `documentos/E06_usabilidad.pdf` (máx. 2 pág.) | Persona ajena al equipo, 2 tareas sin guía (registrar un lote y encontrar su trazabilidad), perfil, tiempo, éxito, dificultades, al menos una mejora derivada con antes y después; comprobar móvil, etiquetas, contraste, teclado y mensajes de error | Sección 5.4 | En curso (#33). **Falta la prueba con la persona externa (#26) y su mejora** |
| **E07** `README.md` + `documentos/E07_operacion.pdf` (máx. 2 pág.) | Instalación, configuración sin secretos, datos, ejecución, pruebas, usuarios; instalación limpia verificada; respaldo, restauración e integridad; servicios externos, costos, fallos, pérdida de conexión, 3 mejoras a 30 días | Sección 8 | En curso (#34). El README ya cubre todo; falta la instalación limpia de Juan Manuel (#27) |
| **E08** `documentos/E08_IA_y_fuentes.pdf` o `.md` | Herramienta, uso, aporte, revisión humana y corrección; componentes generados por archivo o módulo; bibliotecas, licencias, servicios y material previo; si el producto usa IA, ejemplo correcto, de error y manejo | Sección 10 | En curso (#35). Falta la herramienta y el modelo de las imágenes y los videos |
| **E09** `pitch/E09_presentacion.pdf` + `documentos/E09_piloto.pdf` (1–2 pág.) | Cliente, usuario, pagador, precio en COP, qué incluye, costos, canal, diferenciador, piloto de 30 días, 2 indicadores con medición inicial y meta | Sección 9 | Presentación y guion listos; falta `E09_piloto.pdf` (#36) y los ensayos (#28) |
| **E10** `ENTREGA.md` | Equipo, enlaces, commit final, acceso, lista E01–E09 y matriz requisito → componente → prueba → resultado → evidencia; funciones parciales | Secciones 4 y 8 | En curso (#37). Falta el hash final (12:00) |

## 2. Equipo KGB y roles reales

| Integrante | Rol real | Rama |
|---|---|---|
| Miguel Ángel Medina Díaz | Base de datos y backend (Java 21, Spring Boot 3.5.16, JWT, JPA, Flyway, pruebas JUnit, scripts de respaldo) | `feat/backend-api` |
| Juan David Fierro Calderón | Frontend (React 19, Vite, Tailwind 4), identidad visual e integración (rendimiento, respaldo de demostración, README, ENTREGA, tablero) | `feat/frontend-ui`, `feat/integracion` |
| Juan Manuel Villalba Rincón | Documentación, casos de prueba manuales, prueba de usabilidad, instalación limpia y pitch (lo presenta) | Sin rama |

**Ojo:** el contexto inicial del reto (`01_CONTEXTO_Y_PROBLEMA.md`) ponía a Juan Manuel en la base de datos. El equipo se reorganizó al inicio y la base de datos quedó con Miguel (registro en `prompts/integracion/reorganizacion.md`). Usar los roles de esta tabla.

## 3. Ciclo de vida (E02)

| Hito | Hora | `main` | PR | Validación real |
|---|---|---|---|---|
| Checkpoint 1 | 15/10, 23:07 | `493571e` | #1 (B1–B3), #2 (F1–F3), #3 (corrección de lotes y pruebas en `cacao_test`) | Login, 401, 403, recepción 201, 400 por campo y 409 |
| Checkpoint 2 | 16/10, 01:01 | `7c281cc` | #40 (B4–B5), #41 (F4 y F3 contra la API real) | 37/37 pruebas; 34 comprobaciones por API (pruebas 3, 4, 5, 7 y 9 del jurado y regresión del CP1), 0 fallidas |
| Hora 12 | 16/10, 02:00 | — | Issue #38 | Ver sección 6 |
| Checkpoint 3 | 16/10, 05:01 | `e183fca` | #42 (B6–B8 y corrección de scripts `d6d7046`), #43 (F5–F6) | 50/50 pruebas; B6 por API 57/57; regresión del CP2 34/34; prueba 6 (respaldo y restauración) en PowerShell y bash; CSV abierto en Excel; F5 y F6 en el navegador; QR escaneado con un celular a las 05:15 |
| B9 | 16/10, 05:26 | `18d9d40` | #44 | 52/52 pruebas; Swagger UI y OpenAPI 3.1 |
| Integración | 16/10, 06:37 | `e22780b` | #45 (I1, I2 e I3 parcial) | Ver secciones 5 y 8 |
| Estado para documentar | 16/10, 06:46 | `b49dca6` | #46 | Primer corte de este archivo |
| Identidad visual y contraste | 16/10, 08:29 | `83c8dc0` | #47 (F8A–F8C y F7) | Ver secciones 5.3, 5.4 y 7 |

- **Proceso:** una rama por rol; todo entra a `main` por PR con merge commit (sin squash); un commit por bloque con Conventional Commits en español; bitácora por bloque en `prompts/`; tablero con un issue por bloque que se cierra con un comentario de evidencia.
- **Commits del PR #47:** `c7fa4e7` (preparación: guía de diseño, recursos y fuentes), `000e8f1` (F8A), `3891452` (F7), `50588ef` (F8B), `ecaa41e` (F8C), `4ce9e41` y `bf7e492` (registros).
- **Defectos encontrados y corregidos** (para E02 y E05):
  - CP1: `GET /api/lotes` sin filtros fallaba; corregido en `18b6a4d` (PR #3).
  - Después del CP3: la comparación de integridad daba falsas advertencias al cruzar PowerShell y bash por el BOM; corregido en `a11efcb`.
  - F8B: con movimiento reducido, en escritorio la línea horizontal del recorrido quedaba invisible; corregido en la revisión antes del commit `50588ef`.
  - F8C: el sello del estado de la ficha dejaba 6 px de scroll horizontal a 360 px; corregido en la revisión antes del commit `ecaa41e`.
  - F7: 16 campos de texto heredaban un placeholder de 3,14:1; corregido en `3891452`.
- **Tablero al corte (36 tareas):**
  - Done (20): Bloque 0, B1–B9, F1–F6, F8 (#48), I1, I2 y hora 12 (#38).
  - In Progress (9): F7 (#20), I3 (#23), JM5 pitch (#28), E03 (#31), E06 (#33), E07 (#34), E08 (#35), E09 (#36) y E10 (#37).
  - Todo (7): JM1–JM4 (#24–#27), E01 (#29), E02 (#30) y E05 (#32).
  - Exportación actualizada: `gh project item-list 1 --owner JuanFierro15 --format json`.

## 4. Requisitos: estado real (E02 y E10)

La matriz completa (requisito → historia → componente → prueba → resultado → evidencia) está en [`ENTREGA.md`](../../ENTREGA.md).

| RF | Historia | Estado |
|---|---|---|
| RF01 Recepción | HU01 y HU13 (cuota) | Cumple. Código `CACnnn` automático, 400 con error por campo, 409 por código repetido; alerta CUOTA_EXCEDIDA que avisa sin bloquear |
| RF02 Transformación | HU02 | **Parcial:** un solo lote de entrada por transformación (las mezclas no están implementadas, aunque la tabla `lote_composicion` las admite) |
| RF03 Trazabilidad | HU03 | Cumple. Línea de tiempo desde la recepción hasta el último derivado |
| RF04 Alertas | HU04 | **Parcial:** merma alta, registro incompleto, sobrecosto y cuota excedida, con regla y causa; **no hay alerta por retraso** |
| RF05 Indicador económico | HU05 | Cumple. 20.000 COP/kg y 20,00 % en el caso del jurado, con fórmulas, unidades y supuestos |
| RF06 Ficha pública | HU06 | Cumple. Sin inicio de sesión, por enlace, código o QR, también desde la página de inicio (`/`); BLOQUEADO en rojo y nunca disponible; ningún costo. **Decisión:** muestra finca y municipio, no el nombre de la persona productora (Ley 1581 de 2012) |
| RF07 Persistencia y respaldo | HU07 | Cumple. Integridad idéntica al restaurar; el backend reinicia sin migrar ni duplicar usuarios |
| RF08 Inventario e idempotencia | HU08 | Cumple. 422 al pedir de más y 409 al reenviar, sin cambios en el inventario |
| RF09 Estados y permisos | HU09 | Cumple. Solo el administrador, con motivo; 403 al operador; bloqueo en cascada a los derivados; recall con kg afectados |
| RF10 Auditoría | HU10 | Cumple. Quién, rol, cuándo, campo, valor anterior y nuevo, y motivo; la base rechaza modificar o borrar (trigger) |
| RF11 Filtros y CSV | HU11 | Cumple. Filtros por origen y estado; CSV solo para el administrador, con BOM, `;` y coma decimal; abre en Excel con 13 columnas |
| RF12 Balance | HU12 | Cumple. Salida 0 o precio 0 → no calculable con el motivo; la simulación de precio no guarda nada |
| Seguridad | HU14 | Cumple. JWT, 401 sin token, 403 por rol, permisos en el servidor |

- **Funciones parciales o excluidas** (declararlas): RF02 sin mezclas; RF04 sin alerta por retraso; la ficha no muestra el nombre de la persona productora (decisión de privacidad); sin modo sin conexión (ver README, sección 8); rendimiento medido solo en local; sin transiciones animadas entre pantallas (sección 7).
- Historias con criterios Dado/Cuando/Entonces: `evidencias_para_juan_manuel/entregables/E02_insumos.md` (fuera del repositorio). Su columna "estado" quedó al corte de la 01:50; usar los estados de esta tabla.

## 5. Pruebas y evidencia (E05 y E06)

### 5.1 Automatizadas

**52 pruebas, 0 fallos y 0 errores** (JUnit 5 contra PostgreSQL real, base `cacao_test`; `mvnw test`), sobre `main` y también desde un clon nuevo. El backend no cambió después de B9 (PR #44).

| Clase | Pruebas | Qué cubre |
|---|---|---|
| `DominioEsquemaContratoTest` | 6 | Entidades contra el esquema V1, bloqueo pesimista y versión optimista |
| `SeguridadJwtErroresTest` | 6 | Login, 401 y 403 en JSON, usuarios sin duplicar |
| `CalculadoraTransformacionTest` | 7 | Merma, rendimiento, costo, margen, división entre cero y alertas (unitarias) |
| `RecepcionCatalogosFiltrosTest` | 8 | Recepción, 400, 409, cuota y filtros |
| `TransformacionIntegracionTest` | 6 | 100 → 80, idempotencia, 422, salida 0, sobrecosto |
| `TrazabilidadFichaEstadoAuditoriaTest` | 4 | Trazabilidad, ficha con lista blanca, 403 y auditoría |
| `IncidenciaRecallCsvTest` | 5 | Bloqueo en cascada, ORIGEN_BLOQUEADO, recall y CSV |
| `ReglasPermisosRegresionTest` | 8 | Reglas, permisos y **regresión de la hora 12** (casos 7 y 8) |
| `OpenApiDocumentacionTest` | 2 | Swagger y especificación OpenAPI |

### 5.2 Pruebas del jurado y casos ejecutados

- Pruebas del jurado (contrato, sección 10) por API sobre `main`:
  - 3, 4, 5, 7 y 9: 34 comprobaciones, 0 fallidas, en el CP2 y repetidas en el CP3.
  - 8 y el bloqueo de la hora 12 (B6): 57 comprobaciones, 0 fallidas.
  - 6 (respaldo y restauración): integridad confirmada (también el 16/10 a las 08:16, ver 5.3).
  - 10 (rendimiento): ver 5.5.
- Salidas completas en `evidencias_para_juan_manuel/checkpoint2_validacion_main.txt`, `checkpoint3_validacion_main.txt` y `checkpoint3_validacion_backend.txt` (fuera del repositorio).
- **Casos manuales:** 28 casos ejecutados al corte de la 01:50 (`evidencias_para_juan_manuel/entregables/E05_insumos.md`), más las verificaciones en el navegador de cada bloque (sección "Revisión y verificación" de `prompts/frontend/F*.md` y `prompts/integracion/I*.md`). **Pendiente:** los casos manuales de Juan Manuel (#25).

### 5.3 Recorrido de la demostración y restauración (16/10, 08:14–08:16)

Después de F8, el flujo del pitch se recorrió por la interfaz (clics y teclas reales en un navegador) sin regresiones:
- Recepción de PRD-C con 250 kg → CAC004 con alerta "Cuota de plausibilidad excedida" (330 kg acumulados frente a 300 kg).
- Transformación de CAC004, 250 → 200 kg, con el chip "Impurezas y pasilla superiores a lo normal": vista previa 20,00 % en rojo, merma oficial 20,00 %, CAC004-T1 con 200 kg y alerta MERMA_ALTA con su causa.
- Como administrador, las dos alertas en `/admin/alertas`; trazabilidad de CAC004-T1 con 2 pasos y QR; ficha pública a 360 px en estado pendiente.
- Luego se restauró `respaldo_demo.dump`: "INTEGRIDAD CONFIRMADA", 3 lotes PENDIENTES, 3 productores, 2 usuarios y 0 transformaciones, alertas y auditoría; el backend arrancó sin migrar.

### 5.4 Experiencia de usuario: lo verificado y lo pendiente (E06)

| Punto que pide el reto | Estado | Evidencia |
|---|---|---|
| Prueba con persona ajena al equipo (2 tareas sin guía, perfil, tiempo, éxito, dificultades) | **Pendiente** (#26) | — |
| Mejora derivada de esa prueba, con antes y después | **Pendiente** | — |
| Contraste legible | Hecho (F7). De 2,41–4,18:1 a 4,79–5,78:1, medido en el navegador sobre el fondo real de cada texto | Tabla en `prompts/frontend/F7.md`; 7 capturas antes y 7 después en `evidencias_para_juan_manuel/E06/` |
| Etiquetas de formulario | Hecho. Los 35 campos de los formularios tienen `label` asociado (revisión del código del 16/10 a las 08:40) | Código en `frontend/src/` |
| Navegación por teclado | Hecho en el inicio y el login: con Tab se llega a todos los controles con contorno de foco visible; Enter activa anclas y el botón del video | `prompts/frontend/F8A.md` y `F8B.md` |
| Vista móvil (360 px) | Hecho: login, recepción, trazabilidad, ficha e inicio sin scroll horizontal | `prompts/frontend/F8A.md`, `F8B.md`, `F8C.md`; capturas a 360 px en `evidencias_para_juan_manuel/E03/despues/` |
| Mensajes de error comprensibles | Hecho: errores en español con qué pasó y qué hacer, junto a cada campo (400) o en caja general (403, 409, 422) | Checkpoints 1 y 2; contrato, sección 8.1 |
| Movimiento reducido (adicional) | Hecho: con `prefers-reduced-motion` no hay animaciones y el video queda en pausa | `prompts/frontend/F8A.md`–`F8C.md` |

La prueba de usabilidad debe registrar si la persona es participante del evento y no presentarla como productor real.

### 5.5 Rendimiento (prueba 10, meta: menos de 3 s)

Sobre 100 cadenas sintéticas (400 lotes, 300 transformaciones). 5 llamadas de calentamiento y 30 medidas de `GET /api/lotes/PERF050-T3/trazabilidad` con `curl`, en el mismo PC:

| Script | Mínimo | Promedio | p95 | Máximo | Servidor, promedio |
|---|---|---|---|---|---|
| PowerShell (`medicion_20261016_0555.txt`) | 15,29 ms | 17,82 ms | 22,27 ms | 23,94 ms | 11,40 ms |
| Bash (`medicion_20261016_0557.txt`) | 12,98 ms | 16,60 ms | 21,64 ms | 23,19 ms | 10,63 ms |

- `EXPLAIN ANALYZE` de las consultas recursivas: 0,54 ms (ancestros) y 0,64 ms (descendientes) de ejecución.
- Equipo: AMD Ryzen 7 7445HS (6 núcleos, 12 hilos), 15,23 GB de RAM, Windows 11 Home 10.0.26200, Java 25.0.1, PostgreSQL 16.15 en Docker.
- Limitación: la medición es local, sin la red ni el navegador.
- Reportes en `datos/rendimiento/resultados/`.

**Otras verificaciones reales:** el QR escaneado con un celular abre la ficha sin inicio de sesión (16/10, 05:15); el CSV abre en Excel 16 con 13 columnas y los números como números; la instalación compila y pasa las pruebas desde un clon nuevo. **Pendiente:** la instalación completa de Juan Manuel en otro equipo (#27).

## 6. Hora 12 (E02, tarjeta de cambio)

- Anuncio: 16/10/2026 a las 02:00. Lo recibió Juan Manuel.
- Qué se pidió: un entregable de documentación para Classroom, sin cambios en el software.
- Cómo se atendió: se subió a Classroom la carpeta `Evidencia2am`, que está en `Hackaton_II/`, fuera del repositorio. Juan David la descargó de Classroom y confirmó que sus 23 archivos son los subidos: el historial y la validación de los CP1 y CP2, los insumos de E02, E03 y E05, el índice, el registro y 12 capturas.
- Criterio de RF09: no cambió. El bloqueo en cascada y el recall que el equipo había previsto se construyeron igual (B6 `13e29d8`, F6 `915f515`), y la regresión está automatizada (casos 7 y 8 de `ReglasPermisosRegresionTest`).
- Issue #38 (cerrado).

## 7. Diseño (E03)

- **Diagramas** en Mermaid generados del código (flujo de usuario, arquitectura, MER, clases y actividades) y 5 decisiones técnicas candidatas: `evidencias_para_juan_manuel/entregables/E03_insumos.md`.
- **Arquitectura (sin cambios):** React y Vite (proxy `/api`) → Spring Boot (filtro JWT, capas web, servicio, repositorio y dominio) → PostgreSQL 16 (Flyway V1 y V2).
- **Agregar respecto al corte de la 01:50:**
  - Pantallas: página de inicio pública (`/` sin sesión, con la consulta por código), control de estado en la trazabilidad (Bloquear y Liberar, visibles también para el operador), reporte de recall (`/admin/recall/:codigo`) y visor de auditoría (`/admin/auditoria`).
  - Endpoints: `GET /api/lotes/{codigo}/recall`, `GET /api/reportes/exportar-csv` y el bloqueo con `propagarADerivados`.
  - Swagger UI en `/swagger-ui/index.html`; scripts de respaldo y de rendimiento.
- **Flujo de usuario actual:** `/` (inicio público) → "Ingresar" → `/login` → panel según el rol (`/operador` o `/admin`). El comprador entra por el QR, por `/ficha/<código>` o escribiendo el código en el inicio.
- **Identidad visual (F8, guía en [`frontend/DISENO.md`](../../frontend/DISENO.md)):**
  - Tokens de color en `@theme` de Tailwind: cacao `#3A1F0D`, crema `#FFFDF9`, arena `#F3E5D0`, mazorca `#D97706`, mazorca oscuro `#B4520F` (texto naranja), origen `#15803D`; el verde y el naranja del boceto original quedan solo para decoración porque con texto blanco no llegan a 4,5:1.
  - Tipografía: Barlow (texto) y Barlow Condensed (títulos), instaladas localmente para no depender de internet en la feria.
  - "La traza": la línea con nodos del logo se usa como firma visual en el inicio, la trazabilidad y la ficha; el estado de la ficha entra como un sello. Todo respeta el movimiento reducido.
- **Esquema de pantallas:** las capturas que coinciden con la aplicación actual están en `evidencias_para_juan_manuel/E03/despues/` (login, recepción, trazabilidad de CAC002, ficha de CAC002 e inicio, a 1280 y 360 px). Las de `E03/antes/` y las 12 de `entregables/capturas/` muestran el aspecto anterior a F8: sirven para el antes y después o para mostrar funciones (recall, balance, alertas), aclarando que el estilo cambió.
- **Decisión técnica candidata nueva:** estilos con tokens en `@theme` y animaciones solo con CSS. Razón: sin dependencias nuevas y con movimiento reducido en un solo lugar. Alternativa descartada: Motion o GSAP. Limitación: sin transiciones animadas entre pantallas.
- **Diferencias entre el diseño y la aplicación** (el reto pide documentarlas):
  - La guía pedía transiciones entre vistas con `viewTransition` de React Router; no se aplicaron porque con `BrowserRouter` no tienen efecto y cambiar a `createBrowserRouter` tocaba las rutas.
  - El sello del estado arranca en escala 1,06 y no en 1,12, para no dejar scroll horizontal a 360 px.

## 8. Operación (E07) y entrega (E10)

- [`README.md`](../../README.md) cubre todo lo que pide E07: requisitos y versiones, instalación limpia en modo Docker y local, `.env` sin secretos, datos, ejecución, usuarios, pruebas, respaldo y restauración con integridad, servicios externos (ninguno en funcionamiento), costos, pérdida de conexión, fallos conocidos y 3 mejoras a 30 días con responsable, esfuerzo y criterio. `documentos/E07_operacion.pdf` (2 páginas) puede resumir sus secciones 7 y 8. En este corte se actualizó la tabla de direcciones: `http://localhost:5173` ahora es la página de inicio pública.
- Respaldo de demostración: [`datos/respaldos/LEEME.md`](../../datos/respaldos/LEEME.md), con la salida esperada real; la última restauración (08:16) coincidió con ella.
- [`ENTREGA.md`](../../ENTREGA.md) (E10): índice, acceso, estado de E01–E10, matriz y funciones parciales. Falta el hash final (12:00).

## 9. Pitch y piloto (E09)

- `pitch/E09_presentacion.pdf` (5 diapositivas: problema, propuesta, producto, precio, piloto) y `pitch/E09_guion.md` (guion cronometrado de 5 minutos con los tramos del reto, demostración ensayada por la API, plan B y defensa). La demostración del guion sigue funcionando tal cual después de F8 (sección 5.3); la página de inicio puede usarse como pantalla de apertura.
- **Para `documentos/E09_piloto.pdf` (1 a 2 páginas):**
  - **Cliente y pagador:** Asoprocacao, desde su gerencia y junta.
  - **Usuarios:** operador de acopio y planta, y administración. El comprador consulta la ficha.
  - **Precio y qué incluye:** 350.000 COP al mes por asociación, con usuarios ilimitados, fichas y QR sin límite, respaldo diario y soporte.
  - **Piloto:** 30 días por 150.000 COP, con despliegue, registro de fincas y capacitación. Semana 1, medición inicial; semanas 2–3, operación acompañada; semana 4, medición y decisión.
  - **Costos de operación (supuestos):**
    - Servidor de 2 vCPU y 4 GB: 24 USD × 3.200 = 76.800 COP.
    - Respaldos: 16.000 COP.
    - Dominio: 4.000 COP.
    - Soporte: 3 h × 35.000 = 105.000 COP.
    - IA en operación: 0, porque la aplicación no la usa.
    - Total ≈ 201.800 COP al mes; margen ≈ 148.200 COP (42 %).
    - Fuentes de referencia de octubre de 2026: precio público de un servidor de ese tamaño y TRM de la segunda semana de octubre.
  - **Canal:** venta directa a asociaciones del Huila, con demostración en sitio, y alianzas con el gremio cacaotero.
  - **Diferenciadores:** alerta de cuota por finca, merma en vivo con causa en un toque, ficha con QR y retiro inmediato del lote y sus derivados.
  - **Indicadores (las metas son hipótesis):**
    - Lotes despachados con ficha pública: hoy 0 %, meta 100 %.
    - Tiempo para reconstruir un lote y su balance: hoy horas (se mide en la semana 1), meta menos de 3 s; ya medido en 22 ms en pruebas.

## 10. Herramientas y fuentes (E08, lo redacta el equipo)

Registro por bloque, con el prompt y la revisión humana, en `prompts/backend/`, `prompts/frontend/` y `prompts/integracion/` (cada carpeta con su `BITACORA.md`).
- **Miguel:** agy (Antigravity CLI) en B1–B9, con los prompts y su revisión en `prompts/backend/`. Modelos usados, según lo informado por Juan David el 16/10: Gemini 4 Argon, Claude Opus 5.5 y Gemini 3.8 Flash, los tres con esfuerzo máximo. Los archivos de `prompts/backend/` no anotan qué modelo se usó en cada bloque; si E08 lo pide por bloque, Miguel debe precisarlo.
- **Juan David:**
  - Claude Code (claude-opus-5-5) para diseño, revisión, commits, PR, validaciones, tablero, I2, I3, el pitch, F7 (contraste) y este archivo.
  - agy para implementar F1 (claude-opus-5-5-high), F2–F6 e I1 (gemini-3.8-flash-high) y F8A–F8C (gemini-4-argon-high). Los modelos Claude de agy agotaron su cuota el 15/10 a las 20:33 y el 16/10 a las 07:41 seguían sin cuota.
  - Cada delegación se revisó, y las correcciones a mano están anotadas en su archivo de `prompts/` (por ejemplo, en F8B y F8C las dos correcciones de la sección 3).
  - Skills de diseño versionadas como registro de uso: `frontend-design` (Anthropic, Apache 2.0) en `.claude/skills/` y `.agents/skills/`, y `web-design-guidelines` (Vercel) en `.claude/skills/`.
- **Imágenes, logo optimizado y videos de `frontend/public/assets/`:** ilustraciones generadas con IA (lo dice el pie de la página de inicio). **Falta anotar la herramienta y el modelo con que se generaron.**
- **Presentación del pitch:** tipo Slides de claude.ai, exportada a PDF.
- **IA dentro del producto:** ninguna. La aplicación no llama a servicios de IA, así que no aplican el ejemplo de error ni el costo de IA en operación.
- **Librerías abiertas** (declarar con su licencia):
  - Backend: Spring Boot, Spring Security, Hibernate, Flyway, jjwt 0.12.6, PostgreSQL JDBC y springdoc-openapi 2.8.6.
  - Frontend: React, React Router, Vite, Tailwind CSS y qrcode.react; fuentes Barlow y Barlow Condensed (`@fontsource`, SIL OFL 1.1).
  - Base de datos: PostgreSQL 16 (imagen `postgres:16-alpine`).
- **Fuentes del caso:** el reto oficial y el contexto del equipo en `Hackaton_II/Contexto_Hackaton/`, fuera del repositorio.

## 11. Pendientes al corte

| Pendiente | Responsable | Afecta a |
|---|---|---|
| Prueba de usabilidad con una persona externa (2 tareas sin guía, tiempos, dificultades) y la mejora que salga de ella, con antes y después | Juan Manuel (#26) y Juan David (#20) | E06 y F7 |
| Herramienta y modelo con que se generaron las imágenes y los videos | Juan David | E08 |
| Modelo por bloque del backend, si E08 lo pide así | Miguel | E08 |
| Casos de prueba manuales | Juan Manuel (#25) | E05 |
| Instalación limpia en otro equipo siguiendo el README | Juan Manuel (#27) | E07 e I3 |
| Ensayos del pitch (3, con cronómetro) | Juan Manuel (#28) | E09 |
| PDF de `documentos/`: E01, E02, E03, E05, E06, E07, E08 y E09_piloto | Equipo | E01–E09 |
| Etiqueta `v1.0-entrega` y hash en `ENTREGA.md` | Juan David, 12:00 | E04 y E10 |
| Antes de la evaluación: restaurar `respaldo_demo.dump` y cambiar la clave y el `JWT_SECRET` del `.env` del PC de la demostración | Juan David | Demostración |
