#!/usr/bin/env bash
# ============================================================================
# MEDICIÓN DE RENDIMIENTO DE TRAZABILIDAD (BLOQUE I1 / PRUEBA 10 DEL JURADO)
# ============================================================================
# Este script evalúa el rendimiento del endpoint de trazabilidad:
#   GET /api/lotes/{codigo}/trazabilidad
# sobre las 100 cadenas sintéticas cargadas (meta: < 3000 ms).
#
# Flujo de ejecución:
# 1. Detecta automáticamente el modo de base de datos (Docker o Local).
# 2. Inicia sesión con operador1 para obtener el token JWT en memoria.
# 3. Valida la existencia del lote objetivo (guía si falta cargar datos).
# 4. Realiza llamadas de calentamiento (descartadas de las estadísticas).
# 5. Ejecuta las medidas oficiales registrando latencia curl y tiempo del servidor.
# 6. Calcula mínimo, promedio, percentil 95 (rango más cercano) y máximo.
# 7. Recopila información del entorno (CPU, RAM, SO, Java, PostgreSQL).
# 8. Ejecuta explain_trazabilidad.sql para capturar el plan de ejecución real.
# 9. Genera el reporte en datos/rendimiento/resultados/medicion_YYYYMMDD_HHmm.txt.
# ============================================================================

export MSYS_NO_PATHCONV=1
set -euo pipefail

CODIGO_LOTE="${1:-PERF050-T3}"
CALENTAMIENTO="${2:-5}"
MEDIDAS="${3:-30}"
URL_BASE="${4:-http://localhost:8080}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ_REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIR_RESULTADOS="$SCRIPT_DIR/resultados"
SCRIPT_EXPLAIN="$SCRIPT_DIR/explain_trazabilidad.sql"

mkdir -p "$DIR_RESULTADOS"

# Archivos temporales seguros
TEMP_LOGIN="$(mktemp)"
TEMP_CHECK="$(mktemp)"
TEMP_MEDIDA="$(mktemp)"

# En Git Bash, curl es un programa de Windows y con MSYS_NO_PATHCONV=1 no entiende rutas
# como /tmp/...: se le pasan convertidas con cygpath. En Linux o macOS no hay cygpath y no cambia nada.
ruta_para_curl() {
    if command -v cygpath >/dev/null 2>&1; then cygpath -w "$1"; else printf "%s" "$1"; fi
}

cleanup() {
    rm -f "${TEMP_LOGIN:-}" "${TEMP_CHECK:-}" "${TEMP_MEDIDA:-}" 2>/dev/null || true
}
trap cleanup EXIT

echo "============================================================"
echo "  MEDICIÓN DE RENDIMIENTO DE TRAZABILIDAD — ASOPROCACAO    "
echo "============================================================"
echo "Lote objetivo : $CODIGO_LOTE"
echo "Calentamiento : $CALENTAMIENTO llamadas"
echo "Muestras      : $MEDIDAS medidas"
echo "URL base      : $URL_BASE"

# ----------------------------------------------------------------------------
# 1. Detección del modo de base de datos (Docker vs Local)
# ----------------------------------------------------------------------------
MODO="LOCAL"
if command -v docker >/dev/null 2>&1; then
    if docker compose ps --services --filter "status=running" 2>/dev/null | grep -qx "db"; then
        MODO="DOCKER"
    fi
fi

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="cacao"
DB_NAME="cacao"

if [ "$MODO" = "DOCKER" ]; then
    echo "[MODO DOCKER DETECTADO]"
    echo "PostgreSQL en servicio 'db' de docker compose."
