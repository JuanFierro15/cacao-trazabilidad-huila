# Estado del proyecto para redactar la documentación (E01–E10)

Corte: **16/10/2026, 06:45 (hora de Colombia)**. `main` = `e22780b`, más el PR que agrega este archivo.
Repositorio: https://github.com/JuanFierro15/cacao-trazabilidad-huila · Tablero: https://github.com/users/JuanFierro15/projects/1

Este archivo resume, con datos verificados, lo construido y lo medido, para que el equipo y su asistente de documentación redacten los PDF de `documentos/`. Registro del pedido: fila del 16/10 a las 06:45 en `prompts/integracion/BITACORA.md`.

## 1. Reglas para redactar

1. **No inventar nada.** Toda cifra, prueba, resultado o captura sale de este archivo o de los archivos que cita. Si algo no se ejecutó, se escribe "pendiente". El reto lo exige: «No se aceptan entrevistas, pruebas, métricas o resultados inventados».
2. **Las metas del piloto son hipótesis.** Lo único medido son las pruebas, el rendimiento, la restauración y las validaciones de los checkpoints.
3. **Los datos son sintéticos** (los del reto). Asoprocacao es un cliente simulado.
4. **Límite:** E01–E03 y E05–E09 juntos, máximo 15 páginas (sin contar la presentación ni las salidas de pruebas). Se pueden reunir en un solo PDF con apartados.
5. **Declarar las funciones parciales** (sección 4) en E02, E05 y E10.
6. **Plazos (16/10):** congelación de funciones a las 11:00; etiqueta `v1.0-entrega` a las 12:00; documentos a Classroom a la 1:00 p. m.; registro del commit a las 2:00 p. m.

## 2. Equipo KGB y roles reales

| Integrante | Rol real | Rama |
|---|---|---|
| Miguel Ángel Medina Díaz | Base de datos y backend (Java 21, Spring Boot 3.5.16, JWT, JPA, Flyway, pruebas JUnit, scripts de respaldo) | `feat/backend-api` |
| Juan David Fierro Calderón | Frontend (React 19, Vite, Tailwind 4) e integración (rendimiento, respaldo de demostración, README, ENTREGA, tablero) | `feat/frontend-ui`, `feat/integracion` |
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

