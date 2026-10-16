import { etiquetaEstado } from '../utilidades/formato.js'

const CLASES_ESTADO = {
  PENDIENTE: 'bg-mazorca text-cacao',
  LIBERADO: 'bg-origen text-white',
  BLOQUEADO: 'bg-red-700 text-white',
}

// El estado siempre se muestra con texto; el color solo refuerza.
export function InsigniaEstado({ estado }) {
  const clases = CLASES_ESTADO[estado] ?? 'bg-cacao/10 text-cacao'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${clases}`}>
      {etiquetaEstado(estado)}
    </span>
  )
}
