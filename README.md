# Cacao con historia — Trazabilidad para Asoprocacao

MVP de software para que una asociación cacaotera del Huila registre la recepción de lotes, sus transformaciones y su comercialización con trazabilidad, control de inventario, alertas, balance económico, auditoría, respaldo verificable y una ficha pública con código QR.

> Proyecto del equipo KGB en el II Hackathon de Programación, II Feria Universitaria de Ciencia, Tecnología e Innovación del Huila (Universidad Surcolombiana, 15 y 16 de octubre de 2026). El caso, la asociación y los datos son simulados (sintéticos).

El índice de la entrega y la matriz de trazabilidad están en [`ENTREGA.md`](ENTREGA.md). Las reglas de negocio, la API y los permisos están en [`docs/CONTRATO_TECNICO.md`](docs/CONTRATO_TECNICO.md).

## 1. Requisitos del entorno

| Herramienta | Versión | Para qué |
|---|---|---|
| Git | cualquiera reciente | Clonar el repositorio |
| Java (JDK) | 21 o superior | Backend (Spring Boot 3.5.16, compila para Java 21). Maven viene incluido (`mvnw`) |
| Node.js | 22 LTS o superior | Frontend (React 19, Vite, Tailwind CSS 4) |
| Docker Desktop | con Docker Compose v2 | **Modo Docker:** PostgreSQL 16 en un contenedor |
| PostgreSQL | 16 (mínimo 13), con `psql`, `pg_dump` y `pg_restore` en el PATH | **Modo local:** si no se usa Docker |

Puertos: PostgreSQL 5433 (Docker) o el del servidor local, backend 8080 y frontend 5173.

Probado en el PC de la demostración: Windows 11, Java 25.0.1, Node 24.16.0, Docker con `postgres:16-alpine`.

## 2. Instalación limpia

Todos los comandos se ejecutan desde la raíz del repositorio, salvo donde se indica otra carpeta.

**1. Clonar**

```bash
git clone https://github.com/JuanFierro15/cacao-trazabilidad-huila.git
cd cacao-trazabilidad-huila
```

**2. Configuración.** Copiar el ejemplo y cambiar al menos la clave de la base y el secreto del token:

```bash
cp .env.example .env              # PowerShell: Copy-Item .env.example .env
```

- `POSTGRES_PASSWORD`: una clave propia.
- `JWT_SECRET`: una cadena aleatoria de 32 caracteres o más (por ejemplo, la salida de `openssl rand -base64 48`).

El `.env` nunca se sube al repositorio (está en `.gitignore`). Las variables se describen en la sección 3.

**3a. Base de datos en modo Docker**

```bash
docker compose up -d
docker compose ps                 # el servicio db debe quedar "healthy"
docker compose exec db createdb -U cacao cacao_test     # base para las pruebas automatizadas (una sola vez)
```

**3b. Base de datos en modo local (sin Docker).** Con el superusuario del servidor, una sola vez:

```bash
psql -U postgres -p <puerto> -c "CREATE ROLE cacao LOGIN PASSWORD '<la clave del .env>' CREATEDB;" -c "CREATE DATABASE cacao OWNER cacao;"
psql -U cacao -p <puerto> -d cacao -c "CREATE DATABASE cacao_test;"
```

Luego se pone ese puerto en `DB_PORT` del `.env`.

**4. Backend**

```bash
cd backend
./mvnw spring-boot:run            # Windows: .\mvnw.cmd spring-boot:run
```

Al arrancar, Flyway crea el esquema (`V1`) y carga los datos sintéticos (`V2`), y se crean los dos usuarios de demostración. En el registro deben aparecer `Successfully applied 2 migrations` (la primera vez) y `Started CacaoTrazabilidadApplication`. La API queda en `http://localhost:8080/api`.

**5. Frontend** (en otra terminal)

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`. Vite redirige `/api` al backend, así que no hace falta configurar CORS en desarrollo.

**6. Entrar** con un usuario de la sección 5.

**Opcional, QR desde un celular:** en el `.env`, `VITE_PUBLIC_BASE_URL=http://<IP-del-PC-en-la-red>:5173` (la IP sale de `ipconfig` o `ip addr`); reiniciar el frontend; el celular en la misma Wi-Fi; y el puerto 5173 permitido en el firewall del PC.

## 3. Configuración (`.env`, sin secretos en el repositorio)

| Variable | Ejemplo (`.env.example`) | Uso |
|---|---|---|
| `POSTGRES_DB`, `POSTGRES_USER` | `cacao` | Base y usuario de la aplicación |
| `POSTGRES_PASSWORD` | `cambiar_clave_local` | Clave de la base (cambiarla) |
| `DB_HOST`, `DB_PORT` | `localhost`, `5433` | Dónde está PostgreSQL |
| `JWT_SECRET` | 32 caracteres o más | Firma de los tokens (cambiarlo) |
| `JWT_EXPIRACION_MINUTOS` | `480` | Duración de la sesión |
| `APP_UMBRAL_MERMA` | `15.0` | Umbral de la alerta de merma (%) |
| `APP_CORS_ORIGENES` | `http://localhost:5173` | Orígenes permitidos fuera del proxy de Vite |
| `VITE_PUBLIC_BASE_URL` | vacío | URL base del QR (vacío = la del navegador) |
| `VITE_USE_MOCKS` | `false` | `true` usa respuestas simuladas sin backend (solo desarrollo) |

