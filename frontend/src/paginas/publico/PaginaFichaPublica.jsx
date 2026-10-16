import { Link, useParams } from 'react-router'
import { obtenerFichaPublica } from '../../api/servicios.js'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { formatearFecha, formatearFechaHora } from '../../utilidades/formato.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'
import {
  EncabezadoPublico,
  FormularioConsultaFicha,
  PiePublico,
} from './PaginaConsultaFicha.jsx'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

// Cada código monta su propia ficha: al ir y volver entre fichas con el navegador,
// nunca queda a la vista el estado de otro producto mientras carga el nuevo.
export function PaginaFichaPublica() {
  const { codigoLote } = useParams()
  return <ContenidoFicha key={codigoLote} codigoLote={codigoLote} />
}

function ContenidoFicha({ codigoLote }) {
  const {
    datos: ficha,
    cargando,
    error,
    recargar,
  } = useConsultaApi(() => obtenerFichaPublica(codigoLote), [codigoLote])

  let contenido = null

  if (cargando && !ficha) {
    contenido = (
      <p role="status" className="p-4 text-center text-sm text-cacao/70">
        Cargando información del producto…
      </p>
    )
  } else if (error && !ficha) {
    if (error.status === 404) {
      contenido = (
        <div className="space-y-4 rounded-xl border border-cacao/15 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-cacao">Producto no encontrado</h1>
          <p className="text-sm text-cacao">
            No encontramos un producto con el código {codigoLote}. Revise el código impreso o escanee de nuevo el QR.
          </p>
          <FormularioConsultaFicha />
        </div>
      )
    } else {
      contenido = (
        <div className="space-y-4">
          <MensajeError error={error} titulo="No se pudo consultar el producto" />
          <button
            type="button"
            onClick={recargar}
            className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
          >
            Reintentar
          </button>
        </div>
      )
    }
  } else if (ficha) {
    let estadoClase = 'bg-mazorca text-cacao'
    let tituloEstado = 'Aún no está disponible para la venta'
    let esAlerta = false

    if (ficha.estado === 'BLOQUEADO') {
      estadoClase = 'bg-red-700 text-white'
      tituloEstado = 'Producto retenido: no está disponible para la venta'
      esAlerta = true
    } else if (ficha.disponibleParaVenta) {
      estadoClase = 'bg-origen text-white'
      tituloEstado = 'Disponible para la venta'
    }

    const recorrido = Array.isArray(ficha.recorrido) ? ficha.recorrido : []

    contenido = (
      <div className="space-y-6">
        {cargando && (
          <p role="status" className="text-xs text-cacao/70">
            Actualizando…
          </p>
        )}

        {error && <MensajeError error={error} titulo="Error al actualizar la información" />}

        {/* Bloque de estado destacado */}
        <div
          role={esAlerta ? 'alert' : 'status'}
          className={`sello rounded-lg p-5 shadow-xs ${estadoClase}`}
        >
          <p className="text-lg font-bold">{tituloEstado}</p>
          <p className="mt-1 text-sm opacity-95">{ficha.mensajeEstado}</p>
        </div>

        {/* Producto y código */}
        <div className="space-y-4 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs">
          <h1 className="text-2xl font-bold text-cacao">
            {ficha.producto} · Lote {ficha.codigoLote}
          </h1>

          {/* Origen */}
          <section aria-labelledby="titulo-origen-publico" className="space-y-2 border-t border-cacao/10 pt-4">
            <h2 id="titulo-origen-publico" className="text-lg font-semibold text-cacao">
              Origen
            </h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-cacao/70">Finca</dt>
                <dd className="font-semibold">{ficha.origen?.finca || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-cacao/70">Municipio</dt>
                <dd className="font-semibold">{ficha.origen?.municipio || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-cacao/70">Departamento</dt>
                <dd className="font-semibold">{ficha.origen?.departamento || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-cacao/70">Variedad de cacao</dt>
                <dd className="font-semibold">{ficha.origen?.variedadCacao || '—'}</dd>
              </div>
            </dl>
            <p className="pt-2 text-xs text-cacao/80">
              Recibido en acopio el {formatearFecha(ficha.fechaRecepcionOrigen)}
            </p>
          </section>

          {/* Recorrido */}
          <section aria-labelledby="titulo-recorrido-publico" className="space-y-3 border-t border-cacao/10 pt-4">
            <h2 id="titulo-recorrido-publico" className="text-lg font-semibold text-cacao">
              Recorrido
            </h2>
            <ol className="traza visible space-y-3">
              {recorrido.map((paso, indice) => (
                <li key={paso.orden} className="relative" style={{ '--i': indice }}>
                  <p className="text-sm font-semibold text-cacao">{paso.nombre}</p>
                  <p className="text-xs text-cacao/70">{formatearFecha(paso.fecha)}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Fecha y hora de consulta */}
          <p className="border-t border-cacao/10 pt-3 text-xs text-cacao/70">
            Consultado el {formatearFechaHora(ficha.consultadoEn)}
          </p>
        </div>

        {/* Enlace para consultar otro producto */}
        <div className="pt-2 text-center">
          <Link
            to="/ficha"
            className={`text-xs font-semibold text-cacao/80 underline hover:text-cacao ${FOCO}`}
          >
            Consultar otro producto
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-crema text-cacao">
      <EncabezadoPublico />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        {contenido}
      </main>
      <PiePublico />
    </div>
  )
}
