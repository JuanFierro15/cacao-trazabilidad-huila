# ============================================================================
# RESTAURACION DE BASE DE DATOS - CACAO TRAZABILIDAD (B7 / RF07)
# ============================================================================
# Detecta automaticamente el modo de ejecucion:
# - MODO DOCKER: si el servicio db de docker compose esta activo.
# - MODO LOCAL: si no hay Docker o no esta corriendo el servicio db.
# Pasos:
# 1. Ejecutar verificacion de integridad previa (estado ANTES).
# 2. DROP DATABASE IF EXISTS ... WITH (FORCE) y CREATE DATABASE.
# 3. pg_restore --no-owner.
# 4. Ejecutar verificacion de integridad posterior (estado DESPUES).
# ============================================================================

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$ArchivoRespaldo
)

$ErrorActionPreference = "Stop"

$DirectorioScript = $PSScriptRoot
$RaizRepo = (Resolve-Path (Join-Path $DirectorioScript "..\..")).Path
$DirectorioRespaldos = Join-Path $RaizRepo "datos\respaldos"
$ScriptIntegridad = Join-Path $DirectorioScript "verificar_integridad.sql"

if (-not $ArchivoRespaldo) {
    $archivosDump = Get-ChildItem (Join-Path $DirectorioRespaldos "*.dump") | Sort-Object LastWriteTime -Descending
    if (-not $archivosDump) {
        Write-Error "No se encontro ningun archivo .dump en $DirectorioRespaldos para restaurar."
        exit 1
    }
    $ArchivoRespaldo = $archivosDump[0].FullName
    Write-Host "No se especifico archivo. Usando el respaldo mas reciente:" -ForegroundColor Cyan
    Write-Host ("  " + $ArchivoRespaldo) -ForegroundColor Cyan
} else {
    if (-not [System.IO.Path]::IsPathRooted($ArchivoRespaldo)) {
        $ArchivoRespaldo = Join-Path (Get-Location) $ArchivoRespaldo
    }
}

if (-not (Test-Path $ArchivoRespaldo)) {
    Write-Error ("El archivo de respaldo especificado no existe: " + $ArchivoRespaldo)
    exit 1
}

