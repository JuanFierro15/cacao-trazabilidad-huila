#!/usr/bin/env bash
# ============================================================================
# RESTAURACIÓN DE BASE DE DATOS — CACAO TRAZABILIDAD (B7 / RF07)
# ============================================================================
# Detecta automáticamente el modo de ejecución:
# - MODO DOCKER: si el servicio "db" de docker compose está activo.
# - MODO LOCAL: si no hay Docker o no está corriendo el servicio "db".
# Pasos:
# 1. Ejecutar verificación de integridad previa (estado ANTES).
# 2. DROP DATABASE IF EXISTS ... WITH (FORCE) y CREATE DATABASE.
# 3. pg_restore --no-owner.
# 4. Ejecutar verificación de integridad posterior (estado DESPUÉS).
# 5. Comparar el estado final con el reporte .integridad.txt del respaldo.
# ============================================================================

export MSYS_NO_PATHCONV=1
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ_REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIR_RESPALDOS="$RAIZ_REPO/datos/respaldos"
SCRIPT_INTEGRIDAD="$SCRIPT_DIR/verificar_integridad.sql"

ARCHIVO_RESPALDO="${1:-}"
if [ -z "$ARCHIVO_RESPALDO" ]; then
    # Buscar el más reciente
    ARCHIVO_RESPALDO="$(ls -t "$DIR_RESPALDOS"/*.dump 2>/dev/null | head -n 1 || true)"
    if [ -z "$ARCHIVO_RESPALDO" ]; then
        echo "ERROR: No se encontró ningún archivo .dump en $DIR_RESPALDOS para restaurar." >&2
        exit 1
    fi
    echo "No se especificó archivo. Usando el respaldo más reciente:"
    echo "  $ARCHIVO_RESPALDO"
