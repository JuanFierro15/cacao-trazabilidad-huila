# ENTREGA — II Hackathon de Programación (USCO, DEVURITY)

Índice del paquete (E10) del equipo **KGB**: caso "Cacao con historia, calidad y valor" para la asociación simulada Asoprocacao (Campoalegre, Huila).

| Campo | Valor |
|---|---|
| Equipo | KGB |
| Universidad | Universidad Surcolombiana, Programa de Ingeniería de Software |
| Integrantes | Miguel Ángel Medina Díaz (base de datos y backend) · Juan David Fierro Calderón (frontend e integración) · Juan Manuel Villalba Rincón (documentación, pruebas manuales, usabilidad, instalación limpia y pitch) |
| Repositorio | https://github.com/JuanFierro15/cacao-trazabilidad-huila |
| Tablero del proyecto | https://github.com/users/JuanFierro15/projects/1 |
| Etiqueta final | `v1.0-entrega` |
| Commit final (hash completo) | _Se registra al crear la etiqueta (16/10/2026, 12:00)._ |
| Acceso | Clonar el repositorio y seguir [`README.md`](README.md) (instalación en modo Docker o local). Aplicación en `http://localhost:5173`, API en `http://localhost:8080/api`, documentación de la API en `http://localhost:8080/swagger-ui/index.html` y ficha pública en `/ficha/<código>`. Usuarios: `operador1` / `cacao123` y `admin1` / `admin123`. Para volver al estado inicial: [`datos/respaldos/LEEME.md`](datos/respaldos/LEEME.md) |

## Entregables

| ID | Entregable | Ubicación | Estado |
|---|---|---|---|
| E01 | Problema y propuesta de valor | `documentos/E01_problema.pdf` | Lo redacta el equipo |
| E02 | Requisitos, tablero y tarjeta de cambio de la hora 12 | `documentos/E02_requisitos.pdf`; tablero en GitHub Projects; hora 12 en el issue #38 | Tablero al día; documento a cargo del equipo |
| E03 | Diseño (flujo, arquitectura, MER, UML, pantallas y decisiones) | `documentos/E03_diseno.pdf` | Lo redacta el equipo |
| E04 | Producto y código fuente | `backend/`, `frontend/` (equivalen a `src/`) | Integrado en `main` |
| E05 | Informe y archivos de pruebas | `documentos/E05_pruebas.pdf`; pruebas en `backend/src/test/` (equivale a `tests/`); rendimiento en `datos/rendimiento/` | 52 pruebas automatizadas en verde y rendimiento medido; informe a cargo del equipo |
| E06 | Verificación de experiencia de usuario | `documentos/E06_usabilidad.pdf` | Lo redacta el equipo |
| E07 | Instalación, respaldo y mantenimiento | [`README.md`](README.md), `documentos/E07_operacion.pdf`, `datos/` | README y scripts hechos; documento a cargo del equipo |
| E08 | Declaración de herramientas y fuentes | `documentos/E08_IA_y_fuentes.md`; registro por bloque en `prompts/` | Lo redacta el equipo |
| E09 | Pitch y propuesta de piloto | `pitch/E09_presentacion.pdf`, [`pitch/E09_guion.md`](pitch/E09_guion.md), `documentos/E09_piloto.pdf` | Guion hecho; presentación por exportar; propuesta de piloto a cargo del equipo |
| E10 | Índice y matriz de trazabilidad | este archivo | Hecho |

## Matriz de trazabilidad

Las pruebas automatizadas están en `backend/src/test/java/co/edu/usco/cacao/` (clase y método). Las verificaciones en el navegador y por API de cada bloque están en la sección "Revisión y verificación" de su archivo en `prompts/frontend/`, `prompts/backend/` o `prompts/integracion/`. Resultado de las pruebas automatizadas sobre `main`: 52 pruebas, 0 fallos y 0 errores.

