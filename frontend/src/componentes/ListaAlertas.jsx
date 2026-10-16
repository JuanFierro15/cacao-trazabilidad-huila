import {
  etiquetaTipoAlerta,
  formatearKg,
  formatearNumero,
  formatearPorcentaje,
} from '../utilidades/formato.js'

function formatearValorAlerta(tipoAlerta, valor) {
  if (tipoAlerta === 'CUOTA_EXCEDIDA') {
    return formatearKg(valor)
  }
  if (['MERMA_ALTA', 'SOBRECOSTO', 'REGISTRO_INCOMPLETO'].includes(tipoAlerta)) {
    return formatearPorcentaje(valor)
  }
  return formatearNumero(valor)
}

export function ListaAlertas({ alertas }) {
  if (!Array.isArray(alertas) || alertas.length === 0) return null

  return (
    <div className="space-y-3">
      {alertas.map((alerta) => (
        <article
          key={alerta.id ?? `${alerta.tipoAlerta}-${alerta.loteCodigo}`}
          className="rounded-lg border border-mazorca/50 bg-mazorca/10 p-4 text-sm text-cacao"
        >
          <p className="font-bold">{etiquetaTipoAlerta(alerta.tipoAlerta)}</p>
          <p className="mt-1 font-medium text-cacao/90">{alerta.reglaAplicada}</p>
          <p className="mt-1 text-cacao/80">{alerta.causa}</p>
          <p className="mt-2 text-xs font-semibold text-cacao/90">
            Valor medido: {formatearValorAlerta(alerta.tipoAlerta, alerta.valorMedido)} · Umbral:{' '}
            {formatearValorAlerta(alerta.tipoAlerta, alerta.umbral)}
          </p>
        </article>
      ))}
    </div>
  )
}