else
    echo "[MODO LOCAL DETECTADO]"
    echo "Usando configuración de .env y herramientas locales de PostgreSQL."

    if [ -f "$RAIZ_REPO/.env" ]; then
        set -a
        # shellcheck disable=SC1091
        source <(grep -v '^#' "$RAIZ_REPO/.env" | grep -v '^$')
        set +a
    fi

    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    DB_USER="${POSTGRES_USER:-cacao}"
    DB_NAME="${POSTGRES_DB:-cacao}"

    if [ -n "${POSTGRES_PASSWORD:-}" ]; then
        export PGPASSWORD="$POSTGRES_PASSWORD"
    fi

    if ! command -v psql >/dev/null 2>&1; then
        for pg_dir in /c/Program\ Files/PostgreSQL/*/bin; do
            if [ -d "$pg_dir" ]; then
                export PATH="$pg_dir:$PATH"
            fi
        done
    fi
fi

ejecutar_consulta_sql() {
    local consulta="$1"
    if [ "$MODO" = "DOCKER" ]; then
        docker compose exec -T db psql -U cacao -d cacao -t -A -c "$consulta" 2>/dev/null | tr -d '\r' || echo "no disponible"
    else
        if command -v psql >/dev/null 2>&1; then
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -c "$consulta" 2>/dev/null | tr -d '\r' || echo "no disponible"
        else
            echo "no disponible"
        fi
    fi
}

# ----------------------------------------------------------------------------
# 2. Inicio de sesión y obtención del token en memoria
# ----------------------------------------------------------------------------
echo ""
echo "Iniciando sesión con operador1..."
HTTP_LOGIN=$(curl -s -o "$(ruta_para_curl "$TEMP_LOGIN")" -w "%{http_code}" -X POST "$URL_BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"operador1","password":"cacao123"}' || echo "000")

if [ "$HTTP_LOGIN" = "000" ] || [ -z "$HTTP_LOGIN" ]; then
    echo "ERROR: No se pudo conectar con el backend en $URL_BASE." >&2
    echo "Asegúrese de que el servicio backend esté iniciado (mvnw spring-boot:run o contenedor)." >&2
    exit 1
fi

if [ "$HTTP_LOGIN" != "200" ]; then
    echo "ERROR: Error de autenticación al iniciar sesión con operador1 (HTTP $HTTP_LOGIN)." >&2
    exit 1
fi

# Extracción de token sin jq (usando sed)
TOKEN=$(sed -n 's/.*"token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$TEMP_LOGIN")

if [ -z "$TOKEN" ]; then
    echo "ERROR: La respuesta de login no incluyó el token de acceso esperado." >&2
    exit 1
fi

echo "Sesión iniciada correctamente (token obtenido en memoria)."

# ----------------------------------------------------------------------------
# 3. Comprobación preliminar de existencia del lote
# ----------------------------------------------------------------------------
echo "Verificando disponibilidad del lote '$CODIGO_LOTE'..."
HTTP_CHECK=$(curl -s -o "$(ruta_para_curl "$TEMP_CHECK")" -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$URL_BASE/api/lotes/$CODIGO_LOTE/trazabilidad" || echo "000")

if [ "$HTTP_CHECK" = "404" ]; then
    echo "" >&2
    echo "[ERROR] El lote '$CODIGO_LOTE' no existe en la base de datos (HTTP 404)." >&2
    echo "Primero debe ejecutar el script de carga de 100 registros sintéticos:" >&2
    if [ "$MODO" = "DOCKER" ]; then
        echo "  Modo Docker: docker compose exec -T db psql -U cacao -d cacao -f /datos/rendimiento/cargar_100_registros.sql" >&2
    else
        echo "  Modo Local : psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f datos/rendimiento/cargar_100_registros.sql" >&2
    fi
    exit 1
fi

if [ "$HTTP_CHECK" != "200" ]; then
    echo "ERROR: La verificación del lote '$CODIGO_LOTE' retornó código HTTP $HTTP_CHECK." >&2
    exit 1
fi

echo "Lote '$CODIGO_LOTE' verificado correctamente."

# ----------------------------------------------------------------------------
# 4. Llamadas de calentamiento (no se contabilizan)
# ----------------------------------------------------------------------------
echo ""
echo "Ejecutando $CALENTAMIENTO llamadas de calentamiento..."
for ((i=1; i<=CALENTAMIENTO; i++)); do
    curl -s -o "$(ruta_para_curl "$TEMP_MEDIDA")" -H "Authorization: Bearer $TOKEN" "$URL_BASE/api/lotes/$CODIGO_LOTE/trazabilidad"
done
echo "Calentamiento finalizado."

# ----------------------------------------------------------------------------
# 5. Ejecución de mediciones oficiales
# ----------------------------------------------------------------------------
echo ""
echo "Ejecutando $MEDIDAS mediciones oficiales..."
TIEMPOS_CURL=()
TIEMPOS_SRV=()
LINEAS_MUESTRAS=()
HUBO_FALLO="false"

for ((i=1; i<=MEDIDAS; i++)); do
    CURL_OUT=$(curl -s -o "$(ruta_para_curl "$TEMP_MEDIDA")" -w "%{http_code} %{time_total}" \
        -H "Authorization: Bearer $TOKEN" \
        "$URL_BASE/api/lotes/$CODIGO_LOTE/trazabilidad")

    HTTP_CODE=$(echo "$CURL_OUT" | awk '{print $1}')
    TIME_SEC=$(echo "$CURL_OUT" | awk '{print $2}')

    # Conversión a milisegundos con 2 decimales
    TIME_MS=$(awk -v s="$TIME_SEC" 'BEGIN { printf "%.2f", s * 1000 }')

    # Extracción de tiempoConsultaMs de la respuesta
    SRV_MS=$(sed -n 's/.*"tiempoConsultaMs"[[:space:]]*:[[:space:]]*\([0-9]\+\).*/\1/p' "$TEMP_MEDIDA" || true)

    if [ "$HTTP_CODE" != "200" ]; then
        HUBO_FALLO="true"
        printf "  Muestra %02d: HTTP %s (FALLIDA)\n" "$i" "$HTTP_CODE"
    else
        TIEMPOS_CURL+=("$TIME_MS")
        if [ -n "$SRV_MS" ]; then
            TIEMPOS_SRV+=("$SRV_MS")
        fi
    fi

    TIME_MS_COMA=$(echo "$TIME_MS" | tr '.' ',')
    SRV_TEXT="no disponible"
    if [ -n "$SRV_MS" ]; then
        SRV_TEXT="${SRV_MS} ms"
    fi

    NUM_FORMAT=$(printf "%02d" "$i")
    LINEAS_MUESTRAS+=("Muestra $NUM_FORMAT: HTTP $HTTP_CODE | curl: $TIME_MS_COMA ms | servidor: $SRV_TEXT")
