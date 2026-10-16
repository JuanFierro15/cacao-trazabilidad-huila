// sessionStorage y no localStorage: la sesión muere al cerrar la pestaña,
// lo que reduce el riesgo en equipos compartidos del acopio.
const CLAVE_SESION = 'cacao.sesion'

export function borrarSesion() {
  try {
    sessionStorage.removeItem(CLAVE_SESION)
  } catch {
    // Almacenamiento no disponible (modo privado estricto): no hay nada que borrar.
  }
}

export function leerSesion() {
  let texto
  try {
    texto = sessionStorage.getItem(CLAVE_SESION)
  } catch {
    return null
  }
  if (!texto) return null

  try {
    const sesion = JSON.parse(texto)
    const expira = Date.parse(sesion?.expiraEn)
    if (!sesion?.token || Number.isNaN(expira) || expira <= Date.now()) {
      borrarSesion()
      return null
    }
    return sesion
  } catch {
    borrarSesion()
    return null
  }
}

export function guardarSesion(sesion) {
  try {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
  } catch {
    // Sin almacenamiento la sesión vive solo en memoria hasta recargar.
  }
}

export function obtenerToken() {
  return leerSesion()?.token ?? null
}
