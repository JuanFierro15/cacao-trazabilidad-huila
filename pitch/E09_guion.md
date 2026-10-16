# E09 — Guion cronometrado del pitch (5 minutos)

Presenta: **Juan Manuel Villalba Rincón**. Opera la aplicación durante la demostración: **Juan David Fierro Calderón** (así Juan Manuel habla mirando al jurado y no pierde tiempo tecleando).

La presentación son 5 diapositivas: problema, propuesta, producto, precio y piloto (`pitch/E09_presentacion.pdf`). Cada diapositiva tiene en sus notas el mismo texto de este guion.

Formato del reto: el cronómetro se detiene a los 5:00. Después vienen 8 minutos de pruebas del jurado y 5 de defensa.

---

## 1. Preparación (15 minutos antes)

1. **Base limpia** (borra los ensayos; CAC001 debe quedar intacto para las pruebas del jurado):
   ```powershell
   powershell -ExecutionPolicy Bypass -File datos\scripts\restaurar.ps1 datos\respaldos\respaldo_demo.dump
   ```
   Debe terminar con `[INTEGRIDAD CONFIRMADA]`. Detalle en `datos/respaldos/LEEME.md`.
2. **Levantar** el backend (`cd backend` y `.\mvnw.cmd spring-boot:run`) y el frontend (`cd frontend` y `npm run dev`).
3. **QR para el celular:** en el `.env`, `VITE_PUBLIC_BASE_URL=http://<IP-del-PC>:5173` (ver la IP con `ipconfig`). El celular debe estar en la misma Wi-Fi. Probar antes abriendo `http://<IP-del-PC>:5173/ficha` en el celular.
4. **Sesiones abiertas:**
   - Celular: `operador1` en **Recepción de lotes**.
   - Portátil: `admin1` en **Inventario**, con el navegador al 125 %.
5. **Presentación** en modo Presentar, en la diapositiva 1. Cronómetro a la vista.
6. **No usar CAC001** en el pitch: el jurado lo usa después para su prueba de 100 kg → 80 kg.

## 2. Guion

| Tiempo | Diapositiva | Qué pasa |
|---|---|---|
| 0:00–0:40 | 1 · Problema | Quién lo vive y qué consecuencia tiene |
| 0:40–1:10 | 2 · Propuesta | Beneficio principal y solución |
| 1:10–3:10 | Aplicación (3 de respaldo) | Recepción, transformación, alerta y ficha |
| 3:10–4:10 | 4 · Precio | Quién paga, precio, costos y alcance |
| 4:10–4:40 | 5 · Piloto | Por qué elegirnos y cómo medir el beneficio |
| 4:40–5:00 | 5 · Piloto | Piloto concreto y solicitud al cliente |

### 0:00–0:40 · Problema (diapositiva 1)

> «Buenos días. Somos el equipo KGB, de Ingeniería de Software de la USCO. Asoprocacao, en Campoalegre, compra cacao a pequeños productores de Campoalegre, Rivera y Algeciras y lo transforma en grano seleccionado, nibs y licor. Hoy ese recorrido vive en cuadernos, WhatsApp y Excel.
>
> En el acopio no hay una etiqueta única ni un control de cuánto puede producir cada finca: es la puerta al lavado de cacao. En la planta se consumen bultos sin registrar de qué lote salieron, así que nadie concilia mermas ni costos. Y cuando un comprador reclama, reconstruir el lote toma horas, y el producto sale sin un pasaporte que pruebe su origen.»

### 0:40–1:10 · Propuesta (diapositiva 2)

> «Cacao con historia conecta las tres etapas en una sola plataforma web que funciona desde el celular. El operador registra la recepción y la transformación; el sistema calcula mermas, inventario, costos y alertas; y cada lote sale con una ficha pública y un código QR.
>
> Tres cosas nos diferencian: alertamos en el momento cuando una entrega supera lo que la finca puede producir; el operador ve la merma mientras pesa y registra la causa con un toque; y el comprador ve el origen sin ver costos, mientras que ante un reclamo la administración bloquea el lote y todo lo que salió de él en un solo paso. Les muestro.»

### 1:10–3:10 · Demostración en vivo (aplicación; la diapositiva 3 es el plan B)

Datos exactos, ensayados por la API el 16/10 a las 06:25 sobre la base limpia:

