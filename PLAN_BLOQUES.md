# Plan de bloques — Hackathon Cacao (Asoprocacao)

Complementa a `CLAUDE.md`: allí están las reglas y los bloques de cada rama; aquí, el reparto, la incorporación, el cronograma, los checkpoints y el cierre.

Supuesto de horario: si el commit final se registra el 16/10 a las 2:00 p. m., la **hora 0 fue el 15/10 a las 2:00 p. m.** y la incidencia de la hora 12 llega cerca de las **2:00 a. m.** Ajusten si la organización dio otra hora.

---

## 1. Reparto actual (desde las 19:55 del 15/10)

| Integrante | Rama | Herramienta | Modo de BD | Bloques |
|---|---|---|---|---|
| Miguel Ángel Medina Díaz | `feat/backend-api` | agy | Local (PostgreSQL instalado) | B1–B8 (+B9 opcional) |
| Juan David Fierro Calderón | `feat/frontend-ui`, luego `feat/integracion` | Claude Code (delega en agy) | Docker | F1–F7, luego I1–I3 |
| Juan Manuel Villalba Rincón | ninguna | — | — | Revisión de documentos, casos manuales, usabilidad, instalación limpia, pitch |

Por qué se reorganizó: las entidades JPA y el esquema cambian juntos. Con la base y el backend en manos de dos personas, cada ajuste de columna obliga a coordinar una migración entre dos ramas. Un solo dueño elimina esa espera. La rama `feat/db-datos` quedó sin uso y se borró.

Estado al reorganizar:
- Bloque 0: completado en `main`.
- F1: terminado (commit b34b14e).
- B1: código terminado; falta verificarlo contra PostgreSQL (`CLAUDE.md`, 4.1).

## 2. Incorporación

**Miguel** (ya tiene clon, PostgreSQL y `.env`):
```
git switch feat/backend-api
git fetch origin
git merge origin/main
```
Si aparece conflicto en `prompts/BITACORA.md`, se resuelve con la regla de la sección 3 de `CLAUDE.md` (índice de `main`; sus filas a `prompts/backend/BITACORA.md`). Luego arranca el backend una vez para que Flyway cree las tablas y re-verifica B1.

**Juan Manuel** (solo clona y lee; no crea rama ni hace commits):
```
git clone https://github.com/JuanFierro15/cacao-trazabilidad-huila.git
cd cacao-trazabilidad-huila
```
Lee `docs/CONTRATO_TECNICO.md` y `CLAUDE.md` (sección 4.4). No necesita base de datos para su trabajo hasta la instalación limpia. Los archivos del pitch se los entrega a Juan David, que los sube en I3.

**Juan David:** sigue en `feat/frontend-ui` con `VITE_USE_MOCKS=true` en su `.env` hasta el Checkpoint 1.

## 3. Prompts de arranque

Miguel (agy, `feat/backend-api`):
```
Lee GEMINI.md y docs/CONTRATO_TECNICO.md completos. Estás en MODO LOCAL (sin Docker).
Re-verifica el bloque B1 de la sección 4.1: arranca el backend contra PostgreSQL local
y confirma que Flyway aplica V1 y V2 y que Hibernate valida el esquema sin errores.
Si una entidad no coincide con V1, corrige la entidad, nunca la migración ni ddl-auto.
No hagas commit. Responde con el formato de la sección 6 y detente.
```
Luego: `Siguiente: bloque B2`, y así sucesivamente.

Juan David (Claude Code, `feat/frontend-ui`):
```
Bloque F2 de la sección 4.3. Sigue el flujo 5A: diseña la implementación, muéstrame el plan y, cuando lo apruebe, delega a agy con una instrucción autocontenida. Revisa el diff, haz el commit y detente.
```

Abrir una sesión nueva del agente cada 2–3 bloques evita que el contexto se degrade.

## 4. Cronograma y checkpoints

