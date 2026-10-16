# ============================================================================
# RESPALDO DE BASE DE DATOS - CACAO TRAZABILIDAD (B7 / RF07)
# ============================================================================
# Detecta automaticamente el modo de ejecucion:
# - MODO DOCKER: si el servicio db de docker compose esta activo.
# - MODO LOCAL: si no hay Docker o no esta corriendo el servicio db.
# Siempre escribe usando -f (NUNCA redireccion '>', que corrompe binarios en PowerShell).
# ============================================================================

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$ArchivoSalida
)

$ErrorActionPreference = "Stop"

$DirectorioScript = $PSScriptRoot
$RaizRepo = (Resolve-Path (Join-Path $DirectorioScript "..\..")).Path
$DirectorioRespaldos = Join-Path $RaizRepo "datos\respaldos"

if (-not (Test-Path $DirectorioRespaldos)) {
    New-Item -ItemType Directory -Path $DirectorioRespaldos -Force | Out-Null
}

if (-not $ArchivoSalida) {
    $FechaHora = Get-Date -Format "yyyyMMdd_HHmmss"
    $ArchivoSalida = Join-Path $DirectorioRespaldos ("respaldo_" + $FechaHora + ".dump")
} else {
    if (-not [System.IO.Path]::IsPathRooted($ArchivoSalida)) {
        $ArchivoSalida = Join-Path (Get-Location) $ArchivoSalida
    }
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESPALDO DE BASE DE DATOS - CACAO CON HISTORIA Y CALIDAD  " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

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
    Write-Host "El contenedor 'db' de docker compose esta activo."

    $NombreBaseArchivo = [System.IO.Path]::GetFileName($ArchivoSalida)
    $RutaContenedor = "/datos/respaldos/" + $NombreBaseArchivo

    Write-Host "Ejecutando pg_dump dentro del contenedor..."
    Write-Host ("Destino: " + $ArchivoSalida)

    & docker compose exec -T db pg_dump -U cacao -d cacao -Fc -f $RutaContenedor
    if ($LASTEXITCODE -ne 0) {
        Write-Error ("Error al ejecutar pg_dump dentro del contenedor Docker (codigo: " + $LASTEXITCODE + ")")
        exit $LASTEXITCODE
    }
} else {
    Write-Host "[MODO LOCAL DETECTADO]" -ForegroundColor Yellow
    Write-Host "Usando herramientas locales de PostgreSQL y variables de .env"

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

    if (-not (Get-Command "pg_dump" -ErrorAction SilentlyContinue)) {
        $pgRutas = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin" -ErrorAction SilentlyContinue
        if ($pgRutas) {
            $ultimaRuta = $pgRutas | Select-Object -Last 1 -ExpandProperty FullName
            $env:PATH = $ultimaRuta + ";" + $env:PATH
        }
    }

    if (-not (Get-Command "pg_dump" -ErrorAction SilentlyContinue)) {
        Write-Error "No se encontro el ejecutable pg_dump en el PATH ni en C:\Program Files\PostgreSQL"
        exit 1
    }

    Write-Host ("Conectando a postgresql://" + $dbHost + ":" + $dbPort + "/" + $dbName + " como usuario '" + $dbUser + "'...")
    Write-Host ("Destino: " + $ArchivoSalida)

    & pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName -Fc -f $ArchivoSalida
    if ($LASTEXITCODE -ne 0) {
        Write-Error ("Error al ejecutar pg_dump en modo local (codigo: " + $LASTEXITCODE + ")")
        exit $LASTEXITCODE
    }
}

if (Test-Path $ArchivoSalida) {
    $tamanio = (Get-Item $ArchivoSalida).Length
    Write-Host "------------------------------------------------------------" -ForegroundColor Green
    Write-Host "Respaldo completado con exito:" -ForegroundColor Green
    Write-Host ("  Archivo : " + $ArchivoSalida)
    Write-Host ("  Tamano  : " + $tamanio + " bytes")
    Write-Host "------------------------------------------------------------" -ForegroundColor Green
} else {
    Write-Error ("El archivo de respaldo no fue creado: " + $ArchivoSalida)
    exit 1
}