| Paso | Quién y dónde | Acción | Qué decir |
|---|---|---|---|
| 1 · Recepción (30 s) | Celular, `operador1` | Productor **PRD-C · Productor C — Finca Los Cámbulos (Algeciras)**, tipo **Seco**, humedad **7,5**, cantidad **250**. Señalar la vista previa de cuota y **Guardar** | «Esta finca de media hectárea tiene una cuota de 300 kg al año y ya entregó 80. El sistema lo alerta en el momento: es la defensa contra el lavado de cacao.» Resultado: lote **CAC004** con alerta de cuota excedida (330 kg de 300) |
| 2 · Transformación (40 s) | Celular, **Registrar transformación** | Lote **CAC004**, etapa **Limpieza y clasificación**, entrada **250**, salida **200**, producto **Grano seco seleccionado**. Tocar el chip **Impurezas y pasilla superiores a lo normal**. **Registrar** | «Mientras pesa, el semáforo se pone en rojo: 20 % de merma, por encima del umbral de 15 %. Se descuenta el inventario y nace el lote CAC004-T1. El sistema no deja consumir más de lo disponible.» |
| 3 · Alerta (20 s) | Portátil, `admin1`, **Alertas** | Mostrar la alerta de merma alta y la de cuota de CAC004 | «La administración ve cada alerta con su regla y su causa, sin que nadie tenga que reportarla.» |
| 4 · Ficha con QR (30 s) | Portátil: trazabilidad de **CAC004-T1** (desde el inventario). Celular: escanear | Bajar al código QR y escanearlo con el celular | «Esto es lo que ve un comprador: origen, etapas y estado. Nunca costos ni datos personales.» La ficha sale **PENDIENTE**: aún no se ha liberado para la venta |

Cierre del bloque (si queda tiempo):

> «Todo lo que vieron está probado: 52 pruebas automatizadas, y la trazabilidad responde en 22 milisegundos con 400 lotes, cuando la meta es de 3 segundos.»

### 3:10–4:10 · Precio (diapositiva 4)

> «¿Quién paga? La asociación, desde su gerencia: es quien responde ante los compradores por el origen y la calidad. Proponemos una suscripción de 350.000 pesos al mes por asociación, con usuarios ilimitados, fichas y códigos QR sin límite, respaldo diario y soporte.
>
> ¿Cuánto cuesta operarlo? Un servidor en la nube de 2 procesadores y 4 GB cuesta unos 24 dólares al mes, cerca de 77.000 pesos; los respaldos y el dominio, unos 20.000; y el soporte, unas 3 horas al mes, 105.000. En total, unos 202.000 pesos. La aplicación no usa inteligencia artificial en su funcionamiento, así que no hay ese costo. Queda un margen de unos 148.000 pesos, y como un mismo servidor puede atender a varias asociaciones, el costo por cliente baja a medida que crecemos.
>
> Llegamos a las asociaciones con venta directa en el Huila, con demostraciones como esta, y con alianzas con el gremio cacaotero.»

### 4:10–4:40 · Diferenciador e impacto (diapositiva 5)

> «¿Por qué elegirnos? Porque a diferencia de un cuaderno o una hoja de cálculo, el sistema avisa en el momento y prueba el origen con un QR. Y el beneficio se puede medir: hoy, cero por ciento de los lotes sale con una ficha de origen; la meta es el cien por ciento. Hoy, reconstruir un lote toma horas; la meta es menos de 3 segundos, y en nuestras pruebas la consulta ya responde en 22 milisegundos.»

### 4:40–5:00 · Cierre (diapositiva 5)

> «Proponemos un piloto de 30 días por 150.000 pesos, con despliegue, registro de fincas y capacitación. En la primera semana medimos cómo están hoy, y en la cuarta medimos el resultado. Buscamos a Asoprocacao como asociación aliada para validar estas metas. ¿Empezamos?»

## 3. Plan B

- **Falla el backend o la red:** pasar a la diapositiva 3 y contar la demo sobre las capturas. No intentar arreglar en vivo.
- **El celular no abre el QR:** abrir en el portátil `http://localhost:5173/ficha/CAC004-T1`, o escribir el código en `/ficha`.
- **La Wi-Fi aísla los equipos:** compartir datos desde el celular y conectar el PC a ese punto (antes del pitch; cambia la IP del `.env`).
- **Se pasa el tiempo:** recortar el paso 3 (alerta), porque la alerta ya se ve en el celular al guardar.

