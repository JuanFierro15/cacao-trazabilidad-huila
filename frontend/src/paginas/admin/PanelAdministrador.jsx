import { useMemo, useState } from 'react'
import {
  descargarCsv,
  obtenerLotes,
  obtenerProductores,
} from '../../api/servicios.js'
import { useAuth } from '../../auth/useAuth.js'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { TablaLotes } from '../../componentes/TablaLotes.jsx'
import { guardarArchivo } from '../../utilidades/descarga.js'
import { etiquetaEstado, etiquetaTipoLote } from '../../utilidades/formato.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function PanelAdministrador() {
  const { sesion } = useAuth()
  const [filtros, setFiltros] = useState({ origen: '', estado: '', tipo: '' })
  const [descargando, setDescargando] = useState(false)
  const [errorCsv, setErrorCsv] = useState(null)

  const { datos: productores, error: errorProductores } = useConsultaApi(
    () => obtenerProductores(),
    [],
  )

  const municipios = useMemo(() => {
    if (!Array.isArray(productores)) return []
    const set = new Set()
    for (const p of productores) {
      if (p.municipio) set.add(p.municipio)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es-CO'))
  }, [productores])

  const {
    datos: lotes,
    cargando,
    error,
    recargar,
  } = useConsultaApi(() => obtenerLotes(filtros), [filtros])

  const manejarCambioFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  const limpiarFiltros = () => {
    setFiltros({ origen: '', estado: '', tipo: '' })
  }

  const hayFiltrosActivos = Boolean(filtros.origen || filtros.estado || filtros.tipo)

  const manejarDescargarCsv = async () => {
    setDescargando(true)
    setErrorCsv(null)
    try {
      const { blob, nombreArchivo } = await descargarCsv({
        origen: filtros.origen || undefined,
        estado: filtros.estado || undefined,
      })
      guardarArchivo(blob, nombreArchivo)
    } catch (err) {
      setErrorCsv(err)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel del administrador</h1>
        <p className="mt-1 text-cacao/80">Hola, {sesion?.nombreCompleto}.</p>
      </div>

      <section aria-labelledby="titulo-inventario" className="space-y-4">
        <div>
          <h2 id="titulo-inventario" className="text-lg font-semibold">
            Inventario de lotes
          </h2>
          <p className="text-sm text-cacao/80">Recibido, consumido y disponible por lote.</p>
        </div>

        <div className="rounded-lg border border-cacao/20 bg-white p-4 shadow-sm space-y-4">
          <form noValidate className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="filtro-origen" className="block text-sm font-medium">
                Origen
              </label>
              <select
                id="filtro-origen"
                value={filtros.origen}
                onChange={(e) => manejarCambioFiltro('origen', e.target.value)}
                className={`mt-1 rounded-md border border-cacao/30 bg-white px-3 py-1.5 text-sm ${FOCO}`}
              >
                <option value="">Todos</option>
                {municipios.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errorProductores && (
                <p className="mt-1 text-xs text-cacao/70">
                  No se pudieron cargar los municipios de origen.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="filtro-estado" className="block text-sm font-medium">
                Estado
              </label>
              <select
                id="filtro-estado"
                value={filtros.estado}
                onChange={(e) => manejarCambioFiltro('estado', e.target.value)}
                className={`mt-1 rounded-md border border-cacao/30 bg-white px-3 py-1.5 text-sm ${FOCO}`}
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">{etiquetaEstado('PENDIENTE')}</option>
                <option value="LIBERADO">{etiquetaEstado('LIBERADO')}</option>
                <option value="BLOQUEADO">{etiquetaEstado('BLOQUEADO')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="filtro-tipo" className="block text-sm font-medium">
                Tipo
              </label>
              <select
                id="filtro-tipo"
                value={filtros.tipo}
                onChange={(e) => manejarCambioFiltro('tipo', e.target.value)}
                className={`mt-1 rounded-md border border-cacao/30 bg-white px-3 py-1.5 text-sm ${FOCO}`}
              >
                <option value="">Todos</option>
                <option value="RECEPCION">{etiquetaTipoLote('RECEPCION')}</option>
                <option value="DERIVADO">{etiquetaTipoLote('DERIVADO')}</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={limpiarFiltros}
                className={`rounded-md border border-cacao/30 px-3 py-1.5 text-sm font-semibold text-cacao hover:bg-cacao/10 ${FOCO}`}
              >
                Limpiar filtros
              </button>
            </div>
          </form>

          <div className="border-t border-cacao/10 pt-4 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={manejarDescargarCsv}
                disabled={descargando}
                className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 disabled:opacity-60 ${FOCO}`}
              >
                {descargando ? 'Descargando…' : 'Descargar CSV'}
              </button>
              {errorCsv && (
                <div className="flex-1">
                  <MensajeError error={errorCsv} titulo="No se pudo descargar el CSV" />
                </div>
              )}
            </div>
            <p className="text-xs text-cacao/70">
              El archivo incluye los costos de cada lote derivado. Ábralo con doble clic en Excel.
            </p>
          </div>
        </div>

        {cargando && lotes && (
          <p role="status" className="text-xs text-cacao/70">
            Actualizando…
          </p>
        )}

        {error && (
          <div className="space-y-3">
            <MensajeError error={error} titulo="No se pudo cargar el inventario" />
            {!lotes && (
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

        {cargando && !lotes ? (
          <p role="status">Cargando inventario…</p>
        ) : (
          lotes && (
            <TablaLotes
              lotes={lotes}
              columnasAdministrador={true}
              mensajeVacio={
                hayFiltrosActivos
                  ? 'Ningún lote coincide con los filtros.'
                  : 'No hay lotes registrados.'
              }
            />
          )
        )}
      </section>
    </div>
  )
}
