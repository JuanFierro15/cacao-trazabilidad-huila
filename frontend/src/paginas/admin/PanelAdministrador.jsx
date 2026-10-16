import { obtenerLotes } from '../../api/servicios.js'
import { useAuth } from '../../auth/useAuth.js'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { TablaLotes } from '../../componentes/TablaLotes.jsx'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

export function PanelAdministrador() {
  const { sesion } = useAuth()
  const { datos: lotes, cargando, error, recargar } = useConsultaApi(() => obtenerLotes(), [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel del administrador</h1>
        <p className="mt-1 text-cacao/80">Hola, {sesion?.nombreCompleto}.</p>
      </div>

      <section aria-labelledby="titulo-inventario" className="space-y-3">
        <div>
          <h2 id="titulo-inventario" className="text-lg font-semibold">
            Inventario de lotes
          </h2>
          <p className="text-sm text-cacao/80">Recibido, consumido y disponible por lote.</p>
        </div>
        {cargando ? (
          <p role="status">Cargando lotes…</p>
        ) : error ? (
          <div className="space-y-3">
            <MensajeError error={error} titulo="No se pudo cargar el inventario" />
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