## 4. Cifras que hay que saber (y de dónde salen)

| Cifra | Valor | Evidencia |
|---|---|---|
| Pruebas automatizadas | 52, 0 fallos | `mvnw test` sobre `main` (B9 incluido) |
| Rendimiento de la trazabilidad | p95 de 22,27 ms; promedio de 17,82 ms; 30 medidas con 400 lotes y 300 transformaciones | `datos/rendimiento/resultados/medicion_20261016_0555.txt` |
| Meta del reto | Menos de 3 s | Prueba 10 del jurado |
| Respaldo y restauración | Integridad confirmada en PowerShell y bash | `datos/respaldos/LEEME.md` |
| Precio | 350.000 COP al mes; piloto de 30 días, 150.000 COP | Propuesta del equipo |
| Costo de operación | ≈ 201.800 COP al mes | Supuestos: servidor de 2 vCPU y 4 GB a ≈ 24 USD al mes; TRM ≈ 3.200 COP por USD (octubre de 2026); respaldos 5 USD; dominio 15 USD al año; 3 h de soporte a 35.000 COP |
| Margen estimado | ≈ 148.200 COP al mes (42 %) | Precio menos costo |
| Cuota del Productor C | 300 kg al año | Semilla V2: 0,5 ha × 600 kg/ha/año (`rendimientoPlausibleKgHaAnio`) |

Los datos de la aplicación son sintéticos (los del reto). Lo único medido de verdad son las pruebas, el rendimiento y la restauración; **las metas del piloto son hipótesis**.

## 5. Defensa: preguntas probables

- **¿Cómo evitan que se consuma más cacao del que hay, o que una operación se registre dos veces?** El servidor bloquea el lote mientras registra la transformación (bloqueo pesimista) y cada operación lleva un identificador único: un reenvío responde 409 y pedir más de lo disponible responde 422, sin cambiar el inventario. Hay pruebas automatizadas de los dos casos.
- **¿El comprador puede ver costos?** No. La ficha se arma con una lista blanca de campos, y una prueba automatizada revisa que no salga ningún campo prohibido (costos, cantidades, merma, responsable, nombre del productor).
- **¿Un operador puede liberar o bloquear un lote?** No. Lo decide el servidor: el operador recibe 403 aunque vea el botón. Cada cambio queda en una auditoría que la base de datos no deja modificar ni borrar.
- **¿Qué pasa si se pierde la base de datos?** Hay respaldo y restauración con verificación de integridad: conteos, kilos y códigos idénticos antes y después.
- **¿Funciona sin internet?** Funciona en la red local de la asociación (PC y celulares en la misma Wi-Fi) sin salir a internet. No es una aplicación sin conexión: si se cae la red local, la contingencia es registrar en planilla y cargar después.
- **¿Por qué la cuota de la finca es de 300 kg?** Es el rendimiento plausible del caso (600 kg por hectárea al año) por la media hectárea de la finca. La alerta avisa, no bloquea: la recepción se registra y queda marcada.
- **¿Los datos son reales?** No: son los datos sintéticos del reto. Las cifras de rendimiento son mediciones reales en el PC de la demostración.
- **¿Usaron IA?** Sí, para diseñar, programar, probar y preparar este pitch; está declarado en E08. Cada bloque lo revisó el equipo y quedó cubierto por las pruebas.
- **¿Escala con más datos?** Con 400 lotes la consulta recursiva tarda menos de 1 ms en la base y la respuesta completa 22 ms. La medición es local (no incluye la red).
- **Limitaciones que conviene decir antes de que las pregunten:** cada transformación consume un solo lote de entrada (las mezclas de varios lotes quedan para después); no hay modo sin conexión; las metas del piloto son hipótesis por validar.

## 6. Ensayo

- Hacer al menos 3 ensayos completos con cronómetro y la demo real, restaurando la base limpia antes de cada uno.
- Marcar en qué segundo empieza cada tramo; si un tramo se pasa, recortar texto, no velocidad.
- Ensayar el plan B una vez (la diapositiva 3 sin aplicación).