$tamanio = (Get-Item $ArchivoRespaldo).Length
if ($tamanio -eq 0) {
    Write-Error ("El archivo de respaldo esta vacio (0 bytes): " + $ArchivoRespaldo)
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESTAURACION DE BASE DE DATOS - CACAO TRAZABILIDAD        " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ("Archivo a restaurar: " + $ArchivoRespaldo + " (" + $tamanio + " bytes)")

# 1. Detectar modo (Docker vs Local)
$ModoDocker = $false
try {
    $comandoDocker = Get-Command "docker" -ErrorAction SilentlyContinue
    if ($comandoDocker) {
        $serviciosActivos = & docker compose ps --services --filter "status=running" 2>$null
        if ($LASTEXITCODE -eq 0 -and $serviciosActivos) {
            $lineas = $serviciosActivos -split "`r?`n"
            if ($lineas -contains "db") {
                $ModoDocker = $true
            }
        }
    }
} catch {
    $ModoDocker = $false
}

if ($ModoDocker) {
    Write-Host "[MODO DOCKER DETECTADO]" -ForegroundColor Green

    $NombreBaseArchivo = [System.IO.Path]::GetFileName($ArchivoRespaldo)
    $RutaContenedor = "/datos/respaldos/" + $NombreBaseArchivo

    Write-Host ""
    Write-Host "--- ESTADO DE INTEGRIDAD ANTES DE RESTAURAR ---" -ForegroundColor Yellow
    & docker compose exec -T db psql -U cacao -d cacao -f /datos/scripts/verificar_integridad.sql

    Write-Host ""
    Write-Host "Terminando conexiones activas y recreando la base de datos 'cacao'..." -ForegroundColor Yellow
    & docker compose exec -T db psql -U cacao -d postgres -c "DROP DATABASE IF EXISTS cacao WITH (FORCE);" -c "CREATE DATABASE cacao;"
    if ($LASTEXITCODE -ne 0) {
        Write-Error ("Error al recrear la base de datos en Docker (codigo: " + $LASTEXITCODE + ")")
        exit $LASTEXITCODE
    }

    Write-Host "Restaurando respaldo con pg_restore..." -ForegroundColor Yellow
    & docker compose exec -T db pg_restore -U cacao -d cacao "--no-owner" $RutaContenedor
    $codigoRestore = $LASTEXITCODE
    if ($codigoRestore -ne 0 -and $codigoRestore -ne 1) {
        Write-Error ("pg_restore finalizo con error grave (codigo: " + $codigoRestore + ")")
        exit $codigoRestore
    }

    Write-Host ""
    Write-Host "--- ESTADO DE INTEGRIDAD DESPUES DE RESTAURAR ---" -ForegroundColor Green
    & docker compose exec -T db psql -U cacao -d cacao -f /datos/scripts/verificar_integridad.sql

} else {
    Write-Host "[MODO LOCAL DETECTADO]" -ForegroundColor Yellow

    $ArchivoEnv = Join-Path $RaizRepo ".env"
    if (Test-Path $ArchivoEnv) {
        Get-Content $ArchivoEnv | ForEach-Object {
            $linea = $_.Trim()
            if ($linea -and -not $linea.StartsWith("#") -and $linea -match '^([^=]+)=(.*)$') {
                $clave = $matches[1].Trim()
                $valor = $matches[2].Trim()
                [System.Environment]::SetEnvironmentVariable($clave, $valor, "Process")
            }
        }
    }

    $dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
    $dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
    $dbUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "cacao" }
    $dbName = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "cacao" }

    if ($env:POSTGRES_PASSWORD) {
        $env:PGPASSWORD = $env:POSTGRES_PASSWORD
    }

    if (-not (Get-Command "psql" -ErrorAction SilentlyContinue) -or -not (Get-Command "pg_restore" -ErrorAction SilentlyContinue)) {
        $pgRutas = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin" -ErrorAction SilentlyContinue
        if ($pgRutas) {
            $ultimaRuta = $pgRutas | Select-Object -Last 1 -ExpandProperty FullName
            $env:PATH = $ultimaRuta + ";" + $env:PATH
        }
    }

    if (-not (Get-Command "psql" -ErrorAction SilentlyContinue) -or -not (Get-Command "pg_restore" -ErrorAction SilentlyContinue)) {
        Write-Error "No se encontraron los ejecutables psql y/o pg_restore en el PATH"
        exit 1
    }

    Write-Host ""
    Write-Host "--- ESTADO DE INTEGRIDAD ANTES DE RESTAURAR ---" -ForegroundColor Yellow
    & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $ScriptIntegridad

    Write-Host ""
    Write-Host ("Terminando conexiones activas y recreando base de datos '" + $dbName + "'...") -ForegroundColor Yellow
    & psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c ("DROP DATABASE IF EXISTS " + $dbName + " WITH (FORCE);") -c ("CREATE DATABASE " + $dbName + ";")
    if ($LASTEXITCODE -ne 0) {
        Write-Error ("Error al recrear la base de datos '" + $dbName + "' (codigo: " + $LASTEXITCODE + ")")
        exit $LASTEXITCODE
    }

    Write-Host "Restaurando respaldo con pg_restore..." -ForegroundColor Yellow
    & pg_restore -h $dbHost -p $dbPort -U $dbUser -d $dbName "--no-owner" $ArchivoRespaldo
    $codigoRestore = $LASTEXITCODE
    if ($codigoRestore -ne 0 -and $codigoRestore -ne 1) {
        Write-Error ("pg_restore finalizo con error grave (codigo: " + $codigoRestore + ")")
        exit $codigoRestore
    }

    Write-Host ""
    Write-Host "--- ESTADO DE INTEGRIDAD DESPUES DE RESTAURAR ---" -ForegroundColor Green
    & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $ScriptIntegridad
}

Write-Host "------------------------------------------------------------" -ForegroundColor Green
Write-Host "Restauracion completada con exito desde:" -ForegroundColor Green
Write-Host ("  " + $ArchivoRespaldo) -ForegroundColor Green
Write-Host "------------------------------------------------------------" -ForegroundColor Green