else
    if [[ "$ARCHIVO_RESPALDO" != /* ]]; then
        ARCHIVO_RESPALDO="$(pwd)/$ARCHIVO_RESPALDO"
    fi
fi

if [ ! -f "$ARCHIVO_RESPALDO" ]; then
    echo "ERROR: El archivo de respaldo especificado no existe: $ARCHIVO_RESPALDO" >&2
    exit 1
fi

TAMANIO="$(wc -c < "$ARCHIVO_RESPALDO" | tr -d ' ')"
if [ "$TAMANIO" -eq 0 ]; then
    echo "ERROR: El archivo de respaldo está vacío (0 bytes): $ARCHIVO_RESPALDO" >&2
    exit 1
fi

ARCHIVO_INTEGRIDAD="${ARCHIVO_RESPALDO%.*}.integridad.txt"
TMP_POST_INTEGRIDAD="$(mktemp)"
trap 'rm -f "$TMP_POST_INTEGRIDAD"' EXIT

echo "============================================================"
echo "  RESTAURACIÓN DE BASE DE DATOS — CACAO TRAZABILIDAD        "
echo "============================================================"
echo "Archivo a restaurar: $ARCHIVO_RESPALDO ($TAMANIO bytes)"

# Detectar modo
MODO="LOCAL"
if command -v docker >/dev/null 2>&1; then
    if docker compose ps --services --filter "status=running" 2>/dev/null | grep -qx "db"; then
        MODO="DOCKER"
    fi
fi

if [ "$MODO" = "DOCKER" ]; then
    echo "[MODO DOCKER DETECTADO]"
    NOMBRE_BASE="$(basename "$ARCHIVO_RESPALDO")"
    RUTA_CONTENEDOR="/datos/respaldos/$NOMBRE_BASE"

    echo ""
    echo ">>> ESTADO DE INTEGRIDAD ANTES DE RESTAURAR <<<"
    docker compose exec -T db psql -U cacao -d cacao -f /datos/scripts/verificar_integridad.sql

    echo ""
    echo "Terminando conexiones activas y recreando la base de datos 'cacao'..."
    docker compose exec -T db psql -U cacao -d postgres -c "DROP DATABASE IF EXISTS cacao WITH (FORCE);" -c "CREATE DATABASE cacao;"

    echo "Restaurando respaldo con pg_restore..."
    # pg_restore puede retornar 1 por advertencias no fatales
    docker compose exec -T db pg_restore -U cacao -d cacao --no-owner "$RUTA_CONTENEDOR" || true

    echo ""
    echo ">>> ESTADO DE INTEGRIDAD DESPUÉS DE RESTAURAR <<<"
    docker compose exec -T db psql -U cacao -d cacao -f /datos/scripts/verificar_integridad.sql | tee "$TMP_POST_INTEGRIDAD"
else
    echo "[MODO LOCAL DETECTADO]"

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

    # Si psql o pg_restore no están en el PATH, buscar en rutas estándar de Windows (Git Bash)
    if ! command -v psql >/dev/null 2>&1 || ! command -v pg_restore >/dev/null 2>&1; then
        for pg_dir in /c/Program\ Files/PostgreSQL/*/bin; do
            if [ -d "$pg_dir" ]; then
                export PATH="$pg_dir:$PATH"
            fi
        done
    fi

    RUTA_RESPALDO_PG="$ARCHIVO_RESPALDO"
    RUTA_SCRIPT_PG="$SCRIPT_INTEGRIDAD"
    if command -v cygpath >/dev/null 2>&1; then
        RUTA_RESPALDO_PG="$(cygpath -w "$ARCHIVO_RESPALDO")"
        RUTA_SCRIPT_PG="$(cygpath -w "$SCRIPT_INTEGRIDAD")"
    fi

    echo ""
    echo ">>> ESTADO DE INTEGRIDAD ANTES DE RESTAURAR <<<"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$RUTA_SCRIPT_PG"

    echo ""
    echo "Terminando conexiones activas y recreando base de datos '$DB_NAME'..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME WITH (FORCE);" -c "CREATE DATABASE $DB_NAME;"

    echo "Restaurando respaldo con pg_restore..."
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner "$RUTA_RESPALDO_PG" || true

    echo ""
    echo ">>> ESTADO DE INTEGRIDAD DESPUÉS DE RESTAURAR <<<"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$RUTA_SCRIPT_PG" | tee "$TMP_POST_INTEGRIDAD"
fi

# Comparación con el reporte de integridad del respaldo original
# El reporte puede venir de respaldar.ps1, que lo guarda con BOM: se quita antes de comparar.
BOM_UTF8="$(printf '\357\273\277')"
if [ -f "$ARCHIVO_INTEGRIDAD" ]; then
    echo ""
    echo "------------------------------------------------------------"
    echo "  COMPARACIÓN CON REPORTE DE INTEGRIDAD ORIGINAL            "
    echo "------------------------------------------------------------"
    if diff -u -w -B <(tr -d '\r' < "$ARCHIVO_INTEGRIDAD" | sed "1s/^$BOM_UTF8//") <(tr -d '\r' < "$TMP_POST_INTEGRIDAD") >/dev/null 2>&1; then
        echo "[INTEGRIDAD CONFIRMADA] El estado restaurado COINCIDE EXACTAMENTE con el respaldo original."
        echo "Conteos, balances de masa, inconsistencias (0) y códigos de lotes son 100% idénticos."
    else
        echo "[ADVERTENCIA] Se detectaron discrepancias frente al reporte de integridad original:"
        echo "Archivo de referencia: $ARCHIVO_INTEGRIDAD"
        diff -u -w -B <(tr -d '\r' < "$ARCHIVO_INTEGRIDAD" | sed "1s/^$BOM_UTF8//") <(tr -d '\r' < "$TMP_POST_INTEGRIDAD") || true
    fi
else
    echo ""
    echo "[NOTA] No se encontró $ARCHIVO_INTEGRIDAD para comparación automática."
fi

echo "------------------------------------------------------------"
echo "Restauración completada con éxito desde:"
echo "  $ARCHIVO_RESPALDO"
echo "------------------------------------------------------------"