| Hora reloj | Hora reto | Miguel | Juan David | Juan Manuel |
|---|---|---|---|---|
| 19:55–22:00 | 6–8 | B1 (verificar), B2, B3 | F2 (simulaciones) | lee contrato y CLAUDE.md |
| **22:00** | **8** | **Checkpoint 1**: entra B3 | entra F2 | |
| 22:00–02:00 | 8–12 | B4, B5 | F3, F4 | revisa E01–E03 a medida que salgan |
| **02:00** | **12** | **Checkpoint 2 + incidencia CAC001** (anotar la hora real): entra B5 | entra F4 | casos manuales 1–5 y 7–9 |
| 02:00–06:00 | 12–16 | B6, B7, B8 | F5, F6 | prepara el pitch (lo entrega a Juan David) |
| **06:00** | **16** | **Checkpoint 3**: entra B8 | entra F6 | flujo completo de 8 minutos |
| 06:00–09:00 | 16–19 | correcciones, B9 opcional | I1 (rendimiento) en `feat/integracion` | prueba de usabilidad con persona externa |
| 09:00–11:00 | 19–21 | correcciones | F7, I2 (respaldo demo) | casos manuales finales |
| **11:00** | **21** | **Congelación de funciones**: solo correcciones | | instalación limpia (I3) |
| **12:00** | **22** | **Etiqueta `v1.0-entrega`** | | |
| 13:00 | 23 | Documentos en Classroom | | |
| 14:00 | 24 | Registro oficial del commit | | |

Riesgo a vigilar: Miguel carga más bloques que antes. Si en el Checkpoint 2 va atrasado, B7 (scripts de respaldo) pasa a Juan David en `feat/integracion`, y B9 se descarta.

Turnos de descanso escalonados: que Miguel y Juan David nunca duerman a la vez entre las horas 12 y 16.

## 5. Protocolo de cada checkpoint (orden: backend → frontend)

1. El dueño de la rama ejecuta `git fetch origin && git merge origin/main`, vuelve a correr la verificación de su último bloque y hace push.
2. Abre un PR a `main` con título en formato Conventional Commits.
3. Otro integrante revisa 5 minutos: archivos fuera de las carpetas del dueño, secretos, menciones prohibidas en commits.
4. Merge con **merge commit** (no squash): conserva un commit por bloque, que es la evidencia de "historia → tarea → commit" en E02.
5. Los demás ejecutan `git fetch origin && git merge origin/main`.
6. Juan David valida `main` en su PC (modo Docker):
   - **CP1:** base limpia con 3 lotes; login de `admin1` y `operador1`; lote válido 201 y cantidad −5 → 400; el frontend apaga simulaciones para login y recepción.
   - **CP2:** pruebas 3, 4, 5, 7 y 9 del contrato (sección 10).
   - **CP3:** recorrido completo de 8 minutos desde la interfaz; bloqueo en cascada; CSV; `mvnw test` en verde; scripts de B7 en modo Docker.

## 6. Incidencia de la hora 12

Cuando la organización la anuncie: anotar la hora exacta, quién la recibió y qué se pidió. Miguel ejecuta B6 y agrega la regresión en B8; Juan David ejecuta F6. Con esos datos se redacta la tarjeta de cambio y el criterio ajustado de RF09 en E02 (el bloqueo se propaga a los derivados y se emite reporte de recall).

## 7. Cierre

```
git switch main && git pull
git tag -a v1.0-entrega -m "Entrega final II Hackathon de Programación"
git push origin v1.0-entrega
git rev-parse v1.0-entrega^{commit}
```

- `ENTREGA.md` referencia la etiqueta; el hash completo va en el PDF de Classroom y en el canal oficial (un archivo no puede contener el hash del commit que lo incluye).
- Después de la etiqueta no se toca `main`. Si aparece un error grave antes de las 2:00 p. m., se corrige, se vuelve a verificar y se mueve la etiqueta solo con acuerdo de los tres, avisando el nuevo hash.
- Visibilidad del repositorio: hacerlo público o invitar a los jurados según indique la organización.

## 8. Qué enviar para redactar la documentación (E01–E10)

A medida que exista, sin maquillar:
- Exportación o capturas del tablero de tareas.
- `git log --oneline --all` de cada checkpoint.
- Salida real de `mvnw test` (resumen de pruebas, fallos y modo usado).
- Resultado de cada caso manual: esperado, obtenido, estado y evidencia.
- Archivo de medición de rendimiento (I1) con la máquina usada.
- Notas de la prueba de usabilidad: perfil general, tiempos, dificultades, mejora aplicada y capturas antes/después.
- Hora y detalle de la incidencia de la hora 12.
- Las tres bitácoras de `prompts/` (para E08).