| Requisito | Historia | Componente (backend · frontend) | Prueba | Resultado | Evidencia |
|---|---|---|---|---|---|
| RF01 Recepción de lotes | HU01 | `LoteController`, `LoteServicio` · `PaginaRecepcion` | `RecepcionCatalogosFiltrosTest`: `crearLoteValidoAsignaCodigoYRegistraAuditoria`, `crearLoteCantidadNegativaOCampoVacioDevuelve400`, `crearLoteCodigoRepetidoDevuelve409`; `ReglasPermisosRegresionTest.caso4_validacionCantidadNegativaOZeroResponde400` | Cumple: código `CACnnn` único, 400 con error por campo y nada guardado, 409 por código repetido | Pruebas en verde; `prompts/frontend/F2.md` |
| RF01 Cuota de plausibilidad (diferenciador) | HU13 | `LoteServicio` (alerta `CUOTA_EXCEDIDA`) · vista previa de cuota en `PaginaRecepcion` | `RecepcionCatalogosFiltrosTest.crearLoteSuperandoCuotaGeneraAlertaCuotaExcedida` | Cumple: 250 kg del Productor C → alerta de 330 sobre 300 kg; avisa sin bloquear | Prueba en verde; ensayo de la demo en `prompts/integracion/pitch.md` |
| RF02 Transformación por etapas | HU02 | `TransformacionServicio`, `CalculadoraTransformacion` · `PaginaTransformacion`, `SemaforoMerma`, `ChipsIncidencia` | `TransformacionIntegracionTest.transformarCac001GeneraDerivadoAlertaAuditoriasYBalance`, `validarSalidaMayorSinInsumosYLoteBloqueado`; `CalculadoraTransformacionTest` (7) | Parcial: etapa, responsable, fecha, entrada, salida e incidencia con lote derivado `-Tn`; un solo lote de entrada por transformación | Pruebas en verde; `prompts/frontend/F3.md` |
| RF03 Trazabilidad | HU03 | `TrazabilidadServicio` (consultas recursivas de `LoteComposicionRepository`) · `PaginaTrazabilidad` | `TrazabilidadFichaEstadoAuditoriaTest.trazabilidadDeLoteDerivadoYRaizMuestraLineaCompletaYAlertas` | Cumple: línea de tiempo desde la recepción hasta el último derivado | Prueba en verde; `prompts/frontend/F5.md` |
| RF04 Alerta para decidir | HU04 | `AlertaServicio`, `TransformacionServicio` · `PaginaAlertas`, `ListaAlertas` | `CalculadoraTransformacionTest.evaluarCondicionesDeAlerta`; `TransformacionIntegracionTest.generarAlertasRegistroIncompletoYSobrecosto`; `TrazabilidadFichaEstadoAuditoriaTest.consultarAlertasYAuditoriaConPermisosDeAdministrador` | Parcial: merma mayor de 15 %, registro incompleto y sobrecosto, con regla y causa; no hay alerta por retraso | Pruebas en verde; `prompts/frontend/F4.md` |
| RF05 Indicador económico | HU05 | `CalculadoraTransformacion`, `TransformacionController` (balance) · `PaginaBalance` | `CalculadoraTransformacionTest.calcularCostoUnitarioYMargenCasoJurado`, `construirBalanceConFormulasYConSalidaCero` | Cumple: 20.000 COP/kg y 20,00 % con fórmulas, unidades y supuestos | Pruebas en verde; `prompts/frontend/F4.md` |
| RF06 Ficha pública | HU06 | `FichaPublicaController` con DTO de lista blanca · `PaginaFichaPublica`, `PaginaConsultaFicha`, `CodigoQrFicha` | `TrazabilidadFichaEstadoAuditoriaTest.fichaPublicaSinAutenticacionUsaListaBlancaSinNingunCampoProhibido`; `ReglasPermisosRegresionTest.caso6_fichaPublicaSinCamposProhibidos` | Cumple: sin inicio de sesión, por enlace, código o QR; BLOQUEADO en rojo y no disponible; ningún costo ni dato interno. Muestra finca y municipio, no el nombre de la persona productora (decisión de privacidad) | Pruebas en verde; QR escaneado con un celular (`prompts/frontend/F5.md`) |
| RF07 Persistencia, respaldo y restauración | HU07 | Flyway (`V1`, `V2`) · `datos/scripts/respaldar`, `restaurar` y `verificar_integridad.sql` | Prueba 6: respaldar → cambiar datos → restaurar → comparar | Cumple: integridad idéntica (conteos, kg y códigos), el backend reinicia sin migrar y sin duplicar usuarios; probado en PowerShell y bash | `datos/respaldos/LEEME.md`; `prompts/integracion/I2.md` |
| RF08 Inventario e idempotencia | HU08 | `TransformacionServicio` (bloqueo pesimista y `operacionUuid`) · reenvío de prueba en `PaginaTransformacion` | `TransformacionIntegracionTest.reenvioMismoOperacionUuidDevuelve409YNoDescuentaDoble`, `pedirMasDeLoDisponibleDevuelve422InventarioInsuficiente`; `ReglasPermisosRegresionTest.caso1_inventarioInsuficienteResponde422`, `caso3_idempotenciaSinDobleConsumoResponde409` | Cumple: 422 al pedir más de lo disponible y 409 al reenviar, sin cambios en el inventario | Pruebas en verde; `prompts/frontend/F3.md` |
| RF09 Estado y control de acceso | HU09 | `LoteServicio.cambiarEstado`, `SecurityConfig` · `ControlEstadoLote`, `PaginaRecall` | `SeguridadJwtErroresTest.patchEstadoComoOperadorDevuelve403Json`; `ReglasPermisosRegresionTest.caso5_operadorRecibe403AlCambiarEstado`, `caso7_regresionHora12BloqueoCascadaYHistorialConservado`, `caso8_regresionHora12LiberarDerivadoConOrigenBloqueadoResponde409`; `IncidenciaRecallCsvTest` (5) | Cumple: solo el administrador cambia estados, con motivo obligatorio; el operador recibe 403; el bloqueo se propaga a los derivados; recall con kg afectados | Pruebas en verde; `prompts/frontend/F6.md` |
| RF10 Auditoría inmutable | HU10 | `AuditoriaServicio` y trigger de solo inserción en `V1` · `PaginaAuditoria` | `RecepcionCatalogosFiltrosTest.crearLoteValidoAsignaCodigoYRegistraAuditoria`; `TrazabilidadFichaEstadoAuditoriaTest.operadorRecibe403YAdminCambiaEstadoConRegistroEnAuditoria` | Cumple: quién, rol, cuándo, entidad, campo, valor anterior y nuevo, y motivo; la base rechaza modificar o borrar | Pruebas en verde; `prompts/frontend/F6.md` |
| RF11 Consulta y CSV | HU11 | `LoteController` (filtros), `ReporteServicio`, `ReporteController` · `PanelAdministrador` | `RecepcionCatalogosFiltrosTest.filtrarLotesYConsultarPorCodigo`; `IncidenciaRecallCsvTest.exportarCsvConFormatoParaExcel` | Cumple: filtros por origen y estado; CSV solo para el administrador, con BOM, `;` y coma decimal; abre en Excel | Pruebas en verde; `prompts/frontend/F4.md` |
| RF12 Balance sin división entre cero | HU12 | `CalculadoraTransformacion` · simulador de precio en `PaginaBalance` | `CalculadoraTransformacionTest.divisionEntreCeroDevuelveNull`; `TransformacionIntegracionTest.transformacionConSalidaCeroRespondeCalculableFalse` | Cumple: salida 0 o precio 0 → no calculable con el motivo; la simulación no guarda nada | Pruebas en verde; `prompts/frontend/F4.md` |
| Seguridad (calidad) | HU14 | `SecurityConfig`, filtro JWT, `DataInitializer` · inicio de sesión y rutas protegidas | `SeguridadJwtErroresTest` (6); `DominioEsquemaContratoTest` (6) | Cumple: 401 sin token, 403 por rol, sin usuarios duplicados al reiniciar | Pruebas en verde |
| Prueba 10 Rendimiento | — | `datos/rendimiento/` | Carga de 100 cadenas (400 lotes) y 30 medidas de `GET /api/lotes/PERF050-T3/trazabilidad` | Cumple: p95 de 22,27 ms y máximo de 23,94 ms (meta: menos de 3 s), medido en local | `datos/rendimiento/resultados/medicion_20261016_0555.txt` y `medicion_20261016_0557.txt` |
| Regresión de la hora 12 | — | Bloqueo en cascada y recall | `ReglasPermisosRegresionTest.caso7_…` y `caso8_…`; `IncidenciaRecallCsvTest.bloquearCac001PropagaADerivadosYConservaHistorial` | Cumple. La incidencia real de la hora 12 fue un entregable de documentación, sin cambios en el software (issue #38) | Pruebas en verde |

## Funciones parciales y limitaciones declaradas

- **RF02:** cada transformación consume un solo lote de entrada. Las mezclas de varios lotes no están implementadas, aunque el esquema (`lote_composicion`) ya las admite.
- **RF04:** no hay alerta por retraso. Las alertas implementadas son merma alta, registro incompleto, sobrecosto y cuota excedida.
- **RF06:** la ficha muestra la finca y el municipio, pero no el nombre de la persona productora, por ser dato personal (Ley 1581 de 2012).
- **Rendimiento:** medido con el cliente y el servidor en el mismo PC; no incluye la latencia de la red ni del navegador.
- **Operación:** no hay modo sin conexión en el celular; la aplicación funciona en la red local sin internet (README, sección 8).