- **Proceso:** una rama por rol; todo entra a `main` por PR con merge commit (sin squash); un commit por bloque con Conventional Commits en español; bitácora por bloque en `prompts/`; tablero con un issue por bloque que se cierra con un comentario de evidencia.
- **Defecto encontrado y corregido** (para E02 y E05): en el CP1, `GET /api/lotes` sin filtros fallaba y se corrigió en `18b6a4d` (PR #3). Después del CP3, la comparación de integridad daba falsas advertencias al cruzar PowerShell y bash por el BOM; se corrigió en `a11efcb`.
- **Tablero al corte:**
  - Done: Bloque 0, B1–B9, F1–F6, I1, I2 y hora 12 (#38).
  - In Progress: I3 (#23), JM5 pitch (#28), E07 (#34), E09 (#36) y E10 (#37).
  - Todo: F7 (#20), JM1–JM4, E01–E03, E05, E06 y E08.
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
| RF06 Ficha pública | HU06 | Cumple. Sin inicio de sesión, por enlace, código o QR; BLOQUEADO en rojo y nunca disponible; ningún costo. **Decisión:** muestra finca y municipio, no el nombre de la persona productora (Ley 1581 de 2012) |
| RF07 Persistencia y respaldo | HU07 | Cumple. Integridad idéntica al restaurar; el backend reinicia sin migrar ni duplicar usuarios |
| RF08 Inventario e idempotencia | HU08 | Cumple. 422 al pedir de más y 409 al reenviar, sin cambios en el inventario |
| RF09 Estados y permisos | HU09 | Cumple. Solo el administrador, con motivo; 403 al operador; bloqueo en cascada a los derivados; recall con kg afectados |
| RF10 Auditoría | HU10 | Cumple. Quién, rol, cuándo, campo, valor anterior y nuevo, y motivo; la base rechaza modificar o borrar (trigger) |
| RF11 Filtros y CSV | HU11 | Cumple. Filtros por origen y estado; CSV solo para el administrador, con BOM, `;` y coma decimal; abre en Excel con 13 columnas |
| RF12 Balance | HU12 | Cumple. Salida 0 o precio 0 → no calculable con el motivo; la simulación de precio no guarda nada |
| Seguridad | HU14 | Cumple. JWT, 401 sin token, 403 por rol, permisos en el servidor |

Historias con criterios Dado/Cuando/Entonces: `evidencias_para_juan_manuel/entregables/E02_insumos.md` (fuera del repositorio). Su columna "estado" quedó al corte de la 01:50; usar los estados de esta tabla.

## 5. Pruebas y evidencia (E05)

**Automatizadas: 52 pruebas, 0 fallos y 0 errores** (JUnit 5 contra PostgreSQL real, base `cacao_test`; `mvnw test`), sobre `main` y también desde un clon nuevo:

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

**Pruebas del jurado (contrato, sección 10)** ejecutadas por API sobre `main`:
- 3, 4, 5, 7 y 9: 34 comprobaciones, 0 fallidas, en el CP2 y repetidas en el CP3.
- 8 y el bloqueo de la hora 12 (B6): 57 comprobaciones, 0 fallidas.
- 6 (respaldo y restauración): integridad confirmada.
- 10 (rendimiento): ver abajo.

Salidas completas en `evidencias_para_juan_manuel/checkpoint2_validacion_main.txt`, `checkpoint3_validacion_main.txt` y `checkpoint3_validacion_backend.txt` (fuera del repositorio).

**Casos manuales:** 28 casos ejecutados al corte de la 01:50 (`evidencias_para_juan_manuel/entregables/E05_insumos.md`), más las verificaciones en el navegador de cada bloque (sección "Revisión y verificación" de `prompts/frontend/F*.md` y `prompts/integracion/I*.md`). **Pendiente:** los casos manuales de Juan Manuel (#25).

**Rendimiento (prueba 10, meta: menos de 3 s)** sobre 100 cadenas sintéticas (400 lotes, 300 transformaciones). 5 llamadas de calentamiento y 30 medidas de `GET /api/lotes/PERF050-T3/trazabilidad` con `curl`, en el mismo PC:

| Script | Mínimo | Promedio | p95 | Máximo | Servidor, promedio |
|---|---|---|---|---|---|
| PowerShell (`medicion_20261016_0555.txt`) | 15,29 ms | 17,82 ms | 22,27 ms | 23,94 ms | 11,40 ms |
| Bash (`medicion_20261016_0557.txt`) | 12,98 ms | 16,60 ms | 21,64 ms | 23,19 ms | 10,63 ms |

- `EXPLAIN ANALYZE` de las consultas recursivas: 0,54 ms (ancestros) y 0,64 ms (descendientes) de ejecución.
- Equipo: AMD Ryzen 7 7445HS (6 núcleos, 12 hilos), 15,23 GB de RAM, Windows 11 Home 10.0.26200, Java 25.0.1, PostgreSQL 16.15 en Docker.
- Limitación: la medición es local, sin la red ni el navegador.
- Reportes en `datos/rendimiento/resultados/`.

**Otras verificaciones reales:**
- El QR escaneado con un celular abre la ficha sin inicio de sesión (16/10, 05:15).
- El CSV abre en Excel 16 con 13 columnas y los números como números.
- La instalación compila y pasa las pruebas desde un clon nuevo.
- **Pendiente:** la instalación completa de Juan Manuel en otro equipo (#27).

## 6. Hora 12 (E02, tarjeta de cambio)

- Anuncio: 16/10/2026 a las 02:00. Lo recibió Juan Manuel.
- Qué se pidió: un entregable de documentación para Classroom, sin cambios en el software.
- Cómo se atendió: se subió a Classroom la carpeta `Evidencia2am`, que está en `Hackaton_II/`, fuera del repositorio. Juan David la descargó de Classroom y confirmó que sus 23 archivos son los subidos: el historial y la validación de los CP1 y CP2, los insumos de E02, E03 y E05, el índice, el registro y 12 capturas.
- Criterio de RF09: no cambió. El bloqueo en cascada y el recall que el equipo había previsto se construyeron igual (B6 `13e29d8`, F6 `915f515`), y la regresión está automatizada (casos 7 y 8 de `ReglasPermisosRegresionTest`).
- Issue #38 (cerrado).

## 7. Diseño (E03)

- Diagramas en Mermaid generados del código (flujo de usuario, arquitectura, MER, clases y actividades) y 5 decisiones técnicas candidatas: `evidencias_para_juan_manuel/entregables/E03_insumos.md`, con 12 capturas reales en `entregables/capturas/`.
- **Agregar respecto al corte de la 01:50:**
  - **Pantallas nuevas:** control de estado en la trazabilidad (Bloquear y Liberar, visibles también para el operador), reporte de recall (`/admin/recall/:codigo`) y visor de auditoría (`/admin/auditoria`).
  - **Endpoints nuevos:** `GET /api/lotes/{codigo}/recall`, `GET /api/reportes/exportar-csv` y el bloqueo con `propagarADerivados`.
  - **Swagger UI** en `/swagger-ui/index.html`.
  - **Scripts:** de respaldo y de rendimiento.
- La arquitectura no cambió: React y Vite (proxy `/api`) → Spring Boot (filtro JWT, capas web, servicio, repositorio y dominio) → PostgreSQL 16 (Flyway V1 y V2).

## 8. Operación (E07) y entrega (E10)

- [`README.md`](../../README.md) ya cubre todo lo que pide E07: requisitos y versiones, instalación limpia en modo Docker y local, `.env` sin secretos, datos, ejecución, usuarios, pruebas, respaldo y restauración con integridad, servicios externos (ninguno en funcionamiento), costos, pérdida de conexión, fallos conocidos y 3 mejoras a 30 días con responsable, esfuerzo y criterio. `documentos/E07_operacion.pdf` (2 páginas) puede resumir sus secciones 7 y 8.
- Respaldo de demostración: [`datos/respaldos/LEEME.md`](../../datos/respaldos/LEEME.md), con la salida esperada real.
- [`ENTREGA.md`](../../ENTREGA.md) (E10): índice, acceso, estado de E01–E10, matriz y funciones parciales. Falta el hash final (12:00).

## 9. Pitch y piloto (E09)

- `pitch/E09_presentacion.pdf` (5 diapositivas: problema, propuesta, producto, precio, piloto) y `pitch/E09_guion.md` (guion cronometrado de 5 minutos con los tramos del reto, demostración ensayada por la API, plan B y defensa).
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
- **Miguel:** agy (Antigravity CLI) en B1–B9, con los prompts y su revisión en `prompts/backend/`. **El modelo de cada bloque no quedó anotado en esos archivos: Miguel debe indicarlo para E08.**
- **Juan David:**
  - Claude Code (claude-opus-5-5) para diseño, revisión, commits, PR, validaciones, tablero, I2, I3, el pitch y este archivo.
  - agy para implementar F1 (claude-opus-5-5-high), F2–F6 e I1 (gemini-3.8-flash-high). Los modelos Claude de agy agotaron su cuota el 15/10 a las 20:33.
  - Cada delegación se revisó, y las correcciones a mano están anotadas en su archivo de `prompts/`.
- **Presentación del pitch:** tipo Slides de claude.ai, exportada a PDF.
- **Librerías abiertas** (declarar con su licencia):
  - Backend: Spring Boot, Spring Security, Hibernate, Flyway, jjwt 0.12.6, PostgreSQL JDBC y springdoc-openapi 2.8.6.
  - Frontend: React, React Router, Vite, Tailwind CSS y qrcode.react.
  - Base de datos: PostgreSQL 16 (imagen `postgres:16-alpine`).
- **Fuentes del caso:** el reto oficial y el contexto del equipo en `Hackaton_II/Contexto_Hackaton/`, fuera del repositorio.

## 11. Pendientes al corte

| Pendiente | Responsable | Afecta a |
|---|---|---|
| Prueba de usabilidad con una persona externa (2 tareas sin guía, tiempos, dificultades, mejora antes y después) | Juan Manuel (#26) | E06 y F7 |
| F7: accesibilidad y la mejora que salga de la prueba | Juan David (#20) | E06 |
| Casos de prueba manuales | Juan Manuel (#25) | E05 |
| Instalación limpia en otro equipo siguiendo el README | Juan Manuel (#27) | E07 e I3 |
| Ensayos del pitch (3, con cronómetro) | Juan Manuel (#28) | E09 |
| PDF de `documentos/`: E01, E02, E03, E05, E06, E07, E08 y E09_piloto | Equipo | E01–E09 |
| Etiqueta `v1.0-entrega` y hash en `ENTREGA.md` | Juan David, 12:00 | E04 y E10 |
