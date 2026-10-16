import { formatearKg, formatearNumero } from '../utilidades/formato.js'

export function FichaProductor({ productor }) {
  if (!productor) return null

  const municipioVereda = productor.vereda
    ? `${productor.municipio} · ${productor.vereda}`
    : productor.municipio

  return (
    <div className="rounded-lg border border-cacao/15 bg-white p-3 shadow-xs">
      <h3 className="sr-only">Datos del productor y finca</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-cacao/70">Finca</dt>
          <dd className="font-semibold">{productor.nombreFinca}</dd>
        </div>
        <div>
          <dt className="text-xs text-cacao/70">Municipio</dt>
          <dd className="font-semibold">{municipioVereda}</dd>
        </div>
        <div>
          <dt className="text-xs text-cacao/70">Hectáreas productivas</dt>
          <dd className="font-semibold">{formatearNumero(productor.hectareasProductivas, 2)} ha</dd>
        </div>
        <div>
          <dt className="text-xs text-cacao/70">Variedad</dt>
          <dd className="font-semibold">{productor.variedadCacao}</dd>
        </div>
        <div>
          <dt className="text-xs text-cacao/70">Cuota máxima anual</dt>
          <dd className="font-semibold tabular-nums">{formatearKg(productor.cuotaMaximaKg)}</dd>
        </div>
        <div>
          <dt className="text-xs text-cacao/70">Entregado en el año</dt>
          <dd className="font-semibold tabular-nums">{formatearKg(productor.entregadoAnioKg)}</dd>
        </div>
      </dl>
    </div>
  )
}
