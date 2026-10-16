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

[CmdletBinding()]
param (
    [string]$CodigoLote = "PERF050-T3",
    [int]$Calentamiento = 5,
    [int]$Medidas = 30,
    [string]$UrlBase = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

$DirectorioScript = $PSScriptRoot
$RaizRepo = (Resolve-Path (Join-Path $DirectorioScript "..\..")).Path
$DirectorioResultados = Join-Path $DirectorioScript "resultados"
$ScriptExplain = Join-Path $DirectorioScript "explain_trazabilidad.sql"

if (-not (Test-Path $DirectorioResultados)) {
    New-Item -ItemType Directory -Path $DirectorioResultados -Force | Out-Null
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MEDICIÓN DE RENDIMIENTO DE TRAZABILIDAD - ASOPROCACAO    " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Lote objetivo : $CodigoLote"
Write-Host "Calentamiento : $Calentamiento llamadas"
Write-Host "Muestras      : $Medidas medidas"
Write-Host "URL base      : $UrlBase"

# ----------------------------------------------------------------------------
# 1. Detección del modo de base de datos (Docker vs Local)
# ----------------------------------------------------------------------------
$ModoDocker = $false
try {
    $comandoDocker = Get-Command "docker" -ErrorAction SilentlyContinue
    if ($comandoDocker) {
        $serviciosActivos = & docker compose ps --services --filter "status=running" 2>$null
        if ($LASTEXITCODE -eq 0 -and $serviciosActivos) {
            $lineasServicios = $serviciosActivos -split "`r?`n"
            if ($lineasServicios -contains "db") {
                $ModoDocker = $true
            }
        }
    }
} catch {
    $ModoDocker = $false
}

$dbHost = "localhost"
$dbPort = "5432"
$dbUser = "cacao"
$dbName = "cacao"

if ($ModoDocker) {
    Write-Host "[MODO DOCKER DETECTADO]" -ForegroundColor Green
    Write-Host "PostgreSQL en servicio 'db' de docker compose."
} else {
    Write-Host "[MODO LOCAL DETECTADO]" -ForegroundColor Yellow
    Write-Host "Usando configuración de .env y herramientas locales de PostgreSQL."

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

    if ($env:DB_HOST) { $dbHost = $env:DB_HOST }
    if ($env:DB_PORT) { $dbPort = $env:DB_PORT }
    if ($env:POSTGRES_USER) { $dbUser = $env:POSTGRES_USER }
    if ($env:POSTGRES_DB) { $dbName = $env:POSTGRES_DB }

    if ($env:POSTGRES_PASSWORD) {
        $env:PGPASSWORD = $env:POSTGRES_PASSWORD
    }

    if (-not (Get-Command "psql" -ErrorAction SilentlyContinue)) {
        $pgRutas = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin" -ErrorAction SilentlyContinue
        if ($pgRutas) {
            $ultimaRuta = $pgRutas | Select-Object -Last 1 -ExpandProperty FullName
            $env:PATH = $ultimaRuta + ";" + $env:PATH
        }
    }
}

# Función auxiliar para ejecutar consultas SQL y retornar texto plano
function Ejecutar-ConsultaSql {
    param ([string]$Consulta)
    if ($ModoDocker) {
        $res = & docker compose exec -T db psql -U cacao -d cacao -t -A -c $Consulta 2>$null
        if ($LASTEXITCODE -eq 0 -and $res) {
            return ($res -join "`n").Trim()
        }
        return "no disponible"
    } else {
        if (Get-Command "psql" -ErrorAction SilentlyContinue) {
            $res = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -A -c $Consulta 2>$null
            if ($LASTEXITCODE -eq 0 -and $res) {
                return ($res -join "`n").Trim()
            }
        }
        return "no disponible"
    }
}

# ----------------------------------------------------------------------------
# 2. Inicio de sesión y obtención del token en memoria
# ----------------------------------------------------------------------------
Write-Host "`nIniciando sesión con operador1..." -ForegroundColor Cyan
$token = $null

# El login no se mide: se hace con Invoke-RestMethod porque PowerShell 5.1 quita las
# comillas internas al pasar un JSON como argumento a curl.exe y el backend responde 400.
$cuerpoLogin = @{ username = 'operador1'; password = 'cacao123' } | ConvertTo-Json -Compress
try {
    $loginJson = Invoke-RestMethod -Method Post -Uri "$UrlBase/api/auth/login" -ContentType 'application/json; charset=utf-8' -Body $cuerpoLogin -TimeoutSec 15
} catch {
    $respuestaLogin = $_.Exception.Response
    if ($null -eq $respuestaLogin) {
        Write-Error "No se pudo conectar con el backend en $UrlBase. Verifique que el servicio backend esté iniciado (mvnw spring-boot:run o contenedor)."
        exit 1
    }
    Write-Error ("Error de autenticación al iniciar sesión con operador1 (HTTP " + [int]$respuestaLogin.StatusCode + ").")
    exit 1
}

if ($loginJson.token) {
    $token = $loginJson.token
} else {
    Write-Error "La respuesta de login no incluyó el token de acceso esperado."
    exit 1
}

Write-Host "Sesión iniciada correctamente (token obtenido en memoria)." -ForegroundColor Green

# ----------------------------------------------------------------------------
# 3. Comprobación preliminar de existencia del lote
# ----------------------------------------------------------------------------
Write-Host "Verificando disponibilidad del lote '$CodigoLote'..." -ForegroundColor Cyan
$tempCheck = [System.IO.Path]::GetTempFileName()
$httpCheck = "000"

try {
    $httpCheck = & curl.exe -s -o $tempCheck -w "%{http_code}" -H "Authorization: Bearer $token" "$UrlBase/api/lotes/$CodigoLote/trazabilidad"
} finally {
    if (Test-Path $tempCheck) {
        Remove-Item $tempCheck -Force -ErrorAction SilentlyContinue
    }
}

if ($httpCheck -eq "404") {
    Write-Host "`n[ERROR] El lote '$CodigoLote' no existe en la base de datos (HTTP 404)." -ForegroundColor Red
    Write-Host "Primero debe ejecutar el script de carga de 100 registros sintéticos:" -ForegroundColor Yellow
    if ($ModoDocker) {
        Write-Host "  Modo Docker: docker compose exec -T db psql -U cacao -d cacao -f /datos/rendimiento/cargar_100_registros.sql" -ForegroundColor White
    } else {
        Write-Host "  Modo Local : psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f datos/rendimiento/cargar_100_registros.sql" -ForegroundColor White
    }
    exit 1
}

if ($httpCheck -ne "200") {
    Write-Error "La verificación del lote '$CodigoLote' retornó un código inesperado: HTTP $httpCheck."
    exit 1
}

Write-Host "Lote '$CodigoLote' verificado correctamente." -ForegroundColor Green

# ----------------------------------------------------------------------------
# 4. Llamadas de calentamiento (no se contabilizan)
# ----------------------------------------------------------------------------
Write-Host "`nEjecutando $Calentamiento llamadas de calentamiento..." -ForegroundColor Cyan
for ($i = 1; $i -le $Calentamiento; $i++) {
    $tempWarm = [System.IO.Path]::GetTempFileName()
    try {
        & curl.exe -s -o $tempWarm -H "Authorization: Bearer $token" "$UrlBase/api/lotes/$CodigoLote/trazabilidad"
    } finally {
        if (Test-Path $tempWarm) {
            Remove-Item $tempWarm -Force -ErrorAction SilentlyContinue
        }
    }
}
Write-Host "Calentamiento finalizado." -ForegroundColor Green

# ----------------------------------------------------------------------------
# 5. Ejecución de mediciones oficiales
# ----------------------------------------------------------------------------
Write-Host "`nEjecutando $Medidas mediciones oficiales..." -ForegroundColor Cyan
$tiemposCurlMs = @()
$tiemposServidorMs = @()
$lineasMuestras = @()
$huboFallo = $false

for ($i = 1; $i -le $Medidas; $i++) {
    $tempMedida = [System.IO.Path]::GetTempFileName()
    $httpCode = "000"
    $timeTotalSec = "0"
    $tiempoSrvMs = $null

    try {
        $curlOut = & curl.exe -s -o $tempMedida -w "%{http_code} %{time_total}" -H "Authorization: Bearer $token" "$UrlBase/api/lotes/$CodigoLote/trazabilidad"
        if ($curlOut) {
            $partes = $curlOut.Trim() -split "\s+"
            if ($partes.Count -ge 2) {
                $httpCode = $partes[0]
                $timeTotalSec = $partes[1]
            }
        }

        if (Test-Path $tempMedida) {
            $contenido = Get-Content $tempMedida -Raw -Encoding utf8
            if ($contenido) {
                try {
                    $jsonMedida = $contenido | ConvertFrom-Json
                    if ($jsonMedida.PSObject.Properties['tiempoConsultaMs']) {
                        $tiempoSrvMs = [long]$jsonMedida.tiempoConsultaMs
                    }
                } catch {
                    $tiempoSrvMs = $null
                }
            }
        }
    } finally {
        if (Test-Path $tempMedida) {
            Remove-Item $tempMedida -Force -ErrorAction SilentlyContinue
        }
    }

    $timeSec = 0.0
    try {
        $timeSec = [double]::Parse($timeTotalSec, [System.Globalization.CultureInfo]::InvariantCulture)
    } catch {
        $timeSec = 0.0
    }
    $timeMs = [Math]::Round($timeSec * 1000.0, 2)

    if ($httpCode -ne "200") {
        $huboFallo = $true
        Write-Host "  Muestra $($i.ToString("D2")): HTTP $httpCode (FALLIDA)" -ForegroundColor Red
    } else {
        $tiemposCurlMs += $timeMs
        if ($tiempoSrvMs -ne $null) {
            $tiemposServidorMs += $tiempoSrvMs
        }
    }

    $timeMsStr = ("{0:0.00}" -f $timeMs).Replace(".", ",")
    $srvStr = if ($tiempoSrvMs -ne $null) { "$tiempoSrvMs ms" } else { "no disponible" }
    $lineasMuestras += ("Muestra $($i.ToString("D2")): HTTP $httpCode | curl: $timeMsStr ms | servidor: $srvStr")
}

# ----------------------------------------------------------------------------
# 6. Cálculo de estadísticas y veredicto
# ----------------------------------------------------------------------------
$curlMin = 0.0
$curlAvg = 0.0
$curlP95 = 0.0
$curlMax = 0.0

if ($tiemposCurlMs.Count -gt 0) {
    $ordenados = $tiemposCurlMs | Sort-Object
    $curlMin = $ordenados[0]
    $curlMax = $ordenados[-1]
    $curlAvg = [Math]::Round(($ordenados | Measure-Object -Average).Average, 2)

    # Rango más cercano: posición ceil(0.95 * n) de la lista ordenada (1-indexada)
    $n = $ordenados.Count
    $posP95 = [int][Math]::Ceiling(0.95 * $n)
    if ($posP95 -gt $n) { $posP95 = $n }
    if ($posP95 -lt 1) { $posP95 = 1 }
    $curlP95 = $ordenados[$posP95 - 1]
}

$srvMin = 0
$srvAvg = 0.0
$srvMax = 0

if ($tiemposServidorMs.Count -gt 0) {
    $srvOrdenados = $tiemposServidorMs | Sort-Object
    $srvMin = $srvOrdenados[0]
    $srvMax = $srvOrdenados[-1]
    $srvAvg = [Math]::Round(($srvOrdenados | Measure-Object -Average).Average, 2)
}

$veredicto = "NO CUMPLE"
if ($huboFallo) {
    $veredicto = "FALLIDO"
} elseif ($curlP95 -lt 3000.0 -and $curlMax -lt 3000.0) {
    $veredicto = "CUMPLE"
} else {
    $veredicto = "NO CUMPLE"
}

# ----------------------------------------------------------------------------
# 7. Recopilación de información del equipo y entorno
# ----------------------------------------------------------------------------
$cpuInfo = "no disponible"
try {
    $proc = Get-CimInstance Win32_Processor | Select-Object -First 1
    if ($proc) {
        $cpuNombre = $proc.Name.Trim()
        $cpuCores = $proc.NumberOfCores
        $cpuHilos = $proc.NumberOfLogicalProcessors
        $cpuInfo = "$cpuNombre ($cpuCores núcleos, $cpuHilos hilos)"
    }
} catch {
    $cpuInfo = "no disponible"
}

$ramInfo = "no disponible"
try {
    $cs = Get-CimInstance Win32_ComputerSystem | Select-Object -First 1
    if ($cs -and $cs.TotalPhysicalMemory) {
        $ramGb = [Math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
        $ramInfo = ("{0:0.00} GB" -f $ramGb).Replace(".", ",")
    }
} catch {
    $ramInfo = "no disponible"
}

$soInfo = "no disponible"
try {
    $os = Get-CimInstance Win32_OperatingSystem | Select-Object -First 1
    if ($os) {
        $soInfo = "$($os.Caption) (Versión $($os.Version), $($os.OSArchitecture))"
    }
} catch {
    $soInfo = "no disponible"
}

$javaInfo = "no disponible"
try {
    $salidaJava = & cmd.exe /c "java -version 2>&1"
    if ($salidaJava -and $salidaJava.Count -gt 0) {
        $javaInfo = $salidaJava[0].Trim()
    }
} catch {
    $javaInfo = "no disponible"
}

$pgVersion = Ejecutar-ConsultaSql "SELECT version();"
$modoBdStr = if ($ModoDocker) { "MODO DOCKER" } else { "MODO LOCAL" }

# Conteos de datos en la base
$lotesPerf = Ejecutar-ConsultaSql "SELECT count(*) FROM lotes WHERE codigo_lote LIKE 'PERF%';"
$transPerf = Ejecutar-ConsultaSql "SELECT count(*) FROM transformaciones t JOIN lotes l ON l.id = t.lote_origen_id WHERE l.codigo_lote LIKE 'PERF%';"
$totalLotes = Ejecutar-ConsultaSql "SELECT count(*) FROM lotes;"
$totalTrans = Ejecutar-ConsultaSql "SELECT count(*) FROM transformaciones;"

# Commit git
$commitGit = "no disponible"
try {
    $c = & git rev-parse --short HEAD 2>$null
    if ($LASTEXITCODE -eq 0 -and $c) {
        $commitGit = $c.Trim()
    }
} catch {
    $commitGit = "no disponible"
}

# ----------------------------------------------------------------------------
# 8. Ejecución de EXPLAIN ANALYZE
# ----------------------------------------------------------------------------
Write-Host "`nEjecutando EXPLAIN ANALYZE en la base de datos..." -ForegroundColor Cyan
$salidaExplain = "No disponible"
try {
    if ($ModoDocker) {
        $salidaExplain = & docker compose exec -T db psql -U cacao -d cacao -f /datos/rendimiento/explain_trazabilidad.sql 2>&1
        $salidaExplain = ($salidaExplain -join "`n")
    } else {
        if (Get-Command "psql" -ErrorAction SilentlyContinue) {
            $salidaExplain = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $ScriptExplain 2>&1
            $salidaExplain = ($salidaExplain -join "`n")
        }
    }
} catch {
    $salidaExplain = "Error al ejecutar explain_trazabilidad.sql: $_"
}

# ----------------------------------------------------------------------------
# 9. Escritura del archivo de resultados
# ----------------------------------------------------------------------------
$fechaHoraArchivo = Get-Date -Format "yyyyMMdd_HHmm"
$fechaHoraTexto = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
$ArchivoSalida = Join-Path $DirectorioResultados ("medicion_" + $fechaHoraArchivo + ".txt")

$curlMinStr = ("{0:0.00}" -f $curlMin).Replace(".", ",")
$curlAvgStr = ("{0:0.00}" -f $curlAvg).Replace(".", ",")
$curlP95Str = ("{0:0.00}" -f $curlP95).Replace(".", ",")
$curlMaxStr = ("{0:0.00}" -f $curlMax).Replace(".", ",")
$srvAvgStr = ("{0:0.00}" -f $srvAvg).Replace(".", ",")

$lineasReporte = @()
$lineasReporte += "============================================================================"
$lineasReporte += "REPORTE DE MEDICIÓN DE RENDIMIENTO DE TRAZABILIDAD (BLOQUE I1)"
$lineasReporte += "Hackathon Cacao con Historia, Calidad y Valor (Asoprocacao)"
$lineasReporte += "============================================================================"
$lineasReporte += "Fecha y hora         : $fechaHoraTexto"
$lineasReporte += "Commit de git        : $commitGit"
$lineasReporte += ""
$lineasReporte += "1. INFORMACIÓN DEL EQUIPO"
$lineasReporte += "----------------------------------------------------------------------------"
$lineasReporte += "Procesador (CPU)     : $cpuInfo"
$lineasReporte += "Memoria RAM          : $ramInfo"
$lineasReporte += "Sistema operativo    : $soInfo"
$lineasReporte += "Versión de Java      : $javaInfo"
$lineasReporte += "Versión PostgreSQL   : $pgVersion"
$lineasReporte += "Modo de base datos   : $modoBdStr"
$lineasReporte += ""
$lineasReporte += "2. VOLUMEN DE DATOS EN LA BASE"
$lineasReporte += "----------------------------------------------------------------------------"
$lineasReporte += "Lotes sintéticos PERF: $lotesPerf"
$lineasReporte += "Transformaciones PERF: $transPerf"
$lineasReporte += "Total lotes en base  : $totalLotes"
$lineasReporte += "Total transformac.   : $totalTrans"
$lineasReporte += ""
$lineasReporte += "3. MÉTODO DE MEDICIÓN"
$lineasReporte += "----------------------------------------------------------------------------"
$lineasReporte += "Endpoint evaluado    : GET /api/lotes/$CodigoLote/trazabilidad"
$lineasReporte += "Usuario de prueba    : operador1 (rol OPERADOR)"
$lineasReporte += "Calentamiento        : $Calentamiento llamadas (descartadas del análisis)"
$lineasReporte += "Muestras oficiales   : $Medidas llamadas consecutivas"
$lineasReporte += "Herramienta cliente  : curl.exe ejecutado en el mismo equipo del backend"
$lineasReporte += "Nota metodológica    : La medición curl mide la latencia HTTP local completa"
$lineasReporte += "                       (filtro de seguridad, resolución en BD y serialización);"
$lineasReporte += "                       no incluye latencia de red externa ni renderizado en navegador."
$lineasReporte += "                       tiempoConsultaMs registra el tiempo interno del servidor."
$lineasReporte += ""
$lineasReporte += "4. MUESTRAS INDIVIDUALES"
$lineasReporte += "----------------------------------------------------------------------------"
foreach ($lineaMuestra in $lineasMuestras) {
    $lineasReporte += $lineaMuestra
}
$lineasReporte += ""
$lineasReporte += "5. RESUMEN ESTADÍSTICO Y VEREDICTO"
$lineasReporte += "----------------------------------------------------------------------------"
$lineasReporte += "Tiempo HTTP total (curl.exe):"
$lineasReporte += "  - Mínimo           : $curlMinStr ms"
$lineasReporte += "  - Promedio         : $curlAvgStr ms"
$lineasReporte += "  - Percentil 95     : $curlP95Str ms  (rango más cercano, posición $posP95 de $n)"
$lineasReporte += "  - Máximo           : $curlMaxStr ms"
$lineasReporte += ""
$lineasReporte += "Tiempo interno servidor (tiempoConsultaMs):"
$lineasReporte += "  - Mínimo           : $srvMin ms"
$lineasReporte += "  - Promedio         : $srvAvgStr ms"
$lineasReporte += "  - Máximo           : $srvMax ms"
$lineasReporte += ""
$lineasReporte += "Criterio de aceptación: Percentil 95 < 3000 ms y Máximo < 3000 ms (Prueba 10 del jurado)"
$lineasReporte += "Veredicto oficial    : $veredicto"
$lineasReporte += ""
$lineasReporte += "6. PLAN DE EJECUCIÓN (EXPLAIN ANALYZE BUFFERS)"
$lineasReporte += "----------------------------------------------------------------------------"
$lineasReporte += $salidaExplain
$lineasReporte += ""
$lineasReporte += "============================================================================"
$lineasReporte += "Fin del reporte de medición"
$lineasReporte += "============================================================================"

$lineasReporte | Set-Content -Path $ArchivoSalida -Encoding utf8

# ----------------------------------------------------------------------------
# 10. Salida en consola
# ----------------------------------------------------------------------------
Write-Host "`n------------------------------------------------------------" -ForegroundColor Green
Write-Host "RESUMEN DE RENDIMIENTO DE TRAZABILIDAD ($CodigoLote)" -ForegroundColor Green
Write-Host "------------------------------------------------------------" -ForegroundColor Green
Write-Host "Muestras evaluadas   : $Medidas"
Write-Host "Latencia curl mín    : $curlMinStr ms"
Write-Host "Latencia curl prom   : $curlAvgStr ms"
Write-Host "Latencia curl p95    : $curlP95Str ms"
Write-Host "Latencia curl máx    : $curlMaxStr ms"
Write-Host "Servidor interno prom: $srvAvgStr ms"
$colorVeredicto = "Red"
if ($veredicto -eq "CUMPLE") { $colorVeredicto = "Green" }
Write-Host "Veredicto final      : $veredicto" -ForegroundColor $colorVeredicto
Write-Host "Archivo generado     : $ArchivoSalida" -ForegroundColor Cyan
Write-Host "------------------------------------------------------------" -ForegroundColor Green

