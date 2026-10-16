import { useState } from 'react'
import {
  formatearCop,
  formatearKg,
  formatearNumero,
  formatearPorcentaje,
  leerDecimal,
  leerMonto,
} from '../utilidades/formato.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function EconomiaCircular({ transformacion, balance }) {
  const [porcentajeTexto, setPorcentajeTexto] = useState('70')
  const [valorTexto, setValorTexto] = useState('4500')

  const cantidadEntrada = Number(transformacion?.cantidadEntrada)
  const cantidadSalida = Number(transformacion?.cantidadSalida)

  const mermaFisica =
    Number.isFinite(cantidadEntrada) && Number.isFinite(cantidadSalida)
      ? cantidadEntrada - cantidadSalida
      : 0

  if (!Number.isFinite(mermaFisica) || mermaFisica <= 0) {
    return (
      <section
        aria-labelledby="titulo-economia-circular"
        className="space-y-4 rounded-lg border border-origen/50 bg-origen/5 p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-origen/20 pb-3">
          <h3 id="titulo-economia-circular" className="text-base font-bold text-cacao sm:text-lg">
            Economía circular: aprovechamiento de subproductos (Cascarilla HS 1802 / Biomasa)
          </h3>
          <span className="rounded bg-origen px-2.5 py-0.5 text-xs font-semibold text-white">
            Cálculo complementario
          </span>
        </div>
        <p className="rounded-md border border-cacao/15 bg-white p-4 text-sm text-cacao">
          Este lote tuvo 0 kg de merma física: no hay subproducto que aprovechar en esta transformación.
        </p>
      </section>
    )
  }

  const porcentajeNum = leerDecimal(porcentajeTexto)
  const valorNum = leerMonto(valorTexto)

  let errorPorcentaje = null
  if (porcentajeNum === null || Number.isNaN(porcentajeNum)) {
    errorPorcentaje = 'Escriba un porcentaje válido, por ejemplo 70.'
  } else if (porcentajeNum < 0 || porcentajeNum > 100) {
    errorPorcentaje = 'El porcentaje debe estar entre 0 y 100.'
  }

  let errorValor = null
  if (valorNum === null || Number.isNaN(valorNum)) {
    errorValor = 'Escriba un valor comercial válido en pesos, por ejemplo 4.500.'
  } else if (valorNum < 0) {
    errorValor = 'El valor comercial no puede ser negativo.'
  }

  const hayError = Boolean(errorPorcentaje || errorValor)

  let kgAprovechables = null
  let ingresoExtra = null
  let costoUnitarioNeto = null
  let motivoNoCalculableCosto = null
  let margenImpulsado = null
  let motivoNoCalculableMargen = null

  if (!hayError && porcentajeNum !== null && valorNum !== null) {
    kgAprovechables = mermaFisica * (porcentajeNum / 100)
    ingresoExtra = kgAprovechables * valorNum

    const costoEtapaCop = balance?.costoEtapaCop
    const salidaKg = balance?.cantidadSalidaKg ?? (cantidadSalida > 0 ? cantidadSalida : null)

    if (costoEtapaCop === null || costoEtapaCop === undefined) {
      motivoNoCalculableCosto = 'No calculable: la transformación no tiene costo de etapa registrado.'
    } else if (!salidaKg || salidaKg <= 0) {
      motivoNoCalculableCosto = 'No calculable: la salida vendible es 0 kg (división entre cero).'
    } else {
      costoUnitarioNeto = (costoEtapaCop - ingresoExtra) / salidaKg
    }

    const precioVentaCop = balance?.precioVentaCop
    if (precioVentaCop === null || precioVentaCop === undefined) {
      motivoNoCalculableMargen =
        'No calculable: la transformación no tiene precio de venta registrado; use el simulador de precio de arriba como referencia.'
    } else if (costoUnitarioNeto === null) {
      motivoNoCalculableMargen = 'No calculable: no se pudo determinar el costo unitario neto.'
    } else if (precioVentaCop <= 0) {
      motivoNoCalculableMargen = 'No calculable: el precio de venta registrado es 0.'
    } else {
      margenImpulsado = ((precioVentaCop - costoUnitarioNeto) / precioVentaCop) * 100
    }
  }

  const costoTradicional = balance?.costoUnitarioCop
  const tieneCostoNeto = costoUnitarioNeto !== null && Number.isFinite(costoUnitarioNeto)
  const tieneCostoTradicional = typeof costoTradicional === 'number' && Number.isFinite(costoTradicional)

  const diferenciaCosto =
    tieneCostoTradicional && tieneCostoNeto ? costoTradicional - costoUnitarioNeto : null

  const margenOficial = balance?.margenPorcentaje
  const tieneMargenImpulsado = margenImpulsado !== null && Number.isFinite(margenImpulsado)
  const tieneMargenOficial = typeof margenOficial === 'number' && Number.isFinite(margenOficial)

  const diferenciaMargen =
    tieneMargenImpulsado && tieneMargenOficial ? margenImpulsado - margenOficial : null

  const maxCostoComparativo =
    tieneCostoTradicional && tieneCostoNeto
      ? Math.max(costoTradicional, costoUnitarioNeto, 1)
      : 1

  return (
    <section
      aria-labelledby="titulo-economia-circular"
      className="space-y-5 rounded-lg border border-origen/50 bg-origen/5 p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-origen/20 pb-3">
        <h3 id="titulo-economia-circular" className="text-base font-bold text-cacao sm:text-lg">
          Economía circular: aprovechamiento de subproductos (Cascarilla HS 1802 / Biomasa)
        </h3>
        <span className="rounded bg-origen px-2.5 py-0.5 text-xs font-semibold text-white">
          Cálculo complementario
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="campo-porcentaje-recuperable" className="block text-sm font-semibold text-cacao">
            Porcentaje de merma recuperable como subproducto (%)
          </label>
          <input
            id="campo-porcentaje-recuperable"
            type="text"
            inputMode="decimal"
            value={porcentajeTexto}
            onChange={(e) => setPorcentajeTexto(e.target.value)}
            aria-invalid={Boolean(errorPorcentaje)}
            aria-describedby={errorPorcentaje ? 'error-porcentaje-recuperable' : undefined}
            className={`mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm text-cacao ${FOCO} ${
              errorPorcentaje ? 'border-red-700 bg-red-50/20' : 'border-cacao/30'
            }`}
          />
          {errorPorcentaje && (
            <p id="error-porcentaje-recuperable" role="alert" className="mt-1 text-xs font-medium text-red-700">
              {errorPorcentaje}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="campo-valor-subproducto" className="block text-sm font-semibold text-cacao">
            Valor comercial del subproducto (COP por kg)
          </label>
          <input
            id="campo-valor-subproducto"
            type="text"
            inputMode="decimal"
            value={valorTexto}
            onChange={(e) => setValorTexto(e.target.value)}
            aria-invalid={Boolean(errorValor)}
            aria-describedby={errorValor ? 'error-valor-subproducto' : undefined}
            className={`mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm text-cacao ${FOCO} ${
              errorValor ? 'border-red-700 bg-red-50/20' : 'border-cacao/30'
            }`}
          />
          {errorValor && (
            <p id="error-valor-subproducto" role="alert" className="mt-1 text-xs font-medium text-red-700">
              {errorValor}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-cacao/70">
        Valores de ejemplo editables (p. ej. cascarilla tostada para infusión o abono orgánico); no son precios de mercado.
      </p>

      {!hayError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Tarjeta 1: Kg de subproducto aprovechable */}
          <div className="rounded-lg border border-cacao/15 bg-white p-4 shadow-xs space-y-1">
            <p className="text-xs font-medium text-cacao/70">Kg de subproducto aprovechable</p>
            <p className="font-display text-3xl font-bold tabular-nums text-cacao">
              {formatearKg(kgAprovechables)}
            </p>
            <p className="text-xs text-cacao/70">
              Sobre {formatearKg(mermaFisica)} de merma física registrada.
            </p>
          </div>

          {/* Tarjeta 2: Ingreso extra por economía circular */}
          <div className="rounded-lg border border-cacao/15 bg-white p-4 shadow-xs space-y-1">
            <p className="text-xs font-medium text-cacao/70">Ingreso extra por economía circular</p>
            <p className="font-display text-3xl font-bold tabular-nums text-origen">
              {formatearCop(ingresoExtra)}
            </p>
            <p className="text-xs text-cacao/70">
              Valorizado a {formatearCop(valorNum)} por kg de subproducto.
            </p>
          </div>

          {/* Tarjeta 3: Costo unitario neto */}
          <div className="rounded-lg border border-cacao/15 bg-white p-4 shadow-xs space-y-2 sm:col-span-1">
            <p className="text-xs font-medium text-cacao/70">Costo unitario neto con economía circular</p>
            {tieneCostoNeto ? (
              <>
                <p className="font-display text-3xl font-bold tabular-nums text-cacao">
                  {formatearCop(costoUnitarioNeto)}
                  <span className="ml-1 text-sm font-sans font-normal text-cacao/70">por kg</span>
                </p>
                <div className="grid grid-cols-2 gap-2 border-t border-cacao/10 pt-2 text-xs">
                  <div>
                    <span className="text-cacao/70">Tradicional: </span>
                    <span className="font-semibold tabular-nums text-cacao">
                      {tieneCostoTradicional ? `${formatearCop(costoTradicional)}/kg` : 'No registrado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-cacao/70">Con economía circular: </span>
                    <span className="font-semibold tabular-nums text-cacao">
                      {`${formatearCop(costoUnitarioNeto)}/kg`}
                    </span>
                  </div>
                </div>
                {diferenciaCosto !== null && (
                  <p className="text-xs font-semibold text-origen">
                    Diferencia: reducción de {formatearCop(diferenciaCosto)} por kg.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-mazorca-oscuro">{motivoNoCalculableCosto}</p>
            )}
          </div>

          {/* Tarjeta 4: Margen impulsado con subproductos */}
          <div className="rounded-lg border border-cacao/15 bg-white p-4 shadow-xs space-y-2 sm:col-span-1">
            <p className="text-xs font-medium text-cacao/70">Margen impulsado con subproductos (%)</p>
            {tieneMargenImpulsado ? (
              <>
                <p className="font-display text-3xl font-bold tabular-nums text-cacao">
                  {formatearPorcentaje(margenImpulsado)}
                </p>
                <div className="grid grid-cols-2 gap-2 border-t border-cacao/10 pt-2 text-xs">
                  <div>
                    <span className="text-cacao/70">Margen oficial: </span>
                    <span className="font-semibold tabular-nums text-cacao">
                      {tieneMargenOficial ? formatearPorcentaje(margenOficial) : 'No registrado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-cacao/70">Con subproductos: </span>
                    <span className="font-semibold tabular-nums text-cacao">
                      {formatearPorcentaje(margenImpulsado)}
                    </span>
                  </div>
                </div>
                {diferenciaMargen !== null && (
                  <p className="text-xs font-semibold text-origen">
                    Diferencia:{' '}
                    {diferenciaMargen >= 0
                      ? `+${formatearNumero(diferenciaMargen, 2)}`
                      : formatearNumero(diferenciaMargen, 2)}{' '}
                    puntos porcentuales.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-mazorca-oscuro">{motivoNoCalculableMargen}</p>
            )}
          </div>
        </div>
      )}

      {/* Barra comparativa proporcional de costo */}
      {!hayError && tieneCostoNeto && tieneCostoTradicional && (
        <div className="space-y-2 rounded-lg border border-cacao/15 bg-white p-4 shadow-xs" aria-hidden="true">
          <p className="text-xs font-semibold text-cacao">
            Comparación de costo unitario por kg
          </p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-cacao/70 mb-1">
                <span>Tradicional</span>
                <span className="font-semibold tabular-nums text-cacao">{formatearCop(costoTradicional)} / kg</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-arena/50">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, (costoTradicional / maxCostoComparativo) * 100))}%` }}
                  className="h-full rounded-full bg-cacao"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-cacao/70 mb-1">
                <span>Con economía circular</span>
                <span className="font-semibold tabular-nums text-cacao">{formatearCop(costoUnitarioNeto)} / kg</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-arena/50">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, (costoUnitarioNeto / maxCostoComparativo) * 100))}%` }}
                  className="h-full rounded-full bg-origen"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-cacao/70">
        Cálculo complementario de economía circular; el balance oficial del ejercicio se conserva arriba.
      </p>
    </section>
  )
}
