import { Link, useParams } from 'react-router'
import { obtenerLote } from '../../api/servicios.js'
import { rutaInicioPorRol } from '../../auth/roles.js'
import { useAuth } from '../../auth/useAuth.js'
import { InsigniaEstado } from '../../componentes/InsigniaEstado.jsx'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import {
  etiquetaTipoGrano,
  etiquetaTipoLote,
  formatearFecha,
  formatearKg,
  formatearNumero,
} from '../../utilidades/formato.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function PaginaDetalleLote() {
  const { codigo } = useParams()
  const { rol } = useAuth()
  const { datos: lote, cargando, error } = useConsultaApi(() => obtenerLote(codigo), [codigo])

  if (cargando) {
    return <p role="status">Cargando lote…</p>
  }

  if (error) {
    return (
      <div className="space-y-4">
        <MensajeError error={error} titulo="No se pudo cargar el lote" />
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

  if (!lote) return null

  const productorFinca = lote.productor
    ? `${lote.productor.nombreProductor} · ${lote.productor.nombreFinca}`
    : '—'
  const humedadTexto =
    lote.porcentajeHumedad !== null && lote.porcentajeHumedad !== undefined
      ? `${formatearNumero(lote.porcentajeHumedad, 2)} %`
      : '—'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Lote {lote.codigoLote}</h1>
          <InsigniaEstado estado={lote.estado} />
        </div>
        <Link
          to={rutaInicioPorRol(rol)}
          className={`text-sm font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
        >
          Volver al panel
        </Link>
      </div>

      <section
        aria-labelledby="titulo-datos-lote"
        className="rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
      >
        <h2 id="titulo-datos-lote" className="text-lg font-semibold">
          Información general
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-cacao/70">Tipo de lote</dt>
            <dd className="font-semibold">{etiquetaTipoLote(lote.tipoLote)}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Producto</dt>
            <dd className="font-semibold">{lote.producto}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Productor y finca</dt>
            <dd className="font-semibold">{productorFinca}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Origen</dt>
            <dd className="font-semibold">{lote.origenMunicipio}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Fecha de recepción</dt>
            <dd className="font-semibold">{formatearFecha(lote.fechaRecepcion)}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Tipo de grano</dt>
            <dd className="font-semibold">{etiquetaTipoGrano(lote.tipoGrano)}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Humedad</dt>
            <dd className="font-semibold">{humedadTexto}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Recibido</dt>
            <dd className="font-semibold tabular-nums">{formatearKg(lote.cantidadRecibida)}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Consumido</dt>
            <dd className="font-semibold tabular-nums">{formatearKg(lote.cantidadConsumida)}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Disponible</dt>
            <dd className="font-semibold tabular-nums">{formatearKg(lote.cantidadDisponible)}</dd>
          </div>
          <div>
            <dt className="text-xs text-cacao/70">Alertas activas</dt>
            <dd className="font-semibold tabular-nums">{lote.alertasActivas}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