done

# ----------------------------------------------------------------------------
# 6. Cálculo de estadísticas y veredicto
# ----------------------------------------------------------------------------
CURL_MIN="0.00"
CURL_AVG="0.00"
CURL_P95="0.00"
CURL_MAX="0.00"
POS_P95="0"
N_CURL="${#TIEMPOS_CURL[@]}"

if [ "$N_CURL" -gt 0 ]; then
    ORDENADOS_CURL=()
    while IFS= read -r val; do
        ORDENADOS_CURL+=("$val")
    done < <(printf "%s\n" "${TIEMPOS_CURL[@]}" | sort -n)

    CURL_MIN="${ORDENADOS_CURL[0]}"
    CURL_MAX="${ORDENADOS_CURL[$((N_CURL - 1))]}"
    CURL_AVG=$(printf "%s\n" "${TIEMPOS_CURL[@]}" | awk '{s+=$1} END {printf "%.2f", s/NR}')

    # Rango más cercano: posición ceil(0.95 * n) de la lista ordenada (1-indexada)
    POS_P95=$(( (N_CURL * 95 + 99) / 100 ))
    if [ "$POS_P95" -gt "$N_CURL" ]; then POS_P95=$N_CURL; fi
    if [ "$POS_P95" -lt 1 ]; then POS_P95=1; fi
    CURL_P95="${ORDENADOS_CURL[$((POS_P95 - 1))]}"
fi

SRV_MIN="0"
SRV_AVG="0.00"
SRV_MAX="0"
N_SRV="${#TIEMPOS_SRV[@]}"

if [ "$N_SRV" -gt 0 ]; then
    ORDENADOS_SRV=()
    while IFS= read -r val; do
        ORDENADOS_SRV+=("$val")
    done < <(printf "%s\n" "${TIEMPOS_SRV[@]}" | sort -n)

    SRV_MIN="${ORDENADOS_SRV[0]}"
    SRV_MAX="${ORDENADOS_SRV[$((N_SRV - 1))]}"
    SRV_AVG=$(printf "%s\n" "${TIEMPOS_SRV[@]}" | awk '{s+=$1} END {printf "%.2f", s/NR}')
fi

VEREDICTO="NO CUMPLE"
if [ "$HUBO_FALLO" = "true" ]; then
    VEREDICTO="FALLIDO"
