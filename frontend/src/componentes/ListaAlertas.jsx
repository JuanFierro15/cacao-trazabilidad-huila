import { Link } from 'react-router'
import {
  etiquetaTipoAlerta,
  formatearFechaHora,
  formatearKg,
  formatearNumero,
  formatearPorcentaje,
} from '../utilidades/formato.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

function formatearValorAlerta(tipoAlerta, valor) {
  if (tipoAlerta === 'CUOTA_EXCEDIDA') {
    return formatearKg(valor)
  }
  if (['MERMA_ALTA', 'SOBRECOSTO', 'REGISTRO_INCOMPLETO'].includes(tipoAlerta)) {
    return formatearPorcentaje(valor)
  }
  return formatearNumero(valor)
}

export function ListaAlertas({ alertas, mostrarLote = false }) {
  if (!Array.isArray(alertas) || alertas.length === 0) return null

  return (
    <div className="space-y-3">
      {alertas.map((alerta) => (
        <article
          key={alerta.id ?? `${alerta.tipoAlerta}-${alerta.loteCodigo}`}
          className="rounded-lg border border-mazorca/50 bg-mazorca/10 p-4 text-sm text-cacao"
        >
          {mostrarLote && (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-mazorca/30 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <Link
                  to={`/lotes/${encodeURIComponent(alerta.loteCodigo)}/trazabilidad`}
                  className={`font-bold underline hover:text-cacao/80 ${FOCO}`}
                >
                  Lote {alerta.loteCodigo}
                </Link>
                <span className="text-cacao/60">·</span>
                <span className="text-cacao/80">{formatearFechaHora(alerta.fechaGeneracion)}</span>
              </div>
              <span className={`font-semibold ${alerta.activa ? 'text-red-700' : 'text-cacao/70'}`}>
                {alerta.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          )}
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

