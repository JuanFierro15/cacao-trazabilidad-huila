import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import {
  obtenerLote,
  obtenerReglas,
  obtenerTrazabilidad,
} from '../../api/servicios.js'
import { rutaInicioPorRol } from '../../auth/roles.js'
import { useAuth } from '../../auth/useAuth.js'
import { CodigoQrFicha } from '../../componentes/CodigoQrFicha.jsx'
import { ControlEstadoLote } from '../../componentes/ControlEstadoLote.jsx'
import { InsigniaEstado } from '../../componentes/InsigniaEstado.jsx'
import { ListaAlertas } from '../../componentes/ListaAlertas.jsx'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import {
  etiquetaTipoGrano,
  formatearFecha,
  formatearHectareas,
  formatearKg,
  formatearNumero,
  formatearPorcentaje,
} from '../../utilidades/formato.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'
// El umbral se muestra como en la regla del backend: "15,0 %".
const UMBRAL_UN_DECIMAL = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

function resolverNombreEtapa(codigoEtapa, etapas) {
  if (!Array.isArray(etapas)) return codigoEtapa
  const coincidencia = etapas.find((e) => e.codigo === codigoEtapa)
  return coincidencia?.nombre ?? codigoEtapa
}

// Al pasar de un lote a otro desde la línea de tiempo, el contenido se monta de nuevo:
// así nunca se muestran los datos del lote anterior bajo el código nuevo.
export function PaginaTrazabilidad() {
  const { codigo } = useParams()
  return <ContenidoTrazabilidad key={codigo} codigo={codigo} />
}

