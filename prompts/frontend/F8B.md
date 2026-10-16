# Bloque F8B — Identidad visual, parte 2: página de inicio pública

- Integrante: Juan David Fierro Calderón
- Herramienta: Claude Code (coordinación y revisión); implementación delegada a agy con gemini-4-argon-high (claude-opus-5-5-high sin cuota desde F8A).
- Rama: `feat/frontend-ui`
- Fecha: 2026-10-16 07:49. Prompt preparado por Juan David en `prompts/frontend/F8_prompts_agy.md`; guía de diseño en `frontend/DISENO.md`.

## Prompt

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

## Ajustes del coordinador (leídos del código real antes de delegar)

- Reglas de F8A que siguen vigentes: ningún color hex dentro de className (solo tokens); nada de CDN ni URLs externas; sin dependencias nuevas; nada de transition-all (solo colors, opacity o transform); comentarios en español sin nombrar herramientas ni archivos de agentes.
- Los tres grep de F8A, desde la raíz del repositorio:
  - `grep -rnE "\[#[0-9A-Fa-f]{3,8}\]" frontend/src` → vacío.
  - `grep -rniE "https?://" frontend/src frontend/index.html` → solo la línea que ya existía en `componentes/CodigoQrFicha.jsx`.
  - `grep -rniE "\b(IA|AI|claude|anthropic|gemini|antigravity|agy)\b" frontend/src` → solo la línea del pie de `PaginaInicio.jsx` (ver la excepción abajo).
- No hagas commit ni push. No instales ni actualices dependencias ni ejecutes `npm install`. No toques `frontend/public/` (los recursos ya están en `frontend/public/assets/`).
- **La traza debe servir también para F8C**, donde se aplicará a listas `<ol>` ya existentes de la trazabilidad interna y de la ficha pública, cuyos `<li>` tienen contenido variable (fecha, títulos, párrafos). Por eso:
  - La línea se dibuja con `ol.traza::before` (posición absoluta, 2 px, `mazorca`, `transform-origin: top`) y cada nodo con `.traza > li::before` (círculo de 12 px, borde de 2 px `cacao`, relleno `crema`; `.traza > li:last-child::before` relleno `mazorca`). Nada de elementos extra en el JSX para la línea o los nodos.
  - El `ol.traza` reserva el espacio a la izquierda con `padding-left` en el propio CSS, y cada `li` es `position: relative`, para que funcione con cualquier contenido.
  - Sin `.visible`: línea en `scaleY(0)` y nodos en `opacity: 0`. Con `.visible`: corren los keyframes `trazar` (700 ms, `cubic-bezier(.2,.7,.2,1)`) y `nodo` (280 ms, retraso `calc(var(--i, 0) * 110ms + 150ms)`), con `animation-fill-mode: both`.
  - `.traza-horizontal` solo cambia la disposición dentro de `@media (min-width: 64rem)` (desde `lg`), para que la clase pueda estar siempre puesta: línea horizontal (`scaleX`, `transform-origin: left`) y nodos arriba de cada paso.
  - En `@media (prefers-reduced-motion: reduce)`: `animation: none`, línea en `transform: none` y nodos en `opacity: 1`, aunque falte `.visible`.
- `useAlAparecer.js`: si `IntersectionObserver` no existe en el navegador, devuelve `visible = true` desde el inicio. Es el único archivo nuevo permitido en `utilidades/`.
- `FormularioConsultaFicha` se importa desde `../publico/PaginaConsultaFicha.jsx` y se usa tal cual (ya trae su `label` "Código del producto", su placeholder y el botón "Ver ficha"). Debe haber una sola instancia en la página.
- `AvisoSimulacion` se importa desde `../../componentes/AvisoSimulacion.jsx` y va antes del `header`.
- **Excepción esperada del tercer grep:** el texto obligatorio del pie dice "…ilustraciones generadas con IA." (DISENO.md, sección 9). Es texto visible para el usuario exigido por la guía, no un comentario: es la única coincidencia aceptada. Ningún comentario de código puede nombrar herramientas.
- Las imágenes (`<img>`) llevan `width` y `height` explícitos (los del archivo: los `-800.webp` miden 800 px de ancho; consulta el alto real con node si lo necesitas) y `loading="lazy"` las que están bajo el pliegue; el emblema del encabezado no.
- Nada de URLs externas: todo sale de `/assets/`. No cambies nada en `frontend/src/api/`, `frontend/src/auth/`, `componentes/` ni en otras páginas.

## Revisión y verificación (Claude Code, 16/10, 07:59–08:10)

- **Ejecución:** `gemini-4-argon-high`, 07:49–07:59, `SUCCESS`. HEAD siguió en `000e8f1` (sin commit de agy). Mientras agy trabajaba, Claude Code hizo F7 en otros archivos y lo commiteó antes (`3891452`), con solo su parte de `index.css` en el índice.
- **Archivos de agy:** solo los permitidos (`App.jsx`, solo el componente `Inicio`; `index.css`, solo las clases de la traza; y los nuevos `paginas/inicio/PaginaInicio.jsx` y `utilidades/useAlAparecer.js`). Sin cambios en `src/api`, `src/auth` ni otras rutas. Textos exactos del prompt; ningún dato de lotes escrito a mano.
- **Build y lint:** sin errores ni advertencias.
- **Grep:** hex → vacío; URL → solo `componentes/CodigoQrFicha.jsx:98`; menciones → solo `paginas/inicio/PaginaInicio.jsx:257`, la frase obligatoria del pie ("…ilustraciones generadas con IA."), que es texto visible exigido por `DISENO.md` y no un comentario.
- **Navegador (Edge sin ventana por CDP):**
  - Sin sesión, `/` muestra el inicio: un solo `h1`, `header`, `nav`, `main` y `footer`, las tres anclas, el formulario de consulta, todas las imágenes con `width` y `height`, y el pie con el texto obligatorio. Sin scroll horizontal a 1280 ni a 360 px; a 360 px las anclas se ocultan y queda "Ingresar".
  - Con sesión de `operador1`, `/` redirige a `/operador`.
  - CAC002 en el campo y "Ver ficha" → `/ficha/CAC002` ("Cacao seco · Lote CAC002").
  - Con movimiento normal, al entrar en pantalla la lista recibe `.visible` y corren las animaciones `trazar` y 5 `nodo`.
  - Con `prefers-reduced-motion: reduce` emulado: 0 animaciones, nodos con opacidad 1, video en pausa en 0 s.
  - Teclado (eventos reales de Tab): "Cómo funciona", "Consultar un lote", "Para la asociación", "Ingresar", campo de código, "Ver ficha", "Ingresar al sistema", "Pausar video", "Ingresar al sistema", todos con contorno de foco de 2 px; Enter en "Cómo funciona" lleva a `/#recorrido`.
- **Corrección a mano (Claude Code), `index.css`:** con movimiento reducido, a partir de 1024 px la línea horizontal quedaba en `scaleX(0)` (invisible), porque `ol.traza.traza-horizontal::before` es más específica que la regla de movimiento reducido. Se agregó ese selector al bloque `prefers-reduced-motion`; medido de nuevo: `transform: none` a 1280 y a 360 px.
- **Revisión con `web-design-guidelines`:** sin hallazgos graves (jerarquía de encabezados, `scroll-margin-top` en las anclas, imágenes con dimensiones y carga diferida bajo el pliegue, video decorativo con control de pausa, solo `transition-colors`, foco visible).
