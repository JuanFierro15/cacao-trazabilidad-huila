import { NavLink, Outlet, useLocation } from 'react-router'
import { ROLES, etiquetaRol } from '../auth/roles.js'
import { useAuth } from '../auth/useAuth.js'
import { AvisoSimulacion } from './AvisoSimulacion.jsx'

// Un arreglo por rol para que los bloques siguientes solo agreguen entradas.
const NAVEGACION_POR_ROL = {
  [ROLES.OPERADOR]: [
    { a: '/operador', texto: 'Panel del operador' },
    { a: '/operador/recepcion', texto: 'Recepción de lotes' },
    { a: '/operador/transformacion', texto: 'Registrar transformación' },
  ],
  [ROLES.ADMINISTRADOR]: [
    { a: '/admin', texto: 'Panel del administrador' },
    { a: '/operador', texto: 'Operación' },
    { a: '/operador/recepcion', texto: 'Recepción de lotes' },
    { a: '/operador/transformacion', texto: 'Registrar transformación' },
  ],
}

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

function clasesEnlace({ isActive }) {
  // El enlace activo se marca con subrayado y peso, no solo con color.
  const base = `inline-block rounded px-1 py-2 text-sm ${FOCO}`
  return isActive
    ? `${base} font-semibold underline decoration-2 underline-offset-4`
    : `${base} text-crema/90 hover:underline`
}

export function MarcoAplicacion() {
  const { sesion, rol, cerrarSesion } = useAuth()
  const location = useLocation()
  const enlaces = NAVEGACION_POR_ROL[rol] ?? []
  const mensaje = location.state?.mensaje

  return (
    <div className="min-h-screen bg-crema text-cacao">
      <AvisoSimulacion />
      <header className="bg-cacao text-crema">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-lg font-bold">Cacao con historia</p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">
              <span className="font-semibold">{sesion?.nombreCompleto}</span>
              <span className="text-crema/80"> · {etiquetaRol(rol)}</span>
            </p>
            <button
              type="button"
              onClick={() => cerrarSesion()}
              className={`rounded-md border border-crema/60 px-3 py-1.5 text-sm font-semibold hover:bg-crema hover:text-cacao ${FOCO}`}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav aria-label="Navegación principal" className="border-t border-crema/20">
          <ul className="mx-auto flex max-w-6xl flex-wrap gap-4 px-4">
            {enlaces.map((enlace) => (
              <li key={enlace.a}>
                <NavLink to={enlace.a} end className={clasesEnlace}>
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {mensaje && (
          <p role="status" className="mb-4 rounded-md border border-origen/40 bg-origen/10 p-3 text-sm">
            {mensaje}
          </p>
        )}
        <Outlet />
      </main>
    </div>
  )
}