function ContenidoTrazabilidad({ codigo }) {
  const { rol } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const {
    datos: trazabilidad,
    cargando: cargandoTrazabilidad,
    error: errorTrazabilidad,
    recargar: recargarTrazabilidad,
  } = useConsultaApi(() => obtenerTrazabilidad(codigo), [codigo])

  const {
    datos: lote,
    cargando: cargandoLote,
    error: errorLote,
    recargar: recargarLote,
  } = useConsultaApi(() => obtenerLote(codigo), [codigo])

  const {
    datos: reglas,
    error: errorReglas,
  } = useConsultaApi(obtenerReglas, [])

  if (cargandoTrazabilidad && !trazabilidad) {
    return <p role="status">Cargando trazabilidad…</p>
  }

  if (errorTrazabilidad && !trazabilidad) {
    return (
      <div className="space-y-4">
        <MensajeError error={errorTrazabilidad} titulo="No se pudo cargar la trazabilidad" />
        <div>
          <Link
            to={rutaInicioPorRol(rol)}
            className={`inline-block rounded-md border border-cacao/40 px-4 py-2 text-sm font-semibold hover:bg-cacao/5 ${FOCO}`}
          >
            Volver al panel
          </Link>
        </div>
      </div>
    )
  }

  if (!trazabilidad) return null

  const esBloqueado = trazabilidad.estado === 'BLOQUEADO'
  const loteRaiz = trazabilidad.loteRaiz
  const origen = trazabilidad.origen
  const derivados = Array.isArray(trazabilidad.derivados) ? trazabilidad.derivados : []
  const alertas = Array.isArray(trazabilidad.alertas) ? trazabilidad.alertas : []

  const humedadTexto =
    loteRaiz.porcentajeHumedad !== null && loteRaiz.porcentajeHumedad !== undefined
      ? `${formatearNumero(loteRaiz.porcentajeHumedad, 2)} %`
      : '—'

  return (
    <div className="space-y-6">
      {cargandoTrazabilidad && (
        <p role="status" className="text-xs text-cacao/70">
          Actualizando…
        </p>
      )}

      {errorTrazabilidad && (
        <MensajeError error={errorTrazabilidad} titulo="Error al actualizar la trazabilidad" />
      )}

      {/* Encabezado */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-cacao">Lote {trazabilidad.codigoLote}</h1>
            <span className="text-sm text-cacao/80">({trazabilidad.producto})</span>
            <InsigniaEstado estado={trazabilidad.estado} />
          </div>
          <Link
            to={rutaInicioPorRol(rol)}
            className={`text-sm font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
          >
            Volver al panel
          </Link>
        </div>

        <ControlEstadoLote
          codigoLote={trazabilidad.codigoLote}
          estado={trazabilidad.estado}
          cantidadDerivados={derivados.length}
          onCambio={() => {
            recargarTrazabilidad()
            recargarLote()
          }}
        />

        {esBloqueado && (
          <div
            role="alert"
            className="rounded-md border border-red-700 bg-red-50 p-4 text-sm text-red-800 space-y-1"
          >
            <p className="font-semibold">Lote bloqueado: no se puede transformar ni ofrecer a la venta.</p>
            {lote?.motivoEstado && <p>Motivo: {lote.motivoEstado}</p>}
          </div>
        )}
      </header>

      {/* Sección Origen */}
      <section
        aria-labelledby="titulo-seccion-origen"
        className="space-y-4 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h2 id="titulo-seccion-origen" className="text-lg font-semibold text-cacao">
          Origen
        </h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
          {origen?.vereda !== null && origen?.vereda !== undefined && (
            <div>
              <dt className="text-xs text-cacao/70">Vereda</dt>
              <dd className="font-semibold">{origen.vereda}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-cacao/70">Variedad de cacao</dt>
            <dd className="font-semibold">{origen?.variedadCacao || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Hectáreas productivas</dt>
            <dd className="font-semibold">{formatearHectareas(origen?.hectareasProductivas)}</dd>
          </div>
        </dl>

        <div className="border-t border-cacao/10 pt-4">
          <h3 className="text-sm font-semibold text-cacao">Lote de recepción</h3>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs text-cacao/70">Código de recepción</dt>
              <dd>
                <Link
                  to={`/lotes/${encodeURIComponent(loteRaiz.codigoLote)}/trazabilidad`}
                  className={`font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
                >
                  {loteRaiz.codigoLote}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Fecha de recepción</dt>
              <dd className="font-semibold">{formatearFecha(loteRaiz.fechaRecepcion)}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Cantidad recibida</dt>
              <dd className="font-semibold tabular-nums">{formatearKg(loteRaiz.cantidadRecibidaKg)}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Tipo de grano</dt>
              <dd className="font-semibold">{etiquetaTipoGrano(loteRaiz.tipoGrano)}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Porcentaje de humedad</dt>
              <dd className="font-semibold tabular-nums">{humedadTexto}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Sección Inventario de este lote */}
      <section
        aria-labelledby="titulo-seccion-inventario"
        className="space-y-4 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h2 id="titulo-seccion-inventario" className="text-lg font-semibold text-cacao">
          Inventario de este lote
        </h2>

        {errorLote && (
          <p className="text-xs text-red-700">No se pudo cargar el inventario del lote.</p>
        )}

        {cargandoLote && !lote && (
          <p role="status" className="text-xs text-cacao/70">
            Cargando inventario…
          </p>
        )}

        {lote && (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
              <dt className="text-xs text-cacao/70">Recibido</dt>
              <dd className="mt-1 font-semibold tabular-nums text-cacao">
                {formatearKg(lote.cantidadRecibida)}
              </dd>
            </div>
            <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
              <dt className="text-xs text-cacao/70">Consumido</dt>
              <dd className="mt-1 font-semibold tabular-nums text-cacao">
                {formatearKg(lote.cantidadConsumida)}
              </dd>
            </div>
            <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
              <dt className="text-xs text-cacao/70">Disponible</dt>
              <dd className="mt-1 font-semibold tabular-nums text-cacao">
                {formatearKg(lote.cantidadDisponible)}
              </dd>
            </div>
          </dl>
        )}
      </section>

      {/* Sección Línea de tiempo */}
      <section
        aria-labelledby="titulo-seccion-linea"
        className="space-y-4 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h2 id="titulo-seccion-linea" className="text-lg font-semibold text-cacao">
          Línea de tiempo
        </h2>

        {errorReglas && (
          <p className="text-xs text-cacao/70">No se pudieron cargar los nombres oficiales de etapas.</p>
        )}

        <ol className="relative ml-4 space-y-6 border-l-2 border-cacao/20 pl-6">
          {trazabilidad.linea.map((paso) => {
            const esEsteLote =
              (paso.tipo === 'RECEPCION' && trazabilidad.loteRaiz?.codigoLote === trazabilidad.codigoLote) ||
              (paso.tipo === 'TRANSFORMACION' && paso.loteSalida === trazabilidad.codigoLote)

            const superaUmbral =
              reglas?.umbralMermaPorcentaje !== undefined &&
              typeof paso.porcentajeMerma === 'number' &&
              paso.porcentajeMerma > reglas.umbralMermaPorcentaje

            return (
              <li key={paso.orden} className="relative">
                <span
                  className="absolute -left-[33px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-mazorca"
                  aria-hidden="true"
                />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="text-xs font-semibold text-cacao/70">{formatearFecha(paso.fecha)}</time>
                    {esEsteLote && (
                      <span className="rounded bg-mazorca/20 px-2 py-0.5 text-xs font-semibold text-cacao">
                        Este lote
                      </span>
                    )}
                  </div>

                  {paso.tipo === 'RECEPCION' && (
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-cacao">Recepción</h3>
                      <p className="text-sm text-cacao/90">
                        <Link
                          to={`/lotes/${encodeURIComponent(paso.codigoLote)}/trazabilidad`}
                          className={`font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
                        >
                          Lote {paso.codigoLote}
                        </Link>
                        : {paso.descripcion}
                      </p>
                    </div>
                  )}

                  {paso.tipo === 'TRANSFORMACION' && (
                    <div className="space-y-1 text-sm text-cacao/90">
                      <h3 className="text-base font-semibold text-cacao">
                        {resolverNombreEtapa(paso.etapa, reglas?.etapas)}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/lotes/${encodeURIComponent(paso.loteEntrada)}/trazabilidad`}
                          className={`font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
                        >
                          Lote {paso.loteEntrada}
                        </Link>
                        <span>→</span>
                        {paso.loteSalida ? (
                          <Link
                            to={`/lotes/${encodeURIComponent(paso.loteSalida)}/trazabilidad`}
                            className={`font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
                          >
                            Lote {paso.loteSalida}
                          </Link>
                        ) : (
                          <span className="text-cacao/70">Sin lote de salida</span>
                        )}
                      </div>

                      <p className="tabular-nums">
                        Entrada → salida: {formatearKg(paso.cantidadEntradaKg)} → {formatearKg(paso.cantidadSalidaKg)}
                      </p>

                      <p className="tabular-nums">
                        {paso.porcentajeMerma < 0 ? 'Balance con insumos' : 'Merma oficial'}:{' '}
                        {formatearPorcentaje(paso.porcentajeMerma)}
                        {superaUmbral && (
                          <span className="ml-2 font-semibold text-red-700">
                            Supera el umbral de {UMBRAL_UN_DECIMAL.format(reglas.umbralMermaPorcentaje)} %
                          </span>
                        )}
                      </p>

                      <p className="text-xs text-cacao/70">Responsable: {paso.responsable}</p>

                      {paso.incidencia && (
                        <p className="text-xs italic text-cacao/80">Incidencia: {paso.incidencia}</p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Sección Derivados */}
      <section
        aria-labelledby="titulo-seccion-derivados"
        className="space-y-4 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h2 id="titulo-seccion-derivados" className="text-lg font-semibold text-cacao">
          Derivados
        </h2>

        {derivados.length === 0 ? (
          <p className="text-sm text-cacao/70">Este lote no tiene derivados.</p>
        ) : (
          <>
            {/* Tarjetas en móvil */}
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

            {/* Tabla en pantallas md y mayores */}
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

      {/* Sección Alertas del recorrido */}
      <section
        aria-labelledby="titulo-seccion-alertas"
        className="space-y-4 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h2 id="titulo-seccion-alertas" className="text-lg font-semibold text-cacao">
          Alertas del recorrido
        </h2>

        {alertas.length === 0 ? (
          <p className="text-sm text-cacao/70">No hay alertas en este recorrido.</p>
        ) : (
          <ListaAlertas alertas={alertas} mostrarLote={true} />
        )}
      </section>

      {/* Tiempo de respuesta */}
      <p className="text-xs text-cacao/60">
        Consulta de trazabilidad resuelta en {trazabilidad.tiempoConsultaMs} ms
      </p>

      {/* Código QR */}
      <CodigoQrFicha codigoLote={trazabilidad.codigoLote} />
    </div>
  )
}
