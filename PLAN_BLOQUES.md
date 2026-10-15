# Plan de bloques — Hackathon Cacao (Asoprocacao)

Archivo versionado como registro de uso de herramientas (ver `CLAUDE.md`, sección 3). Complementa a `CLAUDE.md`: allí están las reglas y los bloques de cada rama; aquí, el arranque del repositorio, la incorporación de los compañeros, el cronograma y el cierre.

Supuesto de horario: si el commit final se registra el 16/10 a las 2:00 p. m., la **hora 0 fue el 15/10 a las 2:00 p. m.** y la incidencia de la hora 12 llega cerca de las **2:00 a. m.** Ajusten si la organización dio otra hora.

---

## 1. Ahora mismo (mientras Juan David hace el Bloque 0)

Juan David comparte en el grupo el `.zip` del kit. Miguel y Juan Manuel, sin esperar el repositorio:

1. Instalan o verifican: Git, Docker Desktop (abierto), Java 21 (`java -version`), Node 22 (`node -v`), agy (`agy models` responde).
2. Leen `docs/CONTRATO_TECNICO.md` completo. Miguel: secciones 5–8. Juan Manuel: secciones 5, 9 y 10.
3. Envían su usuario de GitHub a Juan David para que los agregue como colaboradores.

## 2. Bloque 0 — Creación del repositorio (Juan David, Claude Code, rama `main`)

Duración objetivo: 35–45 minutos.

### 2.1 Preparación manual

```bash
mkdir cacao-trazabilidad-huila
cd cacao-trazabilidad-huila
# descomprimir aquí el contenido del kit (incluye CLAUDE.md, PLAN_BLOQUES.md, .claude/, .gitignore, backend/, docs/...)
git init -b main
claude
```

### 2.2 Prompt para Claude Code (pegar tal cual)

> Versión original del kit. La versión ejecutada, que agrega el paso 0.0 (versionar los archivos de agentes), está en `prompts/frontend/0.md`.

```
<contexto>
- Estoy en la raíz del repositorio cacao-trazabilidad-huila, con el kit del equipo ya descomprimido y git inicializado en main sin commits.
- Lee CLAUDE.md, docs/CONTRATO_TECNICO.md y la sección 2 de PLAN_BLOQUES.md antes de empezar.
- Sistema operativo: Windows (usa curl.exe y mvnw.cmd si aplica; si es Linux o macOS, los equivalentes).
</contexto>

<tarea>
- Ejecuta el Bloque 0, pasos 0.1 a 0.4. Es trabajo de generadores y copia de archivos: hazlo tú directamente, sin delegar a agy.
</tarea>

<restricciones>
- El primer commit contiene únicamente .gitignore.
- No modifiques ningún archivo del kit: V1, V2, pom.xml, application.yml, CacaoTrazabilidadApplication.java, docker-compose.yml, .env.example, README.md, ENTREGA.md ni docs/CONTRATO_TECNICO.md.
- Del zip de Spring Initializr solo se toman mvnw, mvnw.cmd, la carpeta .mvn/ y .gitattributes. Su pom.xml, sus pruebas y su application.properties se descartan (Initializr genera Spring Boot 4.x; el proyecto usa 3.5.16).
- Ninguna mención a IA, Claude o Anthropic en commits ni archivos. Sin líneas Co-authored-by.
- No hagas push: lo hago yo.
</restricciones>

<bloques>
- 0.1 Verifica con `git check-ignore -v CLAUDE.md PLAN_BLOQUES.md .claude/settings.json .env` que estén ignorados. Commit: `chore: agregar .gitignore inicial`
- 0.2 Backend: descarga en una carpeta temporal fuera del repo
  https://start.spring.io/starter.zip?type=maven-project&language=java&javaVersion=21&groupId=co.edu.usco.devurity&artifactId=cacao-trazabilidad&name=cacao-trazabilidad&packageName=co.edu.usco.cacao&dependencies=web
  copia a backend/ solo mvnw, mvnw.cmd, .mvn/ y .gitattributes, y marca mvnw como ejecutable en git (`git update-index --chmod=+x backend/mvnw` después de agregarlo).
  Crea .env desde .env.example, levanta `docker compose up -d`, espera a que esté healthy y arranca el backend con `-DskipTests spring-boot:run`.
  Commit: `chore: agregar esqueleto del backend, esquema inicial y datos semilla`
  (incluye backend/, docker-compose.yml, .env.example, docs/, README.md, ENTREGA.md y los .gitkeep de datos/, documentos/ y pitch/)
- 0.3 Frontend: `npm create vite@latest frontend -- --template react` (si pregunta por rolldown experimental o por instalar y arrancar ahora, responde que no). Luego en frontend/: `npm install` y `npm install tailwindcss @tailwindcss/vite react-router qrcode.react`. Reemplaza vite.config.js y src/index.css con los de la sección 2.3 de PLAN_BLOQUES.md, y deja App.jsx con un título "Cacao con historia" usando las clases bg-crema y text-cacao para confirmar Tailwind.
  Commit: `chore: agregar esqueleto del frontend con React, Vite y Tailwind`
- 0.4 Muestra `git log --oneline` y `git status` (debe estar limpio y sin CLAUDE.md, PLAN_BLOQUES.md, .claude/ ni .env).
</bloques>

<verificacion>
- El log del backend muestra que Flyway aplicó 2 migraciones y la aplicación arrancó en el puerto 8080.
- `docker compose exec -T db psql -U cacao -d cacao -c "select codigo_lote, cantidad_disponible from lotes order by 1"` devuelve CAC001 100, CAC002 150, CAC003 80.
- `npm run build` en frontend/ termina sin errores.
- Exactamente 3 commits, en español, sin menciones a IA ni co-autoría.
- Responde con el formato de la sección 6 de CLAUDE.md y detente.
</verificacion>
```

