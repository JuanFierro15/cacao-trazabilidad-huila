import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ErrorApi } from '../../api/cliente.js'
import { obtenerProductores, registrarLote } from '../../api/servicios.js'
import { FichaProductor } from '../../componentes/FichaProductor.jsx'
import { InsigniaEstado } from '../../componentes/InsigniaEstado.jsx'
import { ListaAlertas } from '../../componentes/ListaAlertas.jsx'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import {
  etiquetaTipoGrano,
  fechaHoyBogota,
  formatearFecha,
  formatearKg,
  formatearNumero,
  leerDecimal,
} from '../../utilidades/formato.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'
const ORDEN_CAMPOS = [
  'productorId',
  'fechaRecepcion',
  'tipoGrano',
  'porcentajeHumedad',
  'cantidadRecibida',
  'codigoLote',
]

export function PaginaRecepcion() {
  const {
    datos: productores,
    cargando: cargandoProductores,
    error: errorProductores,
    recargar: recargarProductores,
  } = useConsultaApi(() => obtenerProductores(), [])

  const [productorId, setProductorId] = useState('')
  const [fechaRecepcion, setFechaRecepcion] = useState(() => fechaHoyBogota())
  const [tipoGrano, setTipoGrano] = useState('')
  const [porcentajeHumedad, setPorcentajeHumedad] = useState('')
  const [cantidadRecibida, setCantidadRecibida] = useState('')
  const [codigoLote, setCodigoLote] = useState('')
  const [mostrarCodigoManual, setMostrarCodigoManual] = useState(false)

  const [erroresPorCampo, setErroresPorCampo] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const productorRef = useRef(null)
  const fechaRef = useRef(null)
  const tipoGranoSecoRef = useRef(null)
  const humedadRef = useRef(null)
  const cantidadRef = useRef(null)
  const codigoLoteRef = useRef(null)
  const tituloConfirmacionRef = useRef(null)

  const mapaRefs = {
    productorId: productorRef,
    fechaRecepcion: fechaRef,
    tipoGrano: tipoGranoSecoRef,
    porcentajeHumedad: humedadRef,
    cantidadRecibida: cantidadRef,
    codigoLote: codigoLoteRef,
  }

  useEffect(() => {
    if (resultado && tituloConfirmacionRef.current) {
      tituloConfirmacionRef.current.focus()
    }
  }, [resultado])

  const limpiarErrorCampo = (campo) => {
    setErroresPorCampo((prev) => {
      if (!prev[campo]) return prev
      const copia = { ...prev }
      delete copia[campo]
      return copia
    })
  }

  const productorSeleccionado = Array.isArray(productores)
    ? productores.find((p) => String(p.id) === String(productorId))
    : null

  // Es solo una vista previa informativa para el operador; la alerta oficial la decide el backend.
  const cantidadDecimal = leerDecimal(cantidadRecibida)
  const tieneCantidadValida =
    typeof cantidadDecimal === 'number' && Number.isFinite(cantidadDecimal) && cantidadDecimal > 0

  let vistaPreviaCuota = null
  if (productorSeleccionado && tieneCantidadValida) {
    const entregado = productorSeleccionado.entregadoAnioKg ?? 0
    const total = Math.round((entregado + cantidadDecimal) * 1000) / 1000
    const cuota = productorSeleccionado.cuotaMaximaKg
    const supera = total > cuota
    vistaPreviaCuota = {
      supera,
      mensaje: supera
        ? `Vista previa: con esta entrega, ${productorSeleccionado.nombreProductor} sumaría ${formatearNumero(total, 3)} kg en el año y superaría su cuota de ${formatearNumero(cuota, 3)} kg. La recepción se puede registrar; el sistema generará la alerta oficial.`
        : `Vista previa: dentro de la cuota (${formatearNumero(total, 3)} de ${formatearNumero(cuota, 3)} kg en el año).`,
    }
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setErrorGeneral(null)

    // Revisión local solo de formato: números válidos si se escribieron caracteres
    const humedadNum = leerDecimal(porcentajeHumedad)
    const cantidadNum = leerDecimal(cantidadRecibida)
    const erroresLocales = {}

    if (Number.isNaN(humedadNum)) {
      erroresLocales.porcentajeHumedad = 'Escriba un número válido (por ejemplo 120,5).'
    }
    if (Number.isNaN(cantidadNum)) {
      erroresLocales.cantidadRecibida = 'Escriba un número válido (por ejemplo 120,5).'
    }

    if (Object.keys(erroresLocales).length > 0) {
      setErroresPorCampo(erroresLocales)
      if (erroresLocales.porcentajeHumedad) {
        humedadRef.current?.focus()
      } else if (erroresLocales.cantidadRecibida) {
        cantidadRef.current?.focus()
      }
      return
    }

    const cuerpo = {
      codigoLote: codigoLote.trim() || null,
      productorId: productorId === '' ? null : Number(productorId),
      fechaRecepcion: fechaRecepcion || null,
      tipoGrano: tipoGrano || null,
      porcentajeHumedad: humedadNum,
      cantidadRecibida: cantidadNum,
    }

    try {
      setEnviando(true)
      const respuesta = await registrarLote(cuerpo)
      setErroresPorCampo({})
      setErrorGeneral(null)
      setResultado(respuesta)
      recargarProductores()
    } catch (err) {
      if (err instanceof ErrorApi) {
        if (err.codigo === 'VALIDACION') {
          const porCampo = {}
          const otros = []
          for (const item of err.errores) {
            if (item.campo && ORDEN_CAMPOS.includes(item.campo)) {
              porCampo[item.campo] = item.mensaje
            } else {
              otros.push(item)
            }
          }
          setErroresPorCampo(porCampo)
          if (otros.length > 0 || !err.errores?.length) {
            setErrorGeneral({ mensaje: err.mensaje, errores: otros })
          }
          if (porCampo.codigoLote) {
            setMostrarCodigoManual(true)
          }
          for (const campo of ORDEN_CAMPOS) {
            if (porCampo[campo] && mapaRefs[campo]?.current) {
              mapaRefs[campo].current.focus()
              break
            }
          }
          return
        }
        if (err.codigo === 'LOTE_DUPLICADO') {
          setMostrarCodigoManual(true)
          setErroresPorCampo({ codigoLote: err.mensaje })
          setTimeout(() => codigoLoteRef.current?.focus(), 0)
          return
        }
      }
      setErrorGeneral(err)
    } finally {
      setEnviando(false)
    }
  }

  const registrarOtroLote = () => {
    setProductorId('')
    setFechaRecepcion(fechaHoyBogota())
    setTipoGrano('')
    setPorcentajeHumedad('')
    setCantidadRecibida('')
    setCodigoLote('')
    setMostrarCodigoManual(false)
    setErroresPorCampo({})
    setErrorGeneral(null)
    setResultado(null)
    setTimeout(() => productorRef.current?.focus(), 0)
  }

  // Tras registrar un lote se recargan los productores; mientras tanto se sigue
  // mostrando la confirmación con los datos anteriores para no perder el foco.
  if (cargandoProductores && !productores) {
    return <p role="status">Cargando productores…</p>
  }

  if (errorProductores && !productores) {
    return (
      <div className="space-y-4">
        <MensajeError error={errorProductores} titulo="No se pudieron cargar los productores" />
        <button
          type="button"
          onClick={recargarProductores}
          className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (resultado) {
    const lote = resultado.lote
    const alertas = resultado.alertasGeneradas ?? []
    const productorResumen = lote.productor
      ? `${lote.productor.nombreProductor} · ${lote.productor.nombreFinca}`
      : '—'
    const humedadResumen =
      lote.porcentajeHumedad !== null && lote.porcentajeHumedad !== undefined
        ? `${formatearNumero(lote.porcentajeHumedad, 2)} %`
        : '—'

    return (
      <div className="space-y-6">
        <div>
          <h1
            ref={tituloConfirmacionRef}
            tabIndex={-1}
            className="text-2xl font-bold focus:outline-none"
          >
            {lote.codigoLote} registrado
          </h1>
          <p className="mt-1 text-sm text-cacao/80">
            La recepción de cacao se guardó correctamente en el sistema.
          </p>
        </div>

        <section aria-labelledby="titulo-resumen-lote" className="rounded-lg border border-cacao/20 bg-white p-5 shadow-xs">
          <h2 id="titulo-resumen-lote" className="text-base font-semibold">
            Resumen de la recepción
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs text-cacao/70">Productor</dt>
              <dd className="font-semibold">{productorResumen}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Origen</dt>
              <dd className="font-semibold">{lote.origenMunicipio}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Fecha de recepción</dt>
              <dd className="font-semibold">{formatearFecha(lote.fechaRecepcion)}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Tipo de grano</dt>
              <dd className="font-semibold">{etiquetaTipoGrano(lote.tipoGrano)}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Humedad</dt>
              <dd className="font-semibold">{humedadResumen}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Cantidad recibida</dt>
              <dd className="font-semibold tabular-nums">{formatearKg(lote.cantidadRecibida)}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Estado</dt>
              <dd className="mt-0.5">
                <InsigniaEstado estado={lote.estado} />
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="titulo-alertas-generadas" className="space-y-3">
          <h2 id="titulo-alertas-generadas" className="text-base font-semibold">
            Alertas generadas
          </h2>
          {alertas.length > 0 ? (
            <ListaAlertas alertas={alertas} />
          ) : (
            <p className="rounded-md border border-cacao/15 bg-white p-3 text-sm text-cacao/80">
              No se generaron alertas.
            </p>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={registrarOtroLote}
            className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
          >
            Registrar otro lote
          </button>
          <Link
            to={'/lotes/' + encodeURIComponent(lote.codigoLote) + '/trazabilidad'}
            className={`rounded-md border border-cacao/30 px-4 py-2 text-sm font-semibold hover:bg-cacao/5 ${FOCO}`}
          >
            Ver trazabilidad
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recepción de lotes</h1>
        <p className="mt-1 text-sm text-cacao/80">Registre el cacao que llega al centro de acopio.</p>
      </div>

      <form noValidate onSubmit={manejarEnvio} className="space-y-5">
        {/* Campo Productor */}
        <div className="space-y-1.5">
          <label htmlFor="campo-productor" className="block text-sm font-semibold">
            Productor
          </label>
          <select
            id="campo-productor"
            ref={productorRef}
            value={productorId}
            onChange={(e) => {
              setProductorId(e.target.value)
              limpiarErrorCampo('productorId')
            }}
            aria-invalid={Boolean(erroresPorCampo.productorId)}
            aria-describedby={erroresPorCampo.productorId ? 'error-productor' : undefined}
            className={`w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base text-cacao ${FOCO} ${
              erroresPorCampo.productorId ? 'border-red-700 bg-red-50/20' : 'border-cacao/30'
            }`}
          >
            <option value="">Seleccione un productor</option>
            {Array.isArray(productores) &&
              productores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigoProductor} · {p.nombreProductor} — {p.nombreFinca} ({p.municipio})
                </option>
              ))}
          </select>
          {erroresPorCampo.productorId && (
            <p id="error-productor" className="text-sm font-medium text-red-700">
              {erroresPorCampo.productorId}
            </p>
          )}

          {productorSeleccionado && (
            <div className="pt-2">
              <FichaProductor productor={productorSeleccionado} />
            </div>
          )}
        </div>

        {/* Campo Fecha de recepción */}
        <div className="space-y-1.5">
          <label htmlFor="campo-fecha" className="block text-sm font-semibold">
            Fecha de recepción
          </label>
          <input
            id="campo-fecha"
            type="date"
            ref={fechaRef}
            value={fechaRecepcion}
            onChange={(e) => {
              setFechaRecepcion(e.target.value)
              limpiarErrorCampo('fechaRecepcion')
            }}
            aria-invalid={Boolean(erroresPorCampo.fechaRecepcion)}
            aria-describedby={erroresPorCampo.fechaRecepcion ? 'error-fecha' : undefined}
            className={`w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base text-cacao ${FOCO} ${
              erroresPorCampo.fechaRecepcion ? 'border-red-700 bg-red-50/20' : 'border-cacao/30'
            }`}
          />
          {erroresPorCampo.fechaRecepcion && (
            <p id="error-fecha" className="text-sm font-medium text-red-700">
              {erroresPorCampo.fechaRecepcion}
            </p>
          )}
        </div>

        {/* Campo Tipo de grano */}
        <fieldset
          className="space-y-1.5"
          aria-describedby={erroresPorCampo.tipoGrano ? 'error-tipo-grano' : undefined}
        >
          <legend className="block text-sm font-semibold">Tipo de grano</legend>
          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <label
              className={`flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-3 text-base font-semibold transition-colors focus-within:ring-2 focus-within:ring-mazorca focus-within:ring-offset-2 ${
                tipoGrano === 'SECO'
                  ? 'border-cacao bg-cacao text-crema shadow-xs'
                  : 'border-cacao/30 bg-white text-cacao hover:bg-cacao/5'
              }`}
            >
              <input
                type="radio"
                name="tipoGrano"
                value="SECO"
                ref={tipoGranoSecoRef}
                checked={tipoGrano === 'SECO'}
                onChange={(e) => {
                  setTipoGrano(e.target.value)
                  limpiarErrorCampo('tipoGrano')
                }}
                className="size-4 accent-cacao"
                aria-invalid={Boolean(erroresPorCampo.tipoGrano)}
              />
              <span>Seco</span>
              {tipoGrano === 'SECO' && <span aria-hidden="true" className="font-bold">✓</span>}
            </label>

            <label
              className={`flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-3 text-base font-semibold transition-colors focus-within:ring-2 focus-within:ring-mazorca focus-within:ring-offset-2 ${
                tipoGrano === 'BABA'
                  ? 'border-cacao bg-cacao text-crema shadow-xs'
                  : 'border-cacao/30 bg-white text-cacao hover:bg-cacao/5'
              }`}
            >
              <input
                type="radio"
                name="tipoGrano"
                value="BABA"
                checked={tipoGrano === 'BABA'}
                onChange={(e) => {
                  setTipoGrano(e.target.value)
                  limpiarErrorCampo('tipoGrano')
                }}
                className="size-4 accent-cacao"
                aria-invalid={Boolean(erroresPorCampo.tipoGrano)}
              />
              <span>En baba</span>
              {tipoGrano === 'BABA' && <span aria-hidden="true" className="font-bold">✓</span>}
            </label>
          </div>
          {erroresPorCampo.tipoGrano && (
            <p id="error-tipo-grano" className="text-sm font-medium text-red-700">
              {erroresPorCampo.tipoGrano}
            </p>
          )}
        </fieldset>

        {/* Campo Humedad */}
        <div className="space-y-1.5">
          <label htmlFor="campo-humedad" className="block text-sm font-semibold">
            Humedad (%) — opcional
          </label>
          <input
            id="campo-humedad"
            type="text"
            inputMode="decimal"
            placeholder="Ej.: 7,5"
            ref={humedadRef}
            value={porcentajeHumedad}
            onChange={(e) => {
              setPorcentajeHumedad(e.target.value)
              limpiarErrorCampo('porcentajeHumedad')
            }}
            aria-invalid={Boolean(erroresPorCampo.porcentajeHumedad)}
            aria-describedby={erroresPorCampo.porcentajeHumedad ? 'error-humedad' : undefined}
            className={`w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base text-cacao placeholder:text-cacao/70 ${FOCO} ${
              erroresPorCampo.porcentajeHumedad ? 'border-red-700 bg-red-50/20' : 'border-cacao/30'
            }`}
          />
          {erroresPorCampo.porcentajeHumedad && (
            <p id="error-humedad" className="text-sm font-medium text-red-700">
              {erroresPorCampo.porcentajeHumedad}
            </p>
          )}
        </div>

        {/* Campo Cantidad */}
        <div className="space-y-1.5">
          <label htmlFor="campo-cantidad" className="block text-sm font-semibold">
            Cantidad recibida (kg)
          </label>
          <input
            id="campo-cantidad"
            type="text"
            inputMode="decimal"
            placeholder="Ej.: 120,5"
            ref={cantidadRef}
            value={cantidadRecibida}
            onChange={(e) => {
              setCantidadRecibida(e.target.value)
              limpiarErrorCampo('cantidadRecibida')
            }}
            aria-invalid={Boolean(erroresPorCampo.cantidadRecibida)}
            aria-describedby={
              [
                erroresPorCampo.cantidadRecibida ? 'error-cantidad' : null,
                vistaPreviaCuota ? 'vista-previa-cuota' : null,
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className={`w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base text-cacao placeholder:text-cacao/70 ${FOCO} ${
              erroresPorCampo.cantidadRecibida ? 'border-red-700 bg-red-50/20' : 'border-cacao/30'
            }`}
          />
          {erroresPorCampo.cantidadRecibida && (
            <p id="error-cantidad" className="text-sm font-medium text-red-700">
              {erroresPorCampo.cantidadRecibida}
            </p>
          )}

          {/* Vista previa de cuota */}
          {vistaPreviaCuota &&
            (vistaPreviaCuota.supera ? (
              <p
                id="vista-previa-cuota"
                role="status"
                className="rounded-md border border-mazorca/40 bg-mazorca/15 p-3 text-sm text-cacao"
              >
                {vistaPreviaCuota.mensaje}
              </p>
            ) : (
              <p id="vista-previa-cuota" className="text-sm text-cacao/70">
                {vistaPreviaCuota.mensaje}
              </p>
            ))}
        </div>

        {/* Código manual (opcional) */}
        <div className="space-y-2 pt-1">
          {!mostrarCodigoManual ? (
            <button
              type="button"
              onClick={() => setMostrarCodigoManual(true)}
              aria-expanded={false}
              className={`text-sm font-semibold text-cacao underline hover:text-cacao/80 ${FOCO}`}
            >
              Usar un código manual (opcional)
            </button>
          ) : (
            <div className="space-y-1.5 rounded-lg border border-cacao/15 bg-white p-3">
              <div className="flex items-center justify-between">
                <label htmlFor="campo-codigo" className="block text-sm font-semibold">
                  Código de lote
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarCodigoManual(false)
                    setCodigoLote('')
                    limpiarErrorCampo('codigoLote')
                  }}
                  className={`text-xs text-cacao/70 underline hover:text-cacao ${FOCO}`}
                >
                  Ocultar
                </button>
              </div>
              <input
                id="campo-codigo"
                type="text"
                ref={codigoLoteRef}
                value={codigoLote}
                onChange={(e) => {
                  setCodigoLote(e.target.value.toUpperCase())
                  limpiarErrorCampo('codigoLote')
                }}
                placeholder="Ej.: CAC004"
                aria-invalid={Boolean(erroresPorCampo.codigoLote)}
                aria-describedby={
                  [
                    'ayuda-codigo-lote',
                    erroresPorCampo.codigoLote ? 'error-codigo-lote' : null,
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
                className={`w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base uppercase text-cacao placeholder:text-cacao/70 ${FOCO} ${
                  erroresPorCampo.codigoLote ? 'border-red-700 bg-red-50/20' : 'border-cacao/30'
                }`}
              />
              <p id="ayuda-codigo-lote" className="text-xs text-cacao/70">
                Déjelo vacío para que el sistema asigne el siguiente código CAC.
              </p>
              {erroresPorCampo.codigoLote && (
                <p id="error-codigo-lote" className="text-sm font-medium text-red-700">
                  {erroresPorCampo.codigoLote}
                </p>
              )}
            </div>
          )}
        </div>

        {errorGeneral && <MensajeError error={errorGeneral} />}

        <div className="pt-2">
          <button
            type="submit"
            disabled={enviando}
            className={`w-full min-h-[44px] rounded-md bg-cacao px-4 py-2 text-base font-semibold text-crema hover:bg-cacao/90 disabled:opacity-50 sm:w-auto ${FOCO}`}
          >
            {enviando ? 'Registrando…' : 'Registrar recepción'}
          </button>
        </div>
      </form>
    </div>
  )
}
