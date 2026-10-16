import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { rutaInicioPorRol } from '../../auth/roles.js'
import { useAuth } from '../../auth/useAuth.js'
import { AvisoSimulacion } from '../../componentes/AvisoSimulacion.jsx'
import { FondoVideo } from '../../componentes/FondoVideo.jsx'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { ModalFichaComprador } from '../../componentes/ModalFichaComprador.jsx'

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
  const [modalFichaAbierto, setModalFichaAbierto] = useState(false)

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
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-cacao text-cacao">
      <FondoVideo
        src="/assets/recorrido-grano.mp4"
        poster="/assets/recorrido-grano-poster.jpg"
        className="absolute inset-0"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-cacao/70" />
      <div className="relative z-20">
        <AvisoSimulacion />
      </div>
      <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-4 py-6 pb-16">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-mazorca/35 bg-crema/95 shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-cacao/15 bg-arena/75 px-5 py-3.5">
            <Link
              to="/"
              className={`group inline-flex items-center gap-2 rounded-lg border border-cacao/20 bg-crema/90 px-3 py-1.5 text-xs font-semibold text-cacao shadow-2xs transition-all duration-200 hover:border-mazorca hover:bg-crema ${FOCO}`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 text-mazorca-oscuro transition-transform duration-200 group-hover:-translate-x-0.5"
              >
                <path d="M12.5 15 7.5 10l5-5" />
              </svg>
              <span>Volver al inicio</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="font-display text-sm font-bold leading-none text-cacao">
                  Asoprocacao
                </p>
                <p className="mt-0.5 text-[11px] leading-none text-cacao/75">Campoalegre, Huila</p>
              </div>
              <img
                src="/assets/logo-emblema-192.webp"
                alt="Asoprocacao"
                width={40}
                height={40}
                className="h-10 w-auto shrink-0"
              />
            </div>
          </div>

          <div className="p-6">
            <h1 className="font-display text-2xl font-bold">Cacao con historia</h1>
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
              <button
                type="button"
                onClick={() => setModalFichaAbierto(true)}
                className={`cursor-pointer text-sm font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
              >
                ¿Es comprador? Consulte un producto por su código
              </button>
            </div>
          </div>
          </div>
        </div>
      </main>

      <ModalFichaComprador
        abierto={modalFichaAbierto}
        onCerrar={() => setModalFichaAbierto(false)}
      />
    </div>
  )
}
