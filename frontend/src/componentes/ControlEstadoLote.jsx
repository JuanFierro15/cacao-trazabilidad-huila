import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { cambiarEstadoLote } from '../api/servicios.js'
import { ROLES } from '../auth/roles.js'
import { useAuth } from '../auth/useAuth.js'
import { MensajeError } from './MensajeError.jsx'
import { etiquetaEstado } from '../utilidades/formato.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function ControlEstadoLote({ codigoLote, estado, cantidadDerivados, onCambio }) {
  const { rol } = useAuth()
  const esAdmin = rol === ROLES.ADMINISTRADOR

  const [accion, setAccion] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [propagar, setPropagar] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [confirmacion, setConfirmacion] = useState(null)
  const [error403, setError403] = useState(null)
  const [erroresMotivo, setErroresMotivo] = useState([])
  const [errorGeneral, setErrorGeneral] = useState(null)

  const refBotonBloquear = useRef(null)
  const refBotonLiberar = useRef(null)
  const refCampoMotivo = useRef(null)
  const refConfirmacion = useRef(null)

  const abrirAccion = (nuevaAccion) => {
    setConfirmacion(null)
    setError403(null)
    setErroresMotivo([])
    setErrorGeneral(null)
    setAccion(nuevaAccion)
    setTimeout(() => refCampoMotivo.current?.focus(), 0)
  }

  const cancelar = () => {
    const accionPrevia = accion
    setAccion(null)
    setError403(null)
    setErroresMotivo([])
    setErrorGeneral(null)
    if (accionPrevia === 'BLOQUEADO') {
      setTimeout(() => refBotonBloquear.current?.focus(), 0)
    } else if (accionPrevia === 'LIBERADO') {
      setTimeout(() => refBotonLiberar.current?.focus(), 0)
    }
  }

  const manejarConfirmar = async (e) => {
    e.preventDefault()
    if (guardando) return

    setGuardando(true)
    setError403(null)
    setErroresMotivo([])
    setErrorGeneral(null)

    const payload = {
      estado: accion,
      motivo,
    }
    if (accion === 'BLOQUEADO') {
      payload.propagarADerivados = cantidadDerivados > 0 ? propagar : true
    }

    try {
      const res = await cambiarEstadoLote(codigoLote, payload)
      setAccion(null)
      setMotivo('')
      setConfirmacion({
        accion,
        lotesAfectados: res?.lotesAfectados ?? [],
      })
      setTimeout(() => refConfirmacion.current?.focus(), 0)
      onCambio()
    } catch (err) {
      if (err.status === 403) {
        setError403(err.mensaje || 'Solo el Administrador puede liberar o bloquear lotes.')
      } else if (err.status === 400) {
        const delMotivo = err.errores?.filter((item) => item.campo === 'motivo').map((item) => item.mensaje) ?? []
        if (delMotivo.length > 0) {
          setErroresMotivo([...new Set(delMotivo)])
        } else {
          setErrorGeneral(err)
        }
      } else if (err.status === 409 || err.status === 404) {
        setErrorGeneral(err)
        onCambio()
      } else {
        setErrorGeneral(err)
      }
    } finally {
      setGuardando(false)
    }
  }

  const idCampoMotivo = `campo-motivo-${codigoLote}`
  const idAyudaMotivo = `ayuda-motivo-${codigoLote}`
  const idContadorMotivo = `contador-motivo-${codigoLote}`
  const idErroresMotivo = `errores-motivo-${codigoLote}`

  const descripcionIds = [
    idAyudaMotivo,
    idContadorMotivo,
    erroresMotivo.length > 0 ? idErroresMotivo : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      aria-labelledby={`titulo-estado-${codigoLote}`}
      className="space-y-4 rounded-lg border border-cacao/20 bg-white p-4 shadow-xs sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`titulo-estado-${codigoLote}`} className="text-lg font-semibold text-cacao">
          Estado del lote
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {estado !== 'BLOQUEADO' && (
            <button
              ref={refBotonBloquear}
              type="button"
              onClick={() => abrirAccion('BLOQUEADO')}
              className={`rounded-md border border-red-700 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 ${FOCO}`}
            >
              Bloquear lote
            </button>
          )}
          {estado !== 'LIBERADO' && (
            <button
              ref={refBotonLiberar}
              type="button"
              onClick={() => abrirAccion('LIBERADO')}
              className={`rounded-md border border-origen px-3 py-1.5 text-sm font-semibold text-origen hover:bg-origen/10 ${FOCO}`}
            >
              Liberar lote
            </button>
          )}
        </div>
      </div>

      {confirmacion && (
        <div
          ref={refConfirmacion}
          tabIndex={-1}
          role="status"
          className="rounded-md border border-origen/40 bg-origen/10 p-4 text-sm text-cacao focus:outline-none"
        >
          <p className="font-bold">
            {confirmacion.accion === 'BLOQUEADO'
              ? `Lote ${codigoLote} bloqueado.`
              : `Lote ${codigoLote} liberado.`}
          </p>
          {confirmacion.lotesAfectados?.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-semibold text-cacao/80">Lotes afectados:</p>
              <ul className="list-disc pl-5 text-xs space-y-0.5">
                {confirmacion.lotesAfectados.map((afectado) => (
                  <li key={afectado.codigoLote}>
                    <span className="font-semibold">{afectado.codigoLote}</span>:{' '}
                    {etiquetaEstado(afectado.estadoAnterior)} → {etiquetaEstado(afectado.estadoNuevo)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {accion && (
        <form
          noValidate
          onSubmit={manejarConfirmar}
          className="space-y-4 rounded-md border border-cacao/15 bg-crema/30 p-4"
        >
          <h3 className="text-base font-semibold text-cacao">
            {accion === 'BLOQUEADO'
              ? `Bloquear el lote ${codigoLote}`
              : `Liberar el lote ${codigoLote}`}
          </h3>

          {error403 && (
            <div
              role="alert"
              className="rounded-md border border-red-700 bg-red-50 p-3 text-sm text-red-800 space-y-1"
            >
              <p className="font-bold">{error403}</p>
              <p>El servidor rechazó el cambio: el permiso se valida en el backend, no en esta pantalla.</p>
            </div>
          )}

          {errorGeneral && (
            <MensajeError
              error={errorGeneral}
              titulo={
                errorGeneral.status === 409 || errorGeneral.status === 404
                  ? 'No se pudo cambiar el estado'
                  : undefined
              }
            />
          )}

          <div className="space-y-1.5">
            <label
              htmlFor={idCampoMotivo}
              className="block text-sm font-semibold text-cacao"
            >
              Motivo del cambio
            </label>
            <textarea
              ref={refCampoMotivo}
              id={idCampoMotivo}
              rows={3}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value)
                if (erroresMotivo.length > 0) setErroresMotivo([])
              }}
              aria-invalid={erroresMotivo.length > 0 ? true : undefined}
              aria-describedby={descripcionIds}
              className={`block w-full rounded-md border bg-white p-2.5 text-sm text-cacao ${
                erroresMotivo.length > 0 ? 'border-red-700' : 'border-cacao/30'
              } ${FOCO}`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-cacao/70">
              <span id={idAyudaMotivo}>
                Obligatorio, entre 10 y 300 caracteres. Queda registrado en la auditoría con su usuario y la hora.
              </span>
              <span id={idContadorMotivo} aria-live="polite" className="font-mono">
                {motivo.length}/300 caracteres
              </span>
            </div>
            {erroresMotivo.length > 0 && (
              <ul id={idErroresMotivo} role="alert" className="mt-1 list-disc pl-5 text-xs text-red-700">
                {erroresMotivo.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}
          </div>

          {accion === 'BLOQUEADO' && cantidadDerivados > 0 && (
            <label className="flex items-center gap-2 text-sm font-medium text-cacao">
              <input
                type="checkbox"
                checked={propagar}
                onChange={(e) => setPropagar(e.target.checked)}
                className={`h-4 w-4 rounded border-cacao/40 text-cacao accent-mazorca ${FOCO}`}
              />
              {cantidadDerivados === 1
                ? 'Bloquear también su derivado'
                : `Bloquear también sus ${cantidadDerivados} derivados`}
            </label>
          )}

          {accion === 'LIBERADO' && (
            <p className="text-xs text-cacao/80 italic">
              La liberación no se propaga a los derivados. Si un lote de origen sigue bloqueado, el sistema no permite liberar.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={guardando}
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                accion === 'BLOQUEADO'
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-origen hover:bg-origen/90'
              } ${FOCO}`}
            >
              {guardando
                ? 'Guardando…'
                : accion === 'BLOQUEADO'
                  ? 'Confirmar bloqueo'
                  : 'Confirmar liberación'}
            </button>
            <button
              type="button"
              onClick={cancelar}
              disabled={guardando}
              className={`rounded-md border border-cacao/30 px-4 py-2 text-sm font-semibold text-cacao hover:bg-cacao/5 disabled:opacity-60 ${FOCO}`}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {esAdmin && (
        <div className="flex flex-wrap items-center gap-4 border-t border-cacao/10 pt-3 text-sm">
          <Link
            to={`/admin/recall/${encodeURIComponent(codigoLote)}`}
            className={`font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
          >
            Ver reporte de recall
          </Link>
          <Link
            to={`/admin/auditoria?referencia=${encodeURIComponent(codigoLote)}`}
            className={`font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
          >
            Ver auditoría de este lote
          </Link>
        </div>
      )}
    </section>
  )
}
