#!/usr/bin/env bash
# ============================================================================
# RESPALDO DE BASE DE DATOS — CACAO TRAZABILIDAD (B7 / RF07)
# ============================================================================
# Detecta automáticamente el modo de ejecución:
# - MODO DOCKER: si el servicio "db" de docker compose está activo.
# - MODO LOCAL: si no hay Docker o no está corriendo el servicio "db".
# Siempre escribe usando -f (NUNCA redirección '>').
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ_REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIR_RESPALDOS="$RAIZ_REPO/datos/respaldos"

mkdir -p "$DIR_RESPALDOS"

ARCHIVO_SALIDA="${1:-}"
if [ -z "$ARCHIVO_SALIDA" ]; then
    FECHA_HORA="$(date +'%Y%m%d_%H%M%S')"
    ARCHIVO_SALIDA="$DIR_RESPALDOS/respaldo_${FECHA_HORA}.dump"
else
    # Si la ruta es relativa, hacerla absoluta
    if [[ "$ARCHIVO_SALIDA" != /* ]]; then
        ARCHIVO_SALIDA="$(pwd)/$ARCHIVO_SALIDA"
    fi
fi

echo "============================================================"
echo "  RESPALDO DE BASE DE DATOS — CACAO CON HISTORIA Y CALIDAD  "
echo "============================================================"

# Detectar modo
MODO="LOCAL"
if command -v docker >/dev/null 2>&1; then
    if docker compose ps --services --filter "status=running" 2>/dev/null | grep -qx "db"; then
        MODO="DOCKER"
    fi
fi

if [ "$MODO" = "DOCKER" ]; then
    echo "[MODO DOCKER DETECTADO]"
    NOMBRE_BASE="$(basename "$ARCHIVO_SALIDA")"
    RUTA_CONTENEDOR="/datos/respaldos/$NOMBRE_BASE"

    echo "Ejecutando pg_dump dentro del contenedor..."
    echo "Destino: $ARCHIVO_SALIDA"

    docker compose exec -T db pg_dump -U cacao -d cacao -Fc -f "$RUTA_CONTENEDOR"
else
    echo "[MODO LOCAL DETECTADO]"

    if [ -f "$RAIZ_REPO/.env" ]; then
        # Exportar variables sin comentarios
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

    echo "Conectando a postgresql://$DB_HOST:$DB_PORT/$DB_NAME como usuario '$DB_USER'..."
    echo "Destino: $ARCHIVO_SALIDA"

    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -Fc -f "$ARCHIVO_SALIDA"
fi

if [ -f "$ARCHIVO_SALIDA" ]; then
    TAMANIO="$(wc -c < "$ARCHIVO_SALIDA" | tr -d ' ')"
    echo "------------------------------------------------------------"
    echo "Respaldo completado con éxito:"
    echo "  Archivo : $ARCHIVO_SALIDA"
    echo "  Tamaño  : $TAMANIO bytes"
    echo "------------------------------------------------------------"
else
    echo "ERROR: El archivo de respaldo no fue creado: $ARCHIVO_SALIDA" >&2
    exit 1
fi