else
    CUMPLE_CRITERIO=$(awk -v p="$CURL_P95" -v m="$CURL_MAX" 'BEGIN { if (p < 3000 && m < 3000) print "1"; else print "0" }')
    if [ "$CUMPLE_CRITERIO" = "1" ]; then
        VEREDICTO="CUMPLE"
    else
        VEREDICTO="NO CUMPLE"
    fi
fi

# ----------------------------------------------------------------------------
# 7. Recopilación de información del equipo y entorno
# ----------------------------------------------------------------------------
CPU_INFO="no disponible"
if [ -f /proc/cpuinfo ]; then
    CPU_NAME=$(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' || true)
    CPU_CORES=$(grep -c "^processor" /proc/cpuinfo || true)
    if [ -n "$CPU_NAME" ]; then
        CPU_INFO="$CPU_NAME ($CPU_CORES procesadores lógicos)"
    fi
fi

RAM_INFO="no disponible"
if [ -f /proc/meminfo ]; then
    MEM_KB=$(grep -i "MemTotal" /proc/meminfo | awk '{print $2}' || true)
    if [ -n "$MEM_KB" ]; then
        RAM_GB=$(awk -v k="$MEM_KB" 'BEGIN { printf "%.2f", k / 1024 / 1024 }')
        RAM_INFO="$(echo "$RAM_GB" | tr '.' ',') GB"
    fi
fi

SO_INFO="$(uname -s -r -m 2>/dev/null || echo 'no disponible')"
JAVA_INFO="$(java -version 2>&1 | head -n 1 || echo 'no disponible')"
PG_VERSION="$(ejecutar_consulta_sql "SELECT version();")"
MODO_BD_STR="MODO LOCAL"
if [ "$MODO" = "DOCKER" ]; then
    MODO_BD_STR="MODO DOCKER"
fi

LOTES_PERF="$(ejecutar_consulta_sql "SELECT count(*) FROM lotes WHERE codigo_lote LIKE 'PERF%';")"
TRANS_PERF="$(ejecutar_consulta_sql "SELECT count(*) FROM transformaciones t JOIN lotes l ON l.id = t.lote_origen_id WHERE l.codigo_lote LIKE 'PERF%';")"
TOTAL_LOTES="$(ejecutar_consulta_sql "SELECT count(*) FROM lotes;")"
TOTAL_TRANS="$(ejecutar_consulta_sql "SELECT count(*) FROM transformaciones;")"

COMMIT_GIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'no disponible')"

# ----------------------------------------------------------------------------
# 8. Ejecución de EXPLAIN ANALYZE
# ----------------------------------------------------------------------------
echo ""
echo "Ejecutando EXPLAIN ANALYZE en la base de datos..."
SALIDA_EXPLAIN="No disponible"
if [ "$MODO" = "DOCKER" ]; then
    SALIDA_EXPLAIN=$(docker compose exec -T db psql -U cacao -d cacao -f /datos/rendimiento/explain_trazabilidad.sql 2>&1 || echo "Error al ejecutar explain_trazabilidad.sql en contenedor")
else
    if command -v psql >/dev/null 2>&1; then
        RUTA_EXPLAIN_PG="$SCRIPT_EXPLAIN"
        if command -v cygpath >/dev/null 2>&1; then
            RUTA_EXPLAIN_PG="$(cygpath -w "$SCRIPT_EXPLAIN")"
        fi
        SALIDA_EXPLAIN=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$RUTA_EXPLAIN_PG" 2>&1 || echo "Error al ejecutar explain_trazabilidad.sql local")
    fi
fi

# ----------------------------------------------------------------------------
# 9. Escritura del archivo de resultados
# ----------------------------------------------------------------------------
FECHA_HORA_ARCHIVO="$(date +'%Y%m%d_%H%M')"
FECHA_HORA_TEXTO="$(date +'%Y-%m-%d %H:%M:%S %z')"
ARCHIVO_SALIDA="$DIR_RESULTADOS/medicion_${FECHA_HORA_ARCHIVO}.txt"

CURL_MIN_COMA=$(echo "$CURL_MIN" | tr '.' ',')
CURL_AVG_COMA=$(echo "$CURL_AVG" | tr '.' ',')
CURL_P95_COMA=$(echo "$CURL_P95" | tr '.' ',')
CURL_MAX_COMA=$(echo "$CURL_MAX" | tr '.' ',')
SRV_AVG_COMA=$(echo "$SRV_AVG" | tr '.' ',')

