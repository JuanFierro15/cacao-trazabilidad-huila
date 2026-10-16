# F8 — Identidad visual: preparación y prompts para agy

Reemplaza el prompt de Gemini. Son tres delegaciones independientes (F8A, F8B y F8C), cada una con su propio commit, para poder parar en cualquiera sin dejar nada a medias.

**Corte duro: 10:15.** Lo que no esté verificado a esa hora no entra a `main`. La interfaz actual funciona y es accesible; una versión bonita y rota es peor.

Prioridad si falta tiempo: F8A, luego **F7** (la mejora que salga de la prueba de usabilidad, que sí suma en E06), luego F8B y por último F8C.

---

## 0. Preparación (Juan David, unos 10 minutos)

```powershell
git switch feat/frontend-ui
git fetch origin; git merge origin/main

# 1. Assets optimizados: descomprimir assets_f8.zip en frontend/public/assets/
#    y BORRAR de esa carpeta los originales pesados (LogoAsoprocacao.jpg y VideoFondoLogin.mp4 de 5 MB).

# 2. Sistema de diseño
#    copiar DISENO.md a frontend/DISENO.md

# 3. Fuentes (licencia SIL OFL 1.1; declarar en E08)
cd frontend
npm install @fontsource/barlow @fontsource/barlow-condensed
cd ..

# 4. Skills de diseño, en el proyecto, para Claude Code y para agy
#    --copy evita los enlaces simbólicos, que en Windows fallan sin modo desarrollador
npx skills add anthropics/skills --skill frontend-design -a claude-code -a antigravity-cli --copy -y
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a claude-code --copy -y
```

Comprobar que quedaron `.agents/skills/frontend-design/SKILL.md` (lo lee agy) y `.claude/skills/frontend-design/SKILL.md` y `.claude/skills/web-design-guidelines/SKILL.md` (los lee Claude Code). Se versionan como registro de uso (E08 pide declarar las skills).

Guardar cada prompt en `prompts/frontend/F8A.md`, `F8B.md` y `F8C.md` y agregar su fila en `prompts/frontend/BITACORA.md`, como en los bloques anteriores.

Antes de F8A, tomar capturas del estado actual (inicio de sesión, recepción y trazabilidad de CAC002, ficha pública de CAC002, a 360 px y a 1280 px). Sirven como "antes" para E03.

---

## F8A — Tokens, tipografía, logo, marco y login con video

