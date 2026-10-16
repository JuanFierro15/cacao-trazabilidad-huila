# Bloque F8C — Identidad visual, parte 3: la traza en trazabilidad y ficha, sello de estado y transiciones

- Integrante: Juan David Fierro Calderón
- Herramienta: Claude Code (coordinación y revisión); implementación delegada a agy con gemini-4-argon-high (claude-opus-5-5-high sin cuota).
- Rama: `feat/frontend-ui`
- Fecha: 2026-10-16 08:05. Prompt preparado por Juan David en `prompts/frontend/F8_prompts_agy.md`; guía de diseño en `frontend/DISENO.md`.

## Prompt

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

## Ajustes del coordinador (leídos del código real antes de delegar; mandan sobre el prompt)

- **Fuera de este bloque: `viewTransition`.** La app usa `BrowserRouter` (modo declarativo) y React Router 7.18.4 solo aplica `viewTransition` en los routers de datos (`createBrowserRouter`); con `BrowserRouter` la prop se ignora. Cambiar de enrutador tocaría las rutas, que DISENO.md prohíbe. Por eso **no toques `MarcoAplicacion.jsx` ni `TablaLotes.jsx`** y **no agregues** estilos `::view-transition-*`. Los archivos permitidos quedan en: `PaginaTrazabilidad.jsx`, `PaginaFichaPublica.jsx`, `SemaforoMerma.jsx` e `index.css`.
- **Nodos de la traza:** hoy cada `<li>` de las dos listas trae un `<span aria-hidden="true" className="absolute -left-[..px] ... rounded-full ...">` que dibuja el nodo, y el `<ol>` dibuja la línea con `relative ml-4 ... border-l-2 border-cacao/20 pl-6`. Como `.traza` ya dibuja la línea con `ol.traza::before` y los nodos con `.traza > li::before` (revisa index.css), en estas dos listas:
  - reemplaza en el `<ol>` las clases `relative ml-4 border-l-2 border-cacao/20 pl-6` por `traza visible` (conserva el espaciado vertical `space-y-6` en la trazabilidad y `space-y-3` en la ficha);
  - **elimina** el `<span aria-hidden="true">` decorativo del nodo dentro de cada `<li>` (es solo decoración; no lleva texto ni rol) y deja en el `<li>` la clase que necesite;
  - agrega `style={{ '--i': indice }}` en cada `<li>`, tomando el índice del segundo argumento de `.map((paso, indice) => ...)`.
  - Si el espacio reservado por `.traza` (padding-left) no alinea bien el contenido existente, ajústalo en `index.css`, no con márgenes negativos en el JSX.
- **Sello:** keyframes `sello` según DISENO.md, sección 6 (opacidad 0 → 1, escala 1,12 → 0,98 → 1, giro −2° → 0°, 420 ms), clase `.sello` que lo aplica una vez, y `animation: none` en `prefers-reduced-motion: reduce`. Solo se agrega la clase `sello` al div de estado; su `role`, colores y textos no cambian.
- **SemaforoMerma:** cambia `transition-opacity` por `transition-colors duration-200` en las tres luces; nada más.
- Los tres grep, desde la raíz: el de hex vacío; el de URL solo con la línea que ya existía en `componentes/CodigoQrFicha.jsx`; el de menciones solo con la línea del pie de `paginas/inicio/PaginaInicio.jsx` ("…ilustraciones generadas con IA.", texto visible exigido por DISENO.md).
- No hagas commit ni push. No instales dependencias. No cambies nada en `frontend/src/api/`, `frontend/src/auth/`, `utilidades/` ni en otros archivos.

## Revisión y verificación (Claude Code, 16/10, 08:11–08:16)

- **Ejecución:** `gemini-4-argon-high`, 08:05–08:11, `SUCCESS`. HEAD siguió en `50588ef` (sin commit de agy).
- **Archivos de agy:** solo `PaginaTrazabilidad.jsx` y `PaginaFichaPublica.jsx` (clases del `<ol>` y de sus `<li>`, `--i`, eliminación del `<span>` decorativo del nodo y la clase `sello` en el bloque de estado), `SemaforoMerma.jsx` (`transition-colors duration-200`) e `index.css` (keyframes y clase `sello`). No tocó `MarcoAplicacion.jsx`, `TablaLotes.jsx` ni agregó `::view-transition-*`, según el ajuste. Sin cambios en textos, datos, roles ARIA, `key`, condiciones ni llamadas a la API.
- **Build y lint:** sin errores. **Grep:** hex vacío; URL solo `CodigoQrFicha.jsx:98`; menciones solo la frase del pie de `PaginaInicio.jsx:257`.
- **Navegador (Edge sin ventana por CDP, base de desarrollo con CAC002 → CAC002-T1 y CAC003 → CAC003-T1 de prueba):**
  - Trazabilidad de CAC002 (operador, 1280 px): `<ol class="traza visible">` con 2 pasos (`--i` 0 y 1), 0 nodos `<span>` sobrantes, animaciones `trazar` y 2 `nodo` al montar, último nodo relleno de `mazorca`.
  - Ficha de CAC002 (360 px): bloque de estado con `sello` y `role="status"`, recorrido con la traza, animaciones `sello`, `trazar` y 2 `nodo`.
  - Con `prefers-reduced-motion: reduce`: 0 animaciones; línea con `transform: none`, nodos con opacidad 1 y `sello` con `animation-name: none`, en trazabilidad (360 px) y ficha.
  - CAC003 bloqueado por la API como `admin1` con propagación (`CAC003` y `CAC003-T1` en BLOQUEADO; nunca CAC001): la ficha de CAC003-T1 sigue en rojo (`bg-red-700`), con `role="alert"`, el título "Producto retenido: no está disponible para la venta" y el mensaje de la API.
- **Corrección a mano (Claude Code), `index.css`:** con el sello arrancando en `scale(1.12)`, a 360 px la ficha quedaba con 6 px de scroll horizontal (`scrollWidth` 366 frente a 360), porque la tarjeta de estado de 328 px escalada a 1,12 se sale de la pantalla. El arranque pasa a `scale(1.06)` (el resto del sello sigue igual: 0,98 → 1, giro −2° → 0°, 420 ms). Medido de nuevo: `scrollWidth` 360 en la ficha de CAC002 y de CAC003-T1. Es la única desviación de `DISENO.md` (sección 6) y queda explicada en un comentario del CSS.
- **Revisión con `web-design-guidelines`:** sin hallazgos graves (solo se animan `transform` y `opacity`, movimiento reducido respetado, sin `transition-all`, roles intactos). Detalle sin efecto: la clase `visible` coincide con la utilidad de Tailwind `visibility: visible`, que es el valor por defecto.
- **Limitación declarada (E03):** las transiciones entre vistas (`viewTransition`) no se aplicaron porque `BrowserRouter` no las usa; habría que migrar a `createBrowserRouter`, lo que cambia las rutas.
