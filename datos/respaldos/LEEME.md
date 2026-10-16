# Respaldo de demostración

`respaldo_demo.dump` es la base **limpia** de la aplicación: el esquema `V1`, los datos semilla `V2` y los dos usuarios de demostración. Sirve para devolver la demostración a su punto de partida antes de la evaluación o después de cada ensayo.

| Contenido | Cantidad |
|---|---|
| Lotes | 3 (`CAC001` 100 kg Rivera, `CAC002` 150 kg Campoalegre, `CAC003` 80 kg Algeciras; los tres de recepción, `SECO` y `PENDIENTE`) |
| Productores | 3 (`PRD-A`, `PRD-B`, `PRD-C`) |
| Usuarios | 2 (`operador1` y `admin1`, contraseñas de la sección 7 del contrato) |
| Transformaciones, composiciones, alertas y auditoría | 0 |

`CAC001` queda sin transformaciones a propósito: el jurado registra en vivo 100 kg → 80 kg. Después de restaurar, el siguiente lote que se reciba toma el código `CAC004`.

Junto al respaldo está `respaldo_demo.integridad.txt`, la salida de `datos/scripts/verificar_integridad.sql` en el momento del respaldo. Los scripts de restauración la comparan solos con el estado restaurado.

- Generado el 16/10/2026 a partir de `main` `18d9d40` (Flyway V1 y V2), con `datos/scripts/respaldar.ps1` en modo Docker.
- Tamaño: 32.686 bytes. SHA-256: `054EC03AD4C6E4E8690CA82F734AA79ECE81BCD667C71284BA9713D8E70876CA`.
- `.gitattributes` marca los `.dump` como binarios, para que git no les cambie los finales de línea.

## Antes de restaurar

- **Restaurar borra todo lo que haya en la base `cacao`**: lotes, transformaciones, alertas y auditoría de los ensayos. Si algo de eso se necesita, primero se respalda con `datos/scripts/respaldar.ps1` (o `.sh`).
- **Detener el backend** (Ctrl+C en su terminal). El frontend puede seguir abierto.
- Modo Docker: el contenedor de la base debe estar arriba (`docker compose up -d`).
- Modo local: `psql` y `pg_restore` en el PATH, de la misma versión mayor del servidor (16), y en el `.env` los valores de `DB_HOST`, `DB_PORT`, `POSTGRES_USER`, `POSTGRES_DB` y `POSTGRES_PASSWORD`.

Los scripts detectan solos el modo: si el servicio `db` de docker compose está en ejecución usan el contenedor; si no, las herramientas locales.

## Cómo restaurar

Desde la raíz del repositorio.

**Windows (PowerShell):**

```powershell
powershell -ExecutionPolicy Bypass -File datos\scripts\restaurar.ps1 datos\respaldos\respaldo_demo.dump
```

**Git Bash, Linux o macOS:**

```bash
bash datos/scripts/restaurar.sh datos/respaldos/respaldo_demo.dump
```

Luego se vuelve a levantar el backend:

```bash
cd backend
./mvnw spring-boot:run        # en Windows: .\mvnw.cmd spring-boot:run
```

## Salida esperada

Al final de la restauración debe aparecer:

```text
[INTEGRIDAD CONFIRMADA] El estado restaurado COINCIDE EXACTAMENTE con el respaldo original.
```

Y la verificación de integridad después de restaurar debe mostrar esto (salida real del 16/10/2026, la misma de `respaldo_demo.integridad.txt`):

