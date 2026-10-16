# Bloque F8D — Menú hamburguesa de la navegación interna en móvil

- Integrante: Juan David Fierro Calderón
- Herramienta: Claude Code (diseño, coordinación y revisión); implementación delegada a agy: el intento con gemini-4-argon-high terminó por cuota (429) a las 12:07 sin cambios; reintento con gemini-3.8-flash-high (claude-opus-5-5-high también sin cuota).
- Rama: `feat/frontend-ui`
- Fecha: 2026-10-16 12:03. Diseño aprobado por Juan David a las 11:59.
- Motivo: a 360 px la navegación del administrador ocupa 442 de 780 px (la del operador 251 px), con textos cortados, y empuja el contenido hacia abajo.

## Prompt

Bloque F8D en la rama feat/frontend-ui. Aplicación React 19 + Vite + Tailwind CSS v4 (configuración en CSS con @theme, sin tailwind.config.js). Lee frontend/DISENO.md antes de tocar nada.

Archivo permitido (no toques ningún otro): frontend/src/componentes/MarcoAplicacion.jsx

Situación actual: el componente MarcoAplicacion dibuja la navegación interna (operador y administrador). Desde el breakpoint sm (640 px) es una barra lateral fija que se expande al pasar el cursor (estado `expandida`, eventos onMouseEnter y onMouseLeave del <header>). Por debajo de sm, el mismo <header> se muestra arriba a todo el ancho con la tarjeta del logo, la lista de enlaces en una grilla de 2 columnas (`grid grid-cols-2 ... sm:flex sm:flex-col`) y el bloque de usuario con "Cerrar sesión": en un celular de 360 px ocupa más de media pantalla y corta los textos.

Objetivo: por debajo de sm, menú hamburguesa. Desde sm en adelante, NADA cambia (misma barra lateral, mismo comportamiento al pasar el cursor, mismos estilos).

1. Estado nuevo `menuMovilAbierto` (falso al inicio).
2. Por debajo de sm, una barra superior compacta (unos 56 px de alto, bg-cacao, borde inferior como el actual): a la izquierda el emblema /assets/logo-emblema-192.webp (alt="", width y height explícitos) y "Cacao con historia" en font-display; a la derecha un <button type="button"> de al menos 44 × 44 px, solo visible por debajo de sm (`sm:hidden`), con un ícono de tres líneas (svg con aria-hidden="true", trazos con currentColor) que cambia a una X cuando está abierto, `aria-expanded={menuMovilAbierto}`, `aria-controls` apuntando al id del panel y `aria-label` "Abrir menú" o "Cerrar menú" según el estado. Foco visible con la constante FOCO que ya existe en el archivo.
3. El panel con la navegación (la lista de enlaces existente, el acceso al perfil y "Cerrar sesión") por debajo de sm solo se muestra cuando `menuMovilAbierto` es verdadero; se despliega bajo la barra superior, a una sola columna (por debajo de sm la lista pasa de `grid-cols-2` a una columna) y con los textos completos. Detrás del panel, por debajo de sm, una capa que oscurece el contenido (bg-cacao/40, aria-hidden="true") que al tocarla cierra el menú. Desde sm, el panel, la lista y el bloque de usuario se ven como hoy, siempre visibles.
4. Se cierra: al cambiar la ruta (useEffect sobre location.pathname), al elegir cualquier enlace (ya existe manejarSeleccionEnlace: que además ponga menuMovilAbierto en falso), con la tecla Escape (y el foco vuelve al botón de menú, usa un ref), al tocar la capa oscura y con el mismo botón. Al abrirse, el foco pasa al primer enlace del panel (en el siguiente ciclo, con setTimeout(..., 0)).
5. El texto de los enlaces y del usuario NO se oculta por debajo de sm (la función clasesTextoColapsable ya solo oculta desde sm: consérvala). No cambies la lista NAVEGACION_POR_ROL, los destinos, los textos, los roles, la llamada a cerrarSesion ni el contenido de <main>.
6. Las transiciones del panel, si las hay, solo de opacity o transform, con motion-reduce:transition-none. Nada de transition-all.

Reglas: ningún color hex dentro de className (solo tokens), nada de URLs externas ni dependencias nuevas, comentarios en español sin nombrar herramientas ni archivos de agentes. No hagas commit ni push. No instales dependencias. No toques src/api, src/auth ni otros archivos.

Verificación (ejecútala y reporta la salida real):
- cd frontend && npm run build && npm run lint → sin errores.
- grep -rnE "\[#[0-9A-Fa-f]{3,8}\]" frontend/src → vacío.
- grep -rniE "https?://" frontend/src frontend/index.html → solo la línea que ya existía en frontend/src/componentes/CodigoQrFicha.jsx.
- grep -rniE "\b(IA|AI|claude|anthropic|gemini|antigravity|agy)\b" frontend/src → solo la línea del pie de frontend/src/paginas/inicio/PaginaInicio.jsx ("…ilustraciones generadas con IA.", texto visible exigido por el diseño).
Responde con el formato de la sección 6 de CLAUDE.md y detente.

Commit sugerido: fix: mostrar la navegación interna como menú hamburguesa en móvil

## Revisión y verificación (Claude Code, 16/10, 12:15–12:18)

- **Ejecución:** `gemini-4-argon-high` terminó a las 12:07 por cuota (429) sin cambios; el reintento con `gemini-3.8-flash-high` (12:07–12:15) devolvió `SUCCESS`. HEAD siguió en `9201b3c` (sin commit de agy).
- **Archivos:** solo `frontend/src/componentes/MarcoAplicacion.jsx`. Se conservan `NAVEGACION_POR_ROL`, los destinos, el acceso a `/admin/usuarios`, la llamada a `cerrarSesion` y el contenido de `<main>`; desde `sm` la barra lateral mantiene sus clases (`sm:fixed`, `sm:w-20` y `sm:w-72` al pasar el cursor).
- **Build y lint:** sin errores. **Grep:** hex vacío; URL solo `CodigoQrFicha.jsx:98`; menciones solo la frase del pie de `PaginaInicio.jsx`.
- **Navegador (Edge sin ventana por CDP, clics y teclas reales):**
  - Administrador a 360 px: barra superior de 57 px (antes, 442 px), botón "Abrir menú" de 44 × 44 px con `aria-expanded="false"`, ningún enlace visible y el contenido desde el píxel 57.
  - Al tocar el botón: `aria-expanded="true"`, "Cerrar menú", los 8 enlaces visibles a una columna sin textos cortados, foco en "Inventario", sin scroll horizontal.
  - Escape: se cierra y el foco vuelve al botón. Elegir "Alertas": navega a `/admin/alertas` y el menú queda cerrado. Tocar la capa oscura: se cierra.
  - Operador a 360 px: barra de 57 px con el mismo botón.
  - Administrador a 1280 px: el botón no se ve (su contenedor tiene `display: none`), barra lateral fija de 80 px, contenido desde el píxel 104, 8 enlaces, sin scroll horizontal.
- Capturas en el área temporal de la sesión (menú cerrado, abierto y tras navegar).
- No se repitió el recorrido completo de la demo: el cambio solo toca la navegación, que sí se probó en los dos anchos.
