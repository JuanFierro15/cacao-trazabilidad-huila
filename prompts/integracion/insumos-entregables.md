# Insumos para los entregables E02, E03 y E05

- Integrante: Juan David Fierro Calderón
- Herramienta: Claude Code (claude-opus-5-5), ejecutado directamente (recopilación de evidencia, sin delegar)
- Fecha y hora: 2026-10-16 01:50
- Rama del registro: `feat/frontend-ui`

## Pedido

```text
Genial, ya se acerca la hora 12 vamos a preparar los entregables sobre las cosas que llevamos hechas para subir al classroom, miguel ya terminó el bloque B7
```

## Decisiones de Juan David antes de empezar

- Cómo: **insumos para redactar**. Por cada entregable, un paquete con datos verificados, tablas, diagramas en Mermaid y evidencia real, fuera del repositorio (carpeta hermana `evidencias_para_juan_manuel/entregables/`). La redacción final de los PDF la hace el equipo (Juan Manuel / Claude Web); ningún agente crea ni edita `documentos/`, y E08 lo redacta el equipo.
- Prioridad: E02, E03 y E05.
- Alcance: solo lo integrado en `main` (CP1 y CP2, `7c281cc`) más F5 (`478b078` en `feat/frontend-ui`). B6 y B7 todavía no están en GitHub (`feat/backend-api` en `8f4e479`): se marcan como pendientes hasta su PR del CP3.

## Plan aprobado

- E02: historias HU01–HU14 con criterios Dado/Cuando/Entonces tomados del contrato, requisitos de calidad, exportación del tablero (GitHub Projects), relación historia → tarea → commit → PR → prueba, ciclo de vida (checkpoints y PR), funciones incompletas y plantilla de la tarjeta de la hora 12.
- E03: diagramas Mermaid generados del código real (flujo de usuario, arquitectura, MER desde V1, clases desde `dominio/`, actividades de la transformación), esquema de pantallas con capturas reales y decisiones técnicas candidatas.
- E05: tabla de casos realmente ejecutados con esperado, obtenido y evidencia; las 37 pruebas JUnit con el resumen real de `mvnw test`; pendientes declarados.
- Nada inventado: cada cifra sale de un archivo de evidencia, de `git log`, de `gh` o del código; lo no ejecutado queda "Pendiente".
