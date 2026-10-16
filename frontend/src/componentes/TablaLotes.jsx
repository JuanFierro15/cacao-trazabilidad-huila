import { formatearKg } from '../utilidades/formato.js'
import { InsigniaEstado } from './InsigniaEstado.jsx'

function textoOrigen(lote) {
  const finca = lote.productor?.nombreFinca
  return [finca, lote.origenMunicipio].filter(Boolean).join(' · ') || '—'
}

export function TablaLotes({ lotes }) {
  if (!Array.isArray(lotes) || lotes.length === 0) {
    return <p className="rounded-md border border-cacao/20 bg-white p-4 text-sm">No hay lotes registrados.</p>
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {lotes.map((lote) => (
          <li key={lote.codigoLote} className="rounded-lg border border-cacao/20 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold">{lote.codigoLote}</p>
              <InsigniaEstado estado={lote.estado} />
            </div>
            <p className="text-sm">{lote.producto}</p>
            <p className="text-sm text-cacao/80">{textoOrigen(lote)}</p>
            <p className="mt-2 text-sm">
              <span className="text-cacao/80">Disponible: </span>
              <span className="font-semibold">{formatearKg(lote.cantidadDisponible)}</span>
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-cacao/20 bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Lotes con cantidades recibida, consumida y disponible</caption>
          <thead className="bg-cacao/5">
            <tr>
              <th scope="col" className="px-4 py-2 font-semibold">Código</th>
              <th scope="col" className="px-4 py-2 font-semibold">Producto</th>
              <th scope="col" className="px-4 py-2 font-semibold">Origen</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Recibido</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Consumido</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Disponible</th>
              <th scope="col" className="px-4 py-2 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((lote) => (
              <tr key={lote.codigoLote} className="border-t border-cacao/10">
                <th scope="row" className="px-4 py-2 font-bold">{lote.codigoLote}</th>
                <td className="px-4 py-2">{lote.producto}</td>
                <td className="px-4 py-2">{textoOrigen(lote)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatearKg(lote.cantidadRecibida)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatearKg(lote.cantidadConsumida)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatearKg(lote.cantidadDisponible)}</td>
                <td className="px-4 py-2">
                  <InsigniaEstado estado={lote.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