### 2.3 Archivos de configuración del frontend (los usa el paso 0.3)

`frontend/vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '..',
  server: {
    host: true,
    port: 5173,
    proxy: { '/api': 'http://localhost:8080' },
  },
})
```

`frontend/src/index.css`
```css
@import "tailwindcss";

@theme {
  --color-cacao: #3E2723;
  --color-mazorca: #D97706;
  --color-origen: #15803D;
  --color-crema: #FDFBF7;
}

body {
  @apply bg-crema text-cacao;
}
```

### 2.4 GitHub (Juan David, manual)

```bash
gh repo create cacao-trazabilidad-huila --private --source=. --remote=origin --push
# sin gh: crear el repo vacío en github.com y luego
#   git remote add origin https://github.com/JuanFierro15/cacao-trazabilidad-huila.git
#   git push -u origin main

git branch feat/backend-api
git branch feat/db-datos
git branch feat/frontend-ui
git push -u origin feat/backend-api feat/db-datos feat/frontend-ui

gh repo edit --add-topic spring-boot,java,react,vite,tailwindcss,postgresql,jwt,flyway,trazabilidad,hackathon
```

- Colaboradores: Settings → Collaborators → agregar a Miguel y a Juan Manuel con permiso de escritura.
- Visibilidad: **privado** durante la construcción (los demás equipos no ven el código). Al congelar, se hace público o se invita a los jurados, según indique la organización.
- Enviar al grupo: URL del repo (el clon ya trae `CLAUDE.md` y `GEMINI.md`).

## 3. Incorporación de Miguel y Juan Manuel

```bash
git clone https://github.com/JuanFierro15/cacao-trazabilidad-huila.git
cd cacao-trazabilidad-huila
git switch feat/backend-api          # Juan Manuel: git switch feat/db-datos
copy .env.example .env               # Linux/macOS: cp .env.example .env
```

1. No hay que copiar nada: el clon ya trae `CLAUDE.md` y `GEMINI.md` (agy lee `GEMINI.md`, que importa `CLAUDE.md` con `@./CLAUDE.md`).
2. Confirmar: `git ls-files CLAUDE.md GEMINI.md` debe listar los dos (están versionados) y `git check-ignore -v .env` debe mostrar la regla del `.gitignore` (`.env` sigue sin versionarse).
3. Levantar y probar:
   ```bash
   docker compose up -d
   cd backend
   mvnw.cmd -DskipTests spring-boot:run    # Linux/macOS: ./mvnw ...
   ```
   Debe decir que Flyway aplicó 2 migraciones. Detener con Ctrl+C.

Juan David sigue en su clon original: `git switch feat/frontend-ui`.

## 4. Prompts de arranque de cada agente

Miguel (agy, `feat/backend-api`):
```
Lee GEMINI.md y docs/CONTRATO_TECNICO.md completos. Confirma tu rama con git branch --show-current.
Ejecuta solo el bloque B1 de la sección 4.1. No hagas commit. Al terminar responde con el formato de la sección 6 y detente.
```

Juan Manuel (agy, `feat/db-datos`):
```
Lee GEMINI.md y docs/CONTRATO_TECNICO.md completos. Confirma tu rama con git branch --show-current.
Ejecuta solo el bloque D1 de la sección 4.2. No hagas commit. Al terminar responde con el formato de la sección 6 y detente.
```

Juan David (Claude Code, `feat/frontend-ui`):
```
Bloque F1 de la sección 4.3. Sigue el flujo 5A: diseña la implementación, muéstrame el plan y, cuando lo apruebe, delega a agy con una instrucción autocontenida. Revisa el diff, haz el commit y detente.
```

Para los siguientes: `Siguiente: bloque B2` (o D2, F2...). Abrir una sesión nueva del agente cada 2–3 bloques evita que el contexto se degrade.

## 5. Cronograma y checkpoints

