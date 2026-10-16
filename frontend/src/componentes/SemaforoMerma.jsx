import { formatearKg, formatearPorcentaje } from '../utilidades/formato.js'
import { nivelMerma } from '../utilidades/merma.js'

export function SemaforoMerma({ merma, rendimiento, umbral, oficial = false, entrada, salida }) {
  // Sin el umbral de la API no se puede clasificar la merma: no se muestra nada.
  if (merma === null || merma === undefined || typeof umbral !== 'number') return null

  const nivel = nivelMerma(merma, umbral)
  const umbralTexto = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(umbral)

  const prefijo = oficial ? 'Merma oficial (calculada por el sistema): ' : 'Vista previa de la merma: '

  let mensajeNivel = ''
  if (nivel === 'verde') {
    mensajeNivel = 'Dentro de lo esperado (menos de 10 %).'
  } else if (nivel === 'ambar') {
    mensajeNivel = `Atención: entre 10 % y el umbral de ${umbralTexto} %.`
  } else if (nivel === 'rojo') {
    mensajeNivel = `Supera el umbral de ${umbralTexto} %: se genera una alerta de merma alta.`
  } else if (nivel === 'insumos') {
    const diferencia =
      typeof salida === 'number' && typeof entrada === 'number' ? salida - entrada : 0
    mensajeNivel = `Balance con insumos: la salida supera la entrada en ${formatearKg(diferencia)}.`
  }

  const esVerde = nivel === 'verde'
  const esAmbar = nivel === 'ambar'
  const esRojo = nivel === 'rojo'

  return (
    <div
      {...(!oficial ? { role: 'status', 'aria-live': 'polite' } : {})}
      className="rounded-lg border border-cacao/15 bg-white/60 p-3.5 text-sm text-cacao"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full transition-opacity ${
              esVerde ? 'bg-origen ring-2 ring-origen/40' : 'bg-origen/20'
            }`}
          />
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full transition-opacity ${
              esAmbar ? 'bg-mazorca ring-2 ring-mazorca/40' : 'bg-mazorca/20'
            }`}
          />
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full transition-opacity ${
              esRojo ? 'bg-red-700 ring-2 ring-red-700/40' : 'bg-red-700/20'
            }`}
          />
        </div>
        <p className="font-semibold">
          {prefijo}
          {formatearPorcentaje(merma)}
          {rendimiento !== null && rendimiento !== undefined && (
            <span className="font-normal text-cacao/80">
              {' '}
              · Rendimiento: {formatearPorcentaje(rendimiento)}
            </span>
          )}
        </p>
      </div>
      {mensajeNivel && <p className="mt-1.5 text-cacao/80">{mensajeNivel}</p>}
    </div>
  )
}