```
Bloque F8A (identidad visual, parte 1) en la rama feat/frontend-ui. Lee completos frontend/DISENO.md
y .agents/skills/frontend-design/SKILL.md antes de tocar nada. DISENO.md manda sobre la skill.

Contexto: aplicación React 19 + Vite + Tailwind CSS v4 (configuración en CSS con @theme, NO existe
tailwind.config.js) que ya funciona contra una API real. Esta tarea es SOLO visual.

Archivos permitidos (no toques ningún otro):
- frontend/src/index.css
- frontend/src/main.jsx (solo para importar las fuentes)
- frontend/index.html (favicon, apple-touch-icon, meta theme-color #3A1F0D)
- frontend/src/componentes/MarcoAplicacion.jsx
- frontend/src/paginas/login/PaginaLogin.jsx
- frontend/src/componentes/FondoVideo.jsx (nuevo)

Tareas:
1. index.css: en @theme cambia --color-cacao a #3A1F0D y --color-crema a #FFFDF9; agrega
   --color-arena #F3E5D0, --color-mazorca-oscuro #B4520F y --color-selva #27AE60; deja
   --color-mazorca #D97706 y --color-origen #15803D como están. Agrega --font-sans y
   --font-display según DISENO.md, sección 4.
2. main.jsx: importa @fontsource/barlow/400.css, 500.css y 600.css, y
   @fontsource/barlow-condensed/600.css y 700.css (ya están instalados).
3. index.html: favicon /assets/favicon-64.png (type image/png), apple-touch-icon
   /assets/apple-touch-icon.png y <meta name="theme-color" content="#3A1F0D">.
4. FondoVideo.jsx: componente reutilizable con props src, poster, className y mascara (booleano).
   Video con autoPlay, muted, loop, playsInline, preload="auto", aria-hidden="true".
   - Si window.matchMedia('(prefers-reduced-motion: reduce)') es verdadero, no reproduce: muestra el póster.
   - Botón visible "Pausar video" / "Reproducir video" con aria-pressed, foco visible y tamaño
     mínimo de 44 px, en la esquina inferior derecha.
   - Con mascara=true aplica mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, #000 55%,
     transparent 100%) (y -webkit-mask-image).
5. PaginaLogin.jsx: SOLO cambia el envoltorio visual. Fondo a pantalla completa con
   FondoVideo src=/assets/recorrido-grano.mp4 poster=/assets/recorrido-grano-poster.jpg, una capa
   bg-cacao/70 encima (sin backdrop-blur a pantalla completa) y la tarjeta actual encima con
   bg-crema/95, borde border-mazorca/30, rounded-2xl y sombra. Arriba de la tarjeta, el emblema
   /assets/logo-emblema-192.webp (72 px de alto, alt="Asoprocacao"). El título "Cacao con historia"
   pasa a font-display. Agrega arriba el enlace "Volver al inicio" a "/". NO cambies los estados, el
   manejo de errores, los ids, aria-*, los textos de los botones ("Ingresar", "Autocompletar demo
   operador", "Autocompletar demo admin") ni el enlace "¿Es comprador? Consulte un producto por su
   código". AvisoSimulacion se sigue viendo arriba.
6. MarcoAplicacion.jsx: a la izquierda de "Cacao con historia", el emblema
   /assets/logo-emblema-96.webp de 32 px de alto con alt="" (el nombre ya está escrito al lado).
   El nombre pasa a font-display. El enlace activo agrega decoration-mazorca al subrayado que ya
   tiene. No cambies la lista de enlaces, los roles ni el botón de cerrar sesión.

Reglas:
- Ningún color hex dentro de className (prohibido bg-[#...]): solo tokens.
- Nada de CDN ni URLs externas. Sin dependencias nuevas.
- No uses transition-all; transiciona solo colors, opacity o transform.
- Comentarios en español, sin nombrar herramientas ni archivos de agentes.
- No hagas commit.

Verificación (ejecútala de verdad y reporta la salida):
- cd frontend && npm run build && npm run lint → sin errores.
- grep -rnE "\[#[0-9A-Fa-f]{3,8}\]" frontend/src → vacío.
- grep -rniE "https?://" frontend/src frontend/index.html → solo lo que ya existía.
- grep -rniE "\b(IA|AI|claude|anthropic|gemini|antigravity|agy)\b" frontend/src → vacío.
Responde con el formato de la sección 6 de CLAUDE.md y detente.

Commit sugerido: style: aplicar identidad visual de Asoprocacao en tokens, tipografía, marco y login
```

**Revisión de Juan David en el navegador:** login con "Autocompletar demo operador" → recepción → transformación → trazabilidad. El video se ve en Chrome y en Edge; el botón Pausar funciona con Tab y Enter; a 360 px (truco del `iframe`) la tarjeta no se corta. Con "Emular prefers-reduced-motion" en DevTools no se reproduce el video.

---

## F8B — Página de inicio pública

