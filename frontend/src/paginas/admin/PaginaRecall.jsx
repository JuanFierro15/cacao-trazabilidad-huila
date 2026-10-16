import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { obtenerRecall, obtenerReglas } from '../../api/servicios.js'
import { InsigniaEstado } from '../../componentes/InsigniaEstado.jsx'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { formatearKg } from '../../utilidades/formato.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

function resolverNombreEtapa(codigoEtapa, etapas) {
  if (!Array.isArray(etapas)) return codigoEtapa
  const coincidencia = etapas.find((e) => e.codigo === codigoEtapa)
  return coincidencia?.nombre ?? codigoEtapa
}

function ContenidoRecall({ codigo }) {
  const {
    datos: recall,
    cargando,
    error,
  } = useConsultaApi(() => obtenerRecall(codigo), [codigo])

  const { datos: reglas } = useConsultaApi(obtenerReglas, [])

  if (cargando && !recall) {
    return <p role="status">Cargando reporte de recall…</p>
  }

  if (error && !recall) {
    return (
      <div className="space-y-4">
        <MensajeError error={error} titulo="No se pudo cargar el reporte de recall" />
      </div>
    )
  }

  if (!recall) return null

  const esBloqueado = recall.estado === 'BLOQUEADO'
  const derivados = Array.isArray(recall.derivados) ? recall.derivados : []
  const origen = recall.origen
  const cantidades = recall.cantidades

  const numTransformaciones = recall.historialConservado?.transformaciones ?? 0
  const numAuditoria = recall.historialConservado?.registrosAuditoria ?? 0
  const textoTransformaciones =
    numTransformaciones === 1 ? '1 transformación' : `${numTransformaciones} transformaciones`
  const textoAuditoria =
    numAuditoria === 1 ? '1 registro de auditoría' : `${numAuditoria} registros de auditoría`

  return (
    <div className="space-y-6">
      {cargando && (
        <p role="status" className="text-xs text-cacao/70">
          Actualizando…
        </p>
      )}

      {error && (
        <MensajeError error={error} titulo="Error al actualizar el reporte de recall" />
      )}

      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-cacao">Lote {recall.codigoLote}</h2>
            <InsigniaEstado estado={recall.estado} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/lotes/${encodeURIComponent(recall.codigoLote)}/trazabilidad`}
              className={`text-sm font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
            >
              Ver trazabilidad
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className={`rounded-md bg-cacao px-3 py-1.5 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
            >
              Imprimir reporte
            </button>
          </div>
        </div>

        {recall.loteRaiz && recall.loteRaiz !== recall.codigoLote && (
          <p className="text-sm text-cacao/80">
            <span>Lote raíz: </span>
            <Link
              to={`/admin/recall/${encodeURIComponent(recall.loteRaiz)}`}
              className={`font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
            >
              {recall.loteRaiz}
            </Link>
          </p>
        )}

        {!esBloqueado && (
          <div
            role="status"
            className="rounded-md border border-mazorca/50 bg-mazorca/15 p-4 text-sm text-cacao"
          >
            <p>
              Este lote no está bloqueado. Para retirarlo de la venta, bloquéelo desde su{' '}
              <Link
                to={`/lotes/${encodeURIComponent(recall.codigoLote)}/trazabilidad`}
                className={`font-semibold underline ${FOCO}`}
              >
                trazabilidad
              </Link>
              .
            </p>
          </div>
        )}
      </header>

      {/* Cifra destacada */}
      <section
        aria-labelledby="titulo-kg-afectados"
        className="rounded-lg border-2 border-red-700/30 bg-red-50/50 p-6 shadow-xs"
      >
        <h3 id="titulo-kg-afectados" className="text-sm font-semibold text-cacao/80">
          Kg afectados en inventario
        </h3>
        <p className="mt-2 text-3xl font-extrabold tabular-nums text-red-800 sm:text-4xl">
          {formatearKg(recall.kgAfectadosEnInventario)}
        </p>
        <p className="mt-1 text-xs text-cacao/70">
          Suma de lo disponible en el lote y en todos sus derivados.
        </p>
      </section>

      {/* Sección Origen */}
      <section
        aria-labelledby="titulo-seccion-origen-recall"
        className="space-y-3 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h3 id="titulo-seccion-origen-recall" className="text-lg font-semibold text-cacao">
          Origen
        </h3>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-cacao/70">Productor</dt>
            <dd className="font-semibold">{origen?.productor || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Finca</dt>
            <dd className="font-semibold">{origen?.finca || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Municipio</dt>
            <dd className="font-semibold">{origen?.municipio || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Variedad</dt>
            <dd className="font-semibold">{origen?.variedadCacao || '—'}</dd>
          </div>
        </dl>
      </section>

      {/* Sección Cantidades del lote */}
      <section
        aria-labelledby="titulo-seccion-cantidades-recall"
        className="space-y-3 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h3 id="titulo-seccion-cantidades-recall" className="text-lg font-semibold text-cacao">
          Cantidades del lote
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
            <dt className="text-xs text-cacao/70">Recibido</dt>
            <dd className="mt-1 font-semibold tabular-nums text-cacao">
              {formatearKg(cantidades?.recibidaKg)}
            </dd>
          </div>
          <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
            <dt className="text-xs text-cacao/70">Consumido</dt>
            <dd className="mt-1 font-semibold tabular-nums text-cacao">
              {formatearKg(cantidades?.consumidaKg)}
            </dd>
          </div>
          <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
            <dt className="text-xs text-cacao/70">Disponible</dt>
            <dd className="mt-1 font-semibold tabular-nums text-cacao">
              {formatearKg(cantidades?.disponibleKg)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Sección Derivados */}
      <section
        aria-labelledby="titulo-seccion-derivados-recall"
        className="space-y-4 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h3 id="titulo-seccion-derivados-recall" className="text-lg font-semibold text-cacao">
          Derivados
        </h3>

        {derivados.length === 0 ? (
          <p className="text-sm text-cacao/70">Este lote no tiene derivados.</p>
        ) : (
          <>
            {/* Móvil: tarjetas */}
            <div className="space-y-3 md:hidden">
              {derivados.map((derivado) => (
                <article
                  key={derivado.codigoLote}
                  className="rounded-md border border-cacao/15 bg-crema/30 p-4 text-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/lotes/${encodeURIComponent(derivado.codigoLote)}/trazabilidad`}
                      className={`font-bold text-cacao underline hover:text-cacao/80 ${FOCO}`}
                    >
                      {derivado.codigoLote}
                    </Link>
                    <InsigniaEstado estado={derivado.estado} />
                  </div>
                  <p className="font-semibold text-cacao">{derivado.producto}</p>
                  <p className="text-xs text-cacao/70">
                    Etapa: {resolverNombreEtapa(derivado.etapa, reglas?.etapas)}
                  </p>
                  <div className="flex justify-between text-xs tabular-nums text-cacao/80">
                    <span>Cantidad: {formatearKg(derivado.cantidadKg)}</span>
                    <span>Disponible: {formatearKg(derivado.disponibleKg)}</span>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm text-cacao">
                <thead className="border-b border-cacao/20 text-xs text-cacao/70">
                  <tr>
                    <th scope="col" className="py-2 pr-3">Código</th>
                    <th scope="col" className="py-2 pr-3">Producto</th>
                    <th scope="col" className="py-2 pr-3">Etapa</th>
                    <th scope="col" className="py-2 pr-3 tabular-nums">Cantidad</th>
                    <th scope="col" className="py-2 pr-3 tabular-nums">Disponible</th>
                    <th scope="col" className="py-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cacao/10">
                  {derivados.map((derivado) => (
                    <tr key={derivado.codigoLote}>
                      <td className="py-2.5 pr-3">
                        <Link
                          to={`/lotes/${encodeURIComponent(derivado.codigoLote)}/trazabilidad`}
                          className={`font-semibold underline text-cacao hover:text-cacao/80 ${FOCO}`}
                        >
                          {derivado.codigoLote}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 font-medium">{derivado.producto}</td>
                      <td className="py-2.5 pr-3">{resolverNombreEtapa(derivado.etapa, reglas?.etapas)}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{formatearKg(derivado.cantidadKg)}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{formatearKg(derivado.disponibleKg)}</td>
                      <td className="py-2.5">
                        <InsigniaEstado estado={derivado.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Sección Historial conservado */}
      <section
        aria-labelledby="titulo-seccion-historial-recall"
        className="space-y-3 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h3 id="titulo-seccion-historial-recall" className="text-lg font-semibold text-cacao">
          Historial conservado
        </h3>
        <p className="text-sm text-cacao/90">
          {textoTransformaciones} y {textoAuditoria} se conservan.
        </p>
        <div>
          <Link
            to={`/admin/auditoria?referencia=${encodeURIComponent(recall.codigoLote)}`}
            className={`inline-block text-sm font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
          >
            Ver auditoría
          </Link>
        </div>
      </section>
    </div>
  )
}

// Al pasar de un lote a otro (por ejemplo, al lote raíz) el formulario arranca con el código nuevo.
export function PaginaRecall() {
  const { codigo } = useParams()
  return <ConsultaRecall key={codigo ?? ''} codigo={codigo} />
}

function ConsultaRecall({ codigo }) {
  const navigate = useNavigate()

  const [codigoEscrito, setCodigoEscrito] = useState(codigo ?? '')
  const [errorValidacion, setErrorValidacion] = useState(null)

  const manejarEnvio = (e) => {
    e.preventDefault()
    const limpio = codigoEscrito.trim().toUpperCase()
    if (!limpio) {
      setErrorValidacion('Escriba el código de un lote, por ejemplo CAC001.')
      return
    }
    setErrorValidacion(null)
    navigate(`/admin/recall/${encodeURIComponent(limpio)}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cacao">Reporte de recall</h1>
        <p className="mt-1 text-sm text-cacao/80">
          Alcance de retiro del mercado, linaje de producción y trazabilidad de derivados.
        </p>
      </div>

      <section
        aria-labelledby="titulo-consulta-recall"
        className="rounded-lg border border-cacao/20 bg-white p-4 shadow-xs"
      >
        <h2 id="titulo-consulta-recall" className="sr-only">
          Consultar reporte de lote
        </h2>
        <form noValidate onSubmit={manejarEnvio} className="space-y-2">
          <label htmlFor="campo-codigo-recall" className="block text-sm font-semibold text-cacao">
            Código del lote
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="campo-codigo-recall"
              type="text"
              value={codigoEscrito}
              onChange={(e) => {
                setCodigoEscrito(e.target.value)
                if (errorValidacion) setErrorValidacion(null)
              }}
              placeholder="Ej. CAC001"
              aria-invalid={errorValidacion ? true : undefined}
              aria-describedby={errorValidacion ? 'error-codigo-recall' : undefined}
              className={`block w-full max-w-md rounded-md border bg-white px-3 py-2 text-sm uppercase text-cacao ${
                errorValidacion ? 'border-red-700' : 'border-cacao/30'
              } ${FOCO}`}
            />
            <button
              type="submit"
              className={`rounded-md bg-cacao px-5 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 sm:shrink-0 ${FOCO}`}
            >
              Consultar
            </button>
          </div>
          {errorValidacion && (
            <p id="error-codigo-recall" role="alert" className="text-xs font-semibold text-red-700">
              {errorValidacion}
            </p>
          )}
        </form>
      </section>

      {codigo ? (
        <ContenidoRecall key={codigo} codigo={codigo} />
      ) : (
        <p className="rounded-lg border border-cacao/15 bg-white p-6 text-sm text-cacao/80">
          Consulte un lote para ver su origen, sus derivados y los kilos afectados.
        </p>
      )}
    </div>
  )
}
