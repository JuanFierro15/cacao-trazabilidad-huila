import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { obtenerAuditoria } from '../../api/servicios.js'
import { etiquetaRol } from '../../auth/roles.js'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import {
  etiquetaAccionAuditoria,
  etiquetaEntidadAuditoria,
  formatearFechaHora,
} from '../../utilidades/formato.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

function FormularioFiltrosAuditoria({ referenciaInicial, entidadInicial, onFiltrar, onLimpiar }) {
  const [textoReferencia, setTextoReferencia] = useState(referenciaInicial)
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(entidadInicial)

  const manejarEnvio = (e) => {
    e.preventDefault()
    const nuevo = {}
    const refLimpia = textoReferencia.trim().toUpperCase()
    if (refLimpia) nuevo.referencia = refLimpia
    if (entidadSeleccionada) nuevo.entidad = entidadSeleccionada
    onFiltrar(nuevo)
  }

  return (
    <form
      noValidate
      onSubmit={manejarEnvio}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="w-full sm:w-auto">
        <label
          htmlFor="filtro-referencia-auditoria"
          className="block text-xs font-semibold text-cacao"
        >
          Código de lote
        </label>
        <input
          id="filtro-referencia-auditoria"
          type="text"
          value={textoReferencia}
          onChange={(e) => setTextoReferencia(e.target.value)}
          placeholder="Ej. CAC001"
          className={`mt-1 block w-full rounded-md border border-cacao/30 bg-white px-3 py-1.5 text-sm uppercase text-cacao sm:w-48 ${FOCO}`}
        />
      </div>

      <div className="w-full sm:w-auto">
        <label
          htmlFor="filtro-entidad-auditoria"
          className="block text-xs font-semibold text-cacao"
        >
          Entidad
        </label>
        <select
          id="filtro-entidad-auditoria"
          value={entidadSeleccionada}
          onChange={(e) => setEntidadSeleccionada(e.target.value)}
          className={`mt-1 block w-full rounded-md border border-cacao/30 bg-white px-3 py-1.5 text-sm text-cacao sm:w-48 ${FOCO}`}
        >
          <option value="">Todas</option>
          <option value="LOTE">Lote</option>
          <option value="TRANSFORMACION">Transformación</option>
        </select>
      </div>

      <div className="flex items-center gap-2 pt-1 sm:pt-0">
        <button
          type="submit"
          className={`rounded-md bg-cacao px-4 py-1.5 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={onLimpiar}
          className={`rounded-md border border-cacao/30 px-4 py-1.5 text-sm font-semibold text-cacao hover:bg-cacao/10 ${FOCO}`}
        >
          Quitar filtros
        </button>
      </div>
    </form>
  )
}

export function PaginaAuditoria() {
  const [searchParams, setSearchParams] = useSearchParams()

  const referenciaUrl = searchParams.get('referencia') ?? ''
  const entidadUrl = searchParams.get('entidad') ?? ''

  const filtros = useMemo(() => {
    const f = {}
    if (referenciaUrl) f.referencia = referenciaUrl
    if (entidadUrl) f.entidad = entidadUrl
    return f
  }, [referenciaUrl, entidadUrl])

  const {
    datos: registros,
    cargando,
    error,
    recargar,
  } = useConsultaApi(() => obtenerAuditoria(filtros), [referenciaUrl, entidadUrl])

  const totalRegistros = Array.isArray(registros) ? registros.length : 0
  const textoConteo =
    totalRegistros === 1 ? '1 registro' : `${totalRegistros} registros`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cacao">Auditoría de cambios</h1>
        <p className="mt-1 text-sm text-cacao/80">
          Registro de solo lectura: la base de datos rechaza modificar o borrar estas filas.
        </p>
      </div>

      <section
        aria-labelledby="titulo-filtros-auditoria"
        className="rounded-lg border border-cacao/20 bg-white p-4 shadow-xs"
      >
        <h2 id="titulo-filtros-auditoria" className="sr-only">
          Filtros de auditoría
        </h2>
        <FormularioFiltrosAuditoria
          key={`${referenciaUrl}#${entidadUrl}`}
          referenciaInicial={referenciaUrl}
          entidadInicial={entidadUrl}
          onFiltrar={(nuevo) => setSearchParams(nuevo)}
          onLimpiar={() => setSearchParams({})}
        />
      </section>

      <section aria-labelledby="titulo-lista-auditoria" className="space-y-3">
        <h2 id="titulo-lista-auditoria" className="sr-only">
          Listado de auditoría
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {!cargando && registros && (
            <p role="status" className="text-sm font-semibold text-cacao/80">
              {textoConteo}
            </p>
          )}
          {cargando && registros && (
            <p role="status" className="text-xs text-cacao/70">
              Actualizando…
            </p>
          )}
        </div>

        {error && (
          <div className="space-y-3">
            <MensajeError error={error} titulo="No se pudo cargar la auditoría" />
            {!registros && (
              <button
                type="button"
                onClick={recargar}
                className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        {cargando && !registros ? (
          <p role="status">Cargando auditoría…</p>
        ) : !registros ? null : registros.length === 0 ? (
          <p className="rounded-lg border border-cacao/20 bg-white p-6 text-sm text-cacao/80">
            No hay registros con esos filtros.
          </p>
        ) : (
          <>
            {/* Móvil: tarjetas */}
            <div className="space-y-3 md:hidden">
              {registros.map((fila) => {
                const valAnt =
                  fila.valorAnterior === null || fila.valorAnterior === undefined
                    ? '—'
                    : fila.valorAnterior
                const valNue =
                  fila.valorNuevo === null || fila.valorNuevo === undefined
                    ? '—'
                    : fila.valorNuevo

                return (
                  <article
                    key={fila.id}
                    className="rounded-lg border border-cacao/15 bg-white p-4 text-sm shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-cacao/10 pb-2">
                      <div>
                        <time className="text-xs font-semibold text-cacao/70">
                          {formatearFechaHora(fila.fechaHora)}
                        </time>
                        <p className="font-semibold text-cacao">{fila.usuarioUsername}</p>
                        <p className="text-xs text-cacao/70">{etiquetaRol(fila.usuarioRol)}</p>
                      </div>
                      <div className="text-right">
                        <span className="rounded bg-cacao/10 px-2 py-0.5 text-xs font-semibold text-cacao">
                          {etiquetaAccionAuditoria(fila.accion)}
                        </span>
                        <p className="mt-1 text-xs text-cacao/70">
                          {etiquetaEntidadAuditoria(fila.entidadAfectada)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="text-cacao/70">Referencia: </span>
                        <Link
                          to={`/lotes/${encodeURIComponent(fila.registroReferencia)}/trazabilidad`}
                          className={`font-semibold underline text-cacao hover:text-cacao/80 ${FOCO}`}
                        >
                          {fila.registroReferencia}
                        </Link>
                      </p>
                      <p>
                        <span className="text-cacao/70">Campo: </span>
                        <span className="font-mono font-medium text-cacao">{fila.campoModificado}</span>
                      </p>
                      <p>
                        <span className="text-cacao/70">Cambio: </span>
                        <span className="font-medium text-cacao">
                          {valAnt} → {valNue}
                        </span>
                      </p>
                      <p>
                        <span className="text-cacao/70">Motivo: </span>
                        <span className="text-cacao/90">{fila.motivo || '—'}</span>
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden overflow-x-auto rounded-lg border border-cacao/20 bg-white shadow-xs md:block">
              <table className="w-full text-left text-sm text-cacao">
                <caption className="sr-only">Registros de auditoría</caption>
                <thead className="border-b border-cacao/20 bg-cacao/5 text-xs text-cacao/70">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Fecha y hora</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Usuario</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Acción</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Entidad</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Referencia</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Campo</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Anterior → Nuevo</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cacao/10">
                  {registros.map((fila) => {
                    const valAnt =
                      fila.valorAnterior === null || fila.valorAnterior === undefined
                        ? '—'
                        : fila.valorAnterior
                    const valNue =
                      fila.valorNuevo === null || fila.valorNuevo === undefined
                        ? '—'
                        : fila.valorNuevo

                    return (
                      <tr key={fila.id} className="hover:bg-cacao/5">
                        <td className="whitespace-nowrap px-3 py-2 text-xs">
                          {formatearFechaHora(fila.fechaHora)}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <p className="font-semibold">{fila.usuarioUsername}</p>
                          <p className="text-cacao/70">{etiquetaRol(fila.usuarioRol)}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <span className="rounded bg-cacao/10 px-2 py-0.5 text-xs font-semibold text-cacao">
                            {etiquetaAccionAuditoria(fila.accion)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs">
                          {etiquetaEntidadAuditoria(fila.entidadAfectada)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <Link
                            to={`/lotes/${encodeURIComponent(fila.registroReferencia)}/trazabilidad`}
                            className={`font-semibold underline text-cacao hover:text-cacao/80 ${FOCO}`}
                          >
                            {fila.registroReferencia}
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-cacao/90">
                          {fila.campoModificado}
                        </td>
                        <td className="px-3 py-2 text-xs font-medium">
                          {valAnt} → {valNue}
                        </td>
                        <td className="max-w-xs px-3 py-2 text-xs text-cacao/90">
                          {fila.motivo || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
