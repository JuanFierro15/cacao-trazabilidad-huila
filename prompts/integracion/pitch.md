# Pitch E09 — Presentación y guion

- Integrante: Juan David Fierro Calderón (pedido); presenta Juan Manuel Villalba Rincón.
- Herramienta: Claude Code (claude-opus-5-5): investigación de requisitos y costos, redacción de la presentación (tipo Slides de claude.ai) y del guion, y ensayo de la demostración por la API.
- Rama: `feat/integracion`.
- Fecha: 2026-10-16, 06:20–06:45.

## Pedido

Juan David pidió que, como Juan Manuel no tenía los archivos del pitch, Claude Code los preparara para que Juan Manuel entrenara con ellos y presentara.

## Fuentes usadas

- Reto oficial (`Contexto_Hackaton/Reto_Oficial_Devurity_Agroindustria.docx`, fuera del repositorio): E09 pide `pitch/E09_presentacion.pdf` o `.pptx` de máximo cinco diapositivas (problema, propuesta, producto, precio y beneficio, piloto), un pitch de 5 minutos con demostración real y tramos fijos (0:00–0:40, 0:40–1:10, 1:10–3:10, 3:10–4:10, 4:10–4:40, 4:40–5:00), y cliente, usuario, pagador, precio en COP, qué incluye, costos de operación, canal de venta, diferenciador, piloto de 30 días y dos indicadores con medición inicial y meta (las metas son hipótesis).
- Propuesta comercial del equipo (`Contexto_Hackaton/01_CONTEXTO_Y_PROBLEMA.md`): 350.000 COP al mes; piloto de 30 días a 150.000 COP; indicadores de completitud de trazabilidad y tiempo de reconstrucción.
- Costos de referencia consultados en la web el 16/10/2026: servidor de 2 vCPU y 4 GB a unos 24 USD al mes (infratally.com, vpsbenchmarks.com) y TRM de unos 3.200 COP por USD en la segunda semana de octubre de 2026 (dolar-colombia.com, Portafolio). Respaldos (5 USD al mes), dominio (15 USD al año) y soporte (3 h a 35.000 COP) son supuestos declarados en la diapositiva.
- Evidencia propia: 52 pruebas automatizadas; medición de I1 (p95 22,27 ms con 400 lotes); restauración verificada en I2.

## Resultado

- Presentación de 5 diapositivas con notas del orador cronometradas, hecha en claude.ai y exportada a `pitch/E09_presentacion.pdf`.
- `pitch/E09_guion.md`: preparación, guion por tramos, demostración paso a paso, plan B, cifras con su evidencia y preguntas probables de la defensa.
- La demostración se ensayó por la API sobre la base limpia el 16/10 a las 06:25: 250 kg del Productor C → CAC004 con alerta CUOTA_EXCEDIDA (330 de 300 kg); 250 → 200 kg → CAC004-T1, merma 20 % y alerta MERMA_ALTA; ficha de CAC004-T1 con el origen y el recorrido. Después se restauró `respaldo_demo.dump` ("INTEGRIDAD CONFIRMADA").
- `documentos/E09_piloto.pdf` (1 a 2 páginas) no se generó aquí: lo redacta el equipo.
