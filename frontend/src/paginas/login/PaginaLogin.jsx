import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { rutaInicioPorRol } from '../../auth/roles.js'
import { useAuth } from '../../auth/useAuth.js'
import { AvisoSimulacion } from '../../componentes/AvisoSimulacion.jsx'
import { MensajeError } from '../../componentes/MensajeError.jsx'

// Credenciales de demostración publicadas en el README (contrato, sección 7); no son secretos.
const DEMO_OPERADOR = { username: 'operador1', password: 'cacao123' }
const DEMO_ADMIN = { username: 'admin1', password: 'admin123' }

const CAMPOS_FORMULARIO = ['username', 'password']

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'
const CLASE_INPUT = `mt-1 block w-full rounded-md border border-cacao/30 bg-white px-3 py-2 text-base text-cacao ${FOCO} aria-invalid:border-red-700`

// Agrupa los errores de validación por campo; si alguno no pertenece al
// formulario se devuelve null para mostrar la caja general.
function erroresPorCampo(error) {
  if (error?.codigo !== 'VALIDACION' || !Array.isArray(error.errores) || error.errores.length === 0) return null
  const mapa = {}
  for (const item of error.errores) {
    if (!CAMPOS_FORMULARIO.includes(item.campo)) return null
    mapa[item.campo] = mapa[item.campo] ? `${mapa[item.campo]}. ${item.mensaje}` : item.mensaje
  }
  return mapa
}

export function PaginaLogin() {
  const { autenticado, rol, iniciarSesion } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  // Mismo destino que tras un ingreso exitoso, para que no importe cuál de los
  // dos redireccionamientos ocurra primero.
  const desde = location.state?.desde
  if (autenticado) {
    return <Navigate to={desde || rutaInicioPorRol(rol)} replace />
  }

  const mensajeAviso = location.state?.mensaje
  const camposConError = erroresPorCampo(error)

  function autocompletar(credenciales) {
    setUsername(credenciales.username)
    setPassword(credenciales.password)
    setError(null)
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const sesion = await iniciarSesion(username, password)
      navigate(desde || rutaInicioPorRol(sesion.rol), { replace: true })
    } catch (errorRecibido) {
      setError(errorRecibido)
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-crema text-cacao">
      <AvisoSimulacion />
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm rounded-xl border border-cacao/15 bg-white p-6 shadow-md">
          <h1 className="text-2xl font-bold">Cacao con historia</h1>
          <p className="mt-1 text-sm text-cacao/80">Ingrese con su usuario de Asoprocacao.</p>

          {mensajeAviso && (
            <p role="status" className="mt-4 rounded-md border border-mazorca bg-mazorca/10 p-3 text-sm">
              {mensajeAviso}
            </p>
          )}

          <form onSubmit={manejarEnvio} noValidate className="mt-5 space-y-4">
            <div>
              <label htmlFor="login-usuario" className="block text-sm font-semibold">
                Usuario
              </label>
              <input
                id="login-usuario"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={camposConError?.username ? true : undefined}
                aria-describedby={camposConError?.username ? 'login-usuario-error' : undefined}
                className={CLASE_INPUT}
              />
              {camposConError?.username && (
                <p id="login-usuario-error" role="alert" className="mt-1 text-sm text-red-800">
                  {camposConError.username}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="login-contrasena" className="block text-sm font-semibold">
                Contraseña
              </label>
              <input
                id="login-contrasena"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={camposConError?.password ? true : undefined}
                aria-describedby={camposConError?.password ? 'login-contrasena-error' : undefined}
                className={CLASE_INPUT}
              />
              {camposConError?.password && (
                <p id="login-contrasena-error" role="alert" className="mt-1 text-sm text-red-800">
                  {camposConError.password}
                </p>
              )}
            </div>

            {!camposConError && <MensajeError error={error} titulo="No se pudo iniciar sesión" />}

            <button
              type="submit"
              disabled={enviando}
              className={`w-full rounded-md bg-cacao px-4 py-2.5 font-semibold text-crema hover:bg-cacao/90 disabled:cursor-not-allowed disabled:opacity-70 ${FOCO}`}
            >
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 border-t border-cacao/15 pt-4">
            <p className="text-sm text-cacao/80">Usuarios de demostración:</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => autocompletar(DEMO_OPERADOR)}
                disabled={enviando}
                className={`rounded-md border border-cacao/30 px-3 py-2 text-sm font-semibold hover:bg-cacao/5 disabled:opacity-70 ${FOCO}`}
              >
                Autocompletar demo operador
              </button>
              <button
                type="button"
                onClick={() => autocompletar(DEMO_ADMIN)}
                disabled={enviando}
                className={`rounded-md border border-cacao/30 px-3 py-2 text-sm font-semibold hover:bg-cacao/5 disabled:opacity-70 ${FOCO}`}
              >
                Autocompletar demo admin
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/ficha"
                className={`text-sm font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
              >
                ¿Es comprador? Consulte un producto por su código
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
