import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  obtenerBalance,
  obtenerReglas,
  obtenerTransformaciones,
} from '../../api/servicios.js'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import {
  formatearCop,
  formatearFecha,
  formatearKg,
  formatearPorcentaje,
  leerMonto,
} from '../../utilidades/formato.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

function BloqueBalance({ balance, titulo, esSimulacion }) {
  if (!balance) return null

  const haySobrecosto =
    balance.margenPorcentaje !== null &&
    balance.margenPorcentaje !== undefined &&
    balance.margenPorcentaje < 0

  return (
    <article className="space-y-4 rounded-lg border border-cacao/20 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cacao/10 pb-3">
        <h3 className="text-lg font-bold text-cacao">{titulo}</h3>
        {esSimulacion && (
          <span className="rounded bg-mazorca/20 px-2 py-0.5 text-xs font-semibold text-cacao">
            Simulación: no se guarda
          </span>
        )}
      </div>

      {!balance.calculable && balance.motivoNoCalculable && (
        <div
          role="status"
          className="rounded-md border border-mazorca/50 bg-mazorca/10 p-3 text-sm text-cacao"
        >
          <p className="font-semibold">Cálculo no disponible</p>
          <p className="mt-0.5">{balance.motivoNoCalculable}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
          <p className="text-xs text-cacao/70">Costo de la etapa</p>
          <p className="mt-1 font-semibold">
            {balance.costoEtapaCop === null || balance.costoEtapaCop === undefined
              ? 'No registrado'
              : formatearCop(balance.costoEtapaCop)}
          </p>
        </div>

        <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
          <p className="text-xs text-cacao/70">Kg salida vendible</p>
          <p className="mt-1 font-semibold">
            {balance.cantidadSalidaKg === null || balance.cantidadSalidaKg === undefined
              ? 'No calculable'
              : formatearKg(balance.cantidadSalidaKg)}
          </p>
        </div>

        <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
          <p className="text-xs text-cacao/70">Costo unitario</p>
          <p className="mt-1 font-semibold">
            {balance.costoUnitarioCop === null || balance.costoUnitarioCop === undefined
              ? 'No calculable'
              : `${formatearCop(balance.costoUnitarioCop)} por kg`}
          </p>
        </div>

        <div className="rounded-md border border-cacao/10 bg-crema/40 p-3">
          <p className="text-xs text-cacao/70">Precio de venta</p>
          <p className="mt-1 font-semibold">
            {balance.precioVentaCop === null || balance.precioVentaCop === undefined
              ? 'No registrado'
              : `${formatearCop(balance.precioVentaCop)} por kg`}
          </p>
        </div>

        <div className="rounded-md border border-cacao/10 bg-crema/40 p-3 sm:col-span-2 lg:col-span-2">
          <p className="text-xs text-cacao/70">Margen</p>
          <p
            className={`mt-1 font-semibold ${
              haySobrecosto ? 'text-red-700' : 'text-cacao'
            }`}
          >
            {balance.margenPorcentaje === null || balance.margenPorcentaje === undefined
              ? 'No calculable'
              : formatearPorcentaje(balance.margenPorcentaje)}
          </p>
          {haySobrecosto && (
            <p className="mt-1 text-xs font-semibold text-red-700">
              Sobrecosto: el precio no cubre el costo unitario
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 rounded-md border border-cacao/10 bg-cacao/5 p-3 text-xs">
        <p className="font-semibold text-cacao">Fórmulas aplicadas:</p>
        <p className="font-mono text-cacao/90">{balance.formulas?.costoUnitario}</p>
        <p className="font-mono text-cacao/90">{balance.formulas?.margen}</p>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-semibold">Costos incluidos: </span>
          <span className="text-cacao/90">
            {balance.costosIncluidos || 'No se registró el detalle de costos'}
          </span>
        </p>

        {Array.isArray(balance.supuestos) && balance.supuestos.length > 0 && (
          <div>
            <p className="font-semibold">Supuestos:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-cacao/80">
              {balance.supuestos.map((supuesto, indice) => (
                <li key={indice}>{supuesto}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  )
}

function DetalleTransformacionSeleccionada({ transformacionId }) {
  const {
    datos: balanceRegistrado,
    cargando: cargandoBalance,
    error: errorBalance,
    recargar: recargarBalance,
  } = useConsultaApi(() => obtenerBalance(transformacionId), [transformacionId])

  const [precioEscrito, setPrecioEscrito] = useState('')
  const [balanceSimulado, setBalanceSimulado] = useState(null)
  const [simulando, setSimulando] = useState(false)
  const [errorSimulacion, setErrorSimulacion] = useState(null)
  const [errorCampoPrecio, setErrorCampoPrecio] = useState(null)
  const refCampoPrecio = useRef(null)
  const refSeccion = useRef(null)

  // Al elegir una transformación el detalle aparece debajo de la lista: se lleva el foco
  // (y la vista) hasta él en el siguiente ciclo, cuando ya está en el documento.
  useEffect(() => {
    const temporizador = setTimeout(() => refSeccion.current?.focus(), 0)
    return () => clearTimeout(temporizador)
  }, [])

  const manejarSimular = async (e) => {
    e.preventDefault()
    setErrorSimulacion(null)
    setErrorCampoPrecio(null)
    // Un resultado anterior con otro precio no debe quedar a la vista junto a un error nuevo.
    setBalanceSimulado(null)

    const monto = leerMonto(precioEscrito)
    if (monto === null) {
      setErrorCampoPrecio('Escriba el precio que quiere simular, por ejemplo 30.000.')
      refCampoPrecio.current?.focus()
      return
    }
    if (Number.isNaN(monto)) {
      setErrorCampoPrecio('Escriba el precio en pesos, por ejemplo 30.000.')
      refCampoPrecio.current?.focus()
      return
    }

    setSimulando(true)
    try {
      const res = await obtenerBalance(transformacionId, monto)
      setBalanceSimulado(res)
    } catch (err) {
      const errorPrecio = err.errores?.find((item) => item.campo === 'precioVentaCop')
      if (err.status === 400 && errorPrecio) {
        setErrorCampoPrecio(errorPrecio.mensaje)
        refCampoPrecio.current?.focus()
      } else {
        setErrorSimulacion(err)
      }
    } finally {
      setSimulando(false)
    }
  }

  const volverAlPrecioRegistrado = () => {
    setBalanceSimulado(null)
    setErrorSimulacion(null)
    setErrorCampoPrecio(null)
  }

  return (
    <section
      ref={refSeccion}
      tabIndex={-1}
      aria-labelledby="titulo-detalle-balance"
      className="space-y-4 focus:outline-none"
    >
      <h2 id="titulo-detalle-balance" className="sr-only">
        Detalle del balance económico
      </h2>

      {cargandoBalance && balanceRegistrado && (
        <p role="status" className="text-xs text-cacao/70">
          Actualizando balance…
        </p>
      )}

      {errorBalance && (
        <div className="space-y-3">
          <MensajeError
            error={errorBalance}
            titulo="No se pudo cargar el balance de la transformación"
          />
          {!balanceRegistrado && (
            <button
              type="button"
              onClick={recargarBalance}
              className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {cargandoBalance && !balanceRegistrado ? (
        <p role="status">Cargando balance…</p>
      ) : (
        balanceRegistrado && (
          <div className="space-y-6">
            <BloqueBalance
              balance={balanceRegistrado}
              titulo="Balance registrado"
              esSimulacion={false}
            />

            <section
              aria-labelledby="titulo-simulador"
              className="space-y-4 rounded-lg border border-cacao/20 bg-white p-4 shadow-sm"
            >
              <h3 id="titulo-simulador" className="text-base font-semibold">
                Simulador de precio de venta
              </h3>
              <form noValidate onSubmit={manejarSimular} className="space-y-3">
                <div>
                  <label
                    htmlFor="campo-precio-simular"
                    className="block text-sm font-medium"
                  >
                    Precio de venta para simular (COP por kg)
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <input
                      ref={refCampoPrecio}
                      id="campo-precio-simular"
                      type="text"
                      inputMode="decimal"
                      value={precioEscrito}
                      onChange={(e) => {
                        setPrecioEscrito(e.target.value)
                        setErrorCampoPrecio(null)
                      }}
                      aria-invalid={errorCampoPrecio ? true : undefined}
                      aria-describedby={
                        errorCampoPrecio ? 'error-precio-simular' : undefined
                      }
                      placeholder="Ej. 30.000"
                      className={`w-52 rounded-md border ${
                        errorCampoPrecio ? 'border-red-600' : 'border-cacao/30'
                      } bg-white px-3 py-1.5 text-sm ${FOCO}`}
                    />
                    <button
                      type="submit"
                      disabled={simulando}
                      className={`rounded-md bg-cacao px-4 py-1.5 text-sm font-semibold text-crema hover:bg-cacao/90 disabled:opacity-60 ${FOCO}`}
                    >
                      {simulando ? 'Simulando…' : 'Simular'}
                    </button>
                    {balanceSimulado && (
                      <button
                        type="button"
                        onClick={volverAlPrecioRegistrado}
                        className={`rounded-md border border-cacao/30 px-3 py-1.5 text-sm font-semibold text-cacao hover:bg-cacao/10 ${FOCO}`}
                      >
                        Volver al precio registrado
                      </button>
                    )}
                  </div>
                  {errorCampoPrecio && (
                    <p
                      id="error-precio-simular"
                      role="alert"
                      className="mt-1 text-xs font-medium text-red-700"
                    >
                      {errorCampoPrecio}
                    </p>
                  )}
                </div>
              </form>

              {errorSimulacion && (
                <MensajeError
                  error={errorSimulacion}
                  titulo="No se pudo calcular la simulación"
                />
              )}

              {balanceSimulado && (
                <div className="mt-4 border-t border-cacao/10 pt-4">
                  <BloqueBalance
                    balance={balanceSimulado}
                    titulo={`Simulación con precio de ${formatearCop(
                      balanceSimulado.precioVentaCop,
                    )}`}
                    esSimulacion={true}
                  />
                </div>
              )}
            </section>
          </div>
        )
      )}
    </section>
  )
}

export function PaginaBalance() {
  const [searchParams, setSearchParams] = useSearchParams()
  const transformacionIdParam = searchParams.get('transformacion')

  const {
    datos: transformaciones,
    cargando: cargandoTransformaciones,
    error: errorTransformaciones,
    recargar: recargarTransformaciones,
  } = useConsultaApi(() => obtenerTransformaciones(), [])

  const { datos: reglas } = useConsultaApi(() => obtenerReglas(), [])

  const obtenerNombreEtapa = useCallback(
    (codigo) => {
      const etapaEncontrada = reglas?.etapas?.find((e) => e.codigo === codigo)
      return etapaEncontrada ? etapaEncontrada.nombre : codigo
    },
    [reglas],
  )

  const seleccionarTransformacion = (id) => {
    setSearchParams({ transformacion: String(id) })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Balance económico</h1>
        <p className="mt-1 text-cacao/80">
          Costo unitario, margen sobre venta y simulación de precios por transformación.
        </p>
      </div>

      <section aria-labelledby="titulo-transformaciones" className="space-y-3">
        <h2 id="titulo-transformaciones" className="text-lg font-semibold">
          Transformaciones registradas
        </h2>

        {cargandoTransformaciones && transformaciones && (
          <p role="status" className="text-xs text-cacao/70">
            Actualizando…
          </p>
        )}

        {errorTransformaciones && (
          <div className="space-y-3">
            <MensajeError
              error={errorTransformaciones}
              titulo="No se pudieron cargar las transformaciones"
            />
            {!transformaciones && (
              <button
                type="button"
                onClick={recargarTransformaciones}
                className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        {cargandoTransformaciones && !transformaciones ? (
          <p role="status">Cargando transformaciones…</p>
        ) : !transformaciones || transformaciones.length === 0 ? (
          <p className="rounded-md border border-cacao/20 bg-white p-4 text-sm">
            Todavía no hay transformaciones registradas.
          </p>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {transformaciones.map((t) => {
                const estaSeleccionada = String(t.id) === String(transformacionIdParam)
                return (
                  <li
                    key={t.id}
                    className={`rounded-lg border p-4 shadow-sm ${
                      estaSeleccionada
                        ? 'border-mazorca bg-mazorca/5'
                        : 'border-cacao/20 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold">
                        {t.loteSalidaCodigo || 'Sin lote de salida'}
                      </p>
                      {estaSeleccionada && (
                        <span className="rounded bg-mazorca/20 px-2 py-0.5 text-xs font-semibold text-cacao">
                          Seleccionada
                        </span>
                      )}
                    </div>
                    <p className="text-sm">
                      <span className="text-cacao/80">Lote de origen: </span>
                      <span className="font-medium">{t.loteOrigenCodigo}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-cacao/80">Etapa: </span>
                      <span className="font-medium">{obtenerNombreEtapa(t.etapa)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-cacao/80">Fecha: </span>
                      <span>{formatearFecha(t.fechaTransformacion)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-cacao/80">Entrada → Salida: </span>
                      <span className="font-medium">
                        {formatearKg(t.cantidadEntrada)} → {formatearKg(t.cantidadSalida)}
                      </span>
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => seleccionarTransformacion(t.id)}
                        className={`rounded-md bg-cacao px-3 py-1.5 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
                      >
                        Ver balance
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="hidden overflow-x-auto rounded-lg border border-cacao/20 bg-white md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Transformaciones registradas</caption>
                <thead className="bg-cacao/5">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Lote de salida</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Lote de origen</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Etapa</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Fecha</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">Entrada → Salida</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {transformaciones.map((t) => {
                    const estaSeleccionada = String(t.id) === String(transformacionIdParam)
                    return (
                      <tr
                        key={t.id}
                        className={`border-t border-cacao/10 ${
                          estaSeleccionada ? 'bg-mazorca/5' : ''
                        }`}
                      >
                        <td className="px-4 py-2 font-bold">
                          {t.loteSalidaCodigo || 'Sin lote de salida'}
                        </td>
                        <td className="px-4 py-2">{t.loteOrigenCodigo}</td>
                        <td className="px-4 py-2">{obtenerNombreEtapa(t.etapa)}</td>
                        <td className="px-4 py-2">{formatearFecha(t.fechaTransformacion)}</td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {formatearKg(t.cantidadEntrada)} → {formatearKg(t.cantidadSalida)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => seleccionarTransformacion(t.id)}
                              className={`rounded-md bg-cacao px-3 py-1 text-xs font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
                            >
                              Ver balance
                            </button>
                            {estaSeleccionada && (
                              <span className="text-xs font-semibold text-mazorca">
                                Seleccionada
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {transformacionIdParam && (
        <DetalleTransformacionSeleccionada
          key={transformacionIdParam}
          transformacionId={transformacionIdParam}
        />
      )}
    </div>
  )
}
