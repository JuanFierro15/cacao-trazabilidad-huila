# Bloque F8A — Identidad visual, parte 1: tokens, tipografía, logo, marco y login con video

- Integrante: Juan David Fierro Calderón
- Herramienta: Claude Code (coordinación y revisión); implementación delegada a agy con el modelo de mayor capacidad disponible.
- Rama: `feat/frontend-ui`
- Fecha: 2026-10-16 07:40. Prompt preparado por Juan David en `prompts/frontend/F8_prompts_agy.md`; guía de diseño en `frontend/DISENO.md`.

## Prompt

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

## Ajustes del coordinador (leídos del código real antes de delegar)

- No hagas commit ni push. No instales ni actualices dependencias (las fuentes `@fontsource/barlow` y `@fontsource/barlow-condensed` ya están en `frontend/package.json`). No ejecutes `npm install`.
- No toques `frontend/public/assets/` ni `frontend/public/favicon.svg`. Los recursos ya están en `frontend/public/assets/`: `recorrido-grano.mp4`, `recorrido-grano-poster.jpg`, `hero-productores.mp4`, `hero-productores-poster.jpg`, `logo-emblema-96.webp`, `logo-emblema-192.webp`, `logo-emblema-384.webp`, `logo-completo-480.webp`, `logo-completo-960.webp`, `favicon-64.png`, `apple-touch-icon.png`, `ilustracion-cacao.webp` y las fotos `productor-*-800/1600.webp` y `productores-canasta-800/1600.webp`.
- Hoy la tarjeta del login es `bg-white` con `border-cacao/15` y `rounded-xl`: esas clases son las que pasan a `bg-crema/95`, `border-mazorca/30` y `rounded-2xl`. La constante `FOCO` ya existe en los dos archivos: úsala para el foco visible del enlace nuevo y del botón del video.
- La única URL que ya existía en `frontend/src` es el texto de ayuda de `componentes/CodigoQrFicha.jsx:98` (`http://192.168.1.10:5173`); no debe aparecer ninguna otra.
- No cambies nada en `frontend/src/api/`, `frontend/src/auth/`, `frontend/src/utilidades/` ni ninguna otra página.

## Revisión y verificación (Claude Code, 16/10, 07:47–07:49)

- **Ejecución:** el primer intento con `claude-opus-5-5-high` terminó a los 12 s con `RESOURCE_EXHAUSTED (429)` y sin cambios en el árbol. El reintento con `gemini-4-argon-high` (07:41–07:47) devolvió `SUCCESS`. HEAD siguió en `c7fa4e7` (sin commit de agy).
- **Archivos:** solo los permitidos (`index.html`, `index.css`, `main.jsx`, `MarcoAplicacion.jsx`, `PaginaLogin.jsx` y el nuevo `FondoVideo.jsx`). Sin cambios en `src/api`, `src/auth` ni `src/utilidades`. En el login no cambiaron estados, ids, `aria-*`, textos de botones ni el enlace del comprador.
- **Build y lint:** `npm run build` sin errores (las fuentes Barlow y Barlow Condensed quedan empaquetadas en `dist/assets/`); `npm run lint` sin errores ni advertencias.
- **Grep:** hex en `className` → vacío; URL → solo `componentes/CodigoQrFicha.jsx:98`, que ya existía; menciones a herramientas → vacío.
- **Navegador (Edge sin ventana por CDP, sin cambiar configuración del sistema):**
  - Movimiento normal: el video avanza (2,3 s a los 2,5 s), el botón dice "Pausar video" con `aria-pressed="false"`, el título usa "Barlow Condensed" y el cuerpo "Barlow".
  - `prefers-reduced-motion: reduce` emulado: el video queda en pausa en 0 s con el póster y el botón dice "Reproducir video" con `aria-pressed="true"`.
  - 360 px: la tarjeta ocupa de 16 a 344 px, sin scroll horizontal.
- **Navegador (Chrome, 1280 px):** con Tab el foco llega al botón del video con contorno naranja visible; Enter pausa (`paused: true`) y Enter de nuevo reanuda. "Autocompletar demo operador" → "Ingresar" entra al panel; el marco muestra el emblema y el enlace activo subrayado en naranja; recepción y trazabilidad de CAC002 cargan con datos de la API.
- **Navegador (360 px, truco del `iframe`):** recepción y trazabilidad de CAC002 sin scroll horizontal (`scrollWidth` = `clientWidth` = 345 px).
- **Revisión con `web-design-guidelines`:** sin hallazgos graves. Imágenes con `alt`, `width` y `height`; video decorativo con `aria-hidden`, control de pausa (WCAG 2.2.2) y movimiento reducido; solo `transition-colors`; foco visible. Dos detalles menores que no se cambian: el botón del video cambia su texto y además usa `aria-pressed` (lo pide el diseño), y en el login es el primer elemento del orden de tabulación aunque se ve abajo a la derecha.
- Correcciones a mano: ninguna.