## 4. Datos

- **Semilla (Flyway `V2`):** productores PRD-A (Rivera, 2 ha), PRD-B (Campoalegre, 3,5 ha) y PRD-C (Algeciras, 0,5 ha, cuota 300 kg), y los lotes CAC001 (100 kg), CAC002 (150 kg) y CAC003 (80 kg), todos pendientes. CAC001 queda sin transformaciones para la prueba en vivo del jurado.
- **Respaldo de demostración:** `datos/respaldos/respaldo_demo.dump` devuelve la base a ese estado limpio (sección 7).
- **Datos de rendimiento:** `datos/rendimiento/cargar_100_registros.sql` carga 100 cadenas sintéticas `PERF` (400 lotes y 300 transformaciones), y `limpiar_registros_rendimiento.sql` las borra (sección 6).

## 5. Ejecución y usuarios de demostración

| Dirección | Qué es |
|---|---|
| `http://localhost:5173` | Aplicación (operador y administrador) |
| `http://localhost:5173/ficha` y `/ficha/<código>` | Ficha pública del producto, sin inicio de sesión |
| `http://localhost:8080/swagger-ui/index.html` | Documentación interactiva de la API |

| Usuario | Contraseña | Rol |
|---|---|---|
| `operador1` | `cacao123` | Operador: recepción, transformación y trazabilidad |
| `admin1` | `admin123` | Administrador: además inventario, alertas, balance, CSV, estados, recall y auditoría |

Son credenciales de demostración publicadas a propósito (contrato técnico, sección 7), no secretos.

## 6. Pruebas

**Backend** (52 pruebas: unitarias e integración contra PostgreSQL real, base `cacao_test`):

```bash
cd backend
./mvnw test                       # Windows: .\mvnw.cmd test
```

Al iniciar la suite, Flyway limpia y migra `cacao_test`; un seguro impide limpiar cualquier otra base. Resultado en el PC de la demostración sobre `main`: 52 pruebas, 0 fallos y 0 errores.

**Frontend:**

```bash
cd frontend
npm run lint
npm run build
```

**Rendimiento** (prueba 10 del jurado: trazabilidad en menos de 3 s con 100 registros), con el backend encendido:

```bash
# Docker: cargar los datos sintéticos
docker compose exec -T db psql -U cacao -d cacao -f /datos/rendimiento/cargar_100_registros.sql
# Medir (5 llamadas de calentamiento y 30 medidas)
powershell -ExecutionPolicy Bypass -File datos\rendimiento\medir_trazabilidad.ps1     # o: bash datos/rendimiento/medir_trazabilidad.sh
# Borrar los datos sintéticos
docker compose exec -T db psql -U cacao -d cacao -f /datos/rendimiento/limpiar_registros_rendimiento.sql
```

En modo local, los `.sql` se ejecutan con `psql -h localhost -p <puerto> -U cacao -d cacao -f datos/rendimiento/<archivo>.sql`. El reporte queda en `datos/rendimiento/resultados/`. Resultado medido el 16/10/2026 con 400 lotes: p95 de 22,27 ms y máximo de 23,94 ms (CUMPLE). La medición es local: no incluye la red ni el navegador.

Los casos de prueba manuales y sus resultados están en el informe de pruebas (E05).

## 7. Respaldo, restauración e integridad

Los scripts detectan solos el modo: si el servicio `db` de docker compose está en ejecución usan el contenedor; si no, las herramientas locales con los datos del `.env`.

```bash
# Respaldar (deja el .dump y su reporte .integridad.txt en datos/respaldos/)
powershell -ExecutionPolicy Bypass -File datos\scripts\respaldar.ps1        # o: bash datos/scripts/respaldar.sh

# Restaurar (con el backend detenido)
powershell -ExecutionPolicy Bypass -File datos\scripts\restaurar.ps1 datos\respaldos\respaldo_demo.dump
#   o: bash datos/scripts/restaurar.sh datos/respaldos/respaldo_demo.dump
```

**Comprobación de integridad:** `datos/scripts/verificar_integridad.sql` cuenta lotes, transformaciones, composiciones, alertas, auditoría y usuarios; suma los kg recibidos, consumidos y disponibles; busca inconsistencias de inventario (deben ser 0) y lista los códigos de lote. Al respaldar se guarda esa salida junto al `.dump`, y al restaurar el script la compara con el estado restaurado y muestra `[INTEGRIDAD CONFIRMADA]` o las líneas que difieren.

Pasos, salida esperada y cómo regenerar el respaldo de demostración: [`datos/respaldos/LEEME.md`](datos/respaldos/LEEME.md).

## 8. Operación y mantenimiento