```
Bloque F8B (identidad visual, parte 2) en la rama feat/frontend-ui. Lee frontend/DISENO.md y
.agents/skills/frontend-design/SKILL.md. F8A ya está hecho: usa sus tokens, sus fuentes y el
componente frontend/src/componentes/FondoVideo.jsx.

Archivos permitidos:
- frontend/src/paginas/inicio/PaginaInicio.jsx (nuevo)
- frontend/src/utilidades/useAlAparecer.js (nuevo: IntersectionObserver que devuelve [ref, visible]
  y se desconecta tras la primera vez)
- frontend/src/App.jsx (SOLO el componente Inicio)
- frontend/src/index.css (solo agregar las clases de la traza)

1. App.jsx: el componente Inicio mantiene la redirección actual cuando hay sesión
   (Navigate a rutaInicioPorRol(rol)). Sin sesión, en lugar de ir a /login, renderiza <PaginaInicio />.
   No cambies ninguna otra ruta.

2. index.css: clases .traza (lista ol con la línea vertical en ::before) y .traza-horizontal
   (variante de escritorio, línea horizontal) según DISENO.md, sección 5. Keyframes "trazar" y
   "nodo". La animación corre solo cuando el contenedor tiene la clase .visible. Con
   prefers-reduced-motion: reduce se ve completo y sin animación.

3. PaginaInicio.jsx, con estos landmarks: header, nav, main (un solo h1) y footer. Mobile-first.
   Textos exactos (no inventes otros):

   ENCABEZADO: emblema /assets/logo-emblema-96.webp (alt="") + "Cacao con historia" en font-display
   + debajo, pequeño, "de Asoprocacao, Campoalegre (Huila)". Navegación con anclas:
   "Cómo funciona" (#recorrido), "Consultar un lote" (#consulta), "Para la asociación" (#asociacion).
   A la derecha, el botón "Ingresar" (Link a /login) en bg-cacao text-crema. En móvil, la
   navegación por anclas se oculta y queda solo "Ingresar".

   HÉROE (dos columnas desde md; una en móvil, video debajo del texto):
   - h1 en font-display, grande (text-5xl md:text-7xl, leading-none, tracking-tight):
     "Del cultivo al comprador, cada grano con su historia"
   - Párrafo: "Asoprocacao registra el acopio, la transformación y la venta de su cacao en una sola
     plataforma. Cada lote sale con una ficha pública y un código QR que muestran su origen, su
     recorrido y si está disponible para la venta."
   - Bloque con id="consulta": reutiliza el componente FormularioConsultaFicha que ya exporta
     frontend/src/paginas/publico/PaginaConsultaFicha.jsx (no lo reescribas ni cambies su lógica).
     Encima, el texto "¿Compró cacao de Asoprocacao? Escriba el código impreso en el empaque o
     escanee el QR."
   - Enlace secundario "Ingresar al sistema" a /login.
   - Columna derecha: FondoVideo src=/assets/hero-productores.mp4
     poster=/assets/hero-productores-poster.jpg mascara=true, en relación 16/9 y con esquinas
     redondeadas.

   EL RECORRIDO DEL GRANO (section id="recorrido", fondo arena):
   h2 "El recorrido del grano". Lista ordenada con .traza (vertical en móvil, .traza-horizontal desde
   lg), activada con useAlAparecer. Cinco pasos con style={{'--i': indice}}; título en font-display y
   una frase:
   1. "Finca": "Cada productor tiene su finca, municipio, variedad y una cuota anual según sus hectáreas."
   2. "Acopio": "El operador registra peso, humedad y tipo de grano. El sistema asigna un código único
      y alerta si la entrega supera la cuota de la finca."
   3. "Transformación": "En cada etapa, del beneficio al empaque, se pesa la entrada y la salida. La
      merma se ve mientras se registra y no se puede consumir más de lo disponible."
   4. "Control": "La administración revisa alertas, costos y márgenes, y libera o bloquea cada lote.
      Al bloquear, también retiene todo lo que salió de él."
   5. "Ficha pública": "El comprador escanea el QR y ve el origen, el recorrido y el estado, sin
      costos ni datos personales."

   PARA LA ASOCIACIÓN (section id="asociacion"): dos columnas desde md. Izquierda: imagen
   /assets/productor-mazorca-abierta-800.webp (srcset con la de 1600w, loading="lazy",
   alt="Productor sosteniendo una mazorca de cacao abierta"). Derecha: h2 "Lo que cambia para la
   asociación" y una lista (NO tarjetas iguales) de tres puntos con un nodo mazorca como viñeta:
   - "Alerta de cuota por finca: una entrega que supera lo que la finca puede producir se detecta en
     el acopio, no meses después."
   - "Merma en vivo y causa en un toque: el operador ve el porcentaje mientras pesa y registra el
     motivo con un botón."
   - "Retiro inmediato: ante un reclamo, un lote y todo lo que salió de él quedan bloqueados en un
     solo paso, con el reporte de los kilos afectados."
   Al final, el botón "Ingresar al sistema" (Link a /login).

   PIE (bg-cacao text-crema): /assets/logo-completo-480.webp (alt="Asoprocacao, Campoalegre, Huila")
   sobre un círculo o rectángulo color crema para que contraste, y el texto:
   "Asoprocacao es un cliente simulado del II Hackathon de Programación (USCO, Semillero DEVURITY,
   2026). Los datos son sintéticos y las fotografías y los videos son ilustraciones generadas con IA."
   Más "Equipo KGB, Ingeniería de Software, Universidad Surcolombiana."

Reglas: las de F8A, y además ningún dato de lotes escrito a mano (ni códigos, ni kilos, ni estados),
nada de mapa, nada de grillas de tarjetas idénticas, scroll-margin-top en las secciones con ancla y
foco visible en todo lo interactivo. AvisoSimulacion arriba, como en las demás páginas públicas.

Verificación: npm run build, npm run lint y los tres grep de F8A. Además: sin sesión, "/" muestra el
inicio; con sesión de operador, "/" redirige a /operador; escribir CAC002 y "Ver ficha" abre
/ficha/CAC002. Reporta con el formato de la sección 6 de CLAUDE.md y detente. No hagas commit.

Commit sugerido: feat: agregar página de inicio pública con consulta de lotes
```

