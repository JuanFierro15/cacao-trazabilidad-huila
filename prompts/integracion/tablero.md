# Tablero del proyecto (E02)

- Integrante: Juan David Fierro Calderón
- Herramienta: Claude Code (claude-opus-5-5), ejecutado directamente con `gh` (administración de GitHub, sin delegar)
- Fecha y hora: 2026-10-16 00:04
- Rama del registro: `docs/tablero-proyecto` (desde `origin/main`), integrada por PR

## Prompt

```text
<contexto>
- Repo JuanFierro15/cacao-trazabilidad-huila. Equipo KGB:
  - Miguel: base de datos y backend.
  - Juan David: frontend e integración.
  - Juan Manuel: documentación, pruebas manuales, usabilidad y pitch, sin código.
- Lee CLAUDE.md (sección 4) y PLAN_BLOQUES.md. Necesitamos el tablero de tareas que exige el entregable E02, en GitHub Projects y enlazado al repo.
- gh ya tiene el permiso project. Es administración con gh: hazlo tú directamente, sin delegar a agy.
</contexto>

<tarea>
- Crear las etiquetas, un issue por tarea, el Project del equipo con los issues agregados y su estado, y registrar el trabajo en la bitácora de integración mediante un PR.
</tarea>

<restricciones>
- Nada de menciones a IA en títulos ni cuerpos de issues o PR.
- No inventes evidencia. Lo hecho se cierra solo con los commits y PR que existen en git log. Si no encuentras un commit, deja el issue abierto y avísame.
- Antes de crear nada, obtén los usuarios de GitHub con:
  gh api repos/JuanFierro15/cacao-trazabilidad-huila/collaborators --jq '.[].login'
  Pregúntame cuál es Miguel y cuál es Juan Manuel. Si Juan Manuel no es colaborador, sus issues van sin asignar y con su nombre en el cuerpo.
</restricciones>

<bloques>
- 1. Etiquetas con gh label create:
  - backend, frontend, integracion, documentacion, hora-12;
  - una por cada historia: HU01 a HU14.
- 2. Historias, para usar en los cuerpos de los issues:
  - HU01 RF01 Recepción de lotes (operador)
  - HU02 RF02 Transformación por etapas (operador)
  - HU03 RF03 Trazabilidad de recepción a producto
  - HU04 RF04 Alertas con regla y causa (admin)
  - HU05 RF05 Costo unitario y margen con fórmulas (admin)
  - HU06 RF06 Ficha pública con QR (comprador)
  - HU07 RF07 Respaldo y restauración sin pérdida (admin)
  - HU08 RF08 Inventario sin sobreconsumo ni doble consumo
  - HU09 RF09 Liberar o bloquear solo admin, con motivo
  - HU10 RF10 Auditoría inmutable
  - HU11 RF11 Filtros y exportación CSV (admin)
  - HU12 RF12 Balance sin división entre cero y simulador de margen
  - HU13 Cuota de plausibilidad por finca (diferenciador)
  - HU14 Acceso por rol con JWT
- 3. Issues de tareas. Título: "<id> — <nombre del bloque>". Cuerpo:
  - historia o historias;
  - objetivo y criterio de verificación copiados de CLAUDE.md;
  - responsable;
  - checkpoint.

  Lista de issues:
  - Bloque 0 (integracion, Juan David)
  - B1 HU14 (backend, Miguel)
  - B2 HU14 HU09 (backend, Miguel)
  - B3 HU01 HU11 HU13 HU10 (backend, Miguel)
  - B4 HU02 HU04 HU05 HU08 HU12 (backend, Miguel)
  - B5 HU03 HU06 HU09 HU10 (backend, Miguel)
  - B6 HU09 HU11 (backend y hora-12, Miguel)
  - B7 HU07 (backend, Miguel)
  - B8, pruebas automatizadas, todas las historias (backend, Miguel)
  - B9 opcional (backend, Miguel)
  - F1 HU14 (frontend, Juan David)
  - F2 HU01 HU13 (frontend, Juan David)
  - F3 HU02 HU08 (frontend, Juan David)
  - F4 HU04 HU05 HU11 HU12 (frontend, Juan David)
  - F5 HU03 HU06 (frontend, Juan David)
  - F6 HU09 HU10 (frontend y hora-12, Juan David)
  - F7, accesibilidad y usabilidad (frontend, Juan David)
  - I1 rendimiento sobre 100 registros (integracion, Juan David)
  - I2 HU07 respaldo de demostración (integracion, Juan David)
  - I3 cierre (integracion, Juan David)
  - JM1 revisar documentación contra lo construido (documentacion, Juan Manuel)
  - JM2 ejecutar casos manuales (documentacion, Juan Manuel)
  - JM3 prueba de usabilidad con persona externa (documentacion, Juan Manuel)
  - JM4 instalación limpia final (documentacion, Juan Manuel)
  - JM5 pitch E09 (documentacion, Juan Manuel)
  - E01, E02, E03, E05, E06, E07, E08, E09 y E10, un issue por documento (documentacion, sin asignar)
  - "Incidencia hora 12: bloqueo de CAC001" (hora-12). Cuerpo con la plantilla vacía: hora del anuncio, quién la recibió, qué se pidió, criterio ajustado de RF09, commits de B6 y F6, prueba de regresión. Todo en blanco: se llena cuando ocurra.
- 4. Project:
  - gh project create --owner JuanFierro15 --title "KGB — Asoprocacao (Hackathon USCO)"
  - Vincúlalo al repo con gh project link.
  - Crea el campo "Checkpoint", de selección única, con las opciones CP1, CP2, CP3 y Cierre. Asígnalo así:
    - CP1: Bloque 0, B1, B2, B3, F1, F2;
    - CP2: B4, B5, F3, F4;
    - CP3: B6, B7, B8, F5, F6, I1;
    - Cierre: lo demás.
  - Agrega todos los issues con gh project item-add.
- 5. Estado, con el campo Status del project:
  - Done, y el issue se cierra con un comentario de evidencia:
    - Bloque 0 (commits 9df7ac8 a abb34f1);
    - F1 (b34b14e, PR #2);
    - F2 (búscalo en git log, PR #2);
    - B1 (5b2f465), B2 (41312f0) y B3 (8651a50, corrección 18b6a4d), con PR #1 y #3.
    - El comentario incluye además la validación del CP1 que te paso abajo.
  - In Progress: F3 (commit 9e2d9a6). Verificado solo con simulaciones; falta verificarlo contra la API real cuando entre B4.
  - Pregúntame si B4 y F4 ya están en curso antes de marcarlos.
  - Todo: lo demás.
- 6. Validación del CP1, para el comentario de los issues cerrados:
  - mvnw test: 20 pruebas, 0 fallos y 0 errores contra cacao_test.
  - Arranque sin errores; Flyway valida V1 y V2.
  - Login 200, contraseña errada 401, campos vacíos 400.
  - GET /api/lotes 200; el filtro por origen funciona.
  - Recepción: -5 y campos vacíos dan 400, código duplicado 409, lote válido 201.
  - Operador cambiando estado: 403.
  - El frontend lista los lotes desde la API real.
  - Build y lint del frontend sin errores.
- 7. Bitácora:
  - Crea la rama docs/tablero-proyecto desde origin/main.
  - Guarda este prompt en prompts/integracion/tablero.md y agrega su fila en prompts/integracion/BITACORA.md.
  - Commit: `docs: registrar creación del tablero del proyecto`
  - Push de la rama. Abre el PR con gh pr create y haz el merge con gh pr merge --merge --delete-branch.
  - Vuelve a la rama en la que estabas.
</bloques>

<verificacion>
- gh issue list --state all --limit 60 muestra todos los issues con sus etiquetas.
- gh project item-list devuelve todos los items con su Status y su Checkpoint.
- Dame la URL del Project y una tabla corta: issue, estado y evidencia. Luego detente.
</verificacion>

Además deja el proyecto público y agrega a Miguel y a Juan Manuel como colaboradores.
```

## Respuestas de Juan David antes de crear

- Usuarios de GitHub: `MiguelMD06` es Miguel y `jmvr24` es Juan Manuel. Los dos son colaboradores del repositorio.
- B4 (`c124c83`) y B5 (`8f4e479`) ya tienen commit en `feat/backend-api`, todavía sin PR ni verificación del Checkpoint 2: quedan **In Progress** los dos.
- F4: diseño listo en `prompts/frontend/F4.md`, todavía sin aprobar ni implementar: queda **In Progress**.

## Notas de ejecución

- Bloque 0 y F1 no tienen objetivo ni verificación detallados en la sección 4 de `CLAUDE.md`; para sus issues se tomaron de `prompts/integracion/0.md` y `prompts/frontend/F1.md`.
- Para respetar la restricción de no mencionar IA en los issues, los cuerpos no nombran los archivos de contexto de agentes y el issue de E08 remite a la fila E08 de `ENTREGA.md` en lugar de escribir la ruta del archivo.
- Resultado: Project en https://github.com/users/JuanFierro15/projects/1 e issues #4 a #38 en el repositorio.
