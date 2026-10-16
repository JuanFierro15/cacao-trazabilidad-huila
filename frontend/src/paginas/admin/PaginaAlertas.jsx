import { useState } from 'react'
import { obtenerAlertas } from '../../api/servicios.js'
import { ListaAlertas } from '../../componentes/ListaAlertas.jsx'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function PaginaAlertas() {
  const [soloActivas, setSoloActivas] = useState(true)
  const [textoLote, setTextoLote] = useState('')
  const [loteFiltro, setLoteFiltro] = useState('')

  const filtros = {}
  if (soloActivas) {
    filtros.activa = true
  }
  if (loteFiltro) {
    filtros.loteCodigo = loteFiltro
  }

  const { datos: alertas, cargando, error, recargar } = useConsultaApi(
    () => obtenerAlertas(filtros),
    [filtros],
  )

  const manejarFiltrar = (e) => {
    e.preventDefault()
    setLoteFiltro(textoLote.trim().toUpperCase())
  }

  const manejarLimpiar = () => {
    setTextoLote('')
    setLoteFiltro('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas</h1>
        <p className="mt-1 text-cacao/80">
          Control de desviaciones en recepción y transformación de cacao.
        </p>
      </div>

      <section aria-labelledby="titulo-filtros-alertas" className="rounded-lg border border-cacao/20 bg-white p-4 shadow-sm">
        <h2 id="titulo-filtros-alertas" className="sr-only">
          Filtros de alertas
        </h2>
        <form noValidate onSubmit={manejarFiltrar} className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={soloActivas}
              onChange={(e) => setSoloActivas(e.target.checked)}
              className={`h-4 w-4 rounded border-cacao/40 text-cacao accent-mazorca ${FOCO}`}
            />
            Solo alertas activas
          </label>

          <div className="flex items-center gap-2">
            <label htmlFor="filtro-codigo-lote" className="text-sm font-medium">
              Código de lote
            </label>
            <input
              id="filtro-codigo-lote"
              type="text"
              value={textoLote}
              onChange={(e) => setTextoLote(e.target.value)}
              placeholder="Ej. CAC001"
              className={`rounded-md border border-cacao/30 bg-white px-3 py-1.5 text-sm uppercase ${FOCO}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className={`rounded-md bg-cacao px-4 py-1.5 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={manejarLimpiar}
              className={`rounded-md border border-cacao/30 px-3 py-1.5 text-sm font-semibold text-cacao hover:bg-cacao/10 ${FOCO}`}
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="titulo-lista-alertas" className="space-y-3">
        <h2 id="titulo-lista-alertas" className="sr-only">
          Listado de alertas
        </h2>

        {cargando && alertas && (
          <p role="status" className="text-xs text-cacao/70">
            Actualizando…
          </p>
        )}

        {error && (
          <div className="space-y-3">
            <MensajeError error={error} titulo="No se pudieron cargar las alertas" />
            {!alertas && (
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

        {cargando && !alertas ? (
          <p role="status">Cargando alertas…</p>
        ) : (
          alertas && (
            alertas.length === 0 ? (
              <p className="rounded-md border border-cacao/20 bg-white p-4 text-sm">
                No hay alertas con estos filtros.
              </p>
            ) : (
              <ListaAlertas alertas={alertas} mostrarLote={true} />
            )
          )
        )}
      </section>
    </div>
  )
}