**Revisión:** recorrer el inicio solo con el teclado (Tab llega a anclas, al campo de código, a "Ver ficha" y a "Ingresar"); a 360 px no hay scroll horizontal; con movimiento reducido la traza aparece completa.

---

## F8C — La traza en trazabilidad y ficha, sello de estado y transiciones

```
Bloque F8C (identidad visual, parte 3) en la rama feat/frontend-ui. Lee frontend/DISENO.md,
secciones 5 y 6. Las clases .traza y los keyframes ya existen en frontend/src/index.css (F8B).

Archivos permitidos:
- frontend/src/paginas/lotes/PaginaTrazabilidad.jsx: SOLO las clases del <ol> de la línea de tiempo
  (sección "titulo-seccion-linea") y de sus <li>, más style={{'--i': indice}} en cada <li>.
- frontend/src/paginas/publico/PaginaFichaPublica.jsx: SOLO las clases del <ol> del recorrido y de
  sus <li>, y agregar la clase "sello" al bloque de estado (el div con role alert o status).
- frontend/src/componentes/SemaforoMerma.jsx: SOLO clases, para que el cambio de color de las luces
  use transition-colors duration-200.
- frontend/src/componentes/MarcoAplicacion.jsx y frontend/src/componentes/TablaLotes.jsx: agregar la
  prop viewTransition a los NavLink y Link existentes (React Router 7), sin cambiar destinos.
- frontend/src/index.css: keyframes "sello", clase .sello y estilos de ::view-transition-old(root) y
  ::view-transition-new(root) con 180 ms. Todo anulado con prefers-reduced-motion: reduce.

En la trazabilidad y la ficha, la línea y los nodos se dibujan al montar (agrega la clase .visible
directamente, sin IntersectionObserver). El último nodo va relleno de mazorca. No cambies ningún
texto, dato, rol ARIA, key, condición ni llamada a la API.

Verificación: npm run build, npm run lint y los tres grep de F8A. En el navegador: trazabilidad de
CAC002 y ficha pública de CAC002 con la animación; con movimiento reducido emulado, sin animación;
la ficha de un lote BLOQUEADO sigue en rojo con role="alert" y el texto "Producto retenido: no está
disponible para la venta". Reporta con el formato de la sección 6 de CLAUDE.md y detente. No hagas
commit.

Commit sugerido: style: animar la traza del lote y el estado de la ficha pública
```

---

## Después de cada bloque (Juan David con Claude Code)

1. `git status` y `git diff`: solo archivos permitidos; ningún cambio en `src/api`, `src/auth` ni en los cálculos.
2. Pedir a Claude Code la revisión con la skill `web-design-guidelines` sobre los archivos cambiados.
3. Recorrido de regresión de la demo del pitch: recepción con PRD-C (250 kg) → transformación 250 → 200 con chip → alertas → trazabilidad → QR → ficha en el celular. **Hacerlo sobre una copia o restaurar `respaldo_demo.dump` al terminar.**
4. Commit y push. Al final, PR de `feat/frontend-ui` a `main` antes de las 10:30.

## Lo que hay que actualizar por este cambio

- **E03:** capturas nuevas de las pantallas (el reto dice que el diseño debe coincidir con la aplicación) y una decisión técnica: "tokens en `@theme` y animaciones solo con CSS (sin librería), con la alternativa descartada (Motion o GSAP) y la limitación (las transiciones de vista no funcionan en Firefox)".
- **E06:** la mejora derivada de la prueba es la de F7, no este rediseño. No presentar F8 como resultado de la prueba de usabilidad.
- **E08:** imágenes, logo y videos generados con IA (indicar la herramienta y el modelo); skills `frontend-design` (Anthropic, Apache 2.0) y `web-design-guidelines` (Vercel); fuentes Barlow y Barlow Condensed (SIL OFL 1.1).
- **CLAUDE.md, sección 8:** quitar la nota "Material visual … nadie lo usa ni lo versiona" y registrar F8.
