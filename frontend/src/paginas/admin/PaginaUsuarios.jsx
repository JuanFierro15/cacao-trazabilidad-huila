import { useState } from 'react'
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  obtenerUsuarios,
} from '../../api/servicios.js'
import { ROLES, etiquetaRol } from '../../auth/roles.js'
import { useAuth } from '../../auth/useAuth.js'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'
const CLASE_INPUT = `mt-1 block w-full rounded-md border border-cacao/30 bg-white px-3 py-2 text-sm text-cacao ${FOCO} aria-invalid:border-red-700`

function InsigniaAcceso({ activo }) {
  return activo ? (
    <span className="inline-flex items-center rounded-full bg-origen px-2.5 py-0.5 text-xs font-semibold text-white">
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-700 px-2.5 py-0.5 text-xs font-semibold text-white">
      Suspendido
    </span>
  )
}

export function PaginaUsuarios() {
  const { sesion, actualizarPerfilSesion } = useAuth()
  const {
    datos: usuarios,
    cargando,
    error,
    recargar,
  } = useConsultaApi(() => obtenerUsuarios(), [])

  // --- Estado de Mi Perfil (Administrador) ---
  const [nombreAdminEditado, setNombreAdminEditado] = useState(null)
  const [cambiarClaveAdmin, setCambiarClaveAdmin] = useState(false)
  const [passwordActualAdmin, setPasswordActualAdmin] = useState('')
  const [passwordNuevaAdmin, setPasswordNuevaAdmin] = useState('')
  const [confirmacionClaveAdmin, setConfirmacionClaveAdmin] = useState('')
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [errorPerfil, setErrorPerfil] = useState(null)
  const [avisoPerfil, setAvisoPerfil] = useState(null)

  // --- Estado de Creación de Operador ---
  const [nuevoUsername, setNuevoUsername] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoPassword, setNuevoPassword] = useState('')
  const [creandoOperador, setCreandoOperador] = useState(false)
  const [errorCrear, setErrorCrear] = useState(null)
  const [avisoOperadores, setAvisoOperadores] = useState(null)

  // --- Estado de Edición y Eliminación de Operador ---
  const [operadorEditando, setOperadorEditando] = useState(null)
  const [nombreEditado, setNombreEditado] = useState('')
  const [passwordEditado, setPasswordEditado] = useState('')
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)
  const [errorEdicion, setErrorEdicion] = useState(null)
  const [idConfirmarEliminar, setIdConfirmarEliminar] = useState(null)
  const [procesandoId, setProcesandoId] = useState(null)
  const [errorAccionLista, setErrorAccionLista] = useState(null)

  const usuarioAdminActual = Array.isArray(usuarios)
    ? usuarios.find((u) => u.username.toLowerCase() === (sesion?.username ?? '').toLowerCase())
    : null

  const listaOperadores = Array.isArray(usuarios)
    ? usuarios.filter((u) => u.rol === ROLES.OPERADOR)
    : []

  const nombreAdmin =
    nombreAdminEditado ?? usuarioAdminActual?.nombreCompleto ?? sesion?.nombreCompleto ?? ''

  async function manejarGuardarPerfil(evento) {
    evento.preventDefault()
    if (!usuarioAdminActual) return

    setErrorPerfil(null)
    setAvisoPerfil(null)

    const nombreLimpio = nombreAdmin.trim()
    if (!nombreLimpio) {
      setErrorPerfil({ mensaje: 'El nombre completo del administrador es obligatorio.' })
      return
    }

    const cuerpo = { nombreCompleto: nombreLimpio }

    if (cambiarClaveAdmin) {
      if (!passwordActualAdmin) {
        setErrorPerfil({ mensaje: 'Ingrese su contraseña actual para confirmar el cambio.' })
        return
      }
      if (passwordNuevaAdmin.trim().length < 6) {
        setErrorPerfil({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' })
        return
      }
      if (passwordNuevaAdmin !== confirmacionClaveAdmin) {
        setErrorPerfil({ mensaje: 'La confirmación de la nueva contraseña no coincide.' })
        return
      }
      cuerpo.passwordActual = passwordActualAdmin
      cuerpo.passwordNueva = passwordNuevaAdmin.trim()
    }

    setGuardandoPerfil(true)
    try {
      const actualizado = await actualizarUsuario(usuarioAdminActual.id, cuerpo)
      actualizarPerfilSesion({ nombreCompleto: actualizado.nombreCompleto })
      setNombreAdminEditado(null)
      setPasswordActualAdmin('')
      setPasswordNuevaAdmin('')
      setConfirmacionClaveAdmin('')
      setCambiarClaveAdmin(false)
      setAvisoPerfil(
        cuerpo.passwordNueva
          ? 'Perfil y contraseña actualizados correctamente.'
          : 'Nombre del administrador actualizado correctamente.',
      )
      recargar()
    } catch (err) {
      setErrorPerfil(err)
    } finally {
      setGuardandoPerfil(false)
    }
  }

  async function manejarCrearOperador(evento) {
    evento.preventDefault()
    setErrorCrear(null)
    setAvisoOperadores(null)

    const usernameLimpio = nuevoUsername.trim().toLowerCase()
    const nombreLimpio = nuevoNombre.trim()
    const passwordLimpia = nuevoPassword.trim()

    if (usernameLimpio.length < 3) {
      setErrorCrear({ mensaje: 'El usuario debe tener al menos 3 caracteres.' })
      return
    }
    if (!nombreLimpio) {
      setErrorCrear({ mensaje: 'El nombre completo del operador es obligatorio.' })
      return
    }
    if (passwordLimpia.length < 6) {
      setErrorCrear({ mensaje: 'La contraseña inicial debe tener al menos 6 caracteres.' })
      return
    }

    setCreandoOperador(true)
    try {
      const creado = await crearUsuario({
        username: usernameLimpio,
        nombreCompleto: nombreLimpio,
        password: passwordLimpia,
      })
      setNuevoUsername('')
      setNuevoNombre('')
      setNuevoPassword('')
      setAvisoOperadores(
        `Operador "${creado.nombreCompleto}" (${creado.username}) creado exitosamente.`,
      )
      recargar()
    } catch (err) {
      setErrorCrear(err)
    } finally {
      setCreandoOperador(false)
    }
  }

  function iniciarEdicionOperador(operador) {
    setOperadorEditando(operador)
    setNombreEditado(operador.nombreCompleto)
    setPasswordEditado('')
    setErrorEdicion(null)
    setIdConfirmarEliminar(null)
  }

  function cancelarEdicionOperador() {
    setOperadorEditando(null)
    setNombreEditado('')
    setPasswordEditado('')
    setErrorEdicion(null)
  }

  async function manejarGuardarEdicionOperador(evento) {
    evento.preventDefault()
    if (!operadorEditando) return

    setErrorEdicion(null)
    setAvisoOperadores(null)

    const nombreLimpio = nombreEditado.trim()
    if (!nombreLimpio) {
      setErrorEdicion({ mensaje: 'El nombre completo del operador no puede estar vacío.' })
      return
    }

    const cuerpo = { nombreCompleto: nombreLimpio }
    if (passwordEditado.trim() !== '') {
      if (passwordEditado.trim().length < 6) {
        setErrorEdicion({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' })
        return
      }
      cuerpo.passwordNueva = passwordEditado.trim()
    }

    setGuardandoEdicion(true)
    try {
      const actualizado = await actualizarUsuario(operadorEditando.id, cuerpo)
      setAvisoOperadores(`Datos del operador "${actualizado.username}" actualizados correctamente.`)
      cancelarEdicionOperador()
      recargar()
    } catch (err) {
      setErrorEdicion(err)
    } finally {
      setGuardandoEdicion(false)
    }
  }

  async function manejarAlternarActivo(operador) {
    setErrorAccionLista(null)
    setAvisoOperadores(null)
    setProcesandoId(operador.id)
    try {
      const nuevoEstado = !operador.activo
      await actualizarUsuario(operador.id, {
        nombreCompleto: operador.nombreCompleto,
        activo: nuevoEstado,
      })
      setAvisoOperadores(
        nuevoEstado
          ? `Se reactivó el acceso del operador "${operador.username}".`
          : `Se suspendió el acceso del operador "${operador.username}".`,
      )
      recargar()
    } catch (err) {
      setErrorAccionLista(err)
    } finally {
      setProcesandoId(null)
    }
  }

  async function manejarConfirmarEliminar(operador) {
    setErrorAccionLista(null)
    setAvisoOperadores(null)
    setProcesandoId(operador.id)
    try {
      await eliminarUsuario(operador.id)
      setIdConfirmarEliminar(null)
      if (operadorEditando?.id === operador.id) {
        cancelarEdicionOperador()
      }
      setAvisoOperadores(
        `Operador "${operador.nombreCompleto}" (${operador.username}) eliminado del sistema.`,
      )
      recargar()
    } catch (err) {
      setErrorAccionLista(err)
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-cacao">
          Perfil y gestión de operadores
        </h1>
        <p className="mt-1 text-sm text-cacao/80">
          Administre sus credenciales personales y las cuentas de los operadores de acopio y planta.
        </p>
      </div>

      {error && !usuarios && (
        <MensajeError error={error} titulo="No se pudieron cargar las cuentas de usuario" />
      )}

      {/* Sección 1: Perfil del Administrador */}
      <section
        aria-labelledby="titulo-perfil-admin"
        className="overflow-hidden rounded-xl border border-cacao/20 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cacao/15 bg-arena/65 px-5 py-4">
          <div>
            <h2 id="titulo-perfil-admin" className="font-display text-xl font-bold text-cacao">
              Mi cuenta de administrador
            </h2>
            <p className="text-xs text-cacao/80">
              Usuario de ingreso:{' '}
              <span className="font-semibold text-cacao">{sesion?.username}</span> ·{' '}
              {etiquetaRol(sesion?.rol)}
            </p>
          </div>
          <span className="rounded-md border border-mazorca/40 bg-crema px-2.5 py-1 text-xs font-semibold text-mazorca-oscuro">
            Sesión activa
          </span>
        </div>

        <form onSubmit={manejarGuardarPerfil} noValidate className="space-y-5 p-5">
          {avisoPerfil && (
            <p
              role="status"
              className="rounded-md border border-origen/40 bg-origen/10 p-3 text-sm font-medium text-cacao"
            >
              {avisoPerfil}
            </p>
          )}

          {errorPerfil && (
            <MensajeError error={errorPerfil} titulo="No se pudo actualizar el perfil" />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="admin-username" className="block text-sm font-semibold text-cacao">
                Usuario (identificador fijo)
              </label>
              <input
                id="admin-username"
                type="text"
                value={sesion?.username ?? ''}
                disabled
                className="mt-1 block w-full cursor-not-allowed rounded-md border border-cacao/20 bg-arena/35 px-3 py-2 text-sm font-medium text-cacao/75"
              />
            </div>

            <div>
              <label htmlFor="admin-nombre" className="block text-sm font-semibold text-cacao">
                Nombre completo visible
              </label>
              <input
                id="admin-nombre"
                type="text"
                value={nombreAdmin}
                onChange={(e) => setNombreAdminEditado(e.target.value)}
                placeholder="Ej. María Fernanda Rojas"
                className={CLASE_INPUT}
              />
            </div>
          </div>

          <div className="border-t border-cacao/10 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-cacao">Contraseña de administrador</p>
                <p className="text-xs text-cacao/75">
                  Para cambiar su clave actual, active la opción e ingrese su contraseña vigente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCambiarClaveAdmin((prev) => !prev)
                  setPasswordActualAdmin('')
                  setPasswordNuevaAdmin('')
                  setConfirmacionClaveAdmin('')
                  setErrorPerfil(null)
                }}
                className={`rounded-md border border-cacao/30 px-3 py-1.5 text-xs font-semibold text-cacao transition-colors hover:bg-arena/50 ${FOCO}`}
              >
                {cambiarClaveAdmin ? 'Cancelar cambio de contraseña' : 'Cambiar mi contraseña'}
              </button>
            </div>

            {cambiarClaveAdmin && (
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-mazorca/30 bg-crema p-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="admin-clave-actual"
                    className="block text-sm font-semibold text-cacao"
                  >
                    Contraseña actual
                  </label>
                  <input
                    id="admin-clave-actual"
                    type="password"
                    autoComplete="current-password"
                    value={passwordActualAdmin}
                    onChange={(e) => setPasswordActualAdmin(e.target.value)}
                    className={CLASE_INPUT}
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-clave-nueva"
                    className="block text-sm font-semibold text-cacao"
                  >
                    Nueva contraseña
                  </label>
                  <input
                    id="admin-clave-nueva"
                    type="password"
                    autoComplete="new-password"
                    value={passwordNuevaAdmin}
                    onChange={(e) => setPasswordNuevaAdmin(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={CLASE_INPUT}
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-clave-confirmar"
                    className="block text-sm font-semibold text-cacao"
                  >
                    Confirmar nueva contraseña
                  </label>
                  <input
                    id="admin-clave-confirmar"
                    type="password"
                    autoComplete="new-password"
                    value={confirmacionClaveAdmin}
                    onChange={(e) => setConfirmacionClaveAdmin(e.target.value)}
                    placeholder="Repita la nueva clave"
                    className={CLASE_INPUT}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardandoPerfil || !usuarioAdminActual}
              className={`rounded-md bg-cacao px-5 py-2 text-sm font-semibold text-crema transition-colors hover:bg-cacao/90 disabled:cursor-not-allowed disabled:opacity-60 ${FOCO}`}
            >
              {guardandoPerfil ? 'Guardando cambios…' : 'Guardar cambios de mi perfil'}
            </button>
          </div>
        </form>
      </section>

      {/* Sección 2: CRUD de Operadores */}
      <section aria-labelledby="titulo-crud-operadores" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="titulo-crud-operadores" className="font-display text-2xl font-bold text-cacao">
              Operadores de planta y acopio
            </h2>
            <p className="text-sm text-cacao/80">
              Registre nuevos operadores, restablezca contraseñas o suspenda el acceso al sistema.
            </p>
          </div>
          <p className="text-xs font-semibold text-cacao/75 tabular-nums">
            Total registrados: {listaOperadores.length} (
            {listaOperadores.filter((o) => o.activo).length} activos)
          </p>
        </div>

        {avisoOperadores && (
          <p
            role="status"
            className="rounded-md border border-origen/40 bg-origen/10 p-3 text-sm font-medium text-cacao"
          >
            {avisoOperadores}
          </p>
        )}

        {errorAccionLista && (
          <MensajeError error={errorAccionLista} titulo="No se pudo completar la operación" />
        )}

        {/* Formulario para crear un nuevo operador */}
        <div className="overflow-hidden rounded-xl border border-cacao/20 bg-white shadow-sm">
          <div className="border-b border-cacao/15 bg-arena/45 px-5 py-3.5">
            <h3 className="font-display text-lg font-bold text-cacao">
              Añadir nuevo operador
            </h3>
          </div>

          <form onSubmit={manejarCrearOperador} noValidate className="space-y-4 p-5">
            {errorCrear && (
              <MensajeError error={errorCrear} titulo="No se pudo registrar el operador" />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="nuevo-username" className="block text-sm font-semibold text-cacao">
                  Nombre de usuario
                </label>
                <input
                  id="nuevo-username"
                  type="text"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={nuevoUsername}
                  onChange={(e) => setNuevoUsername(e.target.value)}
                  placeholder="Ej. operador2"
                  className={CLASE_INPUT}
                />
              </div>

              <div>
                <label htmlFor="nuevo-nombre" className="block text-sm font-semibold text-cacao">
                  Nombre completo
                </label>
                <input
                  id="nuevo-nombre"
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Carlos Andrés Vargas"
                  className={CLASE_INPUT}
                />
              </div>

              <div>
                <label htmlFor="nuevo-password" className="block text-sm font-semibold text-cacao">
                  Contraseña inicial
                </label>
                <input
                  id="nuevo-password"
                  type="password"
                  autoComplete="new-password"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={CLASE_INPUT}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creandoOperador}
                className={`rounded-md bg-origen px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-origen/90 disabled:cursor-not-allowed disabled:opacity-60 ${FOCO}`}
              >
                {creandoOperador ? 'Registrando…' : 'Registrar operador'}
              </button>
            </div>
          </form>
        </div>

        {/* Panel de edición cuando se selecciona un operador */}
        {operadorEditando && (
          <div className="overflow-hidden rounded-xl border-2 border-mazorca bg-crema shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mazorca/30 bg-arena px-5 py-3">
              <h3 className="font-display text-lg font-bold text-cacao">
                Editar operador: {operadorEditando.username}
              </h3>
              <button
                type="button"
                onClick={cancelarEdicionOperador}
                className={`rounded-md border border-cacao/30 bg-crema px-3 py-1 text-xs font-semibold text-cacao hover:bg-white ${FOCO}`}
              >
                Cerrar edición
              </button>
            </div>

            <form onSubmit={manejarGuardarEdicionOperador} noValidate className="space-y-4 p-5">
              {errorEdicion && (
                <MensajeError error={errorEdicion} titulo="No se pudo actualizar el operador" />
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="editar-nombre-operador"
                    className="block text-sm font-semibold text-cacao"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="editar-nombre-operador"
                    type="text"
                    value={nombreEditado}
                    onChange={(e) => setNombreEditado(e.target.value)}
                    className={CLASE_INPUT}
                  />
                </div>

                <div>
                  <label
                    htmlFor="editar-clave-operador"
                    className="block text-sm font-semibold text-cacao"
                  >
                    Nueva contraseña (dejar vacío para conservar la actual)
                  </label>
                  <input
                    id="editar-clave-operador"
                    type="password"
                    autoComplete="new-password"
                    value={passwordEditado}
                    onChange={(e) => setPasswordEditado(e.target.value)}
                    placeholder="Mínimo 6 caracteres si desea cambiarla"
                    className={CLASE_INPUT}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelarEdicionOperador}
                  className={`rounded-md border border-cacao/30 bg-white px-4 py-2 text-sm font-semibold text-cacao hover:bg-cacao/5 ${FOCO}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicion}
                  className={`rounded-md bg-cacao px-5 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 disabled:opacity-60 ${FOCO}`}
                >
                  {guardandoEdicion ? 'Guardando…' : 'Guardar cambios del operador'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla / Lista de operadores */}
        {cargando && !usuarios ? (
          <p role="status" className="text-sm text-cacao/80">
            Cargando operadores…
          </p>
        ) : listaOperadores.length === 0 ? (
          <p className="rounded-xl border border-cacao/20 bg-white p-5 text-sm text-cacao/80">
            No hay operadores registrados actualmente. Utilice el formulario superior para añadir el
            primero.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-cacao/20 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Listado de operadores registrados</caption>
              <thead className="border-b border-cacao/15 bg-arena/40 text-cacao">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Usuario
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Nombre completo
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Rol
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cacao/10">
                {listaOperadores.map((operador) => {
                  const enProceso = procesandoId === operador.id
                  const confirmandoBorrado = idConfirmarEliminar === operador.id

                  return (
                    <tr key={operador.id} className="hover:bg-crema/60">
                      <th scope="row" className="px-4 py-3 font-bold text-cacao">
                        {operador.username}
                      </th>
                      <td className="px-4 py-3 text-cacao">{operador.nombreCompleto}</td>
                      <td className="px-4 py-3 text-cacao/80">{etiquetaRol(operador.rol)}</td>
                      <td className="px-4 py-3">
                        <InsigniaAcceso activo={operador.activo} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {confirmandoBorrado ? (
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            <span className="text-xs font-semibold text-red-700">
                              ¿Eliminar a {operador.username}?
                            </span>
                            <button
                              type="button"
                              disabled={enProceso}
                              onClick={() => manejarConfirmarEliminar(operador)}
                              className={`rounded-md bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-60 ${FOCO}`}
                            >
                              {enProceso ? 'Eliminando…' : 'Sí, eliminar'}
                            </button>
                            <button
                              type="button"
                              disabled={enProceso}
                              onClick={() => setIdConfirmarEliminar(null)}
                              className={`rounded-md border border-cacao/30 bg-white px-3 py-1 text-xs font-semibold text-cacao hover:bg-cacao/5 ${FOCO}`}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={enProceso}
                              onClick={() => iniciarEdicionOperador(operador)}
                              className={`rounded-md border border-cacao/30 bg-white px-3 py-1 text-xs font-semibold text-cacao transition-colors hover:bg-arena/60 ${FOCO}`}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={enProceso}
                              onClick={() => manejarAlternarActivo(operador)}
                              className={`rounded-md border border-cacao/30 bg-white px-3 py-1 text-xs font-semibold text-cacao transition-colors hover:bg-arena/60 disabled:opacity-60 ${FOCO}`}
                            >
                              {operador.activo ? 'Suspender' : 'Activar'}
                            </button>
                            <button
                              type="button"
                              disabled={enProceso}
                              onClick={() => setIdConfirmarEliminar(operador.id)}
                              className={`rounded-md border border-red-700/40 bg-white px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:opacity-60 ${FOCO}`}
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