```text
=== 1. CONTEOS PRINCIPALES ===
 total_lotes | lotes_recepcion | lotes_derivados | total_transformaciones | total_composiciones | total_alertas | total_auditoria | total_usuarios
-------------+-----------------+-----------------+------------------------+---------------------+---------------+-----------------+----------------
           3 |               3 |               0 |                      0 |                   0 |             0 |               0 |              2
(1 row)

=== 2. BALANCE DE MASA EN INVENTARIO (KG) ===
 suma_recibida_kg | suma_consumida_kg | suma_disponible_kg | discrepancia_kg
------------------+-------------------+--------------------+-----------------
          330.000 |             0.000 |            330.000 |           0.000
(1 row)

=== 3. INCONSISTENCIAS DE INVENTARIO (DEBE SER 0 FILAS) ===
 codigo_lote | cantidad_recibida | cantidad_consumida | cantidad_disponible
-------------+-------------------+--------------------+---------------------
(0 rows)

=== 4. LISTA ORDENADA DE CÓDIGOS DE LOTES ===
 codigo_lote | tipo_lote |  producto  | origen_municipio | recibida_kg | consumida_kg | disponible_kg |  estado
-------------+-----------+------------+------------------+-------------+--------------+---------------+-----------
 CAC001      | RECEPCION | Cacao seco | Rivera           |     100.000 |        0.000 |       100.000 | PENDIENTE
 CAC002      | RECEPCION | Cacao seco | Campoalegre      |     150.000 |        0.000 |       150.000 | PENDIENTE
 CAC003      | RECEPCION | Cacao seco | Algeciras        |      80.000 |        0.000 |        80.000 | PENDIENTE
(3 rows)
```

Si en lugar de la confirmación aparece `[ADVERTENCIA]`, el script muestra las líneas que no coinciden. En ese caso no se debe seguir con la demostración hasta revisar la causa.

## Qué revisar después

1. Al arrancar, el backend muestra `Successfully validated 2 migrations` y `Schema "public" is up to date. No migration necessary.` (no migra nada) y no duplica usuarios.
2. Se puede iniciar sesión con `admin1`, y el inventario muestra solo CAC001, CAC002 y CAC003.
3. `CAC001` está `PENDIENTE`, con 100 kg disponibles y sin transformaciones.
4. Al recibir un lote nuevo, el código asignado es `CAC004`.

## Cómo se generó (y cómo regenerarlo)

Solo hace falta regenerarlo si el esquema cambia con una migración nueva.

1. Detener el backend.
2. Recrear la base vacía. En modo Docker:
   ```bash
   docker compose exec -T db psql -U cacao -d postgres -c "DROP DATABASE IF EXISTS cacao WITH (FORCE);" -c "CREATE DATABASE cacao;"
   ```
3. Arrancar el backend: Flyway aplica las migraciones y el inicializador crea los dos usuarios. Comprobar 3 lotes, 3 productores, 2 usuarios y 0 transformaciones, alertas y auditoría.
4. Respaldar con nombre fijo:
   ```powershell
   powershell -ExecutionPolicy Bypass -File datos\scripts\respaldar.ps1 datos\respaldos\respaldo_demo.dump
   ```
5. Verificar con una restauración y subir `respaldo_demo.dump` y `respaldo_demo.integridad.txt` juntos.

## Verificación hecha (16/10/2026, PC de la demostración, modo Docker)

- La base recién creada tenía 3 lotes, 3 productores, 2 usuarios, 0 transformaciones, 0 composiciones, 0 alertas y 0 registros de auditoría; Flyway aplicó V1 y V2.
- Se ensució la base (un lote nuevo por la API, que salió como `CAC004`, y un cambio de estado en `CAC002`) y se restauró con `restaurar.ps1` y con `restaurar.sh`: las dos dieron `[INTEGRIDAD CONFIRMADA]` y la base volvió a los 3 lotes.
- La comparación funciona en las cuatro combinaciones (reporte generado con PowerShell o con bash, restaurado con PowerShell o con bash). Con un reporte alterado a propósito, los dos scripts avisan la discrepancia.
- Tras restaurar, el backend arrancó sin migrar y con 2 usuarios, el inicio de sesión de `admin1` funcionó, `CAC001` estaba `PENDIENTE` sin transformaciones y el siguiente lote recibido fue `CAC004`.
