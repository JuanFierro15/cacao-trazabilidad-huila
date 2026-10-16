import { Navigate, Outlet, useLocation } from 'react-router'
import { rutaInicioPorRol } from './roles.js'
import { useAuth } from './useAuth.js'

// Esta guarda solo mejora la experiencia de usuario: el control real de
// permisos lo hace el backend respondiendo 403.
export function RutaProtegida({ roles }) {
  const { autenticado, rol, cierre } = useAuth()
  const location = useLocation()

  if (!autenticado) {
    const estado =
      cierre && !cierre.conservarDestino ? undefined : { desde: location.pathname, mensaje: cierre?.mensaje }
    return <Navigate to="/login" replace state={estado} />
  }

  if (Array.isArray(roles) && !roles.includes(rol)) {
    return (
      <Navigate
        to={rutaInicioPorRol(rol)}
        replace
        state={{ mensaje: 'Su rol no tiene acceso a esa sección.' }}
      />
    )
  }

  return <Outlet />
}