**Servicios externos.** En funcionamiento la aplicación no depende de ningún servicio externo: PostgreSQL, backend y frontend corren en el mismo equipo o en la red local, el código QR se genera en el navegador y la aplicación no usa servicios de IA. Internet solo hace falta al instalar (descarga de dependencias de Maven y npm y de la imagen de Docker).

**Costos.** En el PC de la asociación, solo el equipo. Desplegada en la nube como servicio, la estimación es de unos 201.800 COP al mes por asociación (servidor de 2 vCPU y 4 GB, respaldos, dominio y 3 horas de soporte), con supuestos detallados en el pitch (`pitch/E09_guion.md`).

**Ante pérdida de conexión.**
- **Sin internet:** la operación sigue igual, porque todo corre en la red local.
- **Sin Wi-Fi en la planta:** el operador registra desde el PC donde corre la aplicación (`http://localhost:5173`); los celulares vuelven a entrar cuando regresa la red.
- **Si el PC o el servidor falla:** se registra en una planilla de papel con los mismos campos (productor, fecha, grano, humedad y kg; lote, etapa, entrada y salida) y se carga en la aplicación al restablecerla. La base se recupera con el último respaldo verificado (sección 7).

**Fallos conocidos y limitaciones.**
- Cada transformación consume un solo lote de entrada. Las mezclas de varios lotes no están implementadas, aunque el esquema (`lote_composicion`) ya las soporta.
- No hay alerta por retraso: las alertas implementadas son merma alta, registro incompleto, sobrecosto y cuota excedida.
- No hay modo sin conexión en el celular.
- La ficha pública muestra la finca y el municipio, pero no el nombre de la persona productora (dato personal, Ley 1581 de 2012).
- "Try it out" de Swagger llama a `localhost:8080`: funciona desde el navegador del PC donde corre el backend.
- El QR solo abre en un celular si `VITE_PUBLIC_BASE_URL` tiene la IP del PC y el puerto 5173 está permitido en el firewall.

**Tres mejoras priorizadas para los próximos 30 días.**

| Prioridad | Mejora | Responsable | Esfuerzo | Criterio de aceptación |
|---|---|---|---|---|
| 1 | Respaldo automático diario con verificación | Miguel Ángel Medina Díaz | 2 días | Durante 7 días seguidos queda un respaldo diario, y la restauración de prueba semanal termina con `[INTEGRIDAD CONFIRMADA]` |
| 2 | Despliegue en la nube con HTTPS para que la ficha y el QR abran desde internet | Juan David Fierro Calderón | 3 días | Un QR escaneado con datos móviles abre la ficha en menos de 3 s, y la ficha sigue sin ningún campo prohibido (prueba automatizada en verde) |
| 3 | Transformaciones con varios lotes de entrada (mezclas) | Miguel Ángel Medina Díaz y Juan David Fierro Calderón | 5 días | Una transformación con 2 lotes de entrada descuenta el inventario de ambos, la trazabilidad muestra los dos orígenes y el bloqueo se propaga desde cualquiera de ellos, con pruebas automatizadas |

## 9. Estructura del repositorio

| Carpeta | Contenido | Equivalente pedido por el reto |
|---|---|---|
| `backend/src/main/` | API REST: Java 21, Spring Boot 3.5, Spring Security con JWT, JPA y Flyway (migraciones en `resources/db/migration/`) | `src/` |
| `backend/src/test/` | 52 pruebas automatizadas (JUnit 5, contra PostgreSQL) | `tests/` |
| `frontend/src/` | Aplicación web: React 19, Vite, Tailwind CSS 4, React Router 7 y `qrcode.react` | `src/` |
| `datos/` | `scripts/` (respaldo, restauración e integridad), `respaldos/` (respaldo de demostración) y `rendimiento/` (carga de 100 registros, medición y resultados) | `datos/` |
| `docs/` | Contrato técnico del equipo | — |
| `documentos/` | Entregables E01–E03 y E05–E09 | `documentos/` |
| `pitch/` | Presentación y guion del pitch (E09) | `pitch/` |
| `prompts/` | Registro del uso de herramientas por bloque y por integrante (declarado en E08) | — |

## 10. Equipo KGB

- **Miguel Ángel Medina Díaz:** base de datos y backend.
- **Juan David Fierro Calderón:** frontend e integración.
- **Juan Manuel Villalba Rincón:** documentación, pruebas manuales, usabilidad, instalación limpia y pitch.

Programa de Ingeniería de Software, Universidad Surcolombiana.

## 11. Instalación limpia verificada

- **Compilación y pruebas desde un clon nuevo** (Juan David, 16/10/2026 a las 06:24, PC de la demostración): `git clone` de `feat/integracion` (`ec0f4f9`) en una carpeta vacía, `.env` configurado y base `cacao_test` existente. `mvnw -DskipTests package` generó el `.jar`; `mvnw test` dio 52 pruebas, 0 fallos y 0 errores; en el frontend, `npm ci`, `npm run build` y `npm run lint` terminaron sin errores. Las dependencias de Maven salieron de la caché local del equipo, así que esto no prueba su descarga desde internet.
- **Instalación completa desde cero en otro equipo, siguiendo este README** (Juan Manuel): pendiente. Lo que falle se corrige en este archivo.