| Hora reloj | Hora reto | Backend (Miguel) | Datos (Juan Manuel) | Frontend (Juan David) |
|---|---|---|---|---|
| 18:15–19:00 | 4–5 | prerrequisitos, leer contrato | prerrequisitos, leer contrato | **Bloque 0** |
| 19:00–22:00 | 5–8 | B1, B2, B3 | D1, D2 | F1, F2 (con simulaciones) |
| **22:00** | **8** | **Checkpoint 1**: entran D1–D2 y B1–B3 a `main`; frontend apaga simulaciones para login y lotes | | |
| 22:00–02:00 | 8–12 | B4, B5 | D3 (parte SQL) | F3, F4 |
| **02:00** | **12** | **Checkpoint 2 + incidencia CAC001**: tarjeta de cambio con la hora real | | |
| 02:00–06:00 | 12–16 | B6, B7 | D3 (medición contra la API) | F5, F6 |
| **06:00** | **16** | **Checkpoint 3**: flujo completo en `main` | | |
| 06:00–09:00 | 16–19 | correcciones y pruebas | instalación limpia en su PC desde cero | prueba con persona externa (E06), F7 |
| 09:00–11:00 | 19–21 | 15 casos manuales con resultados reales | D4 respaldo demo, D6 pitch | correcciones, README final |
| **11:00** | **21** | **Congelación de funciones**: solo correcciones | | |
| **12:00** | **22** | **Etiqueta `v1.0-entrega`** | | |
| 13:00 | 23 | Documentos en Classroom | | |
| 14:00 | 24 | Registro oficial del commit | | |

Turnos de descanso escalonados: que nunca duerman dos a la vez en las horas 12–16.

### Protocolo de cada checkpoint (en este orden: datos → backend → frontend)

1. El dueño de la rama: `git fetch origin && git merge origin/main`, vuelve a correr la verificación de su último bloque y hace push.
2. Abre un PR a `main` con título en formato Conventional Commits.
3. Otro integrante revisa 5 minutos: archivos fuera de la carpeta del dueño, secretos, menciones prohibidas.
4. Merge con **merge commit** (no squash): conserva un commit por bloque, que es la evidencia de "historia → tarea → commit" en E02.
5. Los demás: `git fetch origin && git merge origin/main`.

### Incidencia de la hora 12

Cuando la organización la anuncie: anotar la hora exacta, quién la recibió y qué se pidió. Miguel ejecuta B6, Juan David F6, Miguel agrega la regresión en B7. Con esos datos se redacta la tarjeta de cambio y el criterio ajustado de RF09 en E02 (el bloqueo se propaga a los derivados y se emite reporte de recall).

## 6. Cierre

```bash
git switch main && git pull
git tag -a v1.0-entrega -m "Entrega final II Hackathon de Programación"
git push origin v1.0-entrega
git rev-parse v1.0-entrega^{commit}    # hash completo para Classroom y el canal oficial
```

- `ENTREGA.md` referencia la etiqueta; el hash completo va en el PDF de Classroom y en el canal oficial (un archivo no puede contener el hash del commit que lo incluye).
- Después de la etiqueta no se toca `main`. Si aparece un error grave antes de las 2:00 p. m., se corrige, se vuelve a verificar y se mueve la etiqueta solo con acuerdo de los tres, avisando el nuevo hash.

## 7. Qué enviar para redactar la documentación (E01–E10)

A medida que exista, sin maquillar:
- Exportación o capturas del tablero de tareas.
- `git log --oneline --all` de cada checkpoint.
- Salida real de `mvnw test` (resumen de pruebas y fallos).
- Resultado de cada uno de los 15 casos manuales: esperado, obtenido, estado y evidencia.
- Archivo de medición de rendimiento (D3) con la máquina usada.
- Notas de la prueba de usabilidad: perfil general, tiempos, dificultades, mejora aplicada y capturas antes/después.
- Hora y detalle de la incidencia de la hora 12.
- Qué herramientas usó cada uno y para qué (para E08).

## 8. Por qué este orden

- **El contrato y el esquema van en el Bloque 0, antes de abrir ramas.** Con tres agentes trabajando en paralelo, lo que más rompe una integración es que cada uno invente la forma de los datos. Si `V1` y el contrato existen en `main` desde el minuto 40, Miguel escribe entidades que calzan (y `validate` lo comprueba), Juan Manuel escribe respaldos sobre el esquema real y Juan David programa contra el JSON real con simulaciones.
- **Primero lo que el jurado prueba en vivo.** B3/B4/F2/F3 cubren el recorrido de los 8 minutos (recepción → transformación → merma → alerta → balance). La auditoría y el CSV van después porque dependen de que existan esos datos.
- **La incidencia de la hora 12 tiene su propio bloque** para que la tarjeta de cambio, el ajuste del criterio y la regresión queden con hora real y commit propio.
- **Los respaldos van temprano (D2)** porque son la red de seguridad del equipo durante la noche, no solo un entregable.
- **Congelación a las 11:00 y etiqueta a las 12:00**, no a las 2:00 p. m.: los documentos de la 1:00 p. m. deben citar resultados y un hash que ya existan.
