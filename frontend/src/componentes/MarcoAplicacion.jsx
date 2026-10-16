import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { ROLES, etiquetaRol } from '../auth/roles.js'
import { useAuth } from '../auth/useAuth.js'
import { AvisoSimulacion } from './AvisoSimulacion.jsx'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

function IconoInventario({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
      <path d="m8 5.25 8 4.5" />
    </svg>
  )
}

function IconoAlertas({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function IconoBalance({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M7 16v-5" />
      <path d="M12 16V8" />
      <path d="M17 16v-8" />
      <path d="m7 8 5-3 5 2" />
    </svg>
  )
}

function IconoRecall({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

function IconoAuditoria({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="m9 15.5 2 2 4-4" />
    </svg>
  )
}

function IconoOperacion({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 4.2c0-1.2.8-2 2.2-2.2" />
      <path d="M12 4.2C7.8 4.2 5 8.1 5 12.6c0 4.3 3.2 7.8 7 9.2 3.8-1.4 7-4.9 7-9.2 0-4.5-2.8-8.4-7-8.4Z" />
      <path d="M9.2 5.3c-1.4 2.3-1.9 4.8-1.9 7.3 0 2.6.6 5.1 2.2 7.3" />
      <path d="M14.8 5.3c1.4 2.3 1.9 4.8 1.9 7.3 0 2.6-.6 5.1-2.2 7.3" />
      <path d="M12 4.4v17.2" />
    </svg>
  )
}

function IconoRecepcion({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v11" />
      <path d="m8 10 4 4 4-4" />
      <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  )
}

function IconoTransformacion({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-15.36-6.36L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 15.36 6.36L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

function IconoCerrarSesion({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconoUsuario({ className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

// Un arreglo por rol para que los bloques siguientes solo agreguen entradas.
const NAVEGACION_POR_ROL = {
  [ROLES.OPERADOR]: [
    { a: '/operador', texto: 'Panel del operador', Icono: IconoOperacion },
    { a: '/operador/recepcion', texto: 'Recepción de lotes', Icono: IconoRecepcion },
    { a: '/operador/transformacion', texto: 'Registrar transformación', Icono: IconoTransformacion },
  ],
  [ROLES.ADMINISTRADOR]: [
    { a: '/admin', texto: 'Inventario', Icono: IconoInventario },
    { a: '/admin/alertas', texto: 'Alertas', Icono: IconoAlertas },
    { a: '/admin/balance', texto: 'Balance económico', Icono: IconoBalance },
    { a: '/admin/recall', texto: 'Recall', end: false, Icono: IconoRecall },
    { a: '/admin/auditoria', texto: 'Auditoría', Icono: IconoAuditoria },
    { a: '/operador', texto: 'Operación', Icono: IconoOperacion, separadorAntes: true },
    { a: '/operador/recepcion', texto: 'Recepción de lotes', Icono: IconoRecepcion },
    { a: '/operador/transformacion', texto: 'Registrar transformación', Icono: IconoTransformacion },
  ],
}

function clasesTextoColapsable(expandida) {
  return `whitespace-nowrap transition-opacity duration-200 motion-reduce:transition-none ${
    expandida ? 'sm:inline sm:opacity-100' : 'sm:hidden sm:opacity-0'
  }`
}

function clasesEnlace(expandida) {
  return ({ isActive }) => {
    // El enlace activo se marca con subrayado, borde lateral y superficie clara, no solo con color.
    const base = `group flex items-center overflow-hidden rounded-lg border-l-4 py-2.5 text-sm transition-colors ${
      expandida ? 'gap-3 pl-3.5 pr-3' : 'gap-3 pl-3.5 pr-3 sm:justify-center sm:px-0'
    } ${FOCO}`
    return isActive
      ? `${base} border-mazorca bg-arena font-semibold text-cacao underline decoration-mazorca decoration-2 underline-offset-4 shadow-2xs`
      : `${base} border-transparent text-crema/90 hover:bg-crema/10 hover:text-crema hover:underline`
  }
}

export function MarcoAplicacion() {
  const { sesion, rol, cerrarSesion } = useAuth()
  const location = useLocation()
  const [expandida, setExpandida] = useState(false)
  const enlaces = NAVEGACION_POR_ROL[rol] ?? []
  const mensaje = location.state?.mensaje
  const claseTexto = clasesTextoColapsable(expandida)

  function manejarSeleccionEnlace(evento) {
    setExpandida(false)
    evento.currentTarget.blur()
  }

  return (
    <div className="flex min-h-dvh flex-col bg-crema text-cacao">
      <AvisoSimulacion />

      <div className="relative flex flex-1 flex-col sm:flex-row sm:pl-20">
        <header
          onMouseEnter={() => setExpandida(true)}
          onMouseLeave={() => setExpandida(false)}
          className={`w-full shrink-0 overflow-hidden border-b border-mazorca/30 bg-cacao text-crema shadow-md transition-[width,box-shadow] duration-300 ease-out motion-reduce:transition-none sm:fixed sm:inset-y-0 sm:left-0 sm:z-40 sm:flex sm:h-dvh sm:flex-col sm:justify-between sm:border-r sm:border-b-0 ${
            expandida ? 'sm:w-72 sm:shadow-2xl' : 'sm:w-20'
          }`}
        >
          <div className="p-3">
            <div
              title="Cacao con historia · Asoprocacao, Huila"
              className={`flex items-center overflow-hidden rounded-xl border border-mazorca/45 bg-crema p-1.5 text-cacao shadow-sm ${
                expandida ? 'gap-3' : 'gap-3 sm:justify-center'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cacao/15 bg-arena/60 p-1">
                <img
                  src="/assets/logo-emblema-192.webp"
                  alt=""
                  width={36}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div className={`min-w-0 pr-1 ${claseTexto}`}>
                <p className="font-display text-lg font-bold leading-tight text-cacao">
                  Cacao con historia
                </p>
                <p className="mt-0.5 text-xs font-semibold text-mazorca-oscuro">
                  Asoprocacao · Huila
                </p>
              </div>
            </div>
          </div>

          <nav
            aria-label="Navegación principal"
            className="flex-1 overflow-x-hidden overflow-y-auto px-3 pb-3 sm:py-2"
          >
            <ul className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-col sm:gap-1">
              {enlaces.map((enlace) => {
                const Icono = enlace.Icono
                return (
                  <li
                    key={enlace.a}
                    className={
                      enlace.separadorAntes
                        ? 'col-span-full border-t border-crema/15 pt-1.5 sm:mt-2 sm:pt-2.5'
                        : ''
                    }
                  >
                    <NavLink
                      to={enlace.a}
                      end={enlace.end !== false}
                      title={enlace.texto}
                      onClick={manejarSeleccionEnlace}
                      className={clasesEnlace(expandida)}
                    >
                      {({ isActive }) => (
                        <>
                          {Icono && (
                            <Icono
                              className={`h-5 w-5 shrink-0 transition-colors ${
                                isActive
                                  ? 'text-mazorca-oscuro'
                                  : 'text-mazorca group-hover:text-arena'
                              }`}
                            />
                          )}
                          <span className={`leading-snug ${claseTexto}`}>
                            {enlace.texto}
                          </span>
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="border-t border-crema/15 bg-cacao p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-stretch">
              <div
                title={`${sesion?.nombreCompleto ?? ''} · ${etiquetaRol(rol)}`}
                className={`flex min-w-0 items-center overflow-hidden py-1 ${
                  expandida ? 'gap-3 px-1.5' : 'gap-3 px-1.5 sm:justify-center sm:px-0'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-mazorca/40 bg-arena/15 text-arena">
                  <IconoUsuario className="h-5 w-5" />
                </div>
                <div className={`min-w-0 ${claseTexto}`}>
                  <p className="truncate text-sm font-semibold text-crema">
                    {sesion?.nombreCompleto}
                  </p>
                  <p className="text-xs text-arena/90">{etiquetaRol(rol)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => cerrarSesion()}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className={`flex items-center overflow-hidden rounded-lg border border-crema/60 text-sm font-semibold text-crema transition-colors hover:bg-crema hover:text-cacao ${
                  expandida
                    ? 'gap-2.5 px-3 py-2 sm:w-full sm:justify-center'
                    : 'gap-2.5 px-3 py-2 sm:mx-auto sm:h-10 sm:w-10 sm:justify-center sm:p-0'
                } ${FOCO}`}
              >
                <IconoCerrarSesion className="h-5 w-5 shrink-0" />
                <span className={claseTexto}>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {mensaje && (
            <p role="status" className="mb-4 rounded-md border border-origen/40 bg-origen/10 p-3 text-sm">
              {mensaje}
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}


