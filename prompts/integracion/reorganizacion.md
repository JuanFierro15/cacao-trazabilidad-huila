# Reorganización del equipo y bitácoras por área

- Integrante: Juan David Fierro Calderón
- Herramienta: Claude Code
- Fecha y hora: 2026-10-15 20:14
- Rama: `main` y luego `feat/frontend-ui`

## Prompt

```text
<contexto>
- Estoy en main con CLAUDE.md, PLAN_BLOQUES.md, README.md y docs/CONTRATO_TECNICO.md recién reemplazados, todavía sin commit.
- Reorganización del equipo:
  - Miguel: base de datos y backend en feat/backend-api.
  - Juan David: frontend en feat/frontend-ui y luego integración en feat/integracion.
  - Juan Manuel: NO tiene rama ni toca el repositorio. Revisa la documentación, ejecuta las pruebas manuales, coordina la usabilidad, hace la instalación limpia y prepara el pitch, que entrega a Juan David para que lo suba en I3.
- La rama feat/db-datos se elimina. La rama docs/pitch NO se crea.
- Es trabajo de git y documentación: hazlo tú directamente, sin delegar a agy.
</contexto>

<tarea>
- Paso 1: corregir las referencias a la rama de pitch.
- Paso 2: dejar las bitácoras por área y hacer el commit en main.
- Paso 3: eliminar feat/db-datos.
- Paso 4: traer main a feat/frontend-ui y mover allí la bitácora de F1.
</tarea>

<restricciones>
- No modifiques .gitignore, GEMINI.md, migraciones, pom.xml, application.yml ni código de backend/ o frontend/.
- Mensajes de commit en español, sin mencionar IA y sin Co-authored-by.
- No hagas push de ramas; la única operación remota permitida es borrar feat/db-datos.
</restricciones>

<bloques>
- 1.1 git diff --stat: confirma que los cambios sin commit solo tocan los 4 archivos. Si aparece otro, detente.
- 1.2 Corrige toda mención de la rama docs/pitch y de prompts/pitch:
  - CLAUDE.md, sección 1: Juan Manuel "no tiene rama: entrega los archivos del pitch a Juan David, que los sube en I3".
  - CLAUDE.md, sección 3: las áreas de bitácora son solo backend, frontend e integracion. Integración incluye el registro del pitch si se usaron herramientas para prepararlo.
  - CLAUDE.md, bloque I3: "subir a pitch/ los archivos que entrega Juan Manuel".
  - CLAUDE.md, sección 4.4, punto Pitch: "prepara la presentación y el guion, los entrega a Juan David, que los sube a pitch/ en I3. No tiene rama ni hace commits".
  - PLAN_BLOQUES.md, sección 1: la rama de Juan Manuel es "ninguna".
  - PLAN_BLOQUES.md, sección 2: quita git switch docs/pitch. Juan Manuel solo clona y lee.
  - PLAN_BLOQUES.md, cronograma: "prepara el pitch (lo entrega a Juan David)".
  - PLAN_BLOQUES.md, sección 5: el orden de los checkpoints es "backend → frontend".
  - PLAN_BLOQUES.md, sección 8: "las tres bitácoras".
  - PLAN_BLOQUES.md: donde diga que feat/db-datos "se borra", que diga "se borró".
  - docs/CONTRATO_TECNICO.md, sección 1: Juan Manuel con rama "ninguna" y sin archivos propios; Juan David agrega pitch/ a lo que es suyo en integración.
  - Al final, grep -rn "docs/pitch\|prompts/pitch" en esos archivos no debe devolver nada.
- 2.1 Bitácoras:
  - Asegura prompts/integracion/BITACORA.md, prompts/frontend/BITACORA.md y prompts/backend/BITACORA.md con el mismo encabezado (fecha y hora, integrante, herramienta, bloque, archivos generados, revisión humana).
  - Si existen prompts/datos/ o prompts/pitch/ sin filas, elimínalas. Si tienen filas, detente y avisa.
- 2.2 Mueve las filas de prompts/BITACORA.md de main a prompts/integracion/BITACORA.md.
  - Agrega una fila: "Reorganización del equipo: base de datos y backend se unifican en Miguel; Juan Manuel pasa a documentación, pruebas manuales y pitch sin rama".
- 2.3 Deja prompts/BITACORA.md solo como índice: enlaces a las tres bitácoras y la nota "No se agregan filas aquí; en un conflicto de merge se conserva este índice y las filas pasan a la bitácora del área".
- 2.4 Commit en main: `docs: reorganizar responsabilidades del equipo y bitácoras por área`
- 3.1 Elimina feat/db-datos:
  - Comprueba primero con git log main..origin/feat/db-datos --oneline que no tenga commits propios. Si tiene, detente y muéstramelos.
  - Si está vacía, ejecuta git branch -D feat/db-datos (si existe en local) y git push origin --delete feat/db-datos.
- 4.1 git switch feat/frontend-ui y git merge main.
- 4.2 Si hay conflicto en prompts/BITACORA.md:
  - Conserva la versión de main.
  - Mueve la fila de F1 y cualquier fila de la rama a prompts/frontend/BITACORA.md.
  - El estado "revisada" del Bloque 0 se aplica en prompts/integracion/BITACORA.md.
  - Ninguna fila se pierde ni se duplica.
- 4.3 La fila de F1 queda con su estado real: commit b34b14e, revisada por Juan David, con la corrección manual de las redirecciones en AuthContext.jsx y RutaProtegida.jsx.
- 4.4 Commit de merge: `chore: integrar main y mover bitácora del frontend a su archivo`
</bloques>

<verificacion>
- En main: git show --stat HEAD toca solo CLAUDE.md, PLAN_BLOQUES.md, README.md, docs/CONTRATO_TECNICO.md y prompts/.
- git ls-remote --heads origin no muestra feat/db-datos ni docs/pitch.
- En feat/frontend-ui:
  - git diff main -- prompts/BITACORA.md CLAUDE.md docs/CONTRATO_TECNICO.md sale vacío.
  - prompts/frontend/BITACORA.md tiene la fila de F1.
- npm run build en frontend/ sigue sin errores.
- Muestra git log --oneline --graph --all -8 y detente.
</verificacion>
```