cat <<EOF > "$ARCHIVO_SALIDA"
============================================================================
REPORTE DE MEDICIÓN DE RENDIMIENTO DE TRAZABILIDAD (BLOQUE I1)
Hackathon Cacao con Historia, Calidad y Valor (Asoprocacao)
============================================================================
Fecha y hora         : $FECHA_HORA_TEXTO
Commit de git        : $COMMIT_GIT

1. INFORMACIÓN DEL EQUIPO
----------------------------------------------------------------------------
Procesador (CPU)     : $CPU_INFO
Memoria RAM          : $RAM_INFO
Sistema operativo    : $SO_INFO
Versión de Java      : $JAVA_INFO
Versión PostgreSQL   : $PG_VERSION
Modo de base datos   : $MODO_BD_STR

2. VOLUMEN DE DATOS EN LA BASE
----------------------------------------------------------------------------
Lotes sintéticos PERF: $LOTES_PERF
Transformaciones PERF: $TRANS_PERF
Total lotes en base  : $TOTAL_LOTES
Total transformac.   : $TOTAL_TRANS

3. MÉTODO DE MEDICIÓN
----------------------------------------------------------------------------
Endpoint evaluado    : GET /api/lotes/$CODIGO_LOTE/trazabilidad
Usuario de prueba    : operador1 (rol OPERADOR)
Calentamiento        : $CALENTAMIENTO llamadas (descartadas del análisis)
Muestras oficiales   : $MEDIDAS llamadas consecutivas
Herramienta cliente  : curl ejecutado en el mismo equipo del backend
Nota metodológica    : La medición curl mide la latencia HTTP local completa
                       (filtro de seguridad, resolución en BD y serialización);
                       no incluye latencia de red externa ni renderizado en navegador.
                       tiempoConsultaMs registra el tiempo interno del servidor.

4. MUESTRAS INDIVIDUALES
----------------------------------------------------------------------------
EOF

for linea_m in "${LINEAS_MUESTRAS[@]}"; do
    echo "$linea_m" >> "$ARCHIVO_SALIDA"
done

cat <<EOF >> "$ARCHIVO_SALIDA"

5. RESUMEN ESTADÍSTICO Y VEREDICTO
----------------------------------------------------------------------------
Tiempo HTTP total (curl):
  - Mínimo           : $CURL_MIN_COMA ms
  - Promedio         : $CURL_AVG_COMA ms
  - Percentil 95     : $CURL_P95_COMA ms  (rango más cercano, posición $POS_P95 de $N_CURL)
  - Máximo           : $CURL_MAX_COMA ms

Tiempo interno servidor (tiempoConsultaMs):
  - Mínimo           : $SRV_MIN ms
  - Promedio         : $SRV_AVG_COMA ms
  - Máximo           : $SRV_MAX ms

Criterio de aceptación: Percentil 95 < 3000 ms y Máximo < 3000 ms (Prueba 10 del jurado)
Veredicto oficial    : $VEREDICTO

6. PLAN DE EJECUCIÓN (EXPLAIN ANALYZE BUFFERS)
----------------------------------------------------------------------------
$SALIDA_EXPLAIN

============================================================================
Fin del reporte de medición
============================================================================
EOF

# ----------------------------------------------------------------------------
# 10. Salida en consola
# ----------------------------------------------------------------------------
echo ""
echo "------------------------------------------------------------"
echo "RESUMEN DE RENDIMIENTO DE TRAZABILIDAD ($CODIGO_LOTE)"
echo "------------------------------------------------------------"
echo "Muestras evaluadas   : $MEDIDAS"
echo "Latencia curl mín    : $CURL_MIN_COMA ms"
echo "Latencia curl prom   : $CURL_AVG_COMA ms"
echo "Latencia curl p95    : $CURL_P95_COMA ms"
echo "Latencia curl máx    : $CURL_MAX_COMA ms"
echo "Servidor interno prom: $SRV_AVG_COMA ms"
echo "Veredicto final      : $VEREDICTO"
echo "Archivo generado     : $ARCHIVO_SALIDA"
echo "------------------------------------------------------------"
