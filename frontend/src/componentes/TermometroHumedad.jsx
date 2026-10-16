import { evaluarHumedad } from '../utilidades/calidadCacao.js'
import { formatearKg, formatearPorcentaje, leerDecimal } from '../utilidades/formato.js'

export function TermometroHumedad({ humedadTexto, tipoGrano, cantidadTexto }) {
  const humedad = leerDecimal(humedadTexto)
  const kg = leerDecimal(cantidadTexto)

  if (humedad === null || Number.isNaN(humedad)) {
    return null
  }

  if (tipoGrano === 'BABA') {
    return (
      <p className="pt-1 text-xs text-cacao/70">
        La referencia de humedad aplica al grano seco.
      </p>
    )
  }

  const evaluacion = evaluarHumedad(humedad, tipoGrano, kg)
  if (!evaluacion) {
    return null
  }

  const esCumple = evaluacion.nivel === 'cumple'
  const esExceso = evaluacion.nivel === 'exceso'
  const esBaja = evaluacion.nivel === 'baja'

  return (
    <article
      role="status"
      className="mt-2 space-y-3 rounded-lg border border-cacao/20 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-cacao/10 pb-2">
        <h3 className="text-sm font-semibold text-cacao">
          Termómetro de calidad · Referencia NTC 1252
        </h3>
        <span className="font-display text-2xl font-bold tabular-nums text-cacao">
          {formatearPorcentaje(evaluacion.humedad)}
        </span>
      </div>

      {/* Barra horizontal de humedad con escala de 0 a 12 % */}
      <div className="space-y-1" aria-hidden="true">
        <div className="relative py-1">
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            <div
              style={{ width: `${(6.5 / 12) * 100}%` }}
              className="h-full bg-arena"
            />
            <div
              style={{ width: `${(0.5 / 12) * 100}%` }}
              className="h-full bg-origen"
            />
            <div
              style={{ width: `${(5.0 / 12) * 100}%` }}
              className="h-full bg-mazorca-oscuro/40"
            />
          </div>

          <div
            style={{ left: `${evaluacion.posicionMarcador}%` }}
            className="absolute top-0 bottom-0 w-[3px] -translate-x-1/2 rounded-full bg-cacao transition-[left] duration-300 motion-reduce:transition-none"
          />
        </div>

        <div className="relative h-4 text-xs font-medium text-cacao/70">
          <span
            style={{ left: `${(6.5 / 12) * 100}%` }}
            className="absolute -translate-x-full pr-1 tabular-nums"
          >
            6,5 %
          </span>
          <span
            style={{ left: `${(7.0 / 12) * 100}%` }}
            className="absolute pl-1 tabular-nums"
          >
            7,0 %
          </span>
        </div>
      </div>

      {/* Mensaje de veredicto según el nivel evaluado */}
      <div
        className={`flex items-start gap-2.5 rounded-md p-3 text-sm ${
          esCumple
            ? 'border-2 border-origen bg-origen/10 text-cacao'
            : esExceso
              ? 'border-2 border-mazorca-oscuro bg-mazorca/15 text-cacao'
              : 'border-2 border-cacao/40 bg-arena/50 text-cacao'
        }`}
      >
        {esCumple && (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 size-5 shrink-0 text-origen"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {esExceso && (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 size-5 shrink-0 text-mazorca-oscuro"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {esBaja && (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 size-5 shrink-0 text-cacao"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .247.25v3.5a.75.75 0 0 0 1.5 0v-3.5A1.75 1.75 0 0 0 9.25 9H9Z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <div className="space-y-1">
          {esCumple && (
            <p>
              <span className="font-semibold">✓ Cumple la referencia NTC 1252 (máximo 7,0 %):</span>{' '}
              humedad óptima de grano seco para almacenamiento seguro y comercialización sin castigo de peso.
            </p>
          )}

          {esExceso && (
            <>
              <p>
                <span className="font-semibold text-mazorca-oscuro">
                  ⚠ Alerta NTC 1252 (más de 7,0 %):
                </span>{' '}
                exceso de humedad. Riesgo de moho en bodega; se recomienda secado adicional.
              </p>
              {evaluacion.aguaExcedenteKg !== null && (
                <p className="text-xs text-cacao/90">
                  Equivale a unos {formatearKg(evaluacion.aguaExcedenteKg)} de agua por encima del 7,0 % (cálculo sobre {formatearKg(kg)} recibidos).
                </p>
              )}
            </>
          )}

          {esBaja && (
            <p>
              <span className="font-semibold">ℹ Aviso NTC 1252 (menos de 6,5 %):</span>{' '}
              grano con baja humedad; controlar la fragilidad de la almendra en el tostado.
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-cacao/70">
        Referencia de calidad; verifique el límite vigente en la norma de ICONTEC.
      </p>
    </article>
  )
}
