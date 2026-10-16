import { obtenerLotes } from '../../api/servicios.js'
import { useAuth } from '../../auth/useAuth.js'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { TablaLotes } from '../../componentes/TablaLotes.jsx'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

export function PanelOperador() {
  const { sesion } = useAuth()
  const { datos: lotes, cargando, error, recargar } = useConsultaApi(() => obtenerLotes(), [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel del operador</h1>
        <p className="mt-1 text-cacao/80">Hola, {sesion?.nombreCompleto}.</p>
      </div>

      <section aria-labelledby="titulo-lotes-operador" className="space-y-3">
        <h2 id="titulo-lotes-operador" className="text-lg font-semibold">
          Lotes registrados
        </h2>
        {cargando ? (
          <p role="status">Cargando lotes…</p>
        ) : error ? (
          <div className="space-y-3">
            <MensajeError error={error} titulo="No se pudieron cargar los lotes" />
            <button
              type="button"
              onClick={recargar}
              className="rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <TablaLotes lotes={lotes} />
        )}
      </section>
    </div>
  )
}
